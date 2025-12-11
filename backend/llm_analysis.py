import google.generativeai as genai
from groq import Groq
import os
import logging
import json

logger = logging.getLogger(__name__)

# Configure API Key - Ideally from ENV, but check simpler for hackathon manually if needed
# genai.configure(api_key=os.environ["GEMINI_API_KEY"])

def analyze_content_with_llm(transcript: str, question_id: str):
    """
    Analyze the interview answer using Gemini.
    """
    gemini_key = os.environ.get("GEMINI_API_KEY")
    groq_key = os.environ.get("GROQ_API_KEY")

    if not gemini_key and not groq_key:
        logger.warning("No API Key found (GEMINI or GROQ). Skipping LLM analysis.")
        return {
            "score": 0,
            "feedback": "API Key missing. Content analysis disabled.",
            "completeness": 0
        }
    
    # Try Groq first if available (since user prefers it/Gemini failed)
    if groq_key:
        try:
            client = Groq(api_key=groq_key)
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
            
            chat_completion = client.chat.completions.create(
                messages=[
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ],
                model="llama-3.3-70b-versatile",
                response_format={"type": "json_object"}, 
            )
            
            text_resp = chat_completion.choices[0].message.content
            data = json.loads(text_resp)
            return data
            
        except Exception as e:
            logger.error(f"Groq Error: {e}")
            if not gemini_key: # If we don't have gemini key, fail here
                 return {
                    "score": 0,
                    "feedback": f"Groq Error: {str(e)}",
                    "completeness": 0
                }
            # Otherwise fall through to Gemini

    try:
        genai.configure(api_key=gemini_key)
        model = genai.GenerativeModel('gemini-2.0-flash')
        
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
