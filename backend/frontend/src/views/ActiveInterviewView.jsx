import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Square, Video, VideoOff, RefreshCw, Loader2, CheckCircle, AlertCircle, Phone, MoreVertical, Move, GripVertical, SkipForward, Users, Hand } from 'lucide-react';
import AudioVisualizer from '../components/visuals/AudioVisualizer';
import { API_URL } from '../config';

const MAX_RECORDING_SECONDS = 60;

// Theme - Using Zoom-style dark theme
const theme = {
    bg: 'bg-[#0e1621]',
    headerBg: 'bg-[#0e1621]',
    controlsBg: 'bg-[#1a2332]',
    buttonBg: 'bg-[#2d3748]',
    buttonHover: 'hover:bg-[#3d4a5c]',
    accent: '#0e72ed',
    accentBg: 'bg-[#0e72ed]',
    endCall: 'bg-[#e02828] hover:bg-[#c02020]',
    videoBg: 'bg-[#1a2332]',
    chatBg: 'bg-[#151d2b]',
    text: 'text-white',
    textMuted: 'text-[#8b9cb6]',
    border: 'border-[#2d3748]'
};

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
                <h2 className="text-2xl font-bold text-white mb-3">Rotate Your Device</h2>
                <p className="text-gray-400 mb-6">For the best experience, use landscape mode.</p>
                <button onClick={onContinue} className="w-full py-3 bg-[#2d3748] text-white rounded-xl font-medium">Continue Anyway</button>
            </div>
        </div>
    );
};

// Draggable & Resizable PiP Component
const DraggablePiP = ({ videoRef, isRecording, isProcessing, timer, formatTime, userName, isMuted }) => {
    const [position, setPosition] = useState({ x: window.innerWidth - 220, y: 80 });
    const [size, setSize] = useState({ width: 200, height: 150 });
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [initialPos, setInitialPos] = useState({ x: 0, y: 0 });
    const [initialSize, setInitialSize] = useState({ width: 0, height: 0 });

    const handleMouseDown = useCallback((e) => {
        if (e.target.closest('.resize-handle')) return;
        e.preventDefault();
        setIsDragging(true);
        setDragStart({ x: e.clientX, y: e.clientY });
        setInitialPos({ x: position.x, y: position.y });
    }, [position]);

    const handleMouseMove = useCallback((e) => {
        if (isDragging) {
            const deltaX = e.clientX - dragStart.x;
            const deltaY = e.clientY - dragStart.y;
            setPosition({
                x: Math.max(0, Math.min(window.innerWidth - size.width, initialPos.x + deltaX)),
                y: Math.max(0, Math.min(window.innerHeight - size.height - 100, initialPos.y + deltaY))
            });
        }
        if (isResizing) {
            setSize({
                width: Math.max(140, Math.min(400, initialSize.width + (e.clientX - dragStart.x))),
                height: Math.max(100, Math.min(300, initialSize.height + (e.clientY - dragStart.y)))
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
                x: Math.max(0, Math.min(window.innerWidth - size.width, initialPos.x + (touch.clientX - dragStart.x))),
                y: Math.max(0, Math.min(window.innerHeight - size.height - 100, initialPos.y + (touch.clientY - dragStart.y)))
            });
        }
    };

    return (
        <div
            className="fixed z-50 rounded-xl overflow-hidden shadow-2xl border-2 border-[#2d3748] cursor-move select-none"
            style={{ left: position.x, top: position.y, width: size.width, height: size.height }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
        >
            <video ref={videoRef} autoPlay muted playsInline className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]" />
            
            {!isRecording && !isProcessing && (
                <div className="absolute inset-0 bg-[#1a2332] flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-[#3d4a5c] flex items-center justify-center">
                        <span className="text-2xl font-medium text-white">{userName?.charAt(0) || 'U'}</span>
                    </div>
                </div>
            )}

            {isRecording && (
                <div className={`absolute top-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium ${timer > MAX_RECORDING_SECONDS - 15 ? 'bg-yellow-500' : 'bg-red-500'}`}>
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                    <span className="text-white">{formatTime(timer)}</span>
                </div>
            )}

            {isProcessing && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                    <RefreshCw size={24} className="animate-spin text-white" />
                </div>
            )}

            <div className="absolute top-2 right-2 p-1.5 rounded-md bg-black/50 opacity-70 hover:opacity-100">
                <Move size={12} className="text-white" />
            </div>

            <div className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded-md bg-black/60">
                <span className="text-white text-xs font-medium">{userName}</span>
                {isMuted && <MicOff size={10} className="text-white" />}
            </div>

            <div className="resize-handle absolute bottom-0 right-0 w-8 h-8 cursor-se-resize flex items-end justify-end p-1.5" onMouseDown={handleResizeStart}>
                <GripVertical size={12} className="text-white/60 rotate-[-45deg]" />
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
                setMessages([{ role: 'ai', type: 'question', text: qs[0].question, topic: qs[0].topic }]);
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
            setMessages(prev => [...prev, { role: 'ai', type: 'complete', text: `🎉 Interview Complete! Your average score: ${avgScore}/100` }]);
        }
    };

    const handleSkipQuestion = () => {
        setMessages(prev => [...prev, { role: 'user', type: 'skip', text: '(Skipped this question)' }]);
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
                    const transcript = data.transcript || "(No speech detected)";
                    const feedback = generateLineFeedback(transcript);
                    
                    // Add user's response
                    setMessages(prev => [...prev, { role: 'user', type: 'answer', text: transcript, feedback, score: data.overallScore }]);
                    
                    // Add AI judgment/feedback
                    const judgmentText = data.evaluation?.reasoning || data.content?.reasoning || 
                        `Score: ${data.overallScore || 0}/100. ${data.overallScore >= 70 ? 'Good response!' : data.overallScore >= 50 ? 'Decent attempt, but could be improved.' : 'Needs more practice.'}`;
                    setMessages(prev => [...prev, { role: 'ai', type: 'judgment', text: judgmentText, score: data.overallScore }]);

                    setAllResults(prev => [...prev, { ...data, question: currentQuestion }]);
                    setLastResult(data);
                    setHasAnsweredCurrent(true);

                } catch {
                    setMessages(prev => [...prev, { role: 'ai', type: 'error', text: "⚠️ Analysis failed. Please try again." }]);
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
                    <Loader2 size={48} className="animate-spin text-[#0e72ed] mx-auto mb-4" />
                    <p className="text-[#8b9cb6]">Setting up interview...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-[#0e1621] overflow-hidden">
            {showLandscapePrompt && <LandscapePrompt onContinue={() => setShowLandscapePrompt(false)} />}

            <DraggablePiP
                videoRef={videoPreviewRef}
                isRecording={isRecording}
                isProcessing={isProcessing}
                timer={timer}
                formatTime={formatTime}
                userName={profile.name}
                isMuted={isMuted}
            />

            {/* Header */}
            <header className="h-12 flex items-center justify-between px-4 bg-[#0e1621] border-b border-[#2d3748]">
                <span className="text-white font-medium">{profile.role} Interview</span>
                <div className="flex items-center gap-3">
                    <span className="text-[#8b9cb6] text-sm font-mono">{formatTime(meetingTimer)}</span>
                    <span className="px-3 py-1 rounded-full bg-[#2d3748] text-white text-sm">
                        Q{currentQuestionIndex + 1}/{questions.length}
                    </span>
                </div>
            </header>

            {/* Main Content - Chat Log Layout */}
            <div className="flex-1 flex overflow-hidden">
                {/* Chat/Conversation Log - Full Width */}
                <div className="flex-1 flex flex-col">
                    {/* Messages */}
                    <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-2' : ''}`}>
                                    {/* Message Header */}
                                    <div className={`flex items-center gap-2 mb-1 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                                            msg.role === 'user' ? 'bg-green-600 order-2' : 
                                            msg.type === 'judgment' ? 'bg-purple-600' : 'bg-[#0e72ed]'
                                        }`}>
                                            {msg.role === 'user' ? profile.name?.charAt(0) : 'AI'}
                                        </div>
                                        <span className="text-xs text-[#8b9cb6]">
                                            {msg.role === 'user' ? profile.name : 
                                             msg.type === 'judgment' ? 'AI Feedback' : 'AI Interviewer'}
                                        </span>
                                        {msg.score !== undefined && (
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                                                msg.score >= 70 ? 'bg-green-500/20 text-green-400' : 
                                                msg.score >= 50 ? 'bg-yellow-500/20 text-yellow-400' : 
                                                'bg-red-500/20 text-red-400'
                                            }`}>{msg.score}%</span>
                                        )}
                                    </div>
                                    
                                    {/* Message Bubble */}
                                    <div className={`rounded-2xl px-4 py-3 ${
                                        msg.role === 'user' 
                                            ? msg.type === 'skip' 
                                                ? 'bg-gray-600/30 border border-gray-500/30 text-gray-400 italic'
                                                : 'bg-green-600/20 border border-green-600/30 text-white'
                                            : msg.type === 'question'
                                                ? 'bg-[#0e72ed]/20 border border-[#0e72ed]/30 text-white'
                                                : msg.type === 'judgment'
                                                    ? 'bg-purple-600/20 border border-purple-500/30 text-white'
                                                    : msg.type === 'complete'
                                                        ? 'bg-green-600/20 border border-green-500/30 text-white'
                                                        : 'bg-[#1a2332] border border-[#2d3748] text-white'
                                    }`}>
                                        {msg.type === 'question' && msg.topic && (
                                            <span className="inline-block px-2 py-0.5 mb-2 rounded text-xs bg-[#0e72ed]/30 text-[#8ab4f8]">
                                                📍 {msg.topic}
                                            </span>
                                        )}
                                        <p className="text-sm leading-relaxed">{msg.text}</p>
                                        
                                        {/* Inline Feedback */}
                                        {msg.feedback?.lineAnalysis?.map((item, i) => (
                                            <div key={i} className={`flex items-center gap-1.5 mt-2 text-xs ${
                                                item.type === 'good' ? 'text-green-400' : 'text-orange-400'
                                            }`}>
                                                {item.type === 'good' ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                                                <span>{item.feedback}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                        
                        {/* Recording Indicator */}
                        {isRecording && (
                            <div className="flex justify-end">
                                <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-red-500/20 border border-red-500/30">
                                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                    <span className="text-sm text-red-400">Recording... Speak now</span>
                                    <AudioVisualizer isActive={true} />
                                </div>
                            </div>
                        )}

                        {/* Processing Indicator */}
                        {isProcessing && (
                            <div className="flex justify-start">
                                <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#1a2332] border border-[#2d3748]">
                                    <RefreshCw size={14} className="animate-spin text-[#0e72ed]" />
                                    <span className="text-sm text-[#8b9cb6]">AI is analyzing your response...</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Current Question Bar */}
                    <div className="px-4 py-3 bg-[#1a2332] border-t border-[#2d3748]">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex-1">
                                <span className="text-xs text-[#8b9cb6]">Current Question:</span>
                                <p className="text-white text-sm font-medium truncate">{currentQuestion?.question}</p>
                            </div>
                            {hasAnsweredCurrent && !isLastQuestion && (
                                <button 
                                    onClick={goToNextQuestion}
                                    className="px-4 py-2 bg-[#0e72ed] hover:bg-[#0952b5] text-white rounded-lg text-sm font-medium flex items-center gap-2"
                                >
                                    Next <SkipForward size={14} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Controls */}
            <footer className="h-20 bg-[#1a2332] flex items-center justify-center gap-3 px-4 mb-16 md:mb-0">
                <div className="flex-1 flex items-center gap-2">
                    <span className="hidden md:block text-white text-sm">{formatTime(meetingTimer)}</span>
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={() => setIsMuted(!isMuted)} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isMuted ? 'bg-[#e02828]' : 'bg-[#2d3748] hover:bg-[#3d4a5c]'}`}>
                        {isMuted ? <MicOff size={20} className="text-white" /> : <Mic size={20} className="text-white" />}
                    </button>

                    <button onClick={() => setIsVideoOff(!isVideoOff)} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isVideoOff ? 'bg-[#e02828]' : 'bg-[#2d3748] hover:bg-[#3d4a5c]'}`}>
                        {isVideoOff ? <VideoOff size={20} className="text-white" /> : <Video size={20} className="text-white" />}
                    </button>

                    <button
                        onClick={() => isRecording ? stopRecording() : startRecording()}
                        disabled={isProcessing}
                        className={`px-6 h-14 rounded-full flex items-center gap-2 justify-center transition-all shadow-lg ${
                            isRecording ? 'bg-[#e02828] ring-4 ring-red-500/30' : 'bg-[#0e72ed]'
                        } ${isProcessing ? 'opacity-50' : ''}`}
                    >
                        {isRecording ? (
                            <><Square size={20} fill="white" className="text-white" /><span className="text-white font-medium">Stop</span></>
                        ) : (
                            <><Mic size={20} className="text-white" /><span className="text-white font-medium">Start</span></>
                        )}
                    </button>

                    {/* Skip Question Button */}
                    <button 
                        onClick={handleSkipQuestion}
                        disabled={isRecording || isProcessing || isLastQuestion}
                        className={`px-4 h-12 rounded-full bg-[#2d3748] hover:bg-[#3d4a5c] flex items-center gap-2 transition-all ${
                            (isRecording || isProcessing || isLastQuestion) ? 'opacity-50' : ''
                        }`}
                    >
                        <SkipForward size={18} className="text-white" />
                        <span className="text-white font-medium hidden md:inline">Skip</span>
                    </button>

                    <button 
                        onClick={() => onEndQuestion(lastResult ? { ...lastResult, allResults, duration: meetingTimer } : null)} 
                        disabled={isRecording || isProcessing}
                        className={`px-5 h-12 rounded-full bg-[#e02828] hover:bg-[#c02020] flex items-center justify-center transition-all ${
                            (isRecording || isProcessing) ? 'opacity-50' : ''
                        }`}
                    >
                        <Phone size={20} className="text-white rotate-[135deg]" />
                        <span className="hidden md:inline text-white font-medium ml-2">End Meeting</span>
                    </button>
                </div>

                <div className="flex-1 flex items-center justify-end gap-2">
                    <button className="hidden md:flex w-12 h-12 rounded-full bg-[#2d3748] hover:bg-[#3d4a5c] items-center justify-center">
                        <Users size={20} className="text-white" />
                    </button>
                    <button className="w-12 h-12 rounded-full bg-[#2d3748] hover:bg-[#3d4a5c] flex items-center justify-center">
                        <MoreVertical size={20} className="text-white" />
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default ActiveInterviewView;
