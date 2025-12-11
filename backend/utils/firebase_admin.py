import firebase_admin
from firebase_admin import credentials, firestore, auth
import os
from dotenv import load_dotenv

load_dotenv()

# Global Firestore client
db = None

def initialize_firebase():
    """Initialize Firebase Admin SDK"""
    global db
    
    if not firebase_admin._apps:
        try:
            # Check if credentials file exists
            # Get the directory of the current file (backend/utils)
            utils_dir = os.path.dirname(os.path.abspath(__file__))
            # Go up one level to backend
            backend_dir = os.path.dirname(utils_dir)
            
            cred_path = os.path.join(backend_dir, "serviceAccountKey.json")
            
            if os.path.exists(cred_path):
                cred = credentials.Certificate(cred_path)
                firebase_admin.initialize_app(cred)
                print("✅ Firebase Admin SDK initialized successfully")
            else:
                print(f"⚠️  Firebase credentials not found at: {cred_path}")
                print("⚠️  Running without Firebase - some features will be disabled")
                return None
        except Exception as e:
            print(f"❌ Error initializing Firebase: {e}")
            return None
    
    # Get Firestore client
    try:
        db = firestore.client()
        return db
    except Exception as e:
        print(f"❌ Error getting Firestore client: {e}")
        return None

def get_firestore_client():
    """Get Firestore client (lazy initialization)"""
    global db
    if db is None:
        db = initialize_firebase()
    return db

# Initialize on module import
initialize_firebase()
