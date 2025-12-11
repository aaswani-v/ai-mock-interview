"""
Job roles database with required and preferred skills
"""

JOB_ROLES = {
    "full-stack": {
        "title": "Full Stack Developer",
        "description": "Develop both frontend and backend applications",
        "requiredSkills": [
            "React", "JavaScript", "Node.js", "SQL", 
            "REST API", "Git", "HTML", "CSS"
        ],
        "preferredSkills": [
            "TypeScript", "Docker", "AWS", "MongoDB",
            "Next.js", "GraphQL", "Redis"
        ],
        "experienceLevels": {
            "entry": {"minYears": 0, "maxYears": 2},
            "mid": {"minYears": 2, "maxYears": 5},
            "senior": {"minYears": 5, "maxYears": 100}
        }
    },
    "frontend": {
        "title": "Frontend Developer",
        "description": "Build user interfaces and experiences",
        "requiredSkills": [
            "React", "JavaScript", "HTML", "CSS",
            "Responsive Design", "Git"
        ],
        "preferredSkills": [
            "TypeScript", "Next.js", "Tailwind CSS",
            "Redux", "Webpack", "Testing Library"
        ],
        "experienceLevels": {
            "entry": {"minYears": 0, "maxYears": 2},
            "mid": {"minYears": 2, "maxYears": 5},
            "senior": {"minYears": 5, "maxYears": 100}
        }
    },
    "backend": {
        "title": "Backend Developer",
        "description": "Build server-side applications and APIs",
        "requiredSkills": [
            "Python", "SQL", "REST API", "Database Design",
            "Git", "Linux"
        ],
        "preferredSkills": [
            "FastAPI", "PostgreSQL", "Redis", "Docker",
            "Microservices", "Message Queues", "AWS"
        ],
        "experienceLevels": {
            "entry": {"minYears": 0, "maxYears": 2},
            "mid": {"minYears": 2, "maxYears": 5},
            "senior": {"minYears": 5, "maxYears": 100}
        }
    },
    "devops": {
        "title": "DevOps Engineer",
        "description": "Manage infrastructure and deployment pipelines",
        "requiredSkills": [
            "Docker", "Kubernetes", "CI/CD", "Linux",
            "Git", "Bash Scripting"
        ],
        "preferredSkills": [
            "AWS", "Terraform", "Jenkins", "Ansible",
            "Monitoring Tools", "Python"
        ],
        "experienceLevels": {
            "entry": {"minYears": 1, "maxYears": 3},
            "mid": {"minYears": 3, "maxYears": 6},
            "senior": {"minYears": 6, "maxYears": 100}
        }
    },
    "data-scientist": {
        "title": "Data Scientist",
        "description": "Analyze data and build predictive models",
        "requiredSkills": [
            "Python", "Machine Learning", "SQL", "Statistics",
            "Pandas", "NumPy", "Data Visualization"
        ],
        "preferredSkills": [
            "TensorFlow", "PyTorch", "Scikit-learn",
            "Big Data", "Spark", "Deep Learning"
        ],
        "experienceLevels": {
            "entry": {"minYears": 0, "maxYears": 2},
            "mid": {"minYears": 2, "maxYears": 5},
            "senior": {"minYears": 5, "maxYears": 100}
        }
    },
    "ml-engineer": {
        "title": "ML Engineer",
        "description": "Build and deploy machine learning systems",
        "requiredSkills": [
            "Python", "Deep Learning", "TensorFlow", "PyTorch",
            "Machine Learning", "Git"
        ],
        "preferredSkills": [
            "MLOps", "Docker", "Kubernetes", "AWS",
            "Model Optimization", "Production ML"
        ],
        "experienceLevels": {
            "entry": {"minYears": 1, "maxYears": 3},
            "mid": {"minYears": 3, "maxYears": 6},
            "senior": {"minYears": 6, "maxYears": 100}
        }
    },
    "mobile-developer": {
        "title": "Mobile App Developer",
        "description": "Build iOS and Android applications",
        "requiredSkills": [
            "React Native", "JavaScript", "Mobile UI/UX",
            "REST API", "Git"
        ],
        "preferredSkills": [
            "TypeScript", "Swift", "Kotlin", "Firebase",
            "Push Notifications", "App Store Deployment"
        ],
        "experienceLevels": {
            "entry": {"minYears": 0, "maxYears": 2},
            "mid": {"minYears": 2, "maxYears": 5},
            "senior": {"minYears": 5, "maxYears": 100}
        }
    },
    "qa-engineer": {
        "title": "QA Engineer",
        "description": "Ensure software quality through testing",
        "requiredSkills": [
            "Test Automation", "Selenium", "API Testing",
            "Bug Tracking", "Test Cases"
        ],
        "preferredSkills": [
            "Python", "Cypress", "Postman", "CI/CD",
            "Performance Testing", "Security Testing"
        ],
        "experienceLevels": {
            "entry": {"minYears": 0, "maxYears": 2},
            "mid": {"minYears": 2, "maxYears": 5},
            "senior": {"minYears": 5, "maxYears": 100}
        }
    }
}

def get_job_role(role_id: str):
    """Get job role by ID"""
    return JOB_ROLES.get(role_id)

def get_all_job_roles():
    """Get all available job roles"""
    return JOB_ROLES

def calculate_compatibility(resume_skills: list, job_role_id: str, experience_years: int = 0):
    """
    Calculate how well a resume matches a job role
    
    Returns:
        dict: {
            'score': int (0-100),
            'matchedRequired': list,
            'missingRequired': list,
            'matchedPreferred': list,
            'missingPreferred': list
        }
    """
    job_role = get_job_role(job_role_id)
    if not job_role:
        return None
    
    # Normalize skills to lowercase for comparison
    user_skills = set([s.lower() for s in resume_skills])
    required = [s.lower() for s in job_role['requiredSkills']]
    preferred = [s.lower() for s in job_role['preferredSkills']]
    
    # Calculate matches
    matched_required = [s for s in job_role['requiredSkills'] if s.lower() in user_skills]
    missing_required = [s for s in job_role['requiredSkills'] if s.lower() not in user_skills]
    matched_preferred = [s for s in job_role['preferredSkills'] if s.lower() in user_skills]
    missing_preferred = [s for s in job_role['preferredSkills'] if s.lower() not in user_skills]
    
    # Calculate score (70% required, 30% preferred)
    required_score = (len(matched_required) / len(required)) * 70 if required else 0
    preferred_score = (len(matched_preferred) / len(preferred)) * 30 if preferred else 0
    total_score = round(required_score + preferred_score)
    
    return {
        'score': total_score,
        'matchedRequired': matched_required,
        'missingRequired': missing_required,
        'matchedPreferred': matched_preferred,
        'missingPreferred': missing_preferred,
        'totalRequired': len(required),
        'totalPreferred': len(preferred)
    }