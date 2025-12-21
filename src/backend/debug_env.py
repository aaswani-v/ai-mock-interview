
import sys
import os

print(f"Python executable: {sys.executable}")
try:
    import dotenv
    print("dotenv imported successfully")
except ImportError as e:
    print(f"dotenv import failed: {e}")

try:
    import google.generativeai
    print("google.generativeai imported successfully")
except ImportError as e:
    print(f"google.generativeai import failed: {e}")

# Manual .env reader since dotenv might be missing
def read_env(path=".env"):
    if not os.path.exists(path):
        return {}
    env = {}
    with open(path, "r") as f:
        for line in f:
            if "=" in line:
                k, v = line.strip().split("=", 1)
                env[k] = v
    return env

env_vars = read_env()
api_key = env_vars.get("GEMINI_API_KEY")

if api_key:
    # Remove quotes if present
    api_key = api_key.strip('"').strip("'")
    print(f"API Key found (length {len(api_key)})")
    
    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        print("Listing models...")
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                print(f"- {m.name}")
    except Exception as e:
        print(f"API Error: {e}")

else:
    print("GEMINI_API_KEY not found in .env (manual read)")
