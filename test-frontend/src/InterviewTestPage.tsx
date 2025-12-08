import { useState, useRef, useEffect } from 'react';
import { Video, Mic, StopCircle, Play, Loader2, RefreshCw, AlertCircle } from 'lucide-react';

interface AnalysisResult {
    role: string;
    questionId: string;
    transcript: string;
    transcriptionError: string | null;
    video: {
        fps: number;
        frameCount: number;
        durationSeconds: number;
    };
    speech: {
        wordCount: number;
        wordsPerMinute: number;
        fillerCount: number;
    };
}

export default function InterviewTestPage() {
    // State
    const [role, setRole] = useState('SDE1');
    const [isRecording, setIsRecording] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [videoFile, setVideoFile] = useState<File | null>(null);

    // Refs
    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const startRecording = async () => {
        setError(null);
        setResult(null);
        setVideoFile(null);

        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });

            setStream(mediaStream);

            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }

            const recorder = new MediaRecorder(mediaStream);
            mediaRecorderRef.current = recorder;
            chunksRef.current = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            recorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error(err);
            setError("Could not access camera/microphone. Please allow permissions.");
        }
    };

    const stopAndAnalyze = () => {
        if (!mediaRecorderRef.current || !isRecording) return;

        const recorder = mediaRecorderRef.current;

        recorder.onstop = () => {
            const blob = new Blob(chunksRef.current, { type: 'video/webm' });
            const file = new File([blob], "answer.webm", { type: 'video/webm' });
            setVideoFile(file); // Save for potential re-upload or debug

            // Stop all tracks
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
                setStream(null);
            }
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }

            setIsRecording(false);
            analyzeVideo(file);
        };

        recorder.stop();
    };

    const analyzeVideo = async (file: File) => {
        setIsAnalyzing(true);
        setError(null);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("role", role);
        formData.append("questionId", "q1");

        try {
            const response = await fetch("http://localhost:8000/api/analyze", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || "Failed to analyze video");
            }

            const data: AnalysisResult = await response.json();
            setResult(data);
        } catch (err: any) {
            setError(err.message || "An error occurred during analysis.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setVideoFile(file);
            analyzeVideo(file);
        }
    };

    return (
        <div className="container">
            <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <h1 style={{ fontSize: '2.5rem', background: 'linear-gradient(to right, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    AI Mock Interview
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>Practice your answers and get instant feedback.</p>
            </header>

            <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
                {/* Setup Section */}
                <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Target Role</label>
                        <select
                            className="select"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="SDE1">Software Engineer (SDE1)</option>
                            <option value="Frontend">Frontend Developer</option>
                            <option value="Backend">Backend Developer</option>
                            <option value="PM">Product Manager</option>
                        </select>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Current Question</span>
                        <div style={{ fontWeight: 600 }}>Explain the difference between array and linked list.</div>
                    </div>
                </div>

                {/* Video Area */}
                <div className="video-container">
                    <video ref={videoRef} autoPlay playsInline muted />

                    {!isRecording && !stream && !result && (
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: 'var(--text-secondary)' }}>
                            <Video size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
                            <p>Camera is off</p>
                        </div>
                    )}

                    {isRecording && (
                        <div className="recording-indicator">
                            <div className="pulse"></div>
                            <span>REC</span>
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    {!isRecording ? (
                        <button
                            className="btn btn-primary"
                            onClick={startRecording}
                            disabled={isAnalyzing}
                        >
                            <Mic size={20} />
                            Start Answer
                        </button>
                    ) : (
                        <button
                            className="btn btn-danger"
                            onClick={stopAndAnalyze}
                        >
                            <StopCircle size={20} />
                            Stop & Analyze
                        </button>
                    )}

                    {/* File Upload Alternative */}
                    <div style={{ position: 'relative' }}>
                        <input
                            type="file"
                            accept="video/*"
                            onChange={handleFileUpload}
                            style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                            disabled={isRecording || isAnalyzing}
                        />
                        <button className="btn" style={{ background: '#334155', color: 'white' }} disabled={isRecording || isAnalyzing}>
                            <RefreshCw size={20} />
                            Upload File instead
                        </button>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', borderRadius: '0.5rem', color: '#fca5a5', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <AlertCircle size={20} />
                        {error}
                    </div>
                )}

                {/* Analysis Status */}
                {isAnalyzing && (
                    <div style={{ marginTop: '2rem', textAlign: 'center', padding: '2rem' }}>
                        <Loader2 size={48} className="animate-spin" style={{ margin: '0 auto', color: 'var(--accent)' }} />
                        <p style={{ marginTop: '1rem', fontSize: '1.125rem' }}>Analyzing your answer...</p>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Transcribing audio and computing metrics</p>
                    </div>
                )}

                {/* Result View */}
                {result && !isAnalyzing && (
                    <div style={{ marginTop: '2rem', borderTop: '1px solid #334155', paddingTop: '2rem' }}>
                        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Play size={20} fill="currentColor" />
                            Analysis Result
                        </h3>

                        <div className="stats-grid">
                            <div className="stat-box">
                                <div className="stat-label">Duration</div>
                                <div className="stat-value">{result.video.durationSeconds.toFixed(1)}s</div>
                            </div>
                            <div className="stat-box">
                                <div className="stat-label">WPM</div>
                                <div className="stat-value">{result.speech.wordsPerMinute}</div>
                            </div>
                            <div className="stat-box">
                                <div className="stat-label">Fillers</div>
                                <div className="stat-value" style={{ color: result.speech.fillerCount > 5 ? 'var(--danger)' : 'var(--success)' }}>
                                    {result.speech.fillerCount}
                                </div>
                            </div>
                            <div className="stat-box">
                                <div className="stat-label">FPS</div>
                                <div className="stat-value">{result.video.fps.toFixed(0)}</div>
                            </div>
                        </div>

                        <div style={{ marginTop: '1.5rem' }}>
                            <h4 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Transcript</h4>
                            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '0.5rem', lineHeight: '1.6' }}>
                                {result.transcript || <span style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>No transcript available</span>}
                            </div>
                            {result.transcriptionError && (
                                <div style={{ marginTop: '0.5rem', color: 'var(--danger)', fontSize: '0.875rem' }}>
                                    Error: {result.transcriptionError}
                                </div>
                            )}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
