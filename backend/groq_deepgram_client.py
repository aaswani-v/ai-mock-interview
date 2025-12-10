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


def evaluate_answer_groq(question: str, transcript: str, role: str = "SDE") -> dict:
    """
    Evaluate interview answer using Groq API.
    
    Args:
        question: The interview question text
        transcript: The candidate's answer transcript
        role: Job role context (e.g., "SDE", "Frontend")
        
    Returns:
        dict: {
            "score": float (1-10),
            "reasoning": str,
            "suggestions": list[str],
            "error": str | None
        }
    """
    logger.info(f"Evaluating answer with Groq for role={role}")
    
    if not GROQ_API_KEY:
        logger.error("GROQ_API_KEY not set")
        return {
            "score": 0,
            "reasoning": "Groq API key not configured",
            "suggestions": [],
            "error": "API key missing"
        }
    
    try:
        import requests
        
        # Use Groq REST API directly (OpenAI-compatible endpoint)
        url = "https://api.groq.com/openai/v1/chat/completions"
        
        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        }
        
        # Construct prompt for structured evaluation
        prompt = f"""You are an expert technical interviewer evaluating a candidate's answer.

Role: {role}
Question: {question}

Candidate's Answer:
{transcript}

Evaluate this answer and provide a JSON response with:
1. "score": A number from 1-10 based on clarity, technical depth, and relevance
2. "reasoning": A 2-3 sentence explanation of the score
3. "suggestions": An array of exactly 3 specific improvement suggestions

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
            "max_tokens": 500
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
        
        # Ensure exactly 3 suggestions
        while len(suggestions) < 3:
            suggestions.append("Continue practicing interview questions")
        suggestions = suggestions[:3]
        
        logger.info(f"Evaluation successful: score={score}")
        return {
            "score": score,
            "reasoning": reasoning,
            "suggestions": suggestions,
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
