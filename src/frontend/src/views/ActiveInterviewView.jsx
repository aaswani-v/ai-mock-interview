import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Square, Video, VideoOff, RefreshCw, Loader2, CheckCircle, AlertCircle, Phone, MoreVertical, Move, GripVertical, SkipForward, ChevronRight } from 'lucide-react';
import AudioVisualizer from '../components/visuals/AudioVisualizer';
import { API_URL } from '../config';

const MAX_RECORDING_SECONDS = 60;

// Landscape Orientation Prompt
const LandscapePrompt = ({ onContinue }) => {
    const [isLandscape, setIsLandscape] = useState(window.innerWidth > window.innerHeight);

    useEffect(() => {
        const check = () => setIsLandscape(window.innerWidth > window.innerHeight);
        window.addEventListener('resize', check);
        window.addEventListener('orientationchange', check);
        return () => { window.removeEventListener('resize', check); window.removeEventListener('orientationchange', check); };
    }, []);

    if (isLandscape || window.innerWidth >= 768) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-[#0e1621] flex items-center justify-center p-6">
            <div className="text-center max-w-sm">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                    <span className="text-2xl">📱</span>
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Rotate Your Device</h2>
                <p className="text-gray-400 mb-4 text-sm">For the best interview experience, please rotate to landscape mode.</p>
                <button onClick={onContinue} className="w-full py-3 bg-[#0e72ed] text-white rounded-xl font-medium">Continue Anyway</button>
            </div>
        </div>
    );
};

// Draggable PiP Component - Optimized for all screen sizes
const DraggablePiP = ({ videoRef, isRecording, isProcessing, timer, formatTime, userName, isMuted }) => {
    const [position, setPosition] = useState({ x: 16, y: 60 });
    const [size, setSize] = useState({ width: 160, height: 120 });
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [initialPos, setInitialPos] = useState({ x: 0, y: 0 });
    const [initialSize, setInitialSize] = useState({ width: 0, height: 0 });

    // Adjust size based on screen
    useEffect(() => {
        const updateSize = () => {
            const isMobile = window.innerWidth < 768;
            setSize(isMobile ? { width: 120, height: 90 } : { width: 180, height: 135 });
            setPosition({ x: 16, y: 60 });
        };
        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    const handleMouseDown = useCallback((e) => {
        if (e.target.closest('.resize-handle')) return;
        e.preventDefault();
        setIsDragging(true);
        setDragStart({ x: e.clientX, y: e.clientY });
        setInitialPos({ x: position.x, y: position.y });
    }, [position]);

    const handleMouseMove = useCallback((e) => {
        if (isDragging) {
            setPosition({
                x: Math.max(8, Math.min(window.innerWidth - size.width - 8, initialPos.x + (e.clientX - dragStart.x))),
                y: Math.max(50, Math.min(window.innerHeight - size.height - 80, initialPos.y + (e.clientY - dragStart.y)))
            });
        }
        if (isResizing) {
            setSize({
                width: Math.max(100, Math.min(280, initialSize.width + (e.clientX - dragStart.x))),
                height: Math.max(75, Math.min(210, initialSize.height + (e.clientY - dragStart.y)))
            });
        }
    }, [isDragging, isResizing, dragStart, initialPos, initialSize, size]);

    const handleMouseUp = useCallback(() => { setIsDragging(false); setIsResizing(false); }, []);

    const handleResizeStart = (e) => {
        e.preventDefault(); e.stopPropagation();
        setIsResizing(true);
        setDragStart({ x: e.clientX, y: e.clientY });
        setInitialSize({ width: size.width, height: size.height });
    };

    useEffect(() => {
        if (isDragging || isResizing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); };
        }
    }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

    const handleTouchStart = (e) => {
        if (e.target.closest('.resize-handle')) return;
        const touch = e.touches[0];
        setIsDragging(true);
        setDragStart({ x: touch.clientX, y: touch.clientY });
        setInitialPos({ x: position.x, y: position.y });
    };

    const handleTouchMove = (e) => {
        if (isDragging) {
            const touch = e.touches[0];
            setPosition({
                x: Math.max(8, Math.min(window.innerWidth - size.width - 8, initialPos.x + (touch.clientX - dragStart.x))),
                y: Math.max(50, Math.min(window.innerHeight - size.height - 80, initialPos.y + (touch.clientY - dragStart.y)))
            });
        }
    };

    return (
        <div
            className="fixed z-50 rounded-lg overflow-hidden shadow-2xl border-2 border-white/20 cursor-move select-none"
            style={{ left: position.x, top: position.y, width: size.width, height: size.height }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
        >
            <video ref={videoRef} autoPlay muted playsInline className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]" />
            
            {!isRecording && !isProcessing && (
                <div className="absolute inset-0 bg-[#1a2332] flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                        <span className="text-lg font-bold text-white">{userName?.charAt(0) || 'U'}</span>
                    </div>
                </div>
            )}

            {isRecording && (
                <div className={`absolute top-1 left-1 flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${timer > MAX_RECORDING_SECONDS - 15 ? 'bg-yellow-500' : 'bg-red-500'}`}>
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                    <span className="text-white">{formatTime(timer)}</span>
                </div>
            )}

            {isProcessing && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                    <RefreshCw size={18} className="animate-spin text-white" />
                </div>
            )}

            <div className="absolute top-1 right-1 p-1 rounded bg-black/40 opacity-60 hover:opacity-100">
                <Move size={10} className="text-white" />
            </div>

            <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/60 flex items-center gap-1">
                <span className="text-white text-[10px] font-medium">{userName}</span>
                {isMuted && <MicOff size={8} className="text-red-400" />}
            </div>

            <div className="resize-handle absolute bottom-0 right-0 w-5 h-5 cursor-se-resize flex items-end justify-end p-0.5" onMouseDown={handleResizeStart}>
                <GripVertical size={8} className="text-white/50 rotate-[-45deg]" />
            </div>
        </div>
    );
};

const ActiveInterviewView = ({ onEndQuestion, userProfile, difficulty = 'intermediate' }) => {
    const [showLandscapePrompt, setShowLandscapePrompt] = useState(true);
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
    const [messages, setMessages] = useState([]);
    const [timer, setTimer] = useState(0);
    const [meetingTimer, setMeetingTimer] = useState(0);
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [lastResult, setLastResult] = useState(null);
    const [allResults, setAllResults] = useState([]);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [hasAnsweredCurrent, setHasAnsweredCurrent] = useState(false);
    
    const timerRef = useRef(null);
    const meetingTimerRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const videoPreviewRef = useRef(null);
    const streamRef = useRef(null);
    const chatContainerRef = useRef(null);

    const savedUser = localStorage.getItem('user');
    const userData = savedUser ? JSON.parse(savedUser) : {};
    const profile = userProfile || { name: userData?.name || 'You', role: userData?.role || 'Professional' };

    const generateLineFeedback = (transcript) => {
        if (!transcript) return null;
        const sentences = transcript.split(/(?<=[.!?])\s+/).filter(s => s.trim()).slice(0, 3);
        const lineAnalysis = sentences.map((sentence) => {
            const hasAction = /i (led|created|developed|implemented|managed)/i.test(sentence);
            const hasFillers = /\b(um|uh|you know|basically)\b/i.test(sentence);
            if (hasFillers) return { type: 'improve', feedback: 'Reduce filler words' };
            if (hasAction) return { type: 'good', feedback: 'Great action verb' };
            return { type: 'neutral', feedback: '' };
        });
        return { lineAnalysis: lineAnalysis.filter(i => i.type !== 'neutral').slice(0, 2) };
    };

    useEffect(() => {
        const fetchQuestions = async () => {
            setIsLoadingQuestions(true);
            try {
                const formData = new FormData();
                formData.append('role', profile.role);
                formData.append('difficulty', difficulty);
                const response = await fetch(`${API_URL}/questions/generate`, { method: 'POST', body: formData });
                const data = await response.json();
                const qs = data.questions?.length > 0 ? data.questions : [
                    { id: 1, question: "Tell me about yourself.", topic: "Introduction" },
                    { id: 2, question: "What are your strengths?", topic: "Behavioral" }
                ];
                setQuestions(qs);
                setMessages([{ role: 'ai', type: 'question', text: qs[0].question, topic: qs[0].topic }]);
            } catch {
                const qs = [{ id: 1, question: "Tell me about yourself.", topic: "Introduction" }];
                setQuestions(qs);
                setMessages([{ role: 'ai', text: qs[0].question, topic: qs[0].topic }]);
            } finally {
                setIsLoadingQuestions(false);
            }
        };
        fetchQuestions();
    }, []);

    useEffect(() => {
        if (chatContainerRef.current) chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }, [messages]);

    useEffect(() => {
        if (isRecording) timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
        else { clearInterval(timerRef.current); setTimer(0); }
        return () => clearInterval(timerRef.current);
    }, [isRecording]);

    useEffect(() => {
        meetingTimerRef.current = setInterval(() => setMeetingTimer(t => t + 1), 1000);
        return () => clearInterval(meetingTimerRef.current);
    }, []);

    useEffect(() => {
        return () => { if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop()); };
    }, []);

    const currentQuestion = questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex >= questions.length - 1;

    const goToNextQuestion = () => {
        if (!isLastQuestion) {
            const nextQ = questions[currentQuestionIndex + 1];
            setMessages(prev => [...prev, { role: 'ai', type: 'question', text: nextQ.question, topic: nextQ.topic }]);
            setCurrentQuestionIndex(prev => prev + 1);
            setHasAnsweredCurrent(false);
        } else {
            const avgScore = allResults.length > 0 
                ? Math.round(allResults.reduce((sum, r) => sum + (r.overallScore || 0), 0) / allResults.length)
                : 0;
            setMessages(prev => [...prev, { role: 'ai', type: 'complete', text: `🎉 Interview Complete! Score: ${avgScore}/100` }]);
        }
    };

    const handleSkipQuestion = () => {
        setMessages(prev => [...prev, { role: 'user', type: 'skip', text: '(Skipped)' }]);
        goToNextQuestion();
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
            streamRef.current = stream;
            if (videoPreviewRef.current) videoPreviewRef.current.srcObject = stream;

            const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
            recorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };

            recorder.onstop = async () => {
                setIsProcessing(true);
                const videoBlob = new Blob(audioChunksRef.current, { type: 'video/webm' });
                audioChunksRef.current = [];

                const formData = new FormData();
                formData.append("file", videoBlob, "recording.webm");
                formData.append("question", currentQuestion?.question || "Tell me about yourself");
                formData.append("role", profile.role);

                try {
                    const response = await fetch(`${API_URL}/analyze`, { method: "POST", body: formData });
                    if (!response.ok) throw new Error("Failed");
                    const data = await response.json();
                    const transcript = data.transcript || "(No speech)";
                    
                    // Add user's answer
                    setMessages(prev => [...prev, { 
                        role: 'user', 
                        type: 'answer', 
                        text: transcript, 
                        score: data.overallScore 
                    }]);
                    
                    // Extract detailed suggestions from the API response
                    const suggestions = data.evaluation?.suggestions || data.content?.suggestions || [];
                    const lineAnalysis = data.lineAnalysis || [];
                    
                    // Build enhanced feedback message with actionable improvements
                    const feedbackIntro = data.evaluation?.reasoning || data.content?.reasoning || 
                        `Score: ${data.overallScore || 0}/100. ${data.overallScore >= 70 ? 'Great job!' : data.overallScore >= 50 ? 'Good effort, room for improvement.' : 'Keep practicing!'}`;
                    
                    // Add AI feedback with detailed suggestions
                    setMessages(prev => [...prev, { 
                        role: 'ai', 
                        type: 'feedback', 
                        text: feedbackIntro,
                        score: data.overallScore,
                        suggestions: suggestions,
                        lineAnalysis: lineAnalysis
                    }]);

                    setAllResults(prev => [...prev, { ...data, question: currentQuestion }]);
                    setLastResult(data);
                    setHasAnsweredCurrent(true);
                    
                    // Auto-advance to next question after a delay
                    if (!isLastQuestion) {
                        setTimeout(() => {
                            const nextQ = questions[currentQuestionIndex + 1];
                            setMessages(prev => [...prev, { 
                                role: 'ai', 
                                type: 'question', 
                                text: nextQ.question, 
                                topic: nextQ.topic 
                            }]);
                            setCurrentQuestionIndex(prev => prev + 1);
                            setHasAnsweredCurrent(false);
                        }, 2500);
                    }

                } catch {
                    setMessages(prev => [...prev, { role: 'ai', type: 'error', text: "Analysis failed. Try again." }]);
                } finally {
                    setIsProcessing(false);
                    if (streamRef.current) { streamRef.current.getTracks().forEach(track => track.stop()); streamRef.current = null; }
                    if (videoPreviewRef.current) videoPreviewRef.current.srcObject = null;
                }
            };

            mediaRecorderRef.current = recorder;
            recorder.start();
            setIsRecording(true);
        } catch {
            alert("Camera/mic access denied.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const formatTime = (s) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;

    if (isLoadingQuestions) {
        return (
            <div className="flex h-full items-center justify-center bg-[#0e1621]">
                <div className="text-center">
                    <Loader2 size={40} className="animate-spin text-[#0e72ed] mx-auto mb-3" />
                    <p className="text-[#8b9cb6] text-sm">Setting up...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-[#0e1621] overflow-hidden">
            {showLandscapePrompt && <LandscapePrompt onContinue={() => setShowLandscapePrompt(false)} />}

            {/* Draggable User PiP */}
            <DraggablePiP
                videoRef={videoPreviewRef}
                isRecording={isRecording}
                isProcessing={isProcessing}
                timer={timer}
                formatTime={formatTime}
                userName={profile.name}
                isMuted={isMuted}
            />

            {/* Header - Compact */}
            <header className="h-10 flex items-center justify-between px-3 bg-[#0e1621]/90 backdrop-blur-sm border-b border-white/5 z-30">
                <div className="flex items-center gap-2">
                    <span className="text-white text-sm font-medium truncate max-w-[120px] sm:max-w-none">{profile.role} Interview</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[#8b9cb6] text-xs font-mono">{formatTime(meetingTimer)}</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#0e72ed]/20 text-[#0e72ed] text-xs font-bold">
                        {currentQuestionIndex + 1}/{questions.length}
                    </span>
                </div>
            </header>

            {/* Main Content - Chat Log as Primary View */}
            <div className="flex-1 relative overflow-hidden flex flex-col bg-[#0e1621]">
                
                {/* Chat Container - Full Space */}
                <div 
                    ref={chatContainerRef} 
                    className="flex-1 overflow-y-auto p-4 space-y-4 pb-24"
                >
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`max-w-[90%] sm:max-w-[80%] ${msg.role === 'user' ? 'ml-auto' : 'mr-auto'}`}>
                            <div className={`rounded-2xl px-4 py-3 text-sm sm:text-base shadow-md ${
                                msg.role === 'user' 
                                    ? msg.type === 'skip' 
                                        ? 'bg-gray-700/50 text-gray-400 italic border border-white/5'
                                        : 'bg-gradient-to-br from-indigo-600 to-blue-600 text-white border border-white/10'
                                    : msg.type === 'feedback'
                                        ? 'bg-gradient-to-br from-purple-900/60 to-purple-800/40 border border-purple-500/30 text-white'
                                        : msg.type === 'complete'
                                            ? 'bg-green-900/40 border border-green-500/30 text-white'
                                            : 'bg-[#1a2332] border border-white/10 text-white'
                            }`}>
                                {/* Message Header */}
                                <div className="flex items-center gap-2 mb-1.5 opacity-80">
                                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm ${
                                        msg.role === 'user' ? 'bg-white/20' : msg.type === 'feedback' ? 'bg-purple-500' : 'bg-[#0e72ed]'
                                    }`}>{msg.role === 'user' ? 'U' : 'AI'}</span>
                                    <span className="text-xs font-medium">
                                        {msg.role === 'user' ? profile.name : msg.type === 'feedback' ? 'Coach Feedback' : 'Interviewer'}
                                    </span>
                                    {msg.score !== undefined && (
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ml-auto ${
                                            msg.score >= 70 ? 'bg-green-500/20 text-green-400' : msg.score >= 50 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
                                        }`}>{msg.score}%</span>
                                    )}
                                </div>
                                
                                {/* Main Text */}
                                <p className="leading-relaxed">{msg.text}</p>
                                
                                {/* Enhanced Suggestions for Feedback Type */}
                                {msg.type === 'feedback' && msg.suggestions && msg.suggestions.length > 0 && (
                                    <div className="mt-4 space-y-3">
                                        <div className="text-xs font-semibold text-purple-300 uppercase tracking-wide flex items-center gap-1">
                                            <span>💡</span> How to Improve
                                        </div>
                                        {msg.suggestions.slice(0, 3).map((suggestion, i) => (
                                            <div key={i} className="bg-black/30 rounded-xl p-3 border border-purple-500/20">
                                                {/* What could be improved */}
                                                <div className="flex items-start gap-2 mb-2">
                                                    <AlertCircle size={14} className="text-orange-400 mt-0.5 flex-shrink-0" />
                                                    <span className="text-orange-200 text-sm font-medium">
                                                        {suggestion.improvement || suggestion}
                                                    </span>
                                                </div>
                                                
                                                {/* Context - What was said */}
                                                {suggestion.context && suggestion.context !== 'General' && (
                                                    <div className="ml-5 mb-2 pl-3 border-l-2 border-red-500/40">
                                                        <span className="text-xs text-gray-400">What you said:</span>
                                                        <p className="text-red-300/80 text-sm italic">"{suggestion.context}"</p>
                                                    </div>
                                                )}
                                                
                                                {/* Better approach */}
                                                {suggestion.better_approach && (
                                                    <div className="ml-5 pl-3 border-l-2 border-green-500/40">
                                                        <span className="text-xs text-gray-400">Try instead:</span>
                                                        <p className="text-green-300 text-sm">"{suggestion.better_approach}"</p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                
                                {/* Line Analysis for user answers (legacy support) */}
                                {msg.feedback?.lineAnalysis?.map((item, i) => (
                                    <div key={i} className={`flex items-start gap-1.5 mt-2 text-xs p-2 rounded bg-black/20 ${
                                        item.type === 'good' ? 'text-green-300' : 'text-orange-300'
                                    }`}>
                                        {item.type === 'good' ? <CheckCircle size={12} className="mt-0.5" /> : <AlertCircle size={12} className="mt-0.5" />}
                                        <span>{item.feedback}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                    
                    {/* Typing/Processing Indicator */}
                    {(isProcessing || isLoadingQuestions) && (
                        <div className="mr-auto max-w-[75%]">
                            <div className="bg-[#1a2332] border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-2 text-white/70 text-sm">
                                <RefreshCw size={14} className="animate-spin text-[#0e72ed]" />
                                <span>{isProcessing ? 'Analyzing response...' : 'Thinking...'}</span>
                            </div>
                        </div>
                    )}
                    
                    {/* Spacer for bottom overlay */}
                    <div className="h-16"></div>
                </div>

                {/* Current Question - Bottom Overlay (Fixed above footer) */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#0e1621] via-[#0e1621]/95 to-transparent z-10 pointer-events-none">
                     <div className="flex items-start gap-2 mb-1 pointer-events-auto">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#0e72ed]/20 text-[#8ab4f8] whitespace-nowrap border border-[#0e72ed]/20">
                            {currentQuestion?.topic || 'Topic'}
                        </span>
                    </div>
                    <p className="text-white text-lg font-medium leading-snug drop-shadow-md pointer-events-auto">
                        {currentQuestion?.question}
                    </p>
                </div>
                
                {/* Recording Indicator Overlay */}
                {isRecording && (
                    <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/20 border border-red-500/40 backdrop-blur-md z-20 shadow-lg animate-pulse">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-red-100 text-xs font-bold tracking-wide">RECORDING</span>
                        <AudioVisualizer isActive={true} />
                    </div>
                )}
            </div>

            {/* Bottom Controls - Compact */}
            <footer className="h-14 sm:h-16 bg-[#1a2332]/90 backdrop-blur-sm flex items-center justify-center gap-2 sm:gap-3 px-2 sm:px-4 border-t border-white/5">
                <div className="flex-1 hidden sm:flex items-center">
                    <span className="text-white text-xs">{formatTime(meetingTimer)}</span>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2">
                    <button onClick={() => setIsMuted(!isMuted)} className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all ${isMuted ? 'bg-red-600' : 'bg-[#2d3748] hover:bg-[#3d4a5c]'}`}>
                        {isMuted ? <MicOff size={16} className="text-white" /> : <Mic size={16} className="text-white" />}
                    </button>

                    <button onClick={() => setIsVideoOff(!isVideoOff)} className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all ${isVideoOff ? 'bg-red-600' : 'bg-[#2d3748] hover:bg-[#3d4a5c]'}`}>
                        {isVideoOff ? <VideoOff size={16} className="text-white" /> : <Video size={16} className="text-white" />}
                    </button>

                    <button
                        onClick={() => isRecording ? stopRecording() : startRecording()}
                        disabled={isProcessing}
                        className={`px-4 sm:px-5 h-10 sm:h-12 rounded-full flex items-center gap-1.5 justify-center transition-all shadow-lg ${
                            isRecording ? 'bg-red-600 ring-2 ring-red-500/30' : 'bg-[#0e72ed] hover:bg-[#0952b5]'
                        } ${isProcessing ? 'opacity-50' : ''}`}
                    >
                        {isRecording ? (
                            <><Square size={14} fill="white" className="text-white" /><span className="text-white text-sm font-medium">Stop</span></>
                        ) : (
                            <><Mic size={14} className="text-white" /><span className="text-white text-sm font-medium">Start</span></>
                        )}
                    </button>

                    <button 
                        onClick={handleSkipQuestion}
                        disabled={isRecording || isProcessing || isLastQuestion}
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#2d3748] hover:bg-[#3d4a5c] flex items-center justify-center ${
                            (isRecording || isProcessing || isLastQuestion) ? 'opacity-40' : ''
                        }`}
                    >
                        <SkipForward size={16} className="text-white" />
                    </button>

                    {hasAnsweredCurrent && !isLastQuestion && (
                        <button 
                            onClick={goToNextQuestion}
                            className="px-3 h-9 sm:h-10 rounded-full bg-green-600 hover:bg-green-700 flex items-center gap-1 text-white text-sm font-medium"
                        >
                            Next <ChevronRight size={14} />
                        </button>
                    )}

                    <button 
                        onClick={() => onEndQuestion(lastResult ? { ...lastResult, allResults, duration: meetingTimer } : null)} 
                        disabled={isRecording || isProcessing}
                        className={`px-3 sm:px-4 h-9 sm:h-10 rounded-full bg-red-600 hover:bg-red-700 flex items-center gap-1 ${
                            (isRecording || isProcessing) ? 'opacity-50' : ''
                        }`}
                    >
                        <Phone size={14} className="text-white rotate-[135deg]" />
                        <span className="text-white text-sm font-medium hidden sm:inline">End</span>
                    </button>
                </div>

                <div className="flex-1 hidden sm:flex justify-end">
                    <button className="w-10 h-10 rounded-full bg-[#2d3748] hover:bg-[#3d4a5c] flex items-center justify-center">
                        <MoreVertical size={16} className="text-white" />
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default ActiveInterviewView;
