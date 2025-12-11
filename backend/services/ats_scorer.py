import os
import json
import google.generativeai as genai
from dotenv import load_dotenv
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from typing import List, Dict, Optional

load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)

class ATSScorer:
    """Service for calculating ATS scores using TF-IDF and Jaccard similarity"""
    
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
            ngram_range=(1, 2),
            max_features=1000
        )
    
    def calculate_keyword_match(self, resume_skills: List[str], required_skills: List[str]) -> float:
        if not resume_skills or not required_skills:
            return 0.0
        
        resume_set = set([s.lower() for s in resume_skills])
        required_set = set([s.lower() for s in required_skills])
        
        intersection = resume_set.intersection(required_set)
        union = resume_set.union(required_set)
        
        if len(union) == 0:
            return 0.0
            
        return (len(intersection) / len(union)) * 100
    
    def calculate_semantic_similarity(self, resume_text: str, job_description: str) -> float:
        try:
            documents = [resume_text, job_description]
            tfidf_matrix = self.vectorizer.fit_transform(documents)
            similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
            return similarity * 100
        except Exception as e:
            print(f"Error calculating semantic similarity: {e}")
            return 0.0
    
    def extract_required_skills(self, job_description: str) -> List[str]:
        # Simple extraction based on keywords
        skills = []
        skill_keywords = ['python', 'java', 'javascript', 'react', 'angular', 'vue',
                         'node.js', 'sql', 'mongodb', 'aws', 'docker', 'kubernetes',
                         'git', 'typescript', 'html', 'css']
        jd_lower = job_description.lower()
        for skill in skill_keywords:
            if skill in jd_lower:
                skills.append(skill)
        return skills
    
    
    def _analyze_with_gemini(self, resume_text: str, job_role: str, job_description: str) -> Optional[Dict]:
        """Use Gemini Flash to analyze the resume if API key is present"""
        if not GOOGLE_API_KEY:
            return None
            
        try:
            model = genai.GenerativeModel('gemini-1.5-flash')
            
            prompt = f"""
You are an expert ATS evaluator and recruiter-engine. Evaluate the following candidate RESUME against a TARGET ROLE and the project's ATS rules. Use all checks listed below and produce structured JSON + human-readable summary. Be strict, explicit, and explain every deduction with evidence from the resume.

INPUT:
- JOB_ROLE: "{job_role}"
- JOB_DESCRIPTION: \"\"\"{job_description}\"\"\"
- RESUME_TEXT: \"\"\"{resume_text}\"\"\"
- CONTEXT (optional): ""

REQUIREMENTS & CHECKS (apply all):
1. Role detection
   - Confirm the RESUME fits JOB_ROLE (Exact, Related, Mismatch).
2. Skills & competency (weightable)
   - Extract skill list; detect synonyms and variants.
   - Mark skills: MUST-HAVE, NICE-TO-HAVE (based on JOB_DESCRIPTION).
3. Experience & seniority
   - Compute total relevant experience months/years for the JOB_ROLE.
   - Detect over/under qualification vs. role requirements.
4. Employment gaps
   - Detect any gap >= 6 months.
5. Achievements & quantification
   - Identify achievements with numbers, %, $.
6. Certifications & education
   - Extract certs and map to validated list.
7. Company prestige & signals
   - Flag FAANG+/Tier-1 companies/Startups.
8. Language, action verbs & tone
   - Score action verbs and recommend stronger verbs.
9. ATS formatting & parseability
   - Check file-structure-friendly format.
10. Keyword density & stuffing
    - Compute keyword density for top 10 JD keywords.
11. Role-specific weights & scoring
    - TECH: Skills 35%, Experience 25%, Achievements 20%, Certifications 10%, Format 10%

OUTPUT REQUIREMENTS:
1. Primary output must be valid JSON.
2. JSON structure exactly:
{{
  "metadata": {{
    "job_role": "{job_role}",
    "scoring_profile": "AUTO",
    "method_used": "semantic",
    "timestamp": "ISO8601"
  }},
  "overall_score": {{ "score": 0-100, "label": "Excellent|Good|Fair|Poor" }},
  "breakdown": {{
    "skills": {{"score":0-100, "weight":35, "details":[ {{ "skill":"", "found":true/false, "evidence": "...", "confidence": "low|med|high" }} ]}},
    "experience": {{"score":0-100, "weight":25, "details": {{ "total_relevant_months": 0, "positions":[] }}}},
    "employment_gaps": {{"score":0-100, "weight":0, "details":[]}},
    "achievements": {{"score":0-100, "weight":20, "details":[]}},
    "certifications": {{"score":0-100, "weight":10, "details":[]}},
    "format_parseability": {{"score":0-100, "weight":10, "issues":[]}},
    "company_prestige": {{"score":0-100, "weight":0, "details":[]}},
    "action_verbs_and_tone": {{"score":0-100, "weight":0, "recommendations":[]}},
    "keyword_density": {{"score":0-100, "weight":0, "top_keywords":[]}}
  }},
  "red_flags": [],
  "recommendations": {{
    "immediate": [],
    "rewrite_examples": {{}},
    "ATS_fixes": []
  }},
  "explainability": "Reasoning for top 5 deductions."
}}
3. After JSON, provide a 6–8 line human readable action summary.

STRICT INSTRUCTIONS:
- Return ONLY the JSON followed by the textual summary.
- Ensure the JSON is parsable.
"""
            response = model.generate_content(prompt)
            text_response = response.text
            
            # Extract JSON from response (heuristic cleanup)
            json_str = text_response
            if "```json" in text_response:
                json_str = text_response.split("```json")[1].split("```")[0].strip()
            elif "```" in text_response:
                 json_str = text_response.split("```")[1].split("```")[0].strip()
                 
            data = json.loads(json_str)
            
            # Normalize structure to match our app's EXPECTED response format
            # Our app expects: atsScore, missingSkills, matchedSkills, etc.
            # We map Gemini's output to our model.
            
            breakdown = data.get("breakdown", {})
            skills_data = breakdown.get("skills", {})
            matched = [s['skill'] for s in skills_data.get('details', []) if s.get('found')]
            missing = [s['skill'] for s in skills_data.get('details', []) if not s.get('found')]
            
            return {
                'atsScore': data.get("overall_score", {}).get("score", 0),
                'breakdown': {
                    'keywordMatch': skills_data.get("score", 0),
                    'semanticMatch': 0, # AI handles this implicitly in overall
                    'structure': breakdown.get("format_parseability", {}).get("score", 0),
                    'experience': breakdown.get("experience", {}).get("score", 0),
                    'education': breakdown.get("certifications", {}).get("score", 0)
                },
                'matchedSkills': matched,
                'missingSkills': missing,
                'totalSkillsDetected': len(matched),
                'requiredSkillsCount': len(matched) + len(missing),
                'ai_analysis': data # Store full AI response for future use
            }
            
        except Exception as e:
            print(f"Gemini AI Error: {e}")
            return None

    def calculate_structure_score(self, parsed_resume) -> float:
        """Check for essential resume sections"""
        score = 0
        checks = {
            'Contact Info (Email/Phone)': 25,
            'Education Section': 25,
            'Experience Section': 25,
            'Skills Section': 25
        }
        
        if parsed_resume.email or parsed_resume.phone: score += checks['Contact Info (Email/Phone)']
        if parsed_resume.education: score += checks['Education Section']
        if parsed_resume.experience: score += checks['Experience Section']
        if parsed_resume.skills: score += checks['Skills Section']
        
        return score

    def calculate_experience_score(self, parsed_resume, required_experience_level: str = None) -> float:
        """Score based on years of experience (heuristic)"""
        # Heuristic: Count number of experience entries or use simple parsing
        # If we had parsed duration, we would use that. For now, checking volume.
        exp_count = len(parsed_resume.experience) if parsed_resume.experience else 0
        
        # Simple Logic: 
        # Entry (0-2y) -> 1-2 items
        # Mid (2-5y) -> 2-4 items
        # Senior (5+) -> 4+ items
        
        score = min(exp_count * 20, 100) # Cap at 100 (5 jobs)
        return score

    def calculate_education_score(self, parsed_resume) -> float:
        """Score based on education presence"""
        if not parsed_resume.education: return 0.0
        # Bonus for higher degrees? For now, just presence is good.
        return 100.0

    def calculate_ats_score(self, parsed_resume, job_description: str = None, required_skills_list: List[str] = None, job_role_title: str = "Target Role") -> Dict:
        """
        Calculate Comprehensive ATS Score based on:
        1. Keyword Match (40%)
        2. Semantic Match (30%)
        3. Structure & Formatting (10%)
        4. Experience Match (10%)
        5. Education (10%)
        """
        resume_text = parsed_resume.raw_text
        resume_skills = parsed_resume.skills
        
        if job_description is None:
            job_description = self.DEFAULT_JOB_DESCRIPTION
            
        if required_skills_list:
            required_skills = required_skills_list
        else:
            required_skills = self.extract_required_skills(job_description)
            
        # 0. Try AI Analysis first
        if GOOGLE_API_KEY:
             ai_result = self._analyze_with_gemini(resume_text, job_role_title, job_description)
             if ai_result:
                 return ai_result

        # Fallback to Rule-Based Logic
        # 1. Keyword Score
        keyword_score = self.calculate_keyword_match(resume_skills, required_skills)
        
        # 2. Semantic Score
        semantic_score = self.calculate_semantic_similarity(resume_text, job_description)
        
        # 3. Structure Score
        structure_score = self.calculate_structure_score(parsed_resume)
        
        # 4. Experience Score
        experience_score = self.calculate_experience_score(parsed_resume)
        
        # 5. Education Score
        education_score = self.calculate_education_score(parsed_resume)
        
        # Weighted Final Score
        final_score = (
            (keyword_score * 0.40) +
            (semantic_score * 0.30) +
            (structure_score * 0.10) +
            (experience_score * 0.10) +
            (education_score * 0.10)
        )
        
        resume_skills_lower = set([s.lower() for s in resume_skills])
        required_skills_lower = set([s.lower() for s in required_skills])
        
        matched = resume_skills_lower.intersection(required_skills_lower)
        missing = required_skills_lower.difference(resume_skills_lower)
        
        return {
            'atsScore': round(final_score, 1),
            'breakdown': {
                'keywordMatch': round(keyword_score, 1),
                'semanticMatch': round(semantic_score, 1),
                'structure': round(structure_score, 1),
                'experience': round(experience_score, 1),
                'education': round(education_score, 1)
            },
            'matchedSkills': [s for s in resume_skills if s.lower() in matched],
            'missingSkills': [s for s in required_skills if s.lower() in missing],
            'totalSkillsDetected': len(resume_skills),
            'requiredSkillsCount': len(required_skills)
        }

ats_scorer = ATSScorer()
