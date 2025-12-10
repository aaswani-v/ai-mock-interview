"""
Hugging Face Inference API Client
Handles speech-to-text transcription and answer evaluation using HF models.
"""

import os
import time
import json
import logging
import requests
from typing import Optional

logger = logging.getLogger(__name__)

# HF API Configuration
HF_API_BASE = "https://api-inference.huggingface.co/models"
HF_API_TOKEN = os.getenv("HUGGINGFACE_API_TOKEN", "")

# Model Configuration (can be overridden via env vars)
# Using models confirmed to work on HF free tier
ASR_MODEL = os.getenv("HF_ASR_MODEL", "facebook/wav2vec2-base-960h")  # Alternative to Whisper
LLM_MODEL = os.getenv("HF_LLM_MODEL", "google/flan-t5-base")  # Smaller, free-tier compatible

# Retry Configuration
MAX_RETRIES = 3
INITIAL_BACKOFF = 1.0  # seconds
MAX_WAIT_TIME = 60.0  # seconds for model loading


def _make_hf_request(
    model: str,
    payload: dict = None,
    files: dict = None,
    timeout: int = 30,
    retry_count: int = 0
) -> dict:
    """
    Make a request to HF Inference API with retry logic.
    
    Args:
        model: HF model identifier
        payload: JSON payload for text generation
        files: File payload for audio/image models
        timeout: Request timeout in seconds
        retry_count: Current retry attempt
        
    Returns:
        dict: API response or error dict
    """
    if not HF_API_TOKEN:
        logger.error("HUGGINGFACE_API_TOKEN not set")
        return {"error": "HF API token not configured"}
    
    url = f"{HF_API_BASE}/{model}"
    headers = {"Authorization": f"Bearer {HF_API_TOKEN}"}
    
    try:
        if files:
            response = requests.post(url, headers=headers, files=files, timeout=timeout)
        else:
            headers["Content-Type"] = "application/json"
            response = requests.post(url, headers=headers, json=payload, timeout=timeout)
        
        # Handle rate limiting (429)
        if response.status_code == 429:
            if retry_count < MAX_RETRIES:
                backoff = INITIAL_BACKOFF * (2 ** retry_count)
                logger.warning(f"Rate limited (429). Retrying in {backoff}s... (attempt {retry_count + 1}/{MAX_RETRIES})")
                time.sleep(backoff)
                return _make_hf_request(model, payload, files, timeout, retry_count + 1)
            else:
                logger.error("Max retries exceeded for rate limiting")
                return {"error": "Rate limit exceeded. Please try again later."}
        
        # Handle model loading (503)
        if response.status_code == 503:
            try:
                error_data = response.json()
                estimated_time = error_data.get("estimated_time", 20)
            except:
                estimated_time = 20
            
            if retry_count < MAX_RETRIES and estimated_time < MAX_WAIT_TIME:
                wait_time = min(estimated_time + 2, MAX_WAIT_TIME)
                logger.info(f"Model loading (503). Waiting {wait_time}s... (attempt {retry_count + 1}/{MAX_RETRIES})")
                time.sleep(wait_time)
                return _make_hf_request(model, payload, files, timeout, retry_count + 1)
            else:
                logger.error("Model loading timeout or max retries exceeded")
                return {"error": f"Model is loading. Please try again in {estimated_time}s."}
        
        # Handle other errors
        if response.status_code != 200:
            logger.error(f"HF API error {response.status_code}: {response.text}")
            return {"error": f"API error: {response.status_code}"}
        
        return response.json()
    
    except requests.exceptions.Timeout:
        logger.error(f"Request timeout after {timeout}s")
        return {"error": "Request timeout. Model may be overloaded."}
    
    except requests.exceptions.RequestException as e:
        logger.error(f"Request failed: {str(e)}")
        return {"error": f"Network error: {str(e)}"}
    
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return {"error": f"Unexpected error: {str(e)}"}


def transcribe_audio_bytes(audio_bytes: bytes, language: str = "en") -> dict:
    """
    Transcribe audio using HF Whisper model.
    
    Args:
        audio_bytes: Audio file bytes (WAV format recommended)
        language: Language code (default: "en")
        
    Returns:
        dict: {"text": str, "error": str | None}
    """
    logger.info(f"Transcribing audio ({len(audio_bytes)} bytes) with model {ASR_MODEL}")
    
    files = {"file": ("audio.wav", audio_bytes, "audio/wav")}
    
    result = _make_hf_request(ASR_MODEL, files=files, timeout=60)
    
    if "error" in result:
        logger.error(f"Transcription failed: {result['error']}")
        return {"text": "", "error": result["error"]}
    
    # HF Whisper returns {"text": "..."} or [{"text": "..."}]
    if isinstance(result, list) and len(result) > 0:
        text = result[0].get("text", "")
    elif isinstance(result, dict):
        text = result.get("text", "")
    else:
        logger.error(f"Unexpected transcription response format: {result}")
        return {"text": "", "error": "Unexpected response format"}
    
    logger.info(f"Transcription successful: {len(text)} characters")
    return {"text": text.strip(), "error": None}


def evaluate_answer(question: str, transcript: str, role: str = "SDE") -> dict:
    """
    Evaluate interview answer using HF LLM.
    
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
    logger.info(f"Evaluating answer for role={role}, question length={len(question)}, transcript length={len(transcript)}")
    
    # Construct prompt for structured evaluation
    prompt = f"""<s>[INST] You are an expert technical interviewer evaluating a candidate's answer.

Role: {role}
Question: {question}

Candidate's Answer:
{transcript}

Evaluate this answer and provide a JSON response with:
1. "score": A number from 1-10 based on clarity, technical depth, and relevance
2. "reasoning": A 2-3 sentence explanation of the score
3. "suggestions": An array of exactly 3 specific improvement suggestions

Respond ONLY with valid JSON, no other text.
[/INST]"""

    payload = {
        "inputs": prompt,
        "parameters": {
            "max_new_tokens": 500,
            "temperature": 0.2,
            "top_p": 0.9,
            "return_full_text": False
        }
    }
    
    result = _make_hf_request(LLM_MODEL, payload=payload, timeout=45)
    
    if "error" in result:
        logger.error(f"Evaluation failed: {result['error']}")
        return {
            "score": 0,
            "reasoning": "Evaluation unavailable",
            "suggestions": [],
            "error": result["error"]
        }
    
    # Parse LLM response
    try:
        # HF returns [{"generated_text": "..."}] or {"generated_text": "..."}
        if isinstance(result, list) and len(result) > 0:
            generated_text = result[0].get("generated_text", "")
        elif isinstance(result, dict):
            generated_text = result.get("generated_text", "") or result.get("text", "")
        else:
            raise ValueError(f"Unexpected response format: {result}")
        
        # Clean up response - remove markdown code blocks if present
        generated_text = generated_text.strip()
        if "```json" in generated_text:
            generated_text = generated_text.split("```json")[1].split("```")[0].strip()
        elif "```" in generated_text:
            generated_text = generated_text.split("```")[1].split("```")[0].strip()
        
        # Try to find JSON in the response
        # Sometimes models add text before/after JSON
        start_idx = generated_text.find("{")
        end_idx = generated_text.rfind("}") + 1
        
        if start_idx != -1 and end_idx > start_idx:
            json_str = generated_text[start_idx:end_idx]
            evaluation = json.loads(json_str)
        else:
            # Fallback: try parsing entire response
            evaluation = json.loads(generated_text)
        
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
        logger.error(f"Failed to parse JSON from LLM response: {e}")
        logger.debug(f"Raw response: {generated_text[:500]}")
        
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
        logger.error(f"Unexpected error parsing evaluation: {str(e)}")
        return {
            "score": 0,
            "reasoning": "Evaluation failed",
            "suggestions": [],
            "error": f"Parsing error: {str(e)}"
        }


def test_hf_connection() -> tuple[bool, str]:
    """
    Test HF API connection and token validity.
    
    Returns:
        tuple: (success: bool, message: str)
    """
    if not HF_API_TOKEN:
        return False, "HUGGINGFACE_API_TOKEN not set"
    
    try:
        # Test with a simple text generation
        test_payload = {
            "inputs": "Hello, this is a test.",
            "parameters": {"max_new_tokens": 10}
        }
        
        result = _make_hf_request(LLM_MODEL, payload=test_payload, timeout=30)
        
        if "error" in result:
            return False, f"API Error: {result['error']}"
        
        return True, f"Connection successful. Using models: ASR={ASR_MODEL}, LLM={LLM_MODEL}"
    
    except Exception as e:
        return False, f"Connection test failed: {str(e)}"
