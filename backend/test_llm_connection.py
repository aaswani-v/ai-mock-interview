
import os
from dotenv import load_dotenv
import google.generativeai as genai
import logging

# Setup basic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load env
load_dotenv()
api_key = os.environ.get("GEMINI_API_KEY")
print(f"API Key present: {bool(api_key)}")

if api_key:
    try:
        genai.configure(api_key=api_key)
        # Test 1: List models
        print("Listing models...")
        models = list(genai.list_models())
        found = False
        for m in models:
            if 'gemini-2.0-flash' in m.name:
                print(f"Found model: {m.name}")
                found = True
        
        if not found:
            print("WARNING: gemini-2.0-flash not found in list_models()")

        # Test 2: Generate content
        print("\nTesting Generation...")
        model = genai.GenerativeModel('gemini-2.0-flash')
        response = model.generate_content("Hello, can you hear me?")
        print(f"Response: {response.text}")

    except Exception as e:
        logger.exception("Error during test")
else:
    print("No API Key found.")
