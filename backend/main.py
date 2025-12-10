import os
import shutil
import subprocess
import tempfile
import logging
from typing import Optional
from pathlib import Path
import math

import cv2
import whisper
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager


# Trigger reload - Dependency installed

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

from dotenv import load_dotenv
load_dotenv(encoding="utf-8")

# Ensure built-in ffmpeg is found if present
if os.path.exists("ffmpeg.exe"):
    logger.info("Found local ffmpeg.exe, adding to PATH.")
    os.environ["PATH"] += os.pathsep + os.getcwd()

# Global variable for the Whisper model
model = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Life span events for the application.
    Load the Whisper model on startup.
    """
    global model
    try:
        logger.info("Loading Whisper model (base)... This might take a moment.")
        # 'base' is a good balance for speed and accuracy for local testing.
        model = whisper.load_model("base")
        logger.info("Whisper model loaded successfully.")
    except Exception as e:
        logger.error(f"Failed to load Whisper model: {e}")
        raise e
    yield
    # Cleanup if necessary (nothing specific for now)

app = FastAPI(title="AI Interview Practice Backend", lifespan=lifespan)

# CORS Setup
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

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
    # ffmpeg -i input -vn -acodec pcm_s16le -ar 16000 -ac 1 output
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
        # Run ffmpeg, suppress output unless error
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
        # A simple count is used here. For "you know", we count occurrences of the phrase.
        filler_count += processed_text.count(filler)
        
    return {
        "wordCount": word_count,
        "wordsPerMinute": round(wpm, 1),
        "fillerCount": filler_count
    }

@app.get("/api/health")
def health_check():
    return {"status": "ok"}

@app.post("/api/analyze")
def analyze_video(
    file: UploadFile = File(...),
    role: Optional[str] = Form(None),
    question_id: Optional[str] = Form(None, alias="questionId") # Support camelCase from frontend if sent that way
):
    # Create a temporary directory for processing
    with tempfile.TemporaryDirectory() as temp_dir:
        try:
            temp_path = Path(temp_dir)
            video_path = temp_path / f"upload_{file.filename}"
            audio_path = temp_path / "extracted_audio.wav"

            # 1. Save Uploaded File
            with open(video_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            logger.info(f"File saved to {video_path}")

            # 2. Extract Video Metadata (OpenCV)
            video_stats, error = get_video_metadata(str(video_path))
            if error:
                return JSONResponse(status_code=400, content={"error": error})

            # 3. Extract Audio (FFmpeg)
            extract_audio(str(video_path), str(audio_path))

            # 4. Transcribe (Whisper)
            if model is None:
                raise HTTPException(status_code=500, detail="Model not loaded.")
            
            result = model.transcribe(str(audio_path), fp16=False)
            transcript_text = result.get("text", "").strip()

            # 5. Analyze Text Stats
            speech_stats = analyze_transcript(transcript_text, video_stats["durationSeconds"])

            # 6. Advanced Analyses (New Features)
            # Visual Analysis
            from video_analysis import VideoAnalyzer
            video_analyzer = VideoAnalyzer()
            visual_stats = video_analyzer.process_video(str(video_path))
            
            # Content Analysis (LLM)
            from llm_analysis import analyze_content_with_llm
            content_stats = analyze_content_with_llm(transcript_text, question_id)

            # 7. Calculate Overall Score
            # Weights: Content (50%), Visual (30%), Speech (20%)
            content_score = content_stats.get("score", 0)
            
            # Visual score is avg of eye contact and posture
            visual_score = (visual_stats["eyeContact"] + visual_stats["posture"]) / 2
            
            # Speech score heuristic: 100 - fillers*5 - WPM deviation penalty
            target_wpm = 130
            wpm = speech_stats["wordsPerMinute"]
            wpm_penalty = min(50, abs(wpm - target_wpm) * 0.5)
            filler_penalty = min(30, speech_stats["fillerCount"] * 5)
            speech_score = max(0, 100 - wpm_penalty - filler_penalty)
            
            overall_score = int(
                (content_score * 0.5) + 
                (visual_score * 0.3) + 
                (speech_score * 0.2)
            )

            return {
                "role": role,
                "questionId": question_id,
                "transcript": transcript_text,
                "transcriptionError": None,
                "video": video_stats,
                "speech": speech_stats,
                "visual": visual_stats,
                "content": content_stats,
                "overallScore": overall_score,
                "speechScore": round(speech_score, 1)
            }

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
    # This block allows running the script directly with python main.py
    # But usually it's run via uvicorn
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
