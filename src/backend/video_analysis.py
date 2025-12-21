import cv2
import numpy as np
import logging
import os

logger = logging.getLogger(__name__)

class VideoAnalyzer:
    def __init__(self):
        # Load Haar Cascade for face detection
        # OpenCV usually comes with these xml files. We will try to load from cv2 data or local.
        # If not found, we'll download or error gracefully.
        self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        
    def process_video(self, video_path: str):
        """
        Analyze video for Eye Contact (Face presence/orientation) and Body Stability.
        Returns score dict (0-100).
        """
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            logger.error(f"Could not open video: {video_path}")
            return {"eyeContact": 0, "posture": 0}

        frame_count = 0
        face_detected_frames = 0
        stable_head_frames = 0
        
        # Track head centroid to measure stability/posture checks
        centroids = []

        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            frame_count += 1
            # Skip frames for speed (process every 5th frame)
            if frame_count % 5 != 0:
                continue

            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            faces = self.face_cascade.detectMultiScale(gray, 1.1, 4)

            if len(faces) > 0:
                face_detected_frames += 1
                
                # Get largest face (assuming user is main subject)
                faces = sorted(faces, key=lambda x: x[2]*x[3], reverse=True)
                (x, y, w, h) = faces[0]
                
                cx, cy = x + w//2, y + h//2
                centroids.append((cx, cy))
                
                # Posture check: Is face roughly centered horizontally and in top half?
                height, width = frame.shape[:2]
                
                # "Good Posture" roughly means face is centrally located, not slouching too low
                if 0.2 * width < cx < 0.8 * width and 0.1 * height < cy < 0.6 * height:
                     stable_head_frames += 1

        cap.release()
        
        processed_frames = frame_count // 5
        if processed_frames == 0:
            return {"eyeContact": 0, "posture": 0}

        # Eye Contact Score: Percentage of frames where a frontal face was detected
        eye_contact_score = int((face_detected_frames / processed_frames) * 100)
        
        # Posture Score: Percentage of frames where face was in "good" position
        # We can also penalize excessive movement if we wanted, but simple position is robust enough.
        posture_score = int((stable_head_frames / processed_frames) * 100)

        # Normalize/Boost scores (cascades are strict)
        # If simple cascade finds face 50% of time, that's actually decent eye contact usually.
        # Let's curve it slightly.
        eye_contact_score = min(100, int(eye_contact_score * 1.2))

        return {
            "eyeContact": eye_contact_score,
            "posture": posture_score
        }
