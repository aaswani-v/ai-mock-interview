from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict
from datetime import datetime

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    confirmPassword: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class ParsedResume(BaseModel):
    name: Optional[str]
    email: Optional[str]
    phone: Optional[str]
    skills: List[str]
    education: List[str]
    experience: List[Dict]
    raw_text: str

class ResumeUploadResponse(BaseModel):
    success: bool
    resumeId: str
    fileName: str
    fileUrl: str
    fileSize: int
    message: str

class ATSAnalysisResult(BaseModel):
    atsScore: float
    skills: List[str]
    missingSkills: List[str]
    matchedSkills: List[str]
    totalSkills: int
    experienceYears: Optional[int]
    education: List[str]

class JobCompatibilityResponse(BaseModel):
    roleId: str
    roleTitle: str
    score: float
    matchedRequired: List[str]
    missingRequired: List[str]
    matchedPreferred: List[str]
    missingPreferred: List[str]

class ResumeAnalysisResponse(BaseModel):
    success: bool
    resumeId: str
    fileName: str
    fileUrl: str
    fileSize: int
    atsScore: float
    skills: List[str]
    missingSkills: List[str]
    matchedSkills: List[str]
    parsedText: str
    analysis: dict
    jobCompatibilities: List[JobCompatibilityResponse] = []
    message: str
