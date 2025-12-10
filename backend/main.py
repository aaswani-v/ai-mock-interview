import os
import shutil
import subprocess
import tempfile
import logging
import json
from typing import Optional
from pathlib import Path

import cv2
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from dotenv import load_dotenv

# Load environment variables
load_dotenv(encoding="utf-8")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Import API clients
from groq_deepgram_client import (
    transcribe_audio_deepgram,
    evaluate_answer_groq,
    test_groq_connection,
    test_deepgram_connection
)

# Load questions database
QUESTIONS = {}
questions_path = Path(__file__).parent / "questions.json"
if questions_path.exists():
    with open(questions_path, "r") as f:
        QUESTIONS = json.load(f)
    logger.info(f"Loaded {len(QUESTIONS)} questions from questions.json")
else:
    logger.warning("questions.json not found. Question context will be limited.")

# Configuration from environment
MAX_UPLOAD_MB = int(os.getenv("MAX_UPLOAD_MB", "40"))
MAX_DURATION_SECONDS = int(os.getenv("MAX_DURATION_SECONDS", "45"))
RATE_LIMIT = os.getenv("RATE_LIMIT_PER_MINUTE", "10/minute")

# Ensure built-in ffmpeg is found if present
if os.path.exists("ffmpeg.exe"):
    logger.info("Found local ffmpeg.exe, adding to PATH.")
    os.environ["PATH"] += os.pathsep + os.getcwd()

# Initialize FastAPI app
app = FastAPI(
    title="AI Interview Practice Backend",
    description="Production-ready backend using Hugging Face Inference API",
    version="2.0.0"
)

# Setup rate limiting
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS Setup - support environment-based origins
allowed_origins_str = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5173")
origins = [origin.strip() for origin in allowed_origins_str.split(",")]

logger.info(f"CORS allowed origins: {origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_video_metadata(video_path: str):
    """
    Extract video metadata using OpenCV.
    """
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        return None, "Could not open video file."

    fps = cap.get(cv2.CAP_PROP_FPS)
    frame_count = cap.get(cv2.CAP_PROP_FRAME_COUNT)
    
    # Calculate duration
    duration = 0.0
    if fps > 0:
        duration = frame_count / fps
    
    cap.release()
    
    return {
        "fps": fps,
        "frameCount": int(frame_count),
        "durationSeconds": duration
    }, None


def extract_audio(video_path: str, audio_output_path: str):
    """
    Use ffmpeg to extract audio from video.
    Target: 16kHz mono WAV (ideal for Whisper).
    """
    command = [
        "ffmpeg",
        "-i", video_path,
        "-vn",                 # No video
        "-acodec", "pcm_s16le",# PCM 16-bit little-endian
        "-ar", "16000",        # 16kHz sample rate
        "-ac", "1",            # Mono channel
        "-y",                  # Overwrite output file if exists
        audio_output_path
    ]
    
    try:
        subprocess.run(
            command, 
            check=True, 
            stdout=subprocess.PIPE, 
            stderr=subprocess.PIPE
        )
    except subprocess.CalledProcessError as e:
        logger.error(f"FFmpeg error: {e.stderr.decode()}")
        raise RuntimeError("Failed to extract audio from video.")


def analyze_transcript(text: str, duration_seconds: float):
    """
    Compute basic metrics from transcript.
    """
    if not text:
        return {
            "wordCount": 0,
            "wordsPerMinute": 0.0,
            "fillerCount": 0
        }

    words = text.split()
    word_count = len(words)
    
    # Simple WPM calculation
    duration_minutes = duration_seconds / 60.0
    wpm = 0.0
    if duration_minutes > 0:
        wpm = word_count / duration_minutes
    
    # Filler words analysis (basic list)
    fillers = {"um", "uh", "like", "you know", "actually", "basically", "literally"}
    filler_count = 0
    
    # Normalize and check
    processed_text = text.lower()
    for filler in fillers:
        filler_count += processed_text.count(filler)
        
    return {
        "wordCount": word_count,
        "wordsPerMinute": round(wpm, 1),
        "fillerCount": filler_count
    }


@app.get("/api/health")
def health_check():
    """
    Health check endpoint with API status.
    """
    groq_ok, groq_message = test_groq_connection()
    deepgram_ok, deepgram_message = test_deepgram_connection()
    
    return {
        "status": "ok",
        "groq_api": {
            "status": "up" if groq_ok else "down",
            "message": groq_message
        },
        "deepgram_api": {
            "status": "up" if deepgram_ok else "down",
            "message": deepgram_message
        },
        "config": {
            "max_upload_mb": MAX_UPLOAD_MB,
            "max_duration_seconds": MAX_DURATION_SECONDS,
            "rate_limit": RATE_LIMIT
        }
    }


@app.post("/api/analyze")
@limiter.limit(RATE_LIMIT)
async def analyze_video(
    request: Request,
    file: UploadFile = File(...),
    role: Optional[str] = Form(None),
    question_id: Optional[str] = Form(None, alias="questionId"),
    question: Optional[str] = Form(None)  # Allow direct question text as fallback
):
    """
    Analyze uploaded interview video using HF Inference API.
    
    Args:
        file: Video file (mp4, webm, etc.)
        role: Job role (e.g., "SDE1", "Frontend")
        question_id: Question identifier from questions.json
        question: Direct question text (fallback if questionId not found)
        
    Returns:
        JSON with transcript, evaluation, and analysis metrics
    """
    logger.info(f"Processing video: role={role}, questionId={question_id}, filename={file.filename}")
    
    # Create a temporary directory for processing
    with tempfile.TemporaryDirectory() as temp_dir:
        try:
            temp_path = Path(temp_dir)
            video_path = temp_path / f"upload_{file.filename}"
            audio_path = temp_path / "extracted_audio.wav"

            # 1. Save Uploaded File
            file_content = await file.read()
            file_size_mb = len(file_content) / (1024 * 1024)
            
            # Validate file size
            if file_size_mb > MAX_UPLOAD_MB:
                logger.warning(f"File too large: {file_size_mb:.2f}MB > {MAX_UPLOAD_MB}MB")
                raise HTTPException(
                    status_code=413,
                    detail=f"File too large. Maximum size is {MAX_UPLOAD_MB}MB, received {file_size_mb:.2f}MB"
                )
            
            with open(video_path, "wb") as buffer:
                buffer.write(file_content)
            
            logger.info(f"File saved: {file_size_mb:.2f}MB")

            # 2. Extract Video Metadata (OpenCV)
            video_stats, error = get_video_metadata(str(video_path))
            if error:
                return JSONResponse(status_code=400, content={"error": error})
            
            # Validate duration
            duration = video_stats["durationSeconds"]
            if duration > MAX_DURATION_SECONDS:
                logger.warning(f"Video too long: {duration:.1f}s > {MAX_DURATION_SECONDS}s")
                raise HTTPException(
                    status_code=413,
                    detail=f"Video too long. Maximum duration is {MAX_DURATION_SECONDS}s, received {duration:.1f}s"
                )
            
            logger.info(f"Video metadata: {duration:.1f}s, {video_stats['fps']:.1f}fps")

            # 3. Extract Audio (FFmpeg)
            extract_audio(str(video_path), str(audio_path))

            # 4. Transcribe using Deepgram API
            with open(audio_path, "rb") as f:
                audio_bytes = f.read()
            
            logger.info(f"Calling Deepgram transcription API ({len(audio_bytes)} bytes)")
            transcription_result = transcribe_audio_deepgram(audio_bytes)
            transcript_text = transcription_result.get("text", "").strip()
            transcription_error = transcription_result.get("error")
            
            if transcription_error:
                logger.error(f"Transcription error: {transcription_error}")
            else:
                logger.info(f"Transcription successful: {len(transcript_text)} characters")

            # 5. Analyze Text Stats
            speech_stats = analyze_transcript(transcript_text, duration)

            # 6. Visual Analysis (unchanged - runs locally)
            from video_analysis import VideoAnalyzer
            video_analyzer = VideoAnalyzer()
            visual_stats = video_analyzer.process_video(str(video_path))
            
            logger.info(f"Visual analysis: eyeContact={visual_stats['eyeContact']}, posture={visual_stats['posture']}")

            # 7. Content Analysis using Groq LLM
            # Get question text from database or use provided question
            question_data = QUESTIONS.get(question_id, {})
            question_text = question_data.get("question") or question or "General interview question"
            
            logger.info(f"Calling Groq evaluation API for question: {question_text[:50]}...")
            evaluation_result = evaluate_answer_groq(question_text, transcript_text, role or "General")
            
            evaluation_error = evaluation_result.get("error")
            if evaluation_error:
                logger.error(f"Evaluation error: {evaluation_error}")
            else:
                logger.info(f"Evaluation successful: score={evaluation_result.get('score')}")

            # 8. Calculate Overall Score
            # Weights: Content (50%), Visual (30%), Speech (20%)
            content_score = evaluation_result.get("score", 5) * 10  # Convert 1-10 to 0-100
            
            # Visual score is avg of eye contact and posture
            visual_score = (visual_stats["eyeContact"] + visual_stats["posture"]) / 2
            
            # Speech score heuristic: 100 - fillers*5 - WPM deviation penalty
            target_wpm = 130
            wpm = speech_stats["wordsPerMinute"]
            wpm_penalty = min(50, abs(wpm - target_wpm) * 0.5) if wpm > 0 else 50
            filler_penalty = min(30, speech_stats["fillerCount"] * 5)
            speech_score = max(0, 100 - wpm_penalty - filler_penalty)
            
            overall_score = int(
                (content_score * 0.5) + 
                (visual_score * 0.3) + 
                (speech_score * 0.2)
            )

            # 9. Build response
            response_data = {
                "role": role,
                "questionId": question_id,
                "transcript": transcript_text,
                "transcriptionError": transcription_error,
                "video": video_stats,
                "speech": speech_stats,
                "visual": visual_stats,
                "evaluation": {
                    "score": evaluation_result.get("score", 0),
                    "reasoning": evaluation_result.get("reasoning", ""),
                    "suggestions": evaluation_result.get("suggestions", [])
                } if not evaluation_error else None,
                "evaluationError": evaluation_error,
                "overallScore": overall_score,
                "speechScore": round(speech_score, 1)
            }
            
            logger.info(f"Analysis complete: overallScore={overall_score}")
            return response_data

        except HTTPException:
            raise
        
        except Exception as e:
            logger.exception("Error processing video")
            return JSONResponse(
                status_code=500, 
                content={
                    "error": str(e),
                    "role": role,
                    "questionId": question_id,
                    "transcript": "",
                    "transcriptionError": str(e)
                }
            )


# Instructions for running
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
