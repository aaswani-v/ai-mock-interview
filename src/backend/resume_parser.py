import pdfplumber
import re
from typing import Dict, List
from app.models.resume import ParsedResume

class ResumeParser:
    """Service for parsing PDF resumes"""
    
    # Common skill keywords (expand this list)
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
        
        # Find skills from our predefined list
        for skill in self.TECH_SKILLS:
            # Use word boundaries to avoid partial matches
            if re.search(r'\b' + re.escape(skill) + r'\b', text_lower):
                # Capitalize properly
                found_skills.append(skill.title() if skill.islower() else skill)
        
        # Remove duplicates and sort
        return sorted(list(set(found_skills)))
    
    def extract_name(self, text: str) -> str:
        """Extract name from resume (first line usually)"""
        lines = text.split('\n')
        # First non-empty line is often the name
        for line in lines[:5]:  # Check first 5 lines
            line = line.strip()
            if line and len(line.split()) <= 4:  # Names are usually 2-4 words
                # Check if it's not an email or phone
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
        
        return list(set(education))  # Remove duplicates
    
    def extract_experience(self, text: str) -> List[dict]:
        """Extract work experience from resume"""
        experience = []
        lines = text.split('\n')
        
        # Look for common experience section headers
        exp_section_started = False
        current_company = None
        
        for i, line in enumerate(lines):
            line_lower = line.lower()
            
            # Check if experience section started
            if any(keyword in line_lower for keyword in ['experience', 'work history', 'employment']):
                exp_section_started = True
                continue
            
            # Stop if we hit education or skills section
            if any(keyword in line_lower for keyword in ['education', 'skills', 'certifications']):
                exp_section_started = False
            
            if exp_section_started and line.strip():
                # Look for company names (usually have keywords like Inc, Ltd, Corp, or are in caps)
                if any(keyword in line for keyword in ['Inc.', 'Ltd.', 'Corp.', 'Pvt']) or line.isupper():
                    if current_company:
                        experience.append(current_company)
                    current_company = {'company': line.strip(), 'details': []}
                elif current_company:
                    current_company['details'].append(line.strip())
        
        if current_company:
            experience.append(current_company)
        
        return experience
    
    def detect_career_gaps(self, text: str) -> List[dict]:
        """Detect potential career gaps"""
        gaps = []
        
        # Extract years mentioned in resume
        years = re.findall(r'\b(19|20)\d{2}\b', text)
        if len(years) >= 2:
            years = sorted(set(map(int, years)))
            
            # Check for gaps > 6 months
            for i in range(len(years) - 1):
                gap = years[i + 1] - years[i]
                if gap > 1:  # More than 1 year gap
                    gaps.append({
                        'type': 'career_gap',
                        'startYear': years[i],
                        'endYear': years[i + 1],
                        'duration': f"{gap} years",
                        'severity': 'high' if gap > 2 else 'medium'
                    })
        
        return gaps
    
    def calculate_total_experience(self, text: str) -> dict:
        """Calculate total years of experience"""
        years = re.findall(r'\b(19|20)\d{2}\b', text)
        if len(years) >= 2:
            years = sorted(set(map(int, years)))
            first_job_year = min(years)
            latest_year = max(years)
            total_years = latest_year - first_job_year
            
            return {
                'years': total_years,
                'firstJobYear': first_job_year,
                'latestYear': latest_year
            }
        
        return {'years': 0, 'firstJobYear': None, 'latestYear': None}

    def parse_resume(self, file_path: str) -> ParsedResume:
        """
        Main function to parse resume and extract all information
        """
        # Extract raw text
        raw_text = self.extract_text_from_pdf(file_path)
        
        # Extract structured information
        parsed_data = ParsedResume(
            name=self.extract_name(raw_text),
            email=self.extract_email(raw_text),
            phone=self.extract_phone(raw_text),
            skills=self.extract_skills(raw_text),
            education=self.extract_education(raw_text),
            experience=self.extract_experience(raw_text),
            raw_text=raw_text
        )
        
        return parsed_data

# Create singleton instance
resume_parser = ResumeParser()