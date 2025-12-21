"""
Demo Data Seeder for Interaura
Creates realistic interview history for demo users to showcase the system.

Usage:
    python seed_demo_data.py <email> [user_id]
    
Examples:
    python seed_demo_data.py ash@test.com
    python seed_demo_data.py ash@test.com 12345-uuid-here
"""

import os
import sys
import random
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Load environment variables
load_dotenv(encoding="utf-8")

from supabase import create_client

# Arguments
TARGET_EMAIL = sys.argv[1] if len(sys.argv) > 1 else "ash@test.com"
PROVIDED_USER_ID = sys.argv[2] if len(sys.argv) > 2 else None

# Initialize Supabase
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

if not url or not key:
    print("❌ SUPABASE_URL and SUPABASE_KEY must be set in .env")
    sys.exit(1)

supabase = create_client(url, key)

# Demo data configuration
DOMAINS = [
    "Software Development",
    "System Design", 
    "Data Structures",
    "Behavioral",
    "Problem Solving",
    "Frontend Development",
    "Backend Development",
    "Cloud & DevOps"
]

DIFFICULTIES = ["beginner", "intermediate", "advanced"]

SAMPLE_QUESTIONS = {
    "Software Development": [
        {"question": "Explain the SOLID principles in OOP", "topic": "Design Principles"},
        {"question": "What is the difference between REST and GraphQL?", "topic": "API Design"},
        {"question": "How do you handle error handling in production?", "topic": "Best Practices"},
    ],
    "System Design": [
        {"question": "Design a URL shortener like bit.ly", "topic": "System Design"},
        {"question": "How would you design Twitter's feed?", "topic": "Scalability"},
        {"question": "Design a rate limiter for an API", "topic": "Infrastructure"},
    ],
    "Data Structures": [
        {"question": "Explain time complexity of common data structures", "topic": "Algorithms"},
        {"question": "When would you use a hash map vs a tree?", "topic": "Data Structures"},
        {"question": "How would you detect a cycle in a linked list?", "topic": "Problem Solving"},
    ],
    "Behavioral": [
        {"question": "Tell me about a time you debugged a complex issue", "topic": "Problem Solving"},
        {"question": "How do you handle disagreements with teammates?", "topic": "Teamwork"},
        {"question": "Describe your biggest professional achievement", "topic": "Leadership"},
    ],
    "Problem Solving": [
        {"question": "How would you approach an unfamiliar codebase?", "topic": "Problem Solving"},
        {"question": "Walk me through your debugging process", "topic": "Debugging"},
        {"question": "How do you prioritize when everything is urgent?", "topic": "Decision Making"},
    ],
    "Frontend Development": [
        {"question": "Explain React's virtual DOM and reconciliation", "topic": "React"},
        {"question": "How do you optimize web performance?", "topic": "Performance"},
        {"question": "What are CSS-in-JS solutions and their trade-offs?", "topic": "Styling"},
    ],
    "Backend Development": [
        {"question": "Explain database indexing and when to use it", "topic": "Databases"},
        {"question": "How do you handle authentication in APIs?", "topic": "Security"},
        {"question": "What is the difference between SQL and NoSQL?", "topic": "Databases"},
    ],
    "Cloud & DevOps": [
        {"question": "Explain CI/CD pipelines and their benefits", "topic": "DevOps"},
        {"question": "How would you set up monitoring for a production app?", "topic": "Observability"},
        {"question": "What are containers and when should you use them?", "topic": "Docker"},
    ],
}


def get_user_id(email: str) -> str:
    """Get user ID from email, creating profile if needed"""
    global PROVIDED_USER_ID
    
    # First check users table
    response = supabase.table('users').select("id").eq('email', email).execute()
    if response.data and len(response.data) > 0:
        return response.data[0]['id']
    
    # If user ID was provided via command line, use it
    if PROVIDED_USER_ID:
        user_id = PROVIDED_USER_ID
        print(f"\n   Using provided user ID: {user_id}")
    else:
        # If not in users table, prompt for user ID
        print(f"\n⚠️  User '{email}' not found in users table.")
        print("   This can happen if the user signed up but profile wasn't created.")
        print("\n   To get your user ID:")
        print("   1. Go to Supabase Dashboard > Authentication > Users")
        print("   2. Find the user with email: " + email)
        print("   3. Copy the User UID")
        print("\n   Then run: python seed_demo_data.py " + email + " <USER_ID>")
        return None
    
    # Create profile for this user
    print(f"\n   Creating profile for user ID: {user_id}")
    try:
        profile_data = {
            "id": user_id,
            "email": email,
            "name": "Ash",
            "phone": "",
            "role": "SDE1",
            "experience_years": "2",
            "salary_expectation": "120000",
            "currency": "USD",
            "education": [],
            "work_history": [],
            "created_at": datetime.now().isoformat(),
            "last_login": datetime.now().isoformat()
        }
        supabase.table('users').insert(profile_data).execute()
        print("   ✅ Profile created successfully")
        return user_id
    except Exception as e:
        print(f"   ⚠️ Profile creation note: {e}")
        # Maybe profile already exists, try fetching again
        response = supabase.table('users').select("id").eq('id', user_id).execute()
        if response.data and len(response.data) > 0:
            print("   ✅ Found existing profile")
            return user_id
        # If insert failed due to unique constraint, the user exists - just use the ID
        print("   ✅ Using provided user ID")
        return user_id


def generate_score_progression(num_days: int, base_score: int = 45) -> list:
    """
    Generate realistic score progression showing improvement over time.
    Starts around base_score and gradually improves with some variance.
    """
    scores = []
    current = base_score
    
    for i in range(num_days):
        # Gradual improvement trend
        improvement = random.uniform(0, 3)
        
        # Add some variance (good days and bad days)
        variance = random.uniform(-8, 8)
        
        # Calculate score with improvement trend
        current = current + improvement + variance
        
        # Clamp between 25 and 95
        current = max(25, min(95, current))
        
        scores.append(int(current))
    
    return scores


def generate_interview_data(domain: str, difficulty: str, overall_score: int, session_date: datetime) -> dict:
    """Generate a single interview record"""
    
    # Generate correlated sub-scores
    base_variance = 15
    visual_score = max(20, min(100, overall_score + random.randint(-base_variance, base_variance)))
    content_score = max(20, min(100, overall_score + random.randint(-base_variance, base_variance + 5)))
    speech_score = max(20, min(100, overall_score + random.randint(-base_variance, base_variance)))
    
    # Get sample questions for this domain
    domain_questions = SAMPLE_QUESTIONS.get(domain, SAMPLE_QUESTIONS["Behavioral"])
    num_questions = random.randint(2, 4)
    questions = random.sample(domain_questions, min(num_questions, len(domain_questions)))
    
    # Add realistic answer evaluation to each question
    for q in questions:
        q["score"] = max(30, min(100, overall_score + random.randint(-20, 20)))
        q["answered"] = True
    
    return {
        "session_date": session_date.isoformat(),
        "overall_score": overall_score,
        "visual_score": visual_score,
        "content_score": content_score,
        "speech_score": speech_score,
        "difficulty": difficulty,
        "domain": domain,
        "questions_answered": len(questions),
        "duration_minutes": random.randint(3, 12),
        "questions": questions
    }


def seed_demo_data(user_id: str, email: str):
    """Seed demo interview data for a user"""
    
    print(f"\n🎯 Seeding demo data for: {email}")
    print(f"   User ID: {user_id}")
    
    # Delete existing interviews for this user (fresh start)
    print("\n🧹 Cleaning existing interview data...")
    supabase.table('interviews').delete().eq('user_id', user_id).execute()
    
    # Generate data for the last 3 weeks
    today = datetime.now()
    interviews = []
    
    # Week 1 (3 weeks ago) - Starting out, lower scores
    week1_start = today - timedelta(days=21)
    week1_scores = generate_score_progression(4, base_score=42)
    
    for i, score in enumerate(week1_scores):
        date = week1_start + timedelta(days=i + random.randint(0, 1))
        domain = random.choice(["Behavioral", "Problem Solving", "Software Development"])
        difficulty = "beginner"
        interviews.append(generate_interview_data(domain, difficulty, score, date))
    
    # Week 2 (2 weeks ago) - Getting better
    week2_start = today - timedelta(days=14)
    week2_scores = generate_score_progression(5, base_score=55)
    
    for i, score in enumerate(week2_scores):
        date = week2_start + timedelta(days=i + random.randint(0, 1))
        domain = random.choice(DOMAINS)
        difficulty = random.choice(["beginner", "intermediate"])
        interviews.append(generate_interview_data(domain, difficulty, score, date))
    
    # Week 3 (last week) - Making progress
    week3_start = today - timedelta(days=7)
    week3_scores = generate_score_progression(6, base_score=62)
    
    for i, score in enumerate(week3_scores):
        date = week3_start + timedelta(days=i)
        domain = random.choice(DOMAINS)
        difficulty = random.choice(["intermediate", "advanced"])
        interviews.append(generate_interview_data(domain, difficulty, score, date))
    
    # This week - Best performance yet
    this_week_start = today - timedelta(days=3)
    this_week_scores = generate_score_progression(4, base_score=72)
    
    for i, score in enumerate(this_week_scores):
        date = this_week_start + timedelta(days=i)
        # Ensure the last interview is today or yesterday
        if i == len(this_week_scores) - 1:
            date = today - timedelta(hours=random.randint(2, 8))
        domain = random.choice(DOMAINS)
        difficulty = random.choice(["intermediate", "advanced"])
        interviews.append(generate_interview_data(domain, difficulty, score, date))
    
    # Insert all interviews
    print(f"\n📥 Inserting {len(interviews)} interview records...")
    
    for idx, interview in enumerate(interviews):
        interview["user_id"] = user_id
        try:
            supabase.table('interviews').insert(interview).execute()
            print(f"   ✅ Interview {idx + 1}: {interview['domain']} ({interview['difficulty']}) - Score: {interview['overall_score']}")
        except Exception as e:
            print(f"   ❌ Failed to insert interview {idx + 1}: {e}")
    
    # Summary
    avg_score = sum(i["overall_score"] for i in interviews) / len(interviews)
    best_score = max(i["overall_score"] for i in interviews)
    latest_score = interviews[-1]["overall_score"]
    
    print(f"\n📊 Demo Data Summary:")
    print(f"   Total Interviews: {len(interviews)}")
    print(f"   Average Score: {avg_score:.1f}")
    print(f"   Best Score: {best_score}")
    print(f"   Latest Score: {latest_score}")
    print(f"   Date Range: {week1_start.strftime('%b %d')} - {today.strftime('%b %d, %Y')}")
    print(f"\n✅ Demo data seeding complete!")


def update_user_profile(user_id: str):
    """Update user profile with demo information"""
    print("\n👤 Updating user profile...")
    
    profile_data = {
        "name": "Ash",
        "role": "SDE1",
        "experience_years": "2",
        "salary_expectation": "120000",
        "currency": "USD",
        "phone": "+1234567890"
    }
    
    try:
        supabase.table('users').update(profile_data).eq('id', user_id).execute()
        print("   ✅ Profile updated successfully")
    except Exception as e:
        print(f"   ⚠️ Profile update failed: {e}")


if __name__ == "__main__":
    print("=" * 50)
    print("🚀 Interaura Demo Data Seeder")
    print("=" * 50)
    
    # Get user ID
    user_id = get_user_id(TARGET_EMAIL)
    
    if not user_id:
        print(f"\n❌ User not found: {TARGET_EMAIL}")
        print("   Make sure the user exists in the database first.")
        sys.exit(1)
    
    # Seed the data
    seed_demo_data(user_id, TARGET_EMAIL)
    update_user_profile(user_id)
    
    print("\n" + "=" * 50)
    print("🎉 Done! The user now has 3+ weeks of demo data.")
    print("=" * 50)
