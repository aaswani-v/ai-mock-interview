import pdfplumber
import re
from typing import List
from backend.models import ParsedResume

class ResumeParser:
    """Service for parsing PDF resumes"""
    
    # Common skill keywords
    TECH_SKILLS = {
        'python', 'java', 'javascript', 'typescript', 'react', 'angular', 'vue',
        'node.js', 'nodejs', 'express', 'fastapi', 'django', 'flask',
        'sql', 'mongodb', 'postgresql', 'mysql', 'redis',
        'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'k8s',
        'git', 'github', 'gitlab', 'ci/cd', 'jenkins',
        'html', 'css', 'sass', 'tailwind', 'bootstrap',
        'machine learning', 'deep learning', 'tensorflow', 'pytorch',
        'data science', 'pandas', 'numpy', 'scikit-learn',
        'restful api', 'graphql', 'microservices',
        'agile', 'scrum', 'jira', 'linux', 'bash'
    }
    
    def extract_text_from_pdf(self, file_path: str) -> str:
        """Extract text from PDF file"""
        try:
            text = ""
            with pdfplumber.open(file_path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
            return text.strip()
        except Exception as e:
            raise Exception(f"Error extracting text from PDF: {str(e)}")
    
    def extract_email(self, text: str) -> str:
        """Extract email address from text"""
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        emails = re.findall(email_pattern, text)
        return emails[0] if emails else None
    
    def extract_phone(self, text: str) -> str:
        """Extract phone number from text"""
        phone_patterns = [
            r'\+?\d{1,3}[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}',  # US format
            r'\+?\d{10,}',  # Simple 10+ digits
        ]
        for pattern in phone_patterns:
            phones = re.findall(pattern, text)
            if phones:
                return phones[0]
        return None
    
    def extract_skills(self, text: str) -> List[str]:
        """Extract skills from text using keyword matching"""
        text_lower = text.lower()
        found_skills = []
        
        for skill in self.TECH_SKILLS:
            if re.search(r'\b' + re.escape(skill) + r'\b', text_lower):
                found_skills.append(skill.title() if skill.islower() else skill)
        
        return sorted(list(set(found_skills)))
    
    def extract_name(self, text: str) -> str:
        """Extract name from resume (heuristic)"""
        lines = text.split('\n')
        for line in lines[:5]:
            line = line.strip()
            if line and len(line.split()) <= 4:
                if '@' not in line and not re.search(r'\d{10}', line):
                    return line
        return None
    
    def extract_education(self, text: str) -> List[str]:
        """Extract education qualifications"""
        education_keywords = ['bachelor', 'master', 'phd', 'b.tech', 'm.tech', 'b.e.', 'm.e.', 
                            'bca', 'mca', 'mba', 'degree', 'diploma']
        education = []
        lines = text.split('\n')
        for line in lines:
            line_lower = line.lower()
            for keyword in education_keywords:
                if keyword in line_lower:
                    education.append(line.strip())
                    break
        return list(set(education))
    
    def extract_experience(self, text: str) -> List[dict]:
        """Extract work experience (simplified)"""
        experience = []
        lines = text.split('\n')
        exp_section_started = False
        current_company = None
        
        for line in lines:
            line_lower = line.lower()
            if any(keyword in line_lower for keyword in ['experience', 'work history', 'employment']):
                exp_section_started = True
                continue
            if any(keyword in line_lower for keyword in ['education', 'skills', 'certifications']):
                exp_section_started = False
            
            if exp_section_started and line.strip():
                if any(keyword in line for keyword in ['Inc.', 'Ltd.', 'Corp.', 'Pvt']) or line.isupper():
                    if current_company:
                        experience.append(current_company)
                    current_company = {'company': line.strip(), 'details': []}
                elif current_company:
                    current_company['details'].append(line.strip())
        
        if current_company:
            experience.append(current_company)
        return experience
    
    def parse_resume(self, file_path: str) -> ParsedResume:
        """Main parsing function"""
        raw_text = self.extract_text_from_pdf(file_path)
        return ParsedResume(
            name=self.extract_name(raw_text),
            email=self.extract_email(raw_text),
            phone=self.extract_phone(raw_text),
            skills=self.extract_skills(raw_text),
            education=self.extract_education(raw_text),
            experience=self.extract_experience(raw_text),
            raw_text=raw_text
        )

resume_parser = ResumeParser()
