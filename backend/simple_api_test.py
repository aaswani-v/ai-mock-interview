
import os
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables
load_dotenv()

def check_structure():
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("Error: GEMINI_API_KEY not found in environment variables.")
        return

    print(f"API Key found: {api_key[:5]}... (masked)")
    
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        print("Sending basic prompt: 'Hello, are you working?'")
        response = model.generate_content("Hello, are you working?")
        
        print("\nResponse Received:")
        print("-" * 20)
        print(response.text)
        print("-" * 20)
        print("API is working correctly.")
        

    except Exception as e:
        print(f"\nError occurred: {str(e)}")
        print("\nListing available models to help debug:")
        try:
            for m in genai.list_models():
                if 'generateContent' in m.supported_generation_methods:
                    print(f"- {m.name}")
        except Exception as list_e:
            print(f"Could not list models: {list_e}")


if __name__ == "__main__":
    check_structure()
