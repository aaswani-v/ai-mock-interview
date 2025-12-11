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
        """Save interview session to database"""
        try:
            client = get_supabase()
            interview_data["user_id"] = uid
            interview_data["session_date"] = datetime.utcnow().isoformat()
            
            response = client.table('interviews').insert(interview_data).execute()
            
            if response.data and len(response.data) > 0:
                logger.info(f"Interview saved for user: {uid}")
                return response.data[0]['id']
            return None
        except Exception as e:
            logger.error(f"Error saving interview: {str(e)}")
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
