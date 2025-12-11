"""
Groq and Deepgram API Client
Handles speech-to-text transcription and answer evaluation using production APIs.
"""

import os
import logging
import json
from typing import Optional

logger = logging.getLogger(__name__)

# API Configuration
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_API_KEY", "")


def transcribe_audio_deepgram(audio_bytes: bytes, language: str = "en") -> dict:
    """
    Transcribe audio using Deepgram API.
    
    Args:
        audio_bytes: Audio file bytes (WAV format recommended)
        language: Language code (default: "en")
        
    Returns:
        dict: {"text": str, "error": str | None}
    """
    logger.info(f"Transcribing audio with Deepgram ({len(audio_bytes)} bytes)")
    
    if not DEEPGRAM_API_KEY:
        logger.error("DEEPGRAM_API_KEY not set")
        return {"text": "", "error": "Deepgram API key not configured"}
    
    try:
        import requests
        
        # Use Deepgram REST API directly
        url = "https://api.deepgram.com/v1/listen"
        
        headers = {
            "Authorization": f"Token {DEEPGRAM_API_KEY}",
            "Content-Type": "audio/wav"
        }
        
        params = {
            "model": "nova-2",
            "language": language,
            "smart_format": "true",
            "punctuate": "true"
        }
        
        # Make API request
        response = requests.post(url, headers=headers, params=params, data=audio_bytes, timeout=60)
        
        if response.status_code != 200:
            error_msg = f"Deepgram API error: {response.status_code}"
            logger.error(f"{error_msg} - {response.text}")
            return {"text": "", "error": error_msg}
        
        # Parse response
        result = response.json()
        transcript = result["results"]["channels"][0]["alternatives"][0]["transcript"]
        
        logger.info(f"Transcription successful: {len(transcript)} characters")
        return {"text": transcript.strip(), "error": None}
    
    except Exception as e:
        logger.error(f"Deepgram transcription error: {str(e)}")
        return {"text": "", "error": f"Transcription failed: {str(e)}"}


def evaluate_answer_groq(
    question: str, 
    transcript: str, 
    role: str = "SDE",
    candidate_name: Optional[str] = None,
    experience_years: Optional[str] = None,
    salary_expectation: Optional[str] = None,
    visual_metrics: Optional[dict] = None,
    speech_metrics: Optional[dict] = None
) -> dict:
    """
    Evaluate interview answer using Groq API with comprehensive criteria.
    
    Args:
        question: The interview question text
        transcript: The candidate's answer transcript
        role: Job role context (e.g., "SDE", "Frontend")
        candidate_name: Candidate's name (optional)
        experience_years: Years of experience (optional)
        salary_expectation: Expected salary (optional)
        visual_metrics: Dict with eye_contact, posture scores (optional)
        speech_metrics: Dict with wpm, filler_count (optional)
        
    Returns:
        dict: {
            "score": float (1-10),
            "reasoning": str,
            "suggestions": list[str],
            "confidence_assessment": str,
            "communication_quality": str,
            "error": str | None
        }
    """
    logger.info(f"Evaluating answer with Groq for role={role}, candidate={candidate_name or 'Anonymous'}")
    
    if not GROQ_API_KEY:
        logger.error("GROQ_API_KEY not set")
        return {
            "score": 0,
            "reasoning": "Groq API key not configured",
            "suggestions": [],
            "confidence_assessment": "Unable to assess",
            "communication_quality": "Unable to assess",
            "error": "API key missing"
        }
    
    try:
        import requests
        
        # Build candidate profile section
        profile_section = "CANDIDATE PROFILE:\n"
        if candidate_name:
            profile_section += f"- Name: {candidate_name}\n"
        profile_section += f"- Target Role: {role}\n"
        if experience_years:
            profile_section += f"- Experience: {experience_years} years\n"
        if salary_expectation:
            profile_section += f"- Salary Expectation: {salary_expectation}\n"
        
        # Build metrics section
        metrics_section = ""
        if visual_metrics:
            metrics_section += "\nVISUAL ANALYSIS (from video):\n"
            metrics_section += f"- Eye Contact: {visual_metrics.get('eyeContact', 0)}%\n"
            metrics_section += f"- Posture: {visual_metrics.get('posture', 0)}/100\n"
        
        if speech_metrics:
            metrics_section += "\nSPEECH METRICS:\n"
            metrics_section += f"- Words Per Minute: {speech_metrics.get('wordsPerMinute', 0)}\n"
            metrics_section += f"- Filler Words: {speech_metrics.get('fillerCount', 0)}\n"
        
        # Use Groq REST API directly (OpenAI-compatible endpoint)
        url = "https://api.groq.com/openai/v1/chat/completions"
        
        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        }
        
        # Construct comprehensive evaluation prompt with enhanced context
        prompt = f"""You are an expert technical interviewer evaluating a candidate's interview performance.

{profile_section}
INTERVIEW QUESTION:
{question}

CANDIDATE'S ANSWER:
{transcript}
{metrics_section}

EVALUATION CRITERIA:
1. Content Quality (40%): Technical accuracy, depth of knowledge, relevance to question
2. Communication (30%): Clarity, confidence, minimal fumbling/filler words
3. Visual Presence (20%): Eye contact, posture, professional demeanor
4. Speech Delivery (10%): Appropriate pacing, minimal filler words

Provide a comprehensive evaluation as JSON with:
{{
  "score": <1-10 overall score based on weighted criteria>,
  "reasoning": "<2-3 sentences explaining the score, highlighting strengths and weaknesses>",
  "suggestions": [
    {{
      "improvement": "<specific, actionable improvement>",
      "context": "<quote a SHORT phrase from transcript where this applies, or 'General' if applies throughout>",
      "better_approach": "<suggest what they could say instead or how to improve>"
    }},
    {{
      "improvement": "<specific, actionable improvement>",
      "context": "<quote a SHORT phrase from transcript where this applies, or 'General' if applies throughout>",
      "better_approach": "<suggest what they could say instead or how to improve>"
    }},
    {{
      "improvement": "<specific, actionable improvement>",
      "context": "<quote a SHORT phrase from transcript where this applies, or 'General' if applies throughout>",
      "better_approach": "<suggest what they could say instead or how to improve>"
    }}
  ],
  "confidence_assessment": "<brief assessment of candidate's confidence level based on speech and visual cues>",
  "communication_quality": "<brief assessment of communication style and clarity>",
  "behavioral_insights": {{
    "eye_contact_analysis": "<analysis of eye contact consistency based on visual metrics>",
    "filler_word_impact": "<how filler words affected the delivery>",
    "speech_pace_feedback": "<feedback on speaking pace based on WPM>"
  }}
}}

Respond ONLY with valid JSON, no other text."""

        payload = {
            "model": "llama-3.3-70b-versatile",  # Updated to active model
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "temperature": 0.3,
            "max_tokens": 600
        }
        
        # Call Groq API
        response = requests.post(url, headers=headers, json=payload, timeout=60)
        
        if response.status_code != 200:
            error_msg = f"Groq API error: {response.status_code}"
            logger.error(f"{error_msg} - {response.text}")
            return {
                "score": 0,
                "reasoning": "Evaluation failed",
                "suggestions": [],
                "confidence_assessment": "Unable to assess",
                "communication_quality": "Unable to assess",
                "error": error_msg
            }
        
        # Extract response
        result = response.json()
        response_text = result["choices"][0]["message"]["content"].strip()
        
        # Parse JSON
        # Clean up response - remove markdown code blocks if present
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        # Try to find JSON in the response
        start_idx = response_text.find("{")
        end_idx = response_text.rfind("}") + 1
        
        if start_idx != -1 and end_idx > start_idx:
            json_str = response_text[start_idx:end_idx]
            evaluation = json.loads(json_str)
        else:
            evaluation = json.loads(response_text)
        
        # Validate and normalize response
        score = float(evaluation.get("score", 5))
        score = max(1.0, min(10.0, score))  # Clamp to 1-10
        
        reasoning = evaluation.get("reasoning", "No reasoning provided")
        if not isinstance(reasoning, str):
            reasoning = str(reasoning)
        
        suggestions = evaluation.get("suggestions", [])
        if not isinstance(suggestions, list):
            suggestions = [str(suggestions)]
        
        # Normalize suggestions to enhanced format
        normalized_suggestions = []
        for sug in suggestions[:3]:  # Limit to 3 suggestions
            if isinstance(sug, dict):
                # Already in enhanced format
                normalized_suggestions.append({
                    "improvement": sug.get("improvement", "Continue practicing"),
                    "context": sug.get("context", "General"),
                    "better_approach": sug.get("better_approach", "")
                })
            else:
                # Old format (simple string) - convert to enhanced format
                normalized_suggestions.append({
                    "improvement": str(sug),
                    "context": "General",
                    "better_approach": ""
                })
        
        # Ensure exactly 3 suggestions
        while len(normalized_suggestions) < 3:
            normalized_suggestions.append({
                "improvement": "Continue practicing interview questions",
                "context": "General",
                "better_approach": "Practice with a variety of question types"
            })
        
        confidence_assessment = evaluation.get("confidence_assessment", "Moderate confidence displayed")
        communication_quality = evaluation.get("communication_quality", "Clear communication")
        
        # Extract behavioral insights
        behavioral_insights = evaluation.get("behavioral_insights", {})
        if not isinstance(behavioral_insights, dict):
            behavioral_insights = {}
        
        logger.info(f"Evaluation successful: score={score}")
        return {
            "score": score,
            "reasoning": reasoning,
            "suggestions": normalized_suggestions,
            "confidence_assessment": confidence_assessment,
            "communication_quality": communication_quality,
            "behavioral_insights": {
                "eye_contact_analysis": behavioral_insights.get("eye_contact_analysis", ""),
                "filler_word_impact": behavioral_insights.get("filler_word_impact", ""),
                "speech_pace_feedback": behavioral_insights.get("speech_pace_feedback", "")
            },
            "error": None
        }
    
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse JSON from Groq response: {e}")
        logger.debug(f"Raw response: {response_text[:500]}")
        
        # Fallback: Return a basic evaluation
        return {
            "score": 5.0,
            "reasoning": "Unable to parse detailed evaluation. The model response was not in the expected format.",
            "suggestions": [
                "Provide more specific examples",
                "Structure your answer more clearly",
                "Include technical details where relevant"
            ],
            "error": "Failed to parse evaluation response"
        }
    
    except Exception as e:
        logger.error(f"Groq evaluation error: {str(e)}")
        return {
            "score": 0,
            "reasoning": "Evaluation failed",
            "suggestions": [],
            "error": f"Groq API error: {str(e)}"
        }


def generate_dynamic_questions(
    role: str,
    experience_years: Optional[str] = None,
    skills: Optional[list] = None,
    num_questions: int = 3
) -> dict:
    """
    Generate personalized interview questions using Groq API.
    
    Args:
        role: Job role (e.g., "Frontend Engineer", "SDE1")
        experience_years: Years of experience (optional)
        skills: List of skills from resume (optional)
        num_questions: Number of questions to generate (default: 3)
        
    Returns:
        dict: {
            "questions": list[dict] with id, question, difficulty, focus,
            "error": str | None
        }
    """
    logger.info(f"Generating {num_questions} questions for role={role}, experience={experience_years}")
    
    if not GROQ_API_KEY:
        logger.error("GROQ_API_KEY not set")
        return {
            "questions": [],
            "error": "API key not configured"
        }
    
    try:
        import requests
        
        # Build context
        context = f"Role: {role}\n"
        if experience_years:
            context += f"Experience: {experience_years} years\n"
        if skills:
            context += f"Skills: {', '.join(skills[:5])}\n"
        
        # Determine difficulty based on experience
        difficulty_guidance = ""
        if experience_years:
            try:
                years = int(experience_years)
                if years < 2:
                    difficulty_guidance = "Focus on fundamental concepts and basic problem-solving. Difficulty: Easy to Medium."
                elif years < 5:
                    difficulty_guidance = "Mix of intermediate technical questions and some system design. Difficulty: Medium to Hard."
                else:
                    difficulty_guidance = "Advanced technical depth, system design, and leadership scenarios. Difficulty: Hard."
            except:
                difficulty_guidance = "Mix of difficulty levels."
        
        prompt = f"""Generate {num_questions} personalized interview questions for a candidate.

CANDIDATE PROFILE:
{context}

{difficulty_guidance}

Generate questions that are:
1. Relevant to the role and experience level
2. Mix of technical, behavioral, and problem-solving
3. Progressively challenging
4. Realistic for actual interviews

Respond with ONLY valid JSON in this format:
{{
  "questions": [
    {{
      "id": "q1",
      "question": "<interview question text>",
      "difficulty": "<Easy|Medium|Hard>",
      "focus": "<Technical|Behavioral|System Design|Problem Solving>",
      "topic": "<specific topic area>"
    }}
  ]
}}"""

        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": "llama-3.3-70b-versatile",
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.7,
            "max_tokens": 800
        }
        
        response = requests.post(url, headers=headers, json=payload, timeout=60)
        
        if response.status_code != 200:
            error_msg = f"Groq API error: {response.status_code}"
            logger.error(f"{error_msg} - {response.text}")
            return {"questions": [], "error": error_msg}
        
        result = response.json()
        response_text = result["choices"][0]["message"]["content"].strip()
        
        # Clean up response
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        # Extract JSON
        start_idx = response_text.find("{")
        end_idx = response_text.rfind("}") + 1
        
        if start_idx != -1 and end_idx > start_idx:
            json_str = response_text[start_idx:end_idx]
            data = json.loads(json_str)
        else:
            data = json.loads(response_text)
        
        questions = data.get("questions", [])
        logger.info(f"Generated {len(questions)} questions successfully")
        
        return {
            "questions": questions,
            "error": None
        }
    
    except Exception as e:
        logger.error(f"Question generation error: {str(e)}")
        return {
            "questions": [],
            "error": f"Failed to generate questions: {str(e)}"
        }


def test_groq_connection() -> tuple[bool, str]:
    """
    Test Groq API connection and token validity.
    
    Returns:
        tuple: (success: bool, message: str)
    """
    if not GROQ_API_KEY:
        return False, "GROQ_API_KEY not set"
    
    try:
        from groq import Groq
        
        client = Groq(api_key=GROQ_API_KEY)
        
        # Test with a simple completion
        response = client.chat.completions.create(
            messages=[{"role": "user", "content": "Hello"}],
            model="llama-3.1-70b-versatile",
            max_tokens=10,
        )
        
        return True, "Groq API connection successful"
    
    except Exception as e:
        return False, f"Groq connection test failed: {str(e)}"


def test_deepgram_connection() -> tuple[bool, str]:
    """
    Test Deepgram API connection.
    
    Returns:
        tuple: (success: bool, message: str)
    """
    if not DEEPGRAM_API_KEY:
        return False, "DEEPGRAM_API_KEY not set"
    
    try:
        from deepgram import DeepgramClient
        
        # Just check if we can initialize the client
        deepgram = DeepgramClient(DEEPGRAM_API_KEY)
        
        return True, "Deepgram API key configured"
    
    except Exception as e:
        return False, f"Deepgram test failed: {str(e)}"
