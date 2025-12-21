"""
Firebase Database Module
Handles Firestore database operations for users, resumes, and interviews
"""

import os
import firebase_admin
from firebase_admin import credentials, firestore, auth
from datetime import datetime
from typing import Optional, Dict, List
import logging

logger = logging.getLogger(__name__)

# Initialize Firebase Admin SDK
def initialize_firebase():
    """Initialize Firebase Admin SDK with service account credentials"""
    try:
        # Check if already initialized
        if not firebase_admin._apps:
            cred_path = os.path.join(os.path.dirname(__file__), 'firebase-credentials.json')
            
            if not os.path.exists(cred_path):
                logger.error("Firebase credentials file not found. Please download from Firebase Console.")
                return False
            
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
            logger.info("Firebase Admin SDK initialized successfully")
        
        return True
    except Exception as e:
        logger.error(f"Failed to initialize Firebase: {str(e)}")
        return False

# Get Firestore client
def get_db():
    """Get Firestore database client"""
    if not firebase_admin._apps:
        initialize_firebase()
    return firestore.client()

# User operations
class UserDB:
    """User database operations"""
    
    @staticmethod
    def create_user(email: str, password: str, name: str) -> Optional[Dict]:
        """Create a new user in Firebase Auth and Firestore"""
        try:
            # Create user in Firebase Auth
            user = auth.create_user(
                email=email,
                password=password,
                display_name=name
            )
            
            # Create user profile in Firestore
            db = get_db()
            user_data = {
                "uid": user.uid,
                "email": email,
                "name": name,
                "profile": {
                    "phone": "",
                    "role": "",
                    "experience_years": "",
                    "salary_expectation": "",
                    "currency": "USD",
                    "education": [],
                    "work_history": []
                },
                "created_at": datetime.utcnow(),
                "last_login": datetime.utcnow()
            }
            
            db.collection('users').document(user.uid).set(user_data)
            logger.info(f"User created successfully: {email}")
            
            return {"uid": user.uid, "email": email, "name": name}
        
        except auth.EmailAlreadyExistsError:
            logger.error(f"Email already exists: {email}")
            return None
        except Exception as e:
            logger.error(f"Error creating user: {str(e)}")
            return None
    
    @staticmethod
    def get_user(uid: str) -> Optional[Dict]:
        """Get user profile from Firestore"""
        try:
            db = get_db()
            doc = db.collection('users').document(uid).get()
            
            if doc.exists:
                return doc.to_dict()
            return None
        except Exception as e:
            logger.error(f"Error getting user: {str(e)}")
            return None
    
    @staticmethod
    def update_profile(uid: str, profile_data: Dict) -> bool:
        """Update user profile"""
        try:
            db = get_db()
            db.collection('users').document(uid).update({
                "profile": profile_data,
                "updated_at": datetime.utcnow()
            })
            logger.info(f"Profile updated for user: {uid}")
            return True
        except Exception as e:
            logger.error(f"Error updating profile: {str(e)}")
            return False
    
    @staticmethod
    def update_last_login(uid: str):
        """Update last login timestamp"""
        try:
            db = get_db()
            db.collection('users').document(uid).update({
                "last_login": datetime.utcnow()
            })
        except Exception as e:
            logger.error(f"Error updating last login: {str(e)}")

# Resume operations
class ResumeDB:
    """Resume database operations"""
    
    @staticmethod
    def save_resume(uid: str, file_url: str, parsed_data: Dict) -> bool:
        """Save resume data to Firestore"""
        try:
            db = get_db()
            resume_data = {
                "user_id": uid,
                "file_url": file_url,
                "parsed_data": parsed_data,
                "uploaded_at": datetime.utcnow()
            }
            
            db.collection('resumes').document(uid).set(resume_data)
            logger.info(f"Resume saved for user: {uid}")
            return True
        except Exception as e:
            logger.error(f"Error saving resume: {str(e)}")
            return False
    
    @staticmethod
    def get_resume(uid: str) -> Optional[Dict]:
        """Get resume data from Firestore"""
        try:
            db = get_db()
            doc = db.collection('resumes').document(uid).get()
            
            if doc.exists:
                return doc.to_dict()
            return None
        except Exception as e:
            logger.error(f"Error getting resume: {str(e)}")
            return None

# Interview operations
class InterviewDB:
    """Interview history database operations"""
    
    @staticmethod
    def save_interview(uid: str, interview_data: Dict) -> Optional[str]:
        """Save interview session to Firestore"""
        try:
            db = get_db()
            interview_data["user_id"] = uid
            interview_data["session_date"] = datetime.utcnow()
            
            doc_ref = db.collection('interviews').add(interview_data)
            logger.info(f"Interview saved for user: {uid}")
            return doc_ref[1].id
        except Exception as e:
            logger.error(f"Error saving interview: {str(e)}")
            return None
    
    @staticmethod
    def get_user_interviews(uid: str, limit: int = 10) -> List[Dict]:
        """Get user's interview history"""
        try:
            db = get_db()
            interviews = db.collection('interviews')\
                .where('user_id', '==', uid)\
                .order_by('session_date', direction=firestore.Query.DESCENDING)\
                .limit(limit)\
                .stream()
            
            return [interview.to_dict() for interview in interviews]
        except Exception as e:
            logger.error(f"Error getting interviews: {str(e)}")
            return []
