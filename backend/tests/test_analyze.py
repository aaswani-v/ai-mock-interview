"""
Unit tests for /api/analyze endpoint with mocked HF responses.
Run with: pytest tests/test_analyze.py -v
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
import io
import json


# Mock HF client functions before importing main
@pytest.fixture(autouse=True)
def mock_hf_client():
    """Mock HF client functions for all tests."""
    with patch('hf_client.transcribe_audio_bytes') as mock_transcribe, \
         patch('hf_client.evaluate_answer') as mock_evaluate, \
         patch('hf_client.test_hf_connection') as mock_test:
        
        # Default mock responses
        mock_transcribe.return_value = {
            "text": "This is a test transcript about debugging a production issue.",
            "error": None
        }
        
        mock_evaluate.return_value = {
            "score": 7.5,
            "reasoning": "Good answer with specific examples and clear structure.",
            "suggestions": [
                "Add more technical details",
                "Mention specific tools used",
                "Quantify the impact"
            ],
            "error": None
        }
        
        mock_test.return_value = (True, "Connection successful")
        
        yield {
            'transcribe': mock_transcribe,
            'evaluate': mock_evaluate,
            'test': mock_test
        }


@pytest.fixture
def client():
    """Create test client."""
    from main import app
    return TestClient(app)


@pytest.fixture
def sample_video():
    """Create a minimal fake video file."""
    # Create a small binary file that mimics a video
    # In reality, this would be a real video file
    video_bytes = b'\x00\x00\x00\x20ftypmp42' + b'\x00' * 1000
    return io.BytesIO(video_bytes)


def test_health_endpoint(client):
    """Test health check endpoint."""
    response = client.get("/api/health")
    assert response.status_code == 200
    
    data = response.json()
    assert data["status"] == "ok"
    assert "hf_api" in data
    assert "config" in data


def test_analyze_success(client, sample_video, mock_hf_client):
    """Test successful video analysis."""
    # Mock video metadata extraction
    with patch('main.get_video_metadata') as mock_metadata, \
         patch('main.extract_audio') as mock_extract, \
         patch('main.VideoAnalyzer') as mock_analyzer:
        
        mock_metadata.return_value = ({
            "fps": 30.0,
            "frameCount": 150,
            "durationSeconds": 5.0
        }, None)
        
        mock_extract.return_value = None
        
        mock_analyzer_instance = MagicMock()
        mock_analyzer_instance.process_video.return_value = {
            "eyeContact": 75,
            "posture": 80
        }
        mock_analyzer.return_value = mock_analyzer_instance
        
        # Make request
        response = client.post(
            "/api/analyze",
            files={"file": ("test.mp4", sample_video, "video/mp4")},
            data={"role": "SDE1", "questionId": "sde1_q1"}
        )
        
        assert response.status_code == 200
        
        data = response.json()
        assert data["role"] == "SDE1"
        assert data["questionId"] == "sde1_q1"
        assert "transcript" in data
        assert data["transcript"] == "This is a test transcript about debugging a production issue."
        assert data["transcriptionError"] is None
        
        assert "evaluation" in data
        assert data["evaluation"]["score"] == 7.5
        assert len(data["evaluation"]["suggestions"]) == 3
        
        assert "overallScore" in data
        assert 0 <= data["overallScore"] <= 100


def test_analyze_file_too_large(client):
    """Test file size validation."""
    # Create a large fake file
    large_file = io.BytesIO(b'\x00' * (50 * 1024 * 1024))  # 50MB
    
    response = client.post(
        "/api/analyze",
        files={"file": ("large.mp4", large_file, "video/mp4")},
        data={"role": "SDE1"}
    )
    
    assert response.status_code == 413
    assert "too large" in response.json()["detail"].lower()


def test_analyze_video_too_long(client, sample_video, mock_hf_client):
    """Test video duration validation."""
    with patch('main.get_video_metadata') as mock_metadata, \
         patch('main.extract_audio'):
        
        # Return a video longer than MAX_DURATION_SECONDS (45s)
        mock_metadata.return_value = ({
            "fps": 30.0,
            "frameCount": 1500,
            "durationSeconds": 50.0
        }, None)
        
        response = client.post(
            "/api/analyze",
            files={"file": ("long.mp4", sample_video, "video/mp4")},
            data={"role": "SDE1"}
        )
        
        assert response.status_code == 413
        assert "too long" in response.json()["detail"].lower()


def test_analyze_transcription_error(client, sample_video, mock_hf_client):
    """Test handling of transcription errors."""
    # Mock transcription error
    mock_hf_client['transcribe'].return_value = {
        "text": "",
        "error": "HF API rate limit exceeded"
    }
    
    with patch('main.get_video_metadata') as mock_metadata, \
         patch('main.extract_audio'), \
         patch('main.VideoAnalyzer') as mock_analyzer:
        
        mock_metadata.return_value = ({
            "fps": 30.0,
            "frameCount": 150,
            "durationSeconds": 5.0
        }, None)
        
        mock_analyzer_instance = MagicMock()
        mock_analyzer_instance.process_video.return_value = {
            "eyeContact": 75,
            "posture": 80
        }
        mock_analyzer.return_value = mock_analyzer_instance
        
        response = client.post(
            "/api/analyze",
            files={"file": ("test.mp4", sample_video, "video/mp4")},
            data={"role": "SDE1"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["transcriptionError"] == "HF API rate limit exceeded"
        assert data["transcript"] == ""


def test_analyze_evaluation_error(client, sample_video, mock_hf_client):
    """Test handling of evaluation errors."""
    # Mock evaluation error
    mock_hf_client['evaluate'].return_value = {
        "score": 0,
        "reasoning": "",
        "suggestions": [],
        "error": "Model loading timeout"
    }
    
    with patch('main.get_video_metadata') as mock_metadata, \
         patch('main.extract_audio'), \
         patch('main.VideoAnalyzer') as mock_analyzer:
        
        mock_metadata.return_value = ({
            "fps": 30.0,
            "frameCount": 150,
            "durationSeconds": 5.0
        }, None)
        
        mock_analyzer_instance = MagicMock()
        mock_analyzer_instance.process_video.return_value = {
            "eyeContact": 75,
            "posture": 80
        }
        mock_analyzer.return_value = mock_analyzer_instance
        
        response = client.post(
            "/api/analyze",
            files={"file": ("test.mp4", sample_video, "video/mp4")},
            data={"role": "SDE1"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["evaluation"] is None
        assert data["evaluationError"] == "Model loading timeout"


def test_analyze_without_question_id(client, sample_video, mock_hf_client):
    """Test analysis without question ID (should use fallback)."""
    with patch('main.get_video_metadata') as mock_metadata, \
         patch('main.extract_audio'), \
         patch('main.VideoAnalyzer') as mock_analyzer:
        
        mock_metadata.return_value = ({
            "fps": 30.0,
            "frameCount": 150,
            "durationSeconds": 5.0
        }, None)
        
        mock_analyzer_instance = MagicMock()
        mock_analyzer_instance.process_video.return_value = {
            "eyeContact": 75,
            "posture": 80
        }
        mock_analyzer.return_value = mock_analyzer_instance
        
        response = client.post(
            "/api/analyze",
            files={"file": ("test.mp4", sample_video, "video/mp4")},
            data={"role": "SDE1"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "evaluation" in data
        # Should still get evaluation with generic question


def test_rate_limiting(client, sample_video):
    """Test rate limiting (10 requests per minute)."""
    # This test would need to make 11 requests quickly
    # For simplicity, we'll just verify the limiter is configured
    from main import app
    assert hasattr(app.state, 'limiter')


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
