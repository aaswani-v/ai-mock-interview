# 🎉 AI Interview Practice Backend - PRODUCTION READY

**Status**: ✅ Fully functional with Groq + Deepgram APIs

## Quick Start

### 1. Install Dependencies

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

### 2. Configure API Keys

Create `.env` file:

```bash
# Groq API (Get from https://console.groq.com)
GROQ_API_KEY=your_groq_api_key_here

# Deepgram API (Get from https://console.deepgram.com)
DEEPGRAM_API_KEY=your_deepgram_api_key_here

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Upload Limits
MAX_UPLOAD_MB=40
MAX_DURATION_SECONDS=45

# Rate Limiting
RATE_LIMIT_PER_MINUTE=10/minute
```

### 3. Run Server

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 4. Test

```bash
python test_client.py "samples/your_video.mp4" --role SDE1 --question-id sde1_q1
```

---

## Features

### ✅ AI-Powered Analysis

- **Deepgram Transcription**: State-of-the-art speech-to-text (Nova-2 model)
- **Groq Evaluation**: Fast LLM scoring with llama-3.3-70b-versatile
- **Visual Analysis**: Eye contact and posture detection (OpenCV)
- **Speech Metrics**: WPM, word count, filler word detection

### ✅ Production Ready

- Rate limiting (10 req/min)
- Upload validation (40MB, 45s max)
- CORS configuration
- Comprehensive error handling
- Structured logging

---

## API Endpoints

### `POST /api/analyze`

Analyze interview video response.

**Request**:

```bash
curl -X POST http://localhost:8000/api/analyze \
  -F "file=@video.mp4" \
  -F "role=SDE1" \
  -F "questionId=sde1_q1"
```

**Response**:

```json
{
  "role": "SDE1",
  "questionId": "sde1_q1",
  "transcript": "In my previous role, I debugged a memory leak...",
  "transcriptionError": null,
  "video": {
    "fps": 30.0,
    "frameCount": 900,
    "durationSeconds": 30.0
  },
  "speech": {
    "wordCount": 45,
    "wordsPerMinute": 90.0,
    "fillerCount": 2
  },
  "visual": {
    "eyeContact": 75,
    "posture": 80
  },
  "evaluation": {
    "score": 7.5,
    "reasoning": "Strong answer with specific examples...",
    "suggestions": [
      "Add more technical details",
      "Mention specific tools used",
      "Quantify the impact"
    ]
  },
  "evaluationError": null,
  "overallScore": 75,
  "speechScore": 88.0
}
```

### `GET /api/health`

Check API status.

**Response**:

```json
{
  "status": "ok",
  "groq_api": {
    "status": "up",
    "message": "Groq API connection successful"
  },
  "deepgram_api": {
    "status": "up",
    "message": "Deepgram API key configured"
  },
  "config": {
    "max_upload_mb": 40,
    "max_duration_seconds": 45,
    "rate_limit": "10/minute"
  }
}
```

---

## API Keys & Quotas

### Groq (Free Tier)

- **Get Key**: https://console.groq.com
- **Rate Limit**: 30 requests/minute
- **Tokens**: 6,000 tokens/minute
- **Model**: llama-3.3-70b-versatile
- **Perfect for**: Hackathon demos and testing

### Deepgram (Free Tier)

- **Get Key**: https://console.deepgram.com
- **Credits**: $200 free credits
- **Cost**: ~$0.0043/minute (Nova-2 model)
- **Estimate**: ~46,000 minutes of transcription
- **Perfect for**: Production demos

---

## Deployment to Render

### 1. Push to GitHub

```bash
git add .
git commit -m "Production-ready backend with Groq + Deepgram"
git push origin main
```

### 2. Create Render Web Service

1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: ai-interview-backend
   - **Region**: Oregon
   - **Branch**: main
   - **Root Directory**: backend
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### 3. Set Environment Variables

Add in Render dashboard:

```
GROQ_API_KEY=your_groq_key
DEEPGRAM_API_KEY=your_deepgram_key
ALLOWED_ORIGINS=http://localhost:3000,https://your-frontend.com
MAX_UPLOAD_MB=40
MAX_DURATION_SECONDS=45
RATE_LIMIT_PER_MINUTE=10/minute
```

### 4. Deploy

Click "Create Web Service" and wait 5-10 minutes.

Your API will be live at: `https://your-app.onrender.com`

---

## Testing

### Test with Sample Video

```bash
# Generate test video
python samples/generate_test_video.py

# Test locally
python test_client.py samples/short_speech.mp4 --role SDE1 --question-id sde1_q1

# Test deployed
python test_client.py samples/short_speech.mp4 \
  --url https://your-app.onrender.com \
  --role SDE1 --question-id sde1_q1
```

### Run Unit Tests

```bash
pip install pytest pytest-mock
pytest tests/test_analyze.py -v
```

---

## Troubleshooting

### "Groq API error: 400"

- **Cause**: Model decommissioned or invalid request
- **Fix**: Verify model name is `llama-3.3-70b-versatile`

### "Deepgram API error: 401"

- **Cause**: Invalid API key
- **Fix**: Check DEEPGRAM_API_KEY in `.env`

### "Rate limit exceeded"

- **Cause**: Too many requests
- **Fix**: Wait 1 minute or adjust RATE_LIMIT_PER_MINUTE

### "FFmpeg not found"

- **Windows**: Download from ffmpeg.org or run `python install_ffmpeg.py`
- **Mac**: `brew install ffmpeg`
- **Linux**: `sudo apt-get install ffmpeg`

---

## Project Structure

```
backend/
├── main.py                      # FastAPI application
├── groq_deepgram_client.py     # API client (direct REST)
├── video_analysis.py           # OpenCV face detection
├── questions.json              # Interview questions
├── requirements.txt            # Dependencies
├── .env                        # API keys (gitignored)
├── .env.example               # Environment template
├── Procfile                   # Render start command
├── render.yaml                # Render deployment config
├── test_client.py             # CLI test tool
├── tests/
│   └── test_analyze.py        # Unit tests
└── samples/
    ├── generate_test_video.py
    ├── Q1 Debugging a complex issue in production.mp4
    └── Q2 Designing a URL shortener.mp4
```

---

## Performance

### Local Testing

- **Transcription**: 2-5s (depends on audio length)
- **Evaluation**: 1-3s (Groq is very fast)
- **Visual Analysis**: 0.5-1s (local OpenCV)
- **Total**: ~5-10s per video

### Render Free Tier

- **Cold Start**: 30-60s (first request after inactivity)
- **Warm**: Same as local (~5-10s)
- **Memory**: ~200-300MB (fits in 512MB limit)

---

## Success Metrics

### Tested Videos

- ✅ Q1: "Debugging a complex issue in production" (10.05 MB, 30s)

  - Transcription: 276 characters
  - Evaluation: 7.5/10 with 3 suggestions
  - Response time: 14.79s

- ✅ Q2: "Designing a URL shortener" (10.49 MB, 32s)
  - Full pipeline working
  - Detailed evaluation with suggestions
  - Response time: ~15s

---

## Tech Stack

- **Framework**: FastAPI 0.109.0
- **Transcription**: Deepgram Nova-2 (REST API)
- **Evaluation**: Groq llama-3.3-70b-versatile (REST API)
- **Video Processing**: OpenCV 4.9.0, FFmpeg
- **Rate Limiting**: SlowAPI 0.1.9
- **HTTP Client**: Requests 2.31.0

---

## License

MIT License

---

## Support

- **Issues**: GitHub Issues
- **Groq Docs**: https://console.groq.com/docs
- **Deepgram Docs**: https://developers.deepgram.com
- **Render Docs**: https://render.com/docs

---

**Made for IIT Hackathon 2025** 🚀
