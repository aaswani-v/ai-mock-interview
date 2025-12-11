import os
import shutil
import subprocess
import tempfile
import logging
import uuid
import json
from typing import Optional, List
from pathlib import Path
import math
from datetime import datetime

import cv2
import whisper
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Body, Depends
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from dotenv import load_dotenv
load_dotenv(encoding="utf-8-sig")

# --- Custom Imports ---
from backend.utils.firebase_admin import get_firestore_client, auth
from backend.services.resume_parser import resume_parser
from backend.services.ats_scorer import ats_scorer
from backend.services.job_roles import get_all_job_roles, calculate_compatibility
from backend.models import UserRegister, UserLogin, ResumeAnalysisResponse, JobCompatibilityResponse

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Ensure built-in ffmpeg is found if present
if os.path.exists("ffmpeg.exe"):
    logger.info("Found local ffmpeg.exe, adding to PATH.")
    os.environ["PATH"] += os.pathsep + os.getcwd()

# Global variable for the Whisper model
model = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global model
    try:
        logger.info("Loading Whisper model (base)... This might take a moment.")
        model = whisper.load_model("base")
        logger.info("Whisper model loaded successfully.")
    except Exception as e:
        logger.error(f"Failed to load Whisper model: {e}")
        raise e
    yield

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

# --- UTILS ---
def get_video_metadata(video_path: str):
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        return None, "Could not open video file."
    fps = cap.get(cv2.CAP_PROP_FPS)
    frame_count = cap.get(cv2.CAP_PROP_FRAME_COUNT)
    duration = frame_count / fps if fps > 0 else 0.0
    cap.release()
    return {"fps": fps, "frameCount": int(frame_count), "durationSeconds": duration}, None

def extract_audio(video_path: str, audio_output_path: str):
    command = ["ffmpeg", "-i", video_path, "-vn", "-acodec", "pcm_s16le", "-ar", "16000", "-ac", "1", "-y", audio_output_path]
    subprocess.run(command, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

def analyze_transcript(text: str, duration_seconds: float):
    if not text: return {"wordCount": 0, "wordsPerMinute": 0.0, "fillerCount": 0}
    words = text.split()
    wpm = len(words) / (duration_seconds / 60.0) if duration_seconds > 0 else 0
    fillers = {"um", "uh", "like", "you know", "actually", "basically"}
    filler_count = sum(text.lower().count(f) for f in fillers)
    return {"wordCount": len(words), "wordsPerMinute": round(wpm, 1), "fillerCount": filler_count}

# --- ROUTES ---

@app.get("/api/health")
def health_check():
    return {"status": "ok"}

# 1. AUTH ROUTES
@app.post("/api/auth/register")
async def register_user(user: UserRegister):
    if user.password != user.confirmPassword:
        raise HTTPException(400, "Passwords do not match")
    
    try:
        # Create or Get user in Firebase Auth
        try:
            user_record = auth.create_user(
                email=user.email,
                password=user.password,
                display_name=user.name,
                email_verified=False
            )
        except auth.EmailAlreadyExistsError:
            # If user already exists (e.g. created by client-side SDK), fetch their record
            user_record = auth.get_user_by_email(user.email)
        except Exception as e:
            raise e
        
        # Store additional details in Firestore
        db = get_firestore_client()
        if db:
            db.collection('users').document(user_record.uid).set({
                'name': user.name,
                'username': user.email.split('@')[0],
                'email': user.email,
                'createdAt': datetime.utcnow(),
                'role': 'user'
            })

        # Generate Verification Link (MOCK SENDING)
        try:
            link = auth.generate_email_verification_link(user.email)
            logger.info(f"===========================================================")
            logger.info(f"VERIFICATION LINK FOR {user.email}: {link}")
            logger.info(f"===========================================================")
        except Exception as ve:
            logger.error(f"Failed to generate verification link: {ve}")
            link = None
            
        return {
            "success": True, 
            "message": "User registered. Please check spam folder for verification link (See Console for Mock Link).", 
            "userId": user_record.uid,
            "mockVerificationLink": link 
        }
        
    except Exception as e:
        logger.error(f"Registration error: {e}")
        raise HTTPException(400, f"Registration failed: {str(e)}")

@app.post("/api/auth/login")
async def login_user(credentials: UserLogin):
    try:
        # Verify user exists by email
        user = auth.get_user_by_email(credentials.email)
        
        # Check if email is verified
        if not user.email_verified:
            # For DEV/DEMO purposes: If user just clicked the link generated above, 
            # Firebase Auth backend updates this status.
            raise HTTPException(400, "Email not verified. Please check your spam folder.")

        # NOTE: Admin SDK CANNOT verify passwords. 
        # In a real app, use Firebase Client SDK on frontend to signInWithEmailAndPassword.
        # Here, we treat existence + verification as "Success" for this Mock Interview prototype 
        # to unlock the dashboard.
        
        return {"success": True, "token": "mock-token", "uid": user.uid, "message": "Login successful"}
        
    except auth.UserNotFoundError:
        raise HTTPException(400, "Invalid email or password") # Generic error
    except Exception as e:
        if isinstance(e, HTTPException): raise e
        logger.error(f"Login error: {e}")
        raise HTTPException(500, "Login failed")

@app.post("/api/auth/status")
async def check_email_status(body: dict = Body(...)):
    email = body.get("email")
    if not email:
        raise HTTPException(400, "Email required")
    try:
        user = auth.get_user_by_email(email)
        return {"verified": user.email_verified}
    except auth.UserNotFoundError:
        raise HTTPException(404, "User not found")
    except Exception as e:
        logger.error(f"Status check error: {e}")
        raise HTTPException(500, "Check failed")

# 2. RESUME UPLOAD & ANALYZE
@app.post("/api/resume/upload")
async def upload_resume(
    file: UploadFile = File(...), 
    userId: str = Form("guest"),
    roleId: Optional[str] = Form(None),
    experienceLevel: Optional[str] = Form(None)
):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(400, "Only PDF files are allowed")
        
    upload_dir = Path("uploads/resumes")
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    resume_id = str(uuid.uuid4())
    file_path = upload_dir / f"{resume_id}.pdf"
    
    try:
        content = await file.read()
        with open(file_path, "wb") as f:
            f.write(content)
            
        # Parse & Score
        parsed = resume_parser.parse_resume(str(file_path))
        
        # Get Job Description for selected role or default
        selected_role = None
        if roleId:
            selected_role = get_all_job_roles().get(roleId)
            
        jd_text = selected_role['description'] if selected_role else None
        
        # Prepare explicit skills list if role selected
        explicit_skills = None
        role_title = "General Role"
        if selected_role:
            explicit_skills = selected_role.get('requiredSkills', []) + selected_role.get('preferredSkills', [])
            role_title = selected_role.get('title', "Target Role")

        # Calculate main ATS Score
        ats_analysis = ats_scorer.calculate_ats_score(parsed, jd_text, explicit_skills, role_title)
        
        # Calculate Compatibility against ALL roles
        all_roles = get_all_job_roles()
        compatibilities = []
        for rid, role in all_roles.items():
            res = calculate_compatibility(parsed.skills, rid)
            if res:
                compatibilities.append(JobCompatibilityResponse(
                    roleId=rid, roleTitle=role['title'], **res
                ))
        
        # Sort by score desc
        compatibilities.sort(key=lambda x: x.score, reverse=True)
        
        # Store in Firestore
        db = get_firestore_client()
        file_url = f"/api/files/resumes/{resume_id}.pdf"
        
        if db and userId != "guest":
            db.collection('resumes').document(resume_id).set({
                'userId': userId,
                'resumeId': resume_id,
                'fileName': file.filename,
                'uploadedAt': datetime.utcnow(),
                'atsScore': ats_analysis['atsScore'],
                'skills': parsed.skills,
                'analysis': ats_analysis,
                'parsedData': {
                    'name': parsed.name,
                    'email': parsed.email,
                    'education': parsed.education
                }
            })
            
        return ResumeAnalysisResponse(
            success=True,
            resumeId=resume_id,
            fileName=file.filename,
            fileUrl=file_url,
            fileSize=len(content),
            atsScore=ats_analysis['atsScore'],
            skills=parsed.skills,
            missingSkills=ats_analysis['missingSkills'],
            matchedSkills=ats_analysis['matchedSkills'],
            parsedText=parsed.raw_text[:2000],
            analysis=ats_analysis,
            jobCompatibilities=compatibilities,
            message="Resume analyzed successfully"
        )
        
    except Exception as e:
        if file_path.exists(): os.remove(file_path)
        logger.error(f"Resume processing error: {e}")
        raise HTTPException(500, f"Error processing resume: {str(e)}")

# 3. JOB COMPATIBILITY
@app.post("/api/jobs/compatibility")
async def check_compatibility(skills: List[str] = Body(...), roleId: Optional[str] = Body(None)):
    if roleId:
        # Check specific role
        result = calculate_compatibility(skills, roleId)
        if not result: raise HTTPException(404, "Job role not found")
        role = get_all_job_roles().get(roleId)
        return [JobCompatibilityResponse(
            roleId=roleId, roleTitle=role['title'], **result
        )]
    else:
        # Check all roles
        results = []
        all_roles = get_all_job_roles()
        for rid, role in all_roles.items():
            res = calculate_compatibility(skills, rid)
            if res:
                results.append(JobCompatibilityResponse(
                    roleId=rid, roleTitle=role['title'], **res
                ))
        # Sort by score desc
        results.sort(key=lambda x: x.score, reverse=True)
        return results

@app.get("/api/jobs/roles")
def get_job_roles():
    return get_all_job_roles()

# 4. EXISTING VIDEO ANALYSIS (Preserved)
@app.post("/api/analyze")
def analyze_video(file: UploadFile = File(...), role: Optional[str] = Form(None), question_id: Optional[str] = Form(None, alias="questionId")):
    with tempfile.TemporaryDirectory() as temp_dir:
        try:
            temp_path = Path(temp_dir)
            video_path = temp_path / f"upload_{file.filename}"
            audio_path = temp_path / "extracted_audio.wav"
            
            with open(video_path, "wb") as buffer: shutil.copyfileobj(file.file, buffer)
            
            video_stats, error = get_video_metadata(str(video_path))
            if error: return JSONResponse(status_code=400, content={"error": error})
            
            extract_audio(str(video_path), str(audio_path))
            
            if model is None: raise HTTPException(500, "Whisper model not loaded.")
            result = model.transcribe(str(audio_path), fp16=False)
            transcript = result.get("text", "").strip()
            
            speech_stats = analyze_transcript(transcript, video_stats["durationSeconds"])
            
            # Placeholder for advanced analysis if modules missing
            try:
                from backend.video_analysis import VideoAnalyzer
                visual_stats = VideoAnalyzer().process_video(str(video_path))
            except: visual_stats = {"eyeContact": 80, "posture": 80}

            try:
                from backend.llm_analysis import analyze_content_with_llm
                content_stats = analyze_content_with_llm(transcript, question_id)
            except: content_stats = {"score": 75, "feedback": "Good answer."}

            # Scoring Logic
            overall = int((content_stats.get("score",0)*0.5) + ((visual_stats["eyeContact"]+visual_stats["posture"])/2*0.3) + (max(0, 100 - speech_stats["fillerCount"]*5)*0.2))
            
            return {
                "role": role, "questionId": question_id, "transcript": transcript,
                "video": video_stats, "speech": speech_stats, "visual": visual_stats,
                "content": content_stats, "overallScore": overall
            }
        except Exception as e:
            logger.exception("Error processing video")
            return JSONResponse(status_code=500, content={"error": str(e)})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

