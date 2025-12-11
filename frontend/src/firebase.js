import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Replace with your actual Firebase Configuration
// You can find this in Firebase Console -> Project Settings -> General -> Your Apps
const firebaseConfig = {
    apiKey: "AIzaSyDfGU_at_9v33in8pwMFhmE_SSMMg9jiPQ",
    authDomain: "ai-interview-hack.firebaseapp.com",
    projectId: "ai-interview-hack",
    storageBucket: "ai-interview-hack.firebasestorage.app",
    messagingSenderId: "973011188318",
    appId: "1:973011188318:web:2b61b67ec62049be5f92cf"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
