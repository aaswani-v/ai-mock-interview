"""
Test client for /api/analyze endpoint.
Usage: python test_client.py <video_file> [--role ROLE] [--question-id QUESTION_ID] [--url URL]
"""

import sys
import argparse
import requests
import json
from pathlib import Path
import time


def test_analyze(video_path: str, role: str = None, question_id: str = None, url: str = "http://localhost:8000"):
    """
    Test the /api/analyze endpoint with a video file.
    
    Args:
        video_path: Path to video file
        role: Job role (optional)
        question_id: Question ID (optional)
        url: Base URL of the API
    """
    endpoint = f"{url}/api/analyze"
    
    # Check if file exists
    video_file = Path(video_path)
    if not video_file.exists():
        print(f"❌ Error: File not found: {video_path}")
        return
    
    print(f"📹 Testing with video: {video_file.name}")
    print(f"📊 File size: {video_file.stat().st_size / (1024*1024):.2f} MB")
    print(f"🌐 Endpoint: {endpoint}")
    print(f"👤 Role: {role or 'Not specified'}")
    print(f"❓ Question ID: {question_id or 'Not specified'}")
    print()
    
    # Prepare form data
    files = {
        'file': (video_file.name, open(video_file, 'rb'), 'video/mp4')
    }
    
    data = {}
    if role:
        data['role'] = role
    if question_id:
        data['questionId'] = question_id
    
    # Make request
    print("⏳ Sending request...")
    start_time = time.time()
    
    try:
        response = requests.post(endpoint, files=files, data=data, timeout=180)
        elapsed = time.time() - start_time
        
        print(f"⏱️  Response time: {elapsed:.2f}s")
        print(f"📡 Status code: {response.status_code}")
        print()
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Success! Response:")
            print("=" * 80)
            print(json.dumps(result, indent=2))
            print("=" * 80)
            print()
            
            # Print summary
            print("📊 Summary:")
            print(f"  Transcript: {len(result.get('transcript', ''))} characters")
            print(f"  Overall Score: {result.get('overallScore', 'N/A')}/100")
            
            if result.get('evaluation'):
                eval_data = result['evaluation']
                print(f"  Evaluation Score: {eval_data.get('score', 'N/A')}/10")
                print(f"  Reasoning: {eval_data.get('reasoning', 'N/A')[:100]}...")
                print(f"  Suggestions: {len(eval_data.get('suggestions', []))} items")
            
            if result.get('transcriptionError'):
                print(f"  ⚠️  Transcription Error: {result['transcriptionError']}")
            
            if result.get('evaluationError'):
                print(f"  ⚠️  Evaluation Error: {result['evaluationError']}")
        
        else:
            print(f"❌ Error: {response.status_code}")
            try:
                error_data = response.json()
                print(json.dumps(error_data, indent=2))
            except:
                print(response.text)
    
    except requests.exceptions.Timeout:
        print("❌ Request timeout (180s). The API may be overloaded or the video is too long.")
    
    except requests.exceptions.ConnectionError:
        print(f"❌ Connection error. Is the server running at {url}?")
    
    except Exception as e:
        print(f"❌ Unexpected error: {str(e)}")
    
    finally:
        files['file'][1].close()


def main():
    parser = argparse.ArgumentParser(
        description="Test the AI Interview Backend /api/analyze endpoint",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python test_client.py video.mp4
  python test_client.py video.mp4 --role SDE1 --question-id sde1_q1
  python test_client.py video.mp4 --url https://your-app.onrender.com
        """
    )
    
    parser.add_argument('video', help='Path to video file')
    parser.add_argument('--role', help='Job role (e.g., SDE1, Frontend)')
    parser.add_argument('--question-id', help='Question ID from questions.json')
    parser.add_argument('--url', default='http://localhost:8000', help='API base URL')
    
    args = parser.parse_args()
    
    test_analyze(args.video, args.role, args.question_id, args.url)


if __name__ == "__main__":
    main()
