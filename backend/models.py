from pydantic import BaseModel
from typing import List, Optional

class ParsedResume(BaseModel):
    """Model for parsed resume data"""
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    skills: List[str] = []
    education: List[str] = []
    experience: List[dict] = []
    raw_text: str = ""
