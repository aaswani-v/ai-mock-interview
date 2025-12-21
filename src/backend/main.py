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
    generate_dynamic_questions,
    analyze_transcript_linewise,
    test_groq_connection,
    test_deepgram_connection
)

# Import Supabase database
from supabase_db import initialize_supabase, UserDB, ResumeDB, InterviewDB

# Import resume services
from services.resume_parser import resume_parser
from services.ats_scorer import ats_scorer

# Import job roles
from job_roles import get_all_job_roles, get_job_role, calculate_compatibility

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
MAX_DURATION_SECONDS = int(os.getenv("MAX_DURATION_SECONDS", "60"))
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


# Initialize Supabase on startup
@app.on_event("startup")
async def startup_event():
    """Initialize Supabase connection on app startup"""
    if initialize_supabase():
        logger.info("✅ Supabase initialized successfully")
    else:
        logger.warning("⚠️ Supabase initialization failed - auth features will not work")


# ============================================================================
# AUTHENTICATION ENDPOINTS
# ============================================================================

@app.post("/api/auth/signup")
async def signup(
    email: str = Form(...),
    password: str = Form(...),
    name: str = Form(...)
):
    """
    Create a new user account
    
    Args:
        email: User email
        password: User password (min 6 characters)
        name: User's full name
        
    Returns:
        User data with email_verified status
    """
    try:
        if len(password) < 6:
            raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
        
        user = UserDB.create_user(email=email, password=password, name=name)
        
        if not user:
            raise HTTPException(status_code=400, detail="Email already exists or signup failed")
        
        # Check if email confirmation is required
        # Supabase with email confirmations enabled will NOT auto-confirm
        session = user.get("session")
        email_verified = False
        if session and hasattr(session, 'user') and session.user:
            email_verified = session.user.email_confirmed_at is not None
        
        return {
            "success": True,
            "email_verified": email_verified,
            "requires_verification": not email_verified,
            "user": {
                "uid": user["uid"],
                "email": user["email"],
                "name": user["name"]
            },
            "message": "Please check your email to verify your account" if not email_verified else "Account created successfully"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Signup error: {str(e)}")
        raise HTTPException(status_code=500, detail="Signup failed")


@app.post("/api/auth/login")
async def login(
    email: str = Form(...),
    password: str = Form(...)
):
    """
    Login user - BLOCKS unverified emails
    
    Args:
        email: User email
        password: User password
        
    Returns:
        User data and session token
    """
    try:
        user = UserDB.login_user(email=email, password=password)
        
        if not user:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Check if email is verified
        session = user.get("session")
        email_verified = False
        if session and hasattr(session, 'user') and session.user:
            email_verified = session.user.email_confirmed_at is not None
        
        if not email_verified:
            raise HTTPException(
                status_code=403, 
                detail="Please verify your email before logging in. Check your inbox for the verification link."
            )
        
        # Get full user profile
        profile = UserDB.get_user(user["uid"])
        
        return {
            "success": True,
            "email_verified": True,
            "user": {
                "uid": user["uid"],
                "email": user["email"],
                "profile": profile
            },
            "session": session
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(status_code=500, detail="Login failed")


@app.post("/api/auth/logout")
async def logout():
    """Logout user (client-side token removal)"""
    return {"success": True, "message": "Logged out successfully"}


@app.post("/api/auth/reset-password-request")
async def reset_password_request(
    email: str = Form(...),
    redirect_url: Optional[str] = Form(None)
):
    """
    Request a password reset email
    
    Args:
        email: User email
        redirect_url: Optional URL to redirect to after reset (for your frontend)
        
    Returns:
        Success status
    """
    try:
        result = UserDB.reset_password_email(email, redirect_url)
        
        if result.get("success"):
            return {"success": True, "message": "If an account exists with this email, a password reset link has been sent."}
        else:
            # Don't reveal if email exists or not for security
            return {"success": True, "message": "If an account exists with this email, a password reset link has been sent."}
    
    except Exception as e:
        logger.error(f"Password reset request error: {str(e)}")
        # Still return success to not reveal email existence
        return {"success": True, "message": "If an account exists with this email, a password reset link has been sent."}


@app.post("/api/auth/update-password")
async def update_password(
    access_token: str = Form(...),
    new_password: str = Form(...)
):
    """
    Update user password using the access token from reset link
    
    Args:
        access_token: The access token from the password reset email link
        new_password: The new password (min 6 characters)
        
    Returns:
        Success status
    """
    try:
        if len(new_password) < 6:
            raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
        
        result = UserDB.update_user_password(access_token, new_password)
        
        if result.get("success"):
            return {"success": True, "message": "Password updated successfully"}
        else:
            raise HTTPException(status_code=400, detail=result.get("error", "Failed to update password"))
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Update password error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update password")


@app.post("/api/auth/magic-link")
async def send_magic_link(
    email: str = Form(...),
    redirect_url: Optional[str] = Form(None)
):
    """
    Send magic link for passwordless login
    
    Args:
        email: User email (must be registered)
        redirect_url: Optional redirect URL after login
        
    Returns:
        Success message
    """
    try:
        # Check if user exists first to prevent spam
        existing_user = UserDB.get_user_by_email(email)
        
        if not existing_user:
            # Don't reveal that user doesn't exist for security
            # But also don't send email to non-existent users
            logger.warning(f"Magic link requested for non-existent user: {email}")
            return {"success": True, "message": "If an account exists, a magic link has been sent to your email."}
        
        result = UserDB.send_magic_link(email, redirect_url)
        
        return {"success": True, "message": "If an account exists, a magic link has been sent to your email."}
    
    except Exception as e:
        logger.error(f"Magic link error: {str(e)}")
        return {"success": True, "message": "If an account exists, a magic link has been sent to your email."}


@app.post("/api/auth/resend-confirmation")
async def resend_confirmation(
    email: str = Form(...)
):
    """
    Resend email confirmation for signup
    
    Args:
        email: User email
        
    Returns:
        Success message
    """
    try:
        result = UserDB.resend_confirmation_email(email)
        
        return {"success": True, "message": "If an account exists, a confirmation email has been sent."}
    
    except Exception as e:
        logger.error(f"Resend confirmation error: {str(e)}")
        return {"success": True, "message": "If an account exists, a confirmation email has been sent."}


@app.post("/api/auth/verify-magic-link")
async def verify_magic_link(
    access_token: str = Form(...),
    refresh_token: str = Form("")
):
    """
    Verify magic link token and get user session
    
    Args:
        access_token: Access token from magic link
        refresh_token: Optional refresh token
        
    Returns:
        User data and session
    """
    try:
        result = UserDB.verify_magic_link_token(access_token, refresh_token)
        
        if not result:
            raise HTTPException(status_code=401, detail="Invalid or expired magic link")
        
        # Get full user profile
        profile = UserDB.get_user(result["uid"])
        
        return {
            "success": True,
            "user": {
                "uid": result["uid"],
                "email": result["email"],
                "profile": profile
            },
            "session": result.get("session")
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Verify magic link error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to verify magic link")


@app.get("/api/profile/{user_id}")
async def get_profile(user_id: str):
    """Get user profile"""
    try:
        profile = UserDB.get_user(user_id)
        
        if not profile:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {"success": True, "profile": profile}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get profile error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get profile")


@app.post("/api/profile/update")
async def update_profile(
    user_id: str = Form(...),
    name: Optional[str] = Form(None),
    phone: Optional[str] = Form(None),
    role: Optional[str] = Form(None),
    experience_years: Optional[str] = Form(None, alias="experienceYears"),
    salary_expectation: Optional[str] = Form(None, alias="salaryExpectation"),
    currency: Optional[str] = Form("USD")
):
    """Update user profile"""
    try:
        profile_data = {}
        if name: profile_data["name"] = name
        if phone: profile_data["phone"] = phone
        if role: profile_data["role"] = role
        if experience_years: profile_data["experience_years"] = experience_years
        if salary_expectation: profile_data["salary_expectation"] = salary_expectation
        if currency: profile_data["currency"] = currency
        
        success = UserDB.update_profile(user_id, profile_data)
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to update profile")
        
        return {"success": True, "message": "Profile updated successfully"}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Update profile error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update profile")


# ============================================================================
# JOB ROLES ENDPOINTS
# ============================================================================

@app.get("/api/jobs/roles")
async def get_roles():
    """Get all available job roles for resume matching"""
    try:
        roles = get_all_job_roles()
        # Transform to list format for frontend
        roles_list = [
            {
                "id": role_id,
                "title": role_data.get("title"),
                "description": role_data.get("description"),
                "requiredSkills": role_data.get("requiredSkills", []),
                "preferredSkills": role_data.get("preferredSkills", []),
                "experienceLevels": role_data.get("experienceLevels", {})
            }
            for role_id, role_data in roles.items()
        ]
        return {"success": True, "roles": roles_list}
    except Exception as e:
        logger.error(f"Error fetching job roles: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch job roles")


@app.get("/api/jobs/roles/{role_id}")
async def get_role_by_id(role_id: str):
    """Get a specific job role by ID"""
    try:
        role = get_job_role(role_id)
        if not role:
            raise HTTPException(status_code=404, detail=f"Role '{role_id}' not found")
        return {"success": True, "role": {"id": role_id, **role}}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching job role {role_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch job role")


# ============================================================================
# RESUME ENDPOINTS
# ============================================================================


@app.post("/api/resume/upload")
async def upload_resume(
    file: UploadFile = File(...),
    user_id: str = Form(...),
    target_role: str = Form(None)
):
    """Upload and parse resume with ATS scoring"""
    try:
        # Validate file type
        if not file.filename.endswith(('.pdf', '.PDF')):
            raise HTTPException(status_code=400, detail="Only PDF files are supported")
        
        # Save file
        file_path = f"uploads/{user_id}_{file.filename}"
        with open(file_path, "wb") as f:
            f.write(await file.read())
        
        logger.info(f"Resume uploaded: {file_path}")
        
        # Parse resume using new parser
        try:
            parsed_resume = resume_parser.parse_resume(file_path)
            logger.info(f"Resume parsed successfully for user: {user_id}")
            
            # Calculate ATS score
            ats_result = ats_scorer.calculate_ats_score(
                parsed_resume=parsed_resume,
                job_description=None,  # Will use default or can be customized
                required_skills_list=None,
                job_role_title=target_role or "Target Role"
            )
            
            logger.info(f"ATS Score calculated: {ats_result.get('atsScore', 0)}")
            
            # Prepare analysis data
            analysis = {
                "overall_score": int(ats_result.get('atsScore', 0)),
                "strengths": [
                    f"Matched {len(ats_result.get('matchedSkills', []))} required skills",
                    f"Overall ATS score: {ats_result.get('atsScore', 0)}%",
                    f"Detected {ats_result.get('totalSkillsDetected', 0)} total skills"
                ],
                "gaps": [
                    f"Missing {len(ats_result.get('missingSkills', []))} key skills"
                ] if ats_result.get('missingSkills') else ["No major gaps detected"],
                "suggestions": [
                    "Add quantifiable achievements to strengthen your resume",
                    "Ensure all required skills are clearly mentioned",
                    "Tailor your resume to match the job description"
                ],
                "key_skills_found": ats_result.get('matchedSkills', [])[:10],
                "missing_skills": ats_result.get('missingSkills', [])[:5],
                "summary": f"Your resume scored {ats_result.get('atsScore', 0)}% for {target_role or 'the target role'}. " +
                          f"Matched {len(ats_result.get('matchedSkills', []))} out of {ats_result.get('requiredSkillsCount', 0)} required skills."
            }
            
            # Prepare parsed data
            parsed_data = {
                "name": parsed_resume.name,
                "email": parsed_resume.email,
                "phone": parsed_resume.phone,
                "skills": parsed_resume.skills,
                "education": parsed_resume.education,
                "experience": parsed_resume.experience,
                "raw_text": parsed_resume.raw_text[:2000],
                "analysis": analysis,
                "ats_score": ats_result
            }
            
        except Exception as e:
            logger.error(f"Error parsing resume: {str(e)}", exc_info=True)
            # Fallback to basic parsing
            parsed_data = {
                "error": "Resume parsing failed",
                "analysis": {
                    "overall_score": 70,
                    "strengths": ["Resume uploaded successfully"],
                    "gaps": ["Detailed analysis unavailable"],
                    "suggestions": ["Ensure resume is in a parseable format"],
                    "key_skills_found": [],
                    "missing_skills": [],
                    "summary": "Resume uploaded but detailed analysis is temporarily unavailable."
                }
            }
        
        # Save to Supabase
        ResumeDB.save_resume(user_id, file_path, parsed_data)
        logger.info(f"Resume data saved to database for user: {user_id}")
        
        return {"success": True, "data": parsed_data}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Resume upload error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to upload resume")


async def analyze_resume_for_role(resume_text: str, target_role: str) -> dict:
    """Analyze resume using Groq AI for specific role"""
    try:
        prompt = f"""You are an expert resume analyst and career coach. Analyze the following resume for the role of {target_role}.

Resume Content:
{resume_text}

Provide a detailed analysis in the following JSON format:
{{
    "overall_score": <number 0-100>,
    "strengths": ["strength1", "strength2", "strength3"],
    "gaps": ["gap1", "gap2", "gap3"],
    "suggestions": ["suggestion1", "suggestion2", "suggestion3"],
    "key_skills_found": ["skill1", "skill2", "skill3"],
    "missing_skills": ["skill1", "skill2"],
    "summary": "Brief 2-3 sentence summary of the resume's fit for this role"
}}

Be specific and actionable in your feedback."""

        response = evaluate_answer_groq(
            question=prompt,
            transcript="",  # Not needed for resume analysis
            user_context={
                "role": target_role,
                "task": "resume_analysis"
            }
        )
        
        # Parse the JSON response
        import json
        try:
            # Extract JSON from response
            analysis_text = response.get('analysis', '')
            # Try to find JSON in the response
            start = analysis_text.find('{')
            end = analysis_text.rfind('}') + 1
            if start != -1 and end > start:
                json_str = analysis_text[start:end]
                analysis = json.loads(json_str)
                return analysis
            else:
                # Fallback if JSON not found
                return {
                    "overall_score": 75,
                    "strengths": ["Experience matches role requirements", "Good technical skills"],
                    "gaps": ["Could add more specific achievements"],
                    "suggestions": ["Quantify your achievements", "Add relevant certifications"],
                    "key_skills_found": ["Technical skills present"],
                    "missing_skills": ["Some role-specific skills"],
                    "summary": analysis_text[:200] if analysis_text else "Resume shows potential for this role."
                }
        except json.JSONDecodeError:
            # Fallback response
            return {
                "overall_score": 75,
                "strengths": ["Relevant experience", "Good skill set"],
                "gaps": ["Could be more specific"],
                "suggestions": ["Add quantifiable achievements"],
                "key_skills_found": ["Core skills present"],
                "missing_skills": ["Some advanced skills"],
                "summary": "Resume shows good potential for the target role."
            }
    except Exception as e:
        logger.error(f"Resume analysis error: {str(e)}")
        raise


# ============================================================================
# INTERVIEW ENDPOINTS
# ============================================================================

@app.post("/api/questions/generate")
@limiter.limit(RATE_LIMIT)
async def generate_questions(
    request: Request,
    role: Optional[str] = Form(None),
    experience_years: Optional[str] = Form(None, alias="experienceYears"),
    skills: Optional[str] = Form(None),  # Comma-separated skills
    difficulty: Optional[str] = Form(None)  # 'beginner', 'intermediate', 'advanced'
):
    """
    Generate personalized interview questions based on user profile.
    
    Args:
        role: Job role (e.g., "Frontend Engineer", "SDE1")
        experience_years: Years of experience
        skills: Comma-separated list of skills
        difficulty: Question difficulty level
        
    Returns:
        JSON with generated questions or fallback to static questions
    """
    logger.info(f"Generating questions for role={role}, experience={experience_years}, difficulty={difficulty}")
    
    # Parse skills if provided
    skills_list = None
    if skills:
        skills_list = [s.strip() for s in skills.split(",") if s.strip()]
    
    # Try to generate dynamic questions
    result = generate_dynamic_questions(
        role=role or "General",
        experience_years=experience_years,
        skills=skills_list,
        num_questions=3,
        difficulty=difficulty
    )
    
    # If generation failed or returned no questions, fallback to static questions
    if result.get("error") or not result.get("questions"):
        logger.warning(f"Dynamic generation failed: {result.get('error')}, falling back to static questions")
        
        # Get static questions from questions.json based on role
        role_key = role.lower().replace(" ", "_") if role else "general"
        static_questions = []
        
        for qid, qdata in QUESTIONS.items():
            if role_key in qid.lower() or qdata.get("role", "").lower() == role.lower():
                static_questions.append({
                    "id": qid,
                    "question": qdata.get("question"),
                    "difficulty": "Medium",
                    "focus": "General",
                    "topic": qdata.get("role", "General")
                })
        
        # If no role-specific questions, return first 3 from database
        if not static_questions:
            static_questions = [
                {
                    "id": qid,
                    "question": qdata.get("question"),
                    "difficulty": "Medium",
                    "focus": "General",
                    "topic": qdata.get("role", "General")
                }
                for qid, qdata in list(QUESTIONS.items())[:3]
            ]
        
        return {
            "questions": static_questions[:3],
            "source": "static",
            "error": result.get("error")
        }
    
    return {
        "questions": result.get("questions", []),
        "source": "dynamic",
        "error": None
    }


@app.post("/api/analyze")
@limiter.limit(RATE_LIMIT)
async def analyze_video(
    request: Request,
    file: UploadFile = File(...),
    role: Optional[str] = Form(None),
    question_id: Optional[str] = Form(None, alias="questionId"),
    question: Optional[str] = Form(None),  # Allow direct question text as fallback
    candidate_name: Optional[str] = Form(None, alias="candidateName"),
    experience_years: Optional[str] = Form(None, alias="experienceYears"),
    salary_expectation: Optional[str] = Form(None, alias="salaryExpectation")
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

            # 7. Content Analysis using Groq LLM with user context
            # Get question text from database or use provided question
            question_data = QUESTIONS.get(question_id, {})
            question_text = question_data.get("question") or question or "General interview question"
            
            logger.info(f"Calling Groq evaluation API for question: {question_text[:50]}...")
            logger.info(f"User context: name={candidate_name}, exp={experience_years}, salary={salary_expectation}")
            
            evaluation_result = evaluate_answer_groq(
                question=question_text,
                transcript=transcript_text,
                role=role or "General",
                candidate_name=candidate_name,
                experience_years=experience_years,
                salary_expectation=salary_expectation,
                visual_metrics=visual_stats,
                speech_metrics=speech_stats
            )
            
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

            # 9. Line-by-line transcript analysis for detailed feedback
            line_analysis_result = analyze_transcript_linewise(
                transcript=transcript_text,
                question=question_text,
                role=role or "General"
            )
            line_analysis = line_analysis_result.get("lineAnalysis", [])
            if line_analysis_result.get("error"):
                logger.warning(f"Line analysis error: {line_analysis_result.get('error')}")
            else:
                logger.info(f"Line analysis complete: {len(line_analysis)} sentences analyzed")

            # 10. Build response
            # Return response with both 'evaluation' and 'content' for compatibility
            evaluation_data = {
                "score": evaluation_result.get("score", 0),
                "reasoning": evaluation_result.get("reasoning", ""),
                "suggestions": evaluation_result.get("suggestions", []),
                "confidence_assessment": evaluation_result.get("confidence_assessment", ""),
                "communication_quality": evaluation_result.get("communication_quality", ""),
                "feedback": evaluation_result.get("reasoning", "Keep practicing!")  # For frontend compatibility
            } if not evaluation_error else None
            
            return {
                "role": role,
                "questionId": question_id,
                "transcript": transcript_text,
                "transcriptionError": transcription_error,
                "video": {
                    "fps": video_stats["fps"],
                    "frameCount": video_stats["frameCount"],
                    "durationSeconds": video_stats["durationSeconds"]
                },
                "speech": speech_stats,
                "visual": visual_stats,
                "evaluation": evaluation_data,  # For backend consistency
                "content": evaluation_data,  # For frontend compatibility
                "lineAnalysis": line_analysis,  # Sentence-by-sentence feedback
                "evaluationError": evaluation_error,
                "overallScore": overall_score,
                "visualScore": int(visual_score),
                "contentScore": int(content_score),
                "speechScore": int(speech_score)
            }
        
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Unexpected error during video analysis: {str(e)}")
            return JSONResponse(
                status_code=500,
                content={
                    "error": "Internal server error during video analysis",
                    "role": role,
                    "questionId": question_id,
                    "transcript": "",
                    "transcriptionError": str(e)
                }
            )


# ============================================================================
# INTERVIEW DATA MANAGEMENT ENDPOINTS
# ============================================================================

@app.post("/api/interview/save")
async def save_interview(
    user_id: str = Form(...),
    overall_score: int = Form(...),
    visual_score: int = Form(0),
    content_score: int = Form(0),
    speech_score: int = Form(0),
    difficulty: str = Form("intermediate"),
    domain: str = Form("General"),
    duration: int = Form(0),
    questions_answered: int = Form(1),
    questions: Optional[str] = Form(None)  # JSON string of questions
):
    """
    Save interview results to database
    
    Args:
        user_id: User ID
        overall_score: Overall interview score (0-100)
        visual_score: Visual analysis score
        content_score: Content quality score
        speech_score: Speech analysis score
        difficulty: Interview difficulty level
        domain: Interview domain/topic
        duration: Interview duration in minutes
        questions_answered: Number of questions answered
        questions: JSON string of questions and responses
        
    Returns:
        Success status and interview ID
    """
    try:
        import json as json_lib
        
        interview_data = {
            "overall_score": overall_score,
            "visual_score": visual_score,
            "content_score": content_score,
            "speech_score": speech_score,
            "difficulty": difficulty,
            "domain": domain,
            "duration_minutes": duration,
            "questions_answered": questions_answered,
            "questions": json_lib.loads(questions) if questions else []
        }
        
        interview_id = InterviewDB.save_interview(user_id, interview_data)
        
        if interview_id:
            return {
                "success": True,
                "interview_id": interview_id,
                "message": "Interview saved successfully"
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to save interview")
    
    except json_lib.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid questions JSON format")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Save interview error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to save interview")


@app.get("/api/interviews/{user_id}")
async def get_interviews(user_id: str, limit: int = 10):
    """
    Get user's interview history
    
    Args:
        user_id: User ID
        limit: Maximum number of interviews to return (default 10)
        
    Returns:
        List of interview records
    """
    try:
        interviews = InterviewDB.get_user_interviews(user_id, limit)
        latest = InterviewDB.get_latest_interview(user_id)
        
        return {
            "success": True,
            "interviews": interviews,
            "latest": latest,
            "total": len(interviews)
        }
    
    except Exception as e:
        logger.error(f"Get interviews error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get interviews")


@app.get("/api/performance/{user_id}")
async def get_performance(user_id: str):
    """
    Get aggregated performance statistics for user
    
    Args:
        user_id: User ID
        
    Returns:
        Performance statistics including averages, trends, and domain scores
    """
    try:
        stats = InterviewDB.get_performance_stats(user_id)
        weak_domains = InterviewDB.get_weak_domains(user_id)
        
        return {
            "success": True,
            "stats": stats,
            "weak_domains": weak_domains
        }
    
    except Exception as e:
        logger.error(f"Get performance error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get performance stats")


@app.get("/api/resume/{user_id}")
async def get_resume(user_id: str):
    """
    Get saved resume data for user
    
    Args:
        user_id: User ID
        
    Returns:
        Resume data including parsed content and analysis
    """
    try:
        resume = ResumeDB.get_resume(user_id)
        
        if resume:
            return {
                "success": True,
                "resume": resume
            }
        else:
            return {
                "success": True,
                "resume": None,
                "message": "No resume found for user"
            }
    
    except Exception as e:
        logger.error(f"Get resume error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get resume")


@app.get("/api/recommendations/{user_id}")
async def get_recommendations(user_id: str):
    """
    Generate learning recommendations based on weak areas
    
    Args:
        user_id: User ID
        
    Returns:
        Personalized learning recommendations
    """
    try:
        weak_domains = InterviewDB.get_weak_domains(user_id)
        stats = InterviewDB.get_performance_stats(user_id)
        
        recommendations = []
        
        # Learning resources mapping
        resources_map = {
            "Technical": [
                {"title": "Data Structures & Algorithms Masterclass", "type": "Course", "link": "https://www.coursera.org/algorithms", "duration": "10 hours"},
                {"title": "System Design Fundamentals", "type": "Guide", "link": "https://github.com/donnemartin/system-design-primer", "duration": "5 hours"},
                {"title": "LeetCode Top 100 Problems", "type": "Practice", "link": "https://leetcode.com/problemset/top-100-liked-questions/", "duration": "20+ hours"}
            ],
            "Communication": [
                {"title": "Public Speaking Mastery", "type": "Course", "link": "https://www.coursera.org/public-speaking", "duration": "4 hours"},
                {"title": "STAR Method Interview Guide", "type": "Article", "link": "https://www.indeed.com/star-method", "duration": "15 min"},
                {"title": "Body Language for Interviews", "type": "Video", "link": "https://www.youtube.com/results?search_query=interview+body+language", "duration": "30 min"}
            ],
            "Behavioral": [
                {"title": "Top 50 Behavioral Questions", "type": "Guide", "link": "https://www.themuse.com/behavioral-interview-questions", "duration": "2 hours"},
                {"title": "Emotional Intelligence at Work", "type": "Course", "link": "https://www.linkedin.com/learning/emotional-intelligence", "duration": "3 hours"},
                {"title": "Conflict Resolution Strategies", "type": "Article", "link": "https://www.mindtools.com/conflict-resolution", "duration": "20 min"}
            ],
            "General": [
                {"title": "Mock Interview Practice Tips", "type": "Guide", "link": "https://www.glassdoor.com/interview-tips", "duration": "30 min"},
                {"title": "Confidence Building Techniques", "type": "Video", "link": "https://www.youtube.com/results?search_query=interview+confidence", "duration": "20 min"},
                {"title": "Resume Optimization Guide", "type": "Article", "link": "https://www.resumegenius.com/tips", "duration": "15 min"}
            ]
        }
        
        # Generate recommendations based on weak domains
        for weak in weak_domains[:3]:  # Top 3 weak areas
            domain = weak["domain"]
            resources = resources_map.get(domain, resources_map["General"])
            
            recommendations.append({
                "domain": domain,
                "current_score": weak["score"],
                "target_score": 70,
                "gap": weak["gap"],
                "priority": "High" if weak["gap"] > 20 else "Medium",
                "resources": resources[:2],  # Top 2 resources per domain
                "improvement_tips": [
                    f"Focus on improving {domain.lower()} skills",
                    f"Practice at least 3 interviews targeting {domain.lower()}",
                    "Review feedback from previous interviews"
                ]
            })
        
        # Add general recommendations if no weak domains
        if not recommendations:
            avg_score = stats.get("avg_overall_score", 0)
            if avg_score < 80:
                recommendations.append({
                    "domain": "General",
                    "current_score": avg_score,
                    "target_score": 80,
                    "gap": 80 - avg_score,
                    "priority": "Medium",
                    "resources": resources_map["General"],
                    "improvement_tips": [
                        "Continue practicing to maintain your skills",
                        "Try more challenging interview scenarios",
                        "Focus on areas with lowest scores"
                    ]
                })
            else:
                recommendations.append({
                    "domain": "Excellence",
                    "current_score": avg_score,
                    "target_score": 100,
                    "gap": 100 - avg_score,
                    "priority": "Low",
                    "resources": [
                        {"title": "Advanced Interview Strategies", "type": "Masterclass", "link": "#", "duration": "2 hours"},
                        {"title": "Leadership in Interviews", "type": "Course", "link": "#", "duration": "3 hours"}
                    ],
                    "improvement_tips": [
                        "You're doing great! Keep up the excellent work",
                        "Consider helping others with mock interviews",
                        "Focus on edge cases and difficult scenarios"
                    ]
                })
        
        return {
            "success": True,
            "recommendations": recommendations,
            "stats_summary": {
                "total_interviews": stats.get("total_interviews", 0),
                "avg_score": stats.get("avg_overall_score", 0),
                "improvement": stats.get("improvement", 0)
            }
        }
    
    except Exception as e:
        logger.error(f"Get recommendations error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get recommendations")


@app.get("/api/user/complete-data/{user_id}")
async def get_complete_user_data(user_id: str):
    """
    Get all user data including profile, interviews, resume, and performance
    
    Args:
        user_id: User ID
        
    Returns:
        Complete user data bundle
    """
    try:
        profile = UserDB.get_user(user_id)
        interviews = InterviewDB.get_user_interviews(user_id, 10)
        latest_interview = InterviewDB.get_latest_interview(user_id)
        resume = ResumeDB.get_resume(user_id)
        performance = InterviewDB.get_performance_stats(user_id)
        weak_domains = InterviewDB.get_weak_domains(user_id)
        
        return {
            "success": True,
            "data": {
                "profile": profile,
                "interviews": interviews,
                "latest_interview": latest_interview,
                "resume": resume,
                "performance": performance,
                "weak_domains": weak_domains
            }
        }
    
    except Exception as e:
        logger.error(f"Get complete user data error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get user data")


# Instructions for running
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

