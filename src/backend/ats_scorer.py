from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from typing import List, Dict
import numpy as np

class ATSScorer:
    """Service for calculating ATS scores"""
    
    # Default job description (can be customized per interview)
    DEFAULT_JOB_DESCRIPTION = """
    We are looking for a Full Stack Developer with strong experience in:
    - Frontend: React, TypeScript, HTML, CSS, JavaScript
    - Backend: Node.js, Python, FastAPI, Express
    - Database: PostgreSQL, MongoDB, SQL
    - Cloud: AWS, Docker, Kubernetes
    - Tools: Git, CI/CD, Agile methodologies
    
    Required skills: Python, React, SQL, AWS, Docker
    Good to have: Kubernetes, TypeScript, GraphQL, Machine Learning
    """
    
    def __init__(self):
        self.vectorizer = TfidfVectorizer(
            stop_words='english',
            ngram_range=(1, 2),  # Use unigrams and bigrams
            max_features=1000
        )
    
    def calculate_keyword_match(self, resume_skills: List[str], required_skills: List[str]) -> float:
        """
        Calculate Jaccard similarity (keyword overlap)
        Score = |intersection| / |union|
        """
        if not resume_skills or not required_skills:
            return 0.0
        
        resume_set = set([s.lower() for s in resume_skills])
        required_set = set([s.lower() for s in required_skills])
        
        intersection = resume_set.intersection(required_set)
        union = resume_set.union(required_set)
        
        if len(union) == 0:
            return 0.0
        
        jaccard_score = len(intersection) / len(union)
        return jaccard_score * 100  # Convert to percentage
    
    def calculate_semantic_similarity(self, resume_text: str, job_description: str) -> float:
        """
        Calculate semantic similarity using TF-IDF and cosine similarity
        """
        try:
            # Create TF-IDF vectors
            documents = [resume_text, job_description]
            tfidf_matrix = self.vectorizer.fit_transform(documents)
            
            # Calculate cosine similarity
            similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
            
            return similarity * 100  # Convert to percentage
        except Exception as e:
            print(f"Error calculating semantic similarity: {e}")
            return 0.0
    
    def extract_required_skills(self, job_description: str) -> List[str]:
        """Extract required skills from job description"""
        # Simple extraction - looks for common skill keywords
        skills = []
        skill_keywords = ['python', 'java', 'javascript', 'react', 'angular', 'vue',
                         'node.js', 'sql', 'mongodb', 'aws', 'docker', 'kubernetes',
                         'git', 'typescript', 'html', 'css']
        
        jd_lower = job_description.lower()
        for skill in skill_keywords:
            if skill in jd_lower:
                skills.append(skill)
        
        return skills
    
    def calculate_ats_score(
        self,
        resume_text: str,
        resume_skills: List[str],
        job_description: str = None
    ) -> Dict:
        """
        Calculate comprehensive ATS score
        
        Returns:
            dict: {
                'atsScore': float (0-100),
                'keywordMatchScore': float,
                'semanticMatchScore': float,
                'matchedSkills': list,
                'missingSkills': list
            }
        """
        if job_description is None:
            job_description = self.DEFAULT_JOB_DESCRIPTION
        
        # Extract required skills from JD
        required_skills = self.extract_required_skills(job_description)
        
        # Calculate keyword match score
        keyword_score = self.calculate_keyword_match(resume_skills, required_skills)
        
        # Calculate semantic similarity score
        semantic_score = self.calculate_semantic_similarity(resume_text, job_description)
        
        # Weighted average (60% semantic, 40% keyword)
        # Semantic is more important as it captures context
        final_score = (semantic_score * 0.6) + (keyword_score * 0.4)
        
        # Find matched and missing skills
        resume_skills_lower = set([s.lower() for s in resume_skills])
        required_skills_lower = set([s.lower() for s in required_skills])
        
        matched = resume_skills_lower.intersection(required_skills_lower)
        missing = required_skills_lower.difference(resume_skills_lower)
        
        matched_skills = [s for s in resume_skills if s.lower() in matched]
        missing_skills = [s for s in required_skills if s.lower() in missing]
        
        return {
            'atsScore': round(final_score, 2),
            'keywordMatchScore': round(keyword_score, 2),
            'semanticMatchScore': round(semantic_score, 2),
            'matchedSkills': matched_skills,
            'missingSkills': missing_skills,
            'totalSkillsDetected': len(resume_skills),
            'requiredSkillsCount': len(required_skills)
        }

# Create singleton instance
ats_scorer = ATSScorer()