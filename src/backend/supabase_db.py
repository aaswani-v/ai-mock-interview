"""
Supabase Database Module
Handles Supabase database operations for users, resumes, and interviews
"""

import os
from supabase import create_client, Client
from datetime import datetime
from typing import Optional, Dict, List
import logging

logger = logging.getLogger(__name__)

# Supabase client
supabase: Optional[Client] = None

def initialize_supabase():
    """Initialize Supabase client"""
    global supabase
    try:
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_KEY")
        
        if not url or not key:
            logger.error("Supabase URL or KEY not found in environment variables")
            return False
        
        supabase = create_client(url, key)
        logger.info("Supabase client initialized successfully")
        return True
    except Exception as e:
        logger.error(f"Failed to initialize Supabase: {str(e)}")
        return False

def get_supabase() -> Client:
    """Get Supabase client"""
    if supabase is None:
        initialize_supabase()
    return supabase

# User operations
class UserDB:
    """User database operations"""
    
    @staticmethod
    def create_user(email: str, password: str, name: str) -> Optional[Dict]:
        """Create a new user in Supabase Auth"""
        try:
            client = get_supabase()
            
            # Create user in Supabase Auth
            auth_response = client.auth.sign_up({
                "email": email,
                "password": password,
                "options": {
                    "data": {
                        "name": name
                    }
                }
            })
            
            if auth_response.user:
                user = auth_response.user
                
                # Create user profile in database
                profile_data = {
                    "id": user.id,
                    "email": email,
                    "name": name,
                    "phone": "",
                    "role": "",
                    "experience_years": "",
                    "salary_expectation": "",
                    "currency": "USD",
                    "education": [],
                    "work_history": [],
                    "created_at": datetime.utcnow().isoformat(),
                    "last_login": datetime.utcnow().isoformat()
                }
                
                client.table('users').insert(profile_data).execute()
                logger.info(f"User created successfully: {email}")
                
                return {
                    "uid": user.id,
                    "email": email,
                    "name": name,
                    "session": auth_response.session
                }
            
            return None
        
        except Exception as e:
            logger.error(f"Error creating user: {str(e)}")
            return None
    
    @staticmethod
    def login_user(email: str, password: str) -> Optional[Dict]:
        """Login user with Supabase Auth"""
        try:
            client = get_supabase()
            
            auth_response = client.auth.sign_in_with_password({
                "email": email,
                "password": password
            })
            
            if auth_response.user:
                user = auth_response.user
                
                # Update last login
                client.table('users').update({
                    "last_login": datetime.utcnow().isoformat()
                }).eq('id', user.id).execute()
                
                logger.info(f"User logged in: {email}")
                
                return {
                    "uid": user.id,
                    "email": user.email,
                    "session": auth_response.session
                }
            
            return None
        
        except Exception as e:
            logger.error(f"Error logging in: {str(e)}")
            return None
    
    @staticmethod
    def get_user(uid: str) -> Optional[Dict]:
        """Get user profile from database"""
        try:
            client = get_supabase()
            response = client.table('users').select("*").eq('id', uid).execute()
            
            if response.data and len(response.data) > 0:
                return response.data[0]
            return None
        except Exception as e:
            logger.error(f"Error getting user: {str(e)}")
            return None
    
    @staticmethod
    def get_user_by_email(email: str) -> Optional[Dict]:
        """Check if user exists by email"""
        try:
            client = get_supabase()
            response = client.table('users').select("id, email").eq('email', email).execute()
            
            if response.data and len(response.data) > 0:
                return response.data[0]
            return None
        except Exception as e:
            logger.error(f"Error checking user by email: {str(e)}")
            return None
    
    @staticmethod
    def update_profile(uid: str, profile_data: Dict) -> bool:
        """Update user profile"""
        try:
            client = get_supabase()
            
            update_data = {
                "name": profile_data.get("name"),
                "phone": profile_data.get("phone"),
                "role": profile_data.get("role"),
                "experience_years": profile_data.get("experience_years"),
                "salary_expectation": profile_data.get("salary_expectation"),
                "currency": profile_data.get("currency", "USD"),
                "education": profile_data.get("education", []),
                "work_history": profile_data.get("work_history", []),
                "updated_at": datetime.utcnow().isoformat()
            }
            
            client.table('users').update(update_data).eq('id', uid).execute()
            logger.info(f"Profile updated for user: {uid}")
            return True
        except Exception as e:
            logger.error(f"Error updating profile: {str(e)}")
            return False
    
    @staticmethod
    def verify_token(token: str) -> Optional[Dict]:
        """Verify JWT token"""
        try:
            client = get_supabase()
            user = client.auth.get_user(token)
            
            if user:
                return {"uid": user.user.id, "email": user.user.email}
            return None
        except Exception as e:
            logger.error(f"Error verifying token: {str(e)}")
            return None
    
    @staticmethod
    def reset_password_email(email: str, redirect_url: str = None) -> Dict:
        """Send password reset email via Supabase Auth"""
        try:
            client = get_supabase()
            
            # Supabase will send a password reset email
            options = {}
            if redirect_url:
                options["redirect_to"] = redirect_url
            
            client.auth.reset_password_email(email, options=options)
            logger.info(f"Password reset email sent to: {email}")
            
            return {"success": True, "message": "Password reset email sent"}
        except Exception as e:
            logger.error(f"Error sending password reset email: {str(e)}")
            return {"success": False, "error": str(e)}
    
    @staticmethod
    def update_user_password(access_token: str, new_password: str) -> Dict:
        """Update user password using access token from reset link"""
        try:
            client = get_supabase()
            
            # Set the session using the access token
            client.auth.set_session(access_token, "")
            
            # Update the user's password
            response = client.auth.update_user({"password": new_password})
            
            if response.user:
                logger.info(f"Password updated for user: {response.user.email}")
                return {"success": True, "message": "Password updated successfully"}
            
            return {"success": False, "error": "Failed to update password"}
        except Exception as e:
            logger.error(f"Error updating password: {str(e)}")
            return {"success": False, "error": str(e)}
    
    @staticmethod
    def send_magic_link(email: str, redirect_url: str = None) -> Dict:
        """Send magic link for passwordless login"""
        try:
            client = get_supabase()
            
            options = {}
            if redirect_url:
                options["redirect_to"] = redirect_url
            
            client.auth.sign_in_with_otp({
                "email": email,
                "options": options
            })
            logger.info(f"Magic link sent to: {email}")
            
            return {"success": True, "message": "Magic link sent to your email"}
        except Exception as e:
            logger.error(f"Error sending magic link: {str(e)}")
            return {"success": False, "error": str(e)}
    
    @staticmethod
    def resend_confirmation_email(email: str) -> Dict:
        """Resend email confirmation for signup"""
        try:
            client = get_supabase()
            
            # Use resend method for confirmation
            client.auth.resend({
                "type": "signup",
                "email": email
            })
            logger.info(f"Confirmation email resent to: {email}")
            
            return {"success": True, "message": "Confirmation email sent"}
        except Exception as e:
            logger.error(f"Error resending confirmation: {str(e)}")
            return {"success": False, "error": str(e)}
    
    @staticmethod
    def change_user_email(access_token: str, new_email: str) -> Dict:
        """Change user email - requires re-verification"""
        try:
            client = get_supabase()
            
            # Set session with current token
            client.auth.set_session(access_token, "")
            
            # Update email - Supabase will send verification to new email
            response = client.auth.update_user({"email": new_email})
            
            if response.user:
                logger.info(f"Email change requested for user, new email: {new_email}")
                return {"success": True, "message": "Verification email sent to new address"}
            
            return {"success": False, "error": "Failed to change email"}
        except Exception as e:
            logger.error(f"Error changing email: {str(e)}")
            return {"success": False, "error": str(e)}
    
    @staticmethod
    def verify_magic_link_token(access_token: str, refresh_token: str = "") -> Optional[Dict]:
        """Verify magic link token and get user session"""
        try:
            client = get_supabase()
            
            # Set session from magic link tokens
            session = client.auth.set_session(access_token, refresh_token)
            
            if session and session.user:
                user = session.user
                logger.info(f"Magic link verified for: {user.email}")
                return {
                    "uid": user.id,
                    "email": user.email,
                    "email_confirmed": user.email_confirmed_at is not None,
                    "session": session
                }
            return None
        except Exception as e:
            logger.error(f"Error verifying magic link: {str(e)}")
            return None

# Resume operations
class ResumeDB:
    """Resume database operations"""
    
    @staticmethod
    def save_resume(uid: str, file_url: str, parsed_data: Dict) -> bool:
        """Save resume data to database"""
        try:
            client = get_supabase()
            resume_data = {
                "user_id": uid,
                "file_url": file_url,
                "parsed_data": parsed_data,
                "uploaded_at": datetime.utcnow().isoformat()
            }
            
            # Upsert (insert or update)
            client.table('resumes').upsert(resume_data, on_conflict='user_id').execute()
            logger.info(f"Resume saved for user: {uid}")
            return True
        except Exception as e:
            logger.error(f"Error saving resume: {str(e)}")
            return False
    
    @staticmethod
    def get_resume(uid: str) -> Optional[Dict]:
        """Get resume data from database"""
        try:
            client = get_supabase()
            response = client.table('resumes').select("*").eq('user_id', uid).execute()
            
            if response.data and len(response.data) > 0:
                return response.data[0]
            return None
        except Exception as e:
            logger.error(f"Error getting resume: {str(e)}")
            return None

# Interview operations
class InterviewDB:
    """Interview history database operations"""
    
    @staticmethod
    def save_interview(uid: str, interview_data: Dict) -> Optional[int]:
        """Save interview session to database with extended fields"""
        try:
            import json as json_lib
            client = get_supabase()
            
            # Prepare interview data with all fields
            # Ensure questions is properly serialized for JSONB
            questions_data = interview_data.get("questions", [])
            if isinstance(questions_data, str):
                try:
                    questions_data = json_lib.loads(questions_data)
                except:
                    questions_data = []
            
            data_to_save = {
                "user_id": uid,
                "session_date": datetime.utcnow().isoformat(),
                "overall_score": int(interview_data.get("overall_score", 0) or 0),
                "visual_score": int(interview_data.get("visual_score", 0) or 0),
                "content_score": int(interview_data.get("content_score", 0) or 0),
                "speech_score": int(interview_data.get("speech_score", 0) or 0),
                "difficulty": str(interview_data.get("difficulty", "intermediate") or "intermediate"),
                "domain": str(interview_data.get("domain", "General") or "General"),
                "questions_answered": int(interview_data.get("questions_answered", 1) or 1),
                "duration_minutes": int(interview_data.get("duration_minutes", 0) or 0),
                "questions": questions_data
            }
            
            logger.info(f"Saving interview for user {uid}: {data_to_save}")
            
            response = client.table('interviews').insert(data_to_save).execute()
            
            if response.data and len(response.data) > 0:
                logger.info(f"Interview saved for user: {uid}, ID: {response.data[0]['id']}")
                return response.data[0]['id']
            
            logger.error(f"Interview save returned no data for user: {uid}")
            return None
        except Exception as e:
            logger.error(f"Error saving interview for user {uid}: {str(e)}")
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")
            return None
    
    @staticmethod
    def get_user_interviews(uid: str, limit: int = 10) -> List[Dict]:
        """Get user's interview history"""
        try:
            client = get_supabase()
            response = client.table('interviews')\
                .select("*")\
                .eq('user_id', uid)\
                .order('session_date', desc=True)\
                .limit(limit)\
                .execute()
            
            return response.data if response.data else []
        except Exception as e:
            logger.error(f"Error getting interviews: {str(e)}")
            return []
    
    @staticmethod
    def get_latest_interview(uid: str) -> Optional[Dict]:
        """Get user's most recent interview"""
        try:
            client = get_supabase()
            response = client.table('interviews')\
                .select("*")\
                .eq('user_id', uid)\
                .order('session_date', desc=True)\
                .limit(1)\
                .execute()
            
            if response.data and len(response.data) > 0:
                return response.data[0]
            return None
        except Exception as e:
            logger.error(f"Error getting latest interview: {str(e)}")
            return None
    
    @staticmethod
    def get_performance_stats(uid: str) -> Dict:
        """Calculate aggregated performance statistics for user"""
        try:
            client = get_supabase()
            response = client.table('interviews')\
                .select("*")\
                .eq('user_id', uid)\
                .order('session_date', desc=True)\
                .execute()
            
            interviews = response.data if response.data else []
            
            if not interviews:
                return {
                    "total_interviews": 0,
                    "avg_overall_score": 0,
                    "avg_visual_score": 0,
                    "avg_content_score": 0,
                    "avg_speech_score": 0,
                    "best_score": 0,
                    "latest_score": 0,
                    "improvement": 0,
                    "domain_scores": {},
                    "recent_trend": []
                }
            
            total = len(interviews)
            avg_overall = sum(i.get("overall_score", 0) for i in interviews) / total
            avg_visual = sum(i.get("visual_score", 0) for i in interviews) / total
            avg_content = sum(i.get("content_score", 0) for i in interviews) / total
            avg_speech = sum(i.get("speech_score", 0) for i in interviews) / total
            best_score = max(i.get("overall_score", 0) for i in interviews)
            latest_score = interviews[0].get("overall_score", 0) if interviews else 0
            
            # Calculate improvement (compare latest with previous)
            improvement = 0
            if total >= 2:
                previous_score = interviews[1].get("overall_score", 0)
                improvement = latest_score - previous_score
            
            # Domain-wise scores
            domain_scores = {}
            for interview in interviews:
                domain = interview.get("domain", "General")
                if domain not in domain_scores:
                    domain_scores[domain] = {"total": 0, "count": 0}
                domain_scores[domain]["total"] += interview.get("overall_score", 0)
                domain_scores[domain]["count"] += 1
            
            for domain in domain_scores:
                count = domain_scores[domain]["count"]
                domain_scores[domain] = round(domain_scores[domain]["total"] / count) if count > 0 else 0
            
            # Recent trend (last 7 interviews)
            recent_trend = [
                {
                    "date": i.get("session_date", ""),
                    "score": i.get("overall_score", 0),
                    "domain": i.get("domain", "General")
                }
                for i in interviews[:7]
            ]
            
            return {
                "total_interviews": total,
                "avg_overall_score": round(avg_overall),
                "avg_visual_score": round(avg_visual),
                "avg_content_score": round(avg_content),
                "avg_speech_score": round(avg_speech),
                "best_score": best_score,
                "latest_score": latest_score,
                "improvement": improvement,
                "domain_scores": domain_scores,
                "recent_trend": recent_trend
            }
        except Exception as e:
            logger.error(f"Error getting performance stats: {str(e)}")
            return {
                "total_interviews": 0,
                "avg_overall_score": 0,
                "avg_visual_score": 0,
                "avg_content_score": 0,
                "avg_speech_score": 0,
                "best_score": 0,
                "latest_score": 0,
                "improvement": 0,
                "domain_scores": {},
                "recent_trend": []
            }
    
    @staticmethod
    def get_weak_domains(uid: str, threshold: int = 60) -> List[Dict]:
        """Identify weak domains based on interview performance"""
        try:
            stats = InterviewDB.get_performance_stats(uid)
            domain_scores = stats.get("domain_scores", {})
            
            weak_domains = []
            for domain, score in domain_scores.items():
                if score < threshold:
                    weak_domains.append({
                        "domain": domain,
                        "score": score,
                        "gap": threshold - score
                    })
            
            # Sort by gap (largest gap first)
            weak_domains.sort(key=lambda x: x["gap"], reverse=True)
            return weak_domains
        except Exception as e:
            logger.error(f"Error getting weak domains: {str(e)}")
            return []
