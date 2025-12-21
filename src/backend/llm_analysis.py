import google.generativeai as genai
import os
import logging
import json

logger = logging.getLogger(__name__)

# Configure API Key - Ideally from ENV, but check simpler for hackathon manually if needed
# genai.configure(api_key=os.environ["GEMINI_API_KEY"])

from dotenv import load_dotenv
from pathlib import Path

env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path, encoding="utf-8")

def analyze_content_with_llm(transcript: str, question_id: str):
    """
    Analyze the interview answer using Gemini.
    """
    logger.info("Starting content analysis (llm_analysis.py)")
    api_key = os.environ.get("GEMINI_API_KEY")
    logger.info(f"API Key present: {bool(api_key)}")
    if not api_key:
        logger.warning("No GEMINI_API_KEY found. Skipping LLM analysis.")
        return {
            "score": 0,
            "feedback": "API Key missing. Content analysis disabled.",
            "completeness": 0
        }
    
    try:
        genai.configure(api_key=api_key)
        # Using gemini-1.5-flash as it is stable and working
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        # Context could be improved by having the actual question text passed in.
        prompt = f"""
        You are an expert interview coach. Analyze the following candidate answer transcript.
        
        Transcript: "{transcript}"
        Question ID Context: {question_id} (Assume standard behavioral/technical interview question)
        
        Provide a JSON response with:
        1. "score": Integrity (0-100) based on clarity, relevance, and depth.
        2. "feedback": A concise (1-2 sentences) constructive tip.
        3. "completeness": (0-100) Did they answer fully?
        
        JSON Format only.
        """
        
        response = model.generate_content(prompt)
        text_resp = response.text.replace("```json", "").replace("```", "").strip()
        
        data = json.loads(text_resp)
        return data

    except Exception as e:
        logger.error(f"LLM Error: {e}")
        return {
            "score": 0,
            "feedback": f"Error: {str(e)}",
            "completeness": 0
        }

def test_api_connection():
    """
    Simple test to verify Gemini API connection.
    """
    try:
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            return False, "Missing API Key"
        
        genai.configure(api_key=api_key)
        # Verify model list
        models = list(genai.list_models())
        found = any('gemini-1.5-flash' in m.name for m in models)
        if found:
            return True, "Connection Successful, Model Found"
        return True, "Connection Successful, but specific model not in list (might call anyway)"
    except Exception as e:
        return False, str(e)
