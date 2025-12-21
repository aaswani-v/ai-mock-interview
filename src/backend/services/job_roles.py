"""
Job roles database and compatibility logic
"""

JOB_ROLES = {
    # --- Software Development ---
    "full-stack": {
        "title": "Full Stack Developer",
        "description": "Develop both frontend and backend applications",
        "requiredSkills": ["React", "JavaScript", "Node.js", "SQL", "REST API", "Git", "HTML", "CSS"],
        "preferredSkills": ["TypeScript", "Docker", "AWS", "MongoDB", "Next.js", "GraphQL", "Redis"]
    },
    "frontend": {
        "title": "Frontend Developer",
        "description": "Build user interfaces and experiences",
        "requiredSkills": ["React", "JavaScript", "HTML", "CSS", "Responsive Design", "Git"],
        "preferredSkills": ["TypeScript", "Next.js", "Tailwind CSS", "Redux", "Webpack", "Testing Library"]
    },
    "backend": {
        "title": "Backend Developer",
        "description": "Build server-side applications and APIs",
        "requiredSkills": ["Python", "SQL", "REST API", "Database Design", "Git", "Linux"],
        "preferredSkills": ["FastAPI", "PostgreSQL", "Redis", "Docker", "Microservices", "Message Queues", "AWS"]
    },
    "mobile-developer": {
        "title": "Mobile App Developer",
        "description": "Build iOS and Android applications",
        "requiredSkills": ["React Native", "JavaScript", "Mobile UI/UX", "REST API", "Git"],
        "preferredSkills": ["TypeScript", "Swift", "Kotlin", "Firebase", "Push Notifications"]
    },
    "ios-developer": {
        "title": "iOS Developer",
        "description": "Develop native applications for Apple devices",
        "requiredSkills": ["Swift", "iOS SDK", "Xcode", "UIKit", "Git", "Core Data"],
        "preferredSkills": ["SwiftUI", "Combine", "Objective-C", "CocoaPods", "App Store Deployment"]
    },
    "android-developer": {
        "title": "Android Developer",
        "description": "Develop native applications for Android devices",
        "requiredSkills": ["Kotlin", "Android SDK", "Java", "Android Studio", "Git"],
        "preferredSkills": ["Jetpack Compose", "Coroutines", "Dagger/Hilt", "Retrofit", "Google Play Console"]
    },
    "game-developer": {
        "title": "Game Developer",
        "description": "Create video games for various platforms",
        "requiredSkills": ["C++", "C#", "Unity", "Unreal Engine", "Math", "Git"],
        "preferredSkills": ["OpenGL", "DirectX", "Physics Engines", "3D Modeling", "Shaders"]
    },
    "java-developer": {
        "title": "Java Developer",
        "description": "Develop enterprise applications using Java",
        "requiredSkills": ["Java", "Spring Boot", "Hibernate", "SQL", "REST API", "Microservices"],
        "preferredSkills": ["Kafka", "Docker", "Kubernetes", "AWS", "Junit", "System Design"]
    },
    
    # --- Data & AI ---
    "data-scientist": {
        "title": "Data Scientist",
        "description": "Analyze data and build predictive models",
        "requiredSkills": ["Python", "Machine Learning", "SQL", "Statistics", "Pandas", "NumPy", "Data Visualization"],
        "preferredSkills": ["TensorFlow", "PyTorch", "Scikit-learn", "Big Data", "Spark", "Deep Learning", "Jupyter"]
    },
    "ml-engineer": {
        "title": "ML Engineer",
        "description": "Build and deploy machine learning systems",
        "requiredSkills": ["Python", "Deep Learning", "TensorFlow", "PyTorch", "Machine Learning", "Git"],
        "preferredSkills": ["MLOps", "Docker", "Kubernetes", "AWS SageMaker", "Model Optimization", "Production ML"]
    },
    "data-analyst": {
        "title": "Data Analyst",
        "description": "Interpret data to help make business decisions",
        "requiredSkills": ["SQL", "Excel", "Data Visualization", "Statistics", "Python", "Tableau"],
        "preferredSkills": ["Power BI", "R", "Google Analytics", "Business Intelligence", "ETL"]
    },
    "data-engineer": {
        "title": "Data Engineer",
        "description": "Design and maintain data pipelines",
        "requiredSkills": ["SQL", "Python", "ETL", "Big Data", "Database Design", "Spark"],
        "preferredSkills": ["Airflow", "Kafka", "AWS Redshift", "Snowflake", "Hadoop", "Scala"]
    },
    "ai-researcher": {
        "title": "AI Researcher",
        "description": "Research and develop new AI algorithms",
        "requiredSkills": ["Python", "Deep Learning", "Mathematics", "PyTorch", "Research Papers", "Algorithms"],
        "preferredSkills": ["Reinforcement Learning", "NLP", "Computer Vision", "NeurIPS/ICML Publications", "C++"]
    },

    # --- Infrastructure & Security ---
    "devops": {
        "title": "DevOps Engineer",
        "description": "Manage infrastructure and deployment pipelines",
        "requiredSkills": ["Docker", "Kubernetes", "CI/CD", "Linux", "Git", "Bash Scripting"],
        "preferredSkills": ["AWS", "Terraform", "Jenkins", "Ansible", "Monitoring Tools", "Python"]
    },
    "cloud-architect": {
        "title": "Cloud Architect",
        "description": "Design and manage cloud infrastructure",
        "requiredSkills": ["AWS", "Azure", "Cloud Architecture", "Networking", "Security", "Terraform"],
        "preferredSkills": ["Google Cloud", "Kubernetes", "Serverless", "Cost Optimization", "Disaster Recovery"]
    },
    "cyber-security": {
        "title": "Cyber Security Analyst",
        "description": "Protect systems and networks from threats",
        "requiredSkills": ["Network Security", "Linux", "Penetration Testing", "Security Tools", "Python", "Firewalls"],
        "preferredSkills": ["CISSP", "Ethical Hacking", "SIEM", "Incident Response", "Cryptography"]
    },
    "sre": {
        "title": "Site Reliability Engineer",
        "description": "Ensure system reliability and scalability",
        "requiredSkills": ["Linux", "Python", "Go", "Observability", "Incident Management", "Cloud"],
        "preferredSkills": ["Prometheus", "Grafana", "Kubernetes", "Chaos Engineering", "SLO/SLA"]
    },

    # --- Product & Design ---
    "product-manager": {
        "title": "Product Manager",
        "description": "Lead product development and strategy",
        "requiredSkills": ["Product Strategy", "User Research", "Agile", "Communication", "Data Analysis", "Roadmapping"],
        "preferredSkills": ["SQL", "UX Design", "Market Research", "Technical Background", "A/B Testing"]
    },
    "project-manager": {
        "title": "Project Manager",
        "description": "Plan and execute projects",
        "requiredSkills": ["Project Management", "Agile", "Scrum", "Communication", "Risk Management", "Jira"],
        "preferredSkills": ["PMP Certification", "Waterfall", "Budgeting", "Stakeholder Management", "Kanban"]
    },
    "ui-ux-designer": {
        "title": "UI/UX Designer",
        "description": "Design user interfaces and experiences",
        "requiredSkills": ["Figma", "UI Design", "UX Research", "Prototyping", "Wireframing", "Interaction Design"],
        "preferredSkills": ["Adobe Creative Suite", "HTML/CSS", "Design Systems", "User Testing", "Motion Graphics"]
    },
    "graphic-designer": {
        "title": "Graphic Designer",
        "description": "Create visual concepts and layouts",
        "requiredSkills": ["Photoshop", "Illustrator", "InDesign", "Visual Design", "Typography", "Creativity"],
        "preferredSkills": ["Motion Design", "Branding", "Print Design", "3D Design", "After Effects"]
    },

    # --- Testing & QA ---
    "qa-engineer": {
        "title": "QA Engineer",
        "description": "Ensure software quality through testing",
        "requiredSkills": ["Manual Testing", "Test Cases", "Bug Tracking", "Jira", "SQL"],
        "preferredSkills": ["Automation Testing", "Selenium", "Python", "Java", "API Testing"]
    },
    "automation-engineer": {
        "title": "Automation Test Engineer",
        "description": "Write scripts to automate testing",
        "requiredSkills": ["Selenium", "Python", "Java", "Test Automation", "CI/CD", "Git"],
        "preferredSkills": ["Appium", "Cypress", "Playwright", "Docker", "Load Testing"]
    },

    # --- Other Tech Roles ---
    "blockchain-developer": {
        "title": "Blockchain Developer",
        "description": "Build decentralized applications",
        "requiredSkills": ["Solidity", "Smart Contracts", "Ethereum", "Web3.js", "Cryptography", "Git"],
        "preferredSkills": ["Rust", "Hyperledger", "DeFi", "NFTs", "Truffle/Hardhat"]
    },
    "embedded-systems": {
        "title": "Embedded Systems Engineer",
        "description": "Program embedded devices",
        "requiredSkills": ["C", "C++", "Microcontrollers", "RTOS", "Electronics", "Debugging"],
        "preferredSkills": ["IoT", "PCB Design", "ARM", "Linux Kernel", "Driver Development"]
    },
    "network-engineer": {
        "title": "Network Engineer",
        "description": "Manage computer networks",
        "requiredSkills": ["Networking", "Cisco", "Routing/Switching", "TCP/IP", "Firewalls", "Troubleshooting"],
        "preferredSkills": ["CCNA", "CCNP", "Network Security", "Cloud Networking", "SD-WAN"]
    },
    "sales-engineer": {
        "title": "Sales Engineer",
        "description": "Sell technical products using engineering knowledge",
        "requiredSkills": ["Technical Knowledge", "Sales", "Communication", "Presentation", "Problem Solving"],
        "preferredSkills": ["CRM", "Negotiation", "SaaS", "Solution Architecture", "Public Speaking"]
    },
    
    # --- Non-Tech / Hybrid ---
    "digital-marketer": {
        "title": "Digital Marketer",
        "description": "Promote products online",
        "requiredSkills": ["SEO", "Content Marketing", "Social Media", "Analytics", "Email Marketing"],
        "preferredSkills": ["Google Ads", "Copywriting", "CRM", "HTML/CSS Basics", "Graphic Design"]
    },
    "technical-writer": {
        "title": "Technical Writer",
        "description": "Create technical documentation",
        "requiredSkills": ["Technical Writing", "Documentation", "Communication", "English Grammar", "Editing"],
        "preferredSkills": ["Markdown", "API Documentation", "Git", "HTML", "User Guides"]
    },
    "business-analyst": {
        "title": "Business Analyst",
        "description": "Analyze business processes and requirements",
        "requiredSkills": ["Requirements Analysis", "Documentation", "Communication", "Process Mapping", "SQL"],
        "preferredSkills": ["Agile", "UML", "Tableau", "Project Management", "Jira"]
    },
    "hr-specialist": {
        "title": "HR Specialist",
        "description": "Manage recruitment and employee relations",
        "requiredSkills": ["Recruitment", "Communication", "Onboarding", "Employee Relations", "HR Policies"],
        "preferredSkills": ["HRIS", "Talent Acquisition", "Labor Laws", "Performance Management", "Payroll"]
    },
    "finance-analyst": {
        "title": "Finance Analyst",
        "description": "Analyze financial data and trends",
        "requiredSkills": ["Financial Analysis", "Excel", "Accounting", "Financial Modeling", "Data Analysis"],
        "preferredSkills": ["SQL", "Tableau", "CFA", "SAP", "Risk Management"]
    },
    "marketing-manager": {
        "title": "Marketing Manager",
        "description": "Plan and execute marketing strategies",
        "requiredSkills": ["Marketing Strategy", "Digital Marketing", "Campaign Management", "SEO", "Analytics"],
        "preferredSkills": ["Content Marketing", "Social Media", "CRM", "Brand Management", "Copywriting"]
    },
    "operations-manager": {
        "title": "Operations Manager",
        "description": "Oversee daily business operations",
        "requiredSkills": ["Operations Management", "Process Improvement", "Strategic Planning", "Leadership"],
        "preferredSkills": ["Supply Chain", "Logistics", "Project Management", "Six Sigma", "Budgeting"]
    },
    "content-strategist": {
        "title": "Content Strategist",
        "description": "Plan and manage content strategy",
        "requiredSkills": ["Content Strategy", "SEO", "Copywriting", "Editing", "Content Management"],
        "preferredSkills": ["Google Analytics", "Social Media", "Video Production", "UX Writing", "Marketing"]
    }
}

def get_job_role(role_id: str):
    return JOB_ROLES.get(role_id)

def get_all_job_roles():
    return JOB_ROLES

def calculate_compatibility(resume_skills: list, job_role_id: str):
    job_role = get_job_role(job_role_id)
    if not job_role:
        return None
    
    user_skills = set([s.lower() for s in resume_skills])
    required = job_role['requiredSkills']
    preferred = job_role['preferredSkills']
    
    matched_required = [s for s in required if s.lower() in user_skills]
    missing_required = [s for s in required if s.lower() not in user_skills]
    matched_preferred = [s for s in preferred if s.lower() in user_skills]
    missing_preferred = [s for s in preferred if s.lower() not in user_skills]
    
    required_score = (len(matched_required) / len(required)) * 70 if required else 0
    preferred_score = (len(matched_preferred) / len(preferred)) * 30 if preferred else 0
    
    return {
        'score': round(required_score + preferred_score),
        'matchedRequired': matched_required,
        'missingRequired': missing_required,
        'matchedPreferred': matched_preferred,
        'missingPreferred': missing_preferred,
        'totalRequired': len(required),
        'totalPreferred': len(preferred)
    }
