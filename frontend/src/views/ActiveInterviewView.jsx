import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Square, Video, VideoOff, RefreshCw, Loader2, CheckCircle, AlertCircle, Lightbulb, MoreVertical, Users, MessageSquare, Shield, Settings, Phone, Monitor, Grid, Maximize2 } from 'lucide-react';
import Button from '../components/ui/Button';
import AudioVisualizer from '../components/visuals/AudioVisualizer';
import { API_URL } from '../config';

// Theme configurations
const THEMES = {
    meet: {
        name: 'Google Meet',
        bg: 'bg-[#202124]',
        controlsBg: 'bg-[#202124]',
        buttonBg: 'bg-[#3c4043]',
        buttonHover: 'hover:bg-[#4a4d51]',
        accent: 'bg-blue-500',
        accentHover: 'hover:bg-blue-600',
        endCall: 'bg-red-500 hover:bg-red-600',
        text: 'text-white',
        textMuted: 'text-gray-400',
        border: 'border-[#3c4043]',
        videoBg: 'bg-[#3c4043]',
        chatBg: 'bg-[#292b2e]'
    },
    zoom: {
        name: 'Zoom',
        bg: 'bg-[#1a1a1a]',
        controlsBg: 'bg-[#2d2d2d]',
        buttonBg: 'bg-[#4a4a4a]',
        buttonHover: 'hover:bg-[#5a5a5a]',
        accent: 'bg-[#0e72ed]',
        accentHover: 'hover:bg-[#0d65d4]',
        endCall: 'bg-red-600 hover:bg-red-700',
        text: 'text-white',
        textMuted: 'text-gray-400',
        border: 'border-[#3c3c3c]',
        videoBg: 'bg-black',
        chatBg: 'bg-[#242424]'
    }
};

// Simple markdown-like text parser for chat messages
const FormattedText = ({ text }) => {
    const parseText = (text) => {
        if (!text) return null;
        const lines = text.split('\n');
        
        return lines.map((line, lineIdx) => {
            if (line.trim() === '---') {
                return <hr key={lineIdx} className="border-slate-600 my-3" />;
            }
            
            const parts = line.split(/(\*\*.*?\*\*)/g);
            const formattedParts = parts.map((part, partIdx) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={partIdx} className="font-bold text-cyan-300">{part.slice(2, -2)}</strong>;
                }
                return part;
            });
            
            return (
                <React.Fragment key={lineIdx}>
                    {formattedParts}
                    {lineIdx < lines.length - 1 && <br />}
                </React.Fragment>
            );
        });
    };

    return <>{parseText(text)}</>;
};

// Line-by-line feedback component
const TranscriptFeedback = ({ transcript, feedback }) => {
    if (!transcript || !feedback?.lineAnalysis || feedback.lineAnalysis.length === 0) {
        return (
            <div className="space-y-2">
                <p className="text-slate-300 leading-relaxed">{transcript}</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {feedback.lineAnalysis.map((item, idx) => (
                <div key={idx} className={`p-3 rounded-lg border-l-4 ${
                    item.type === 'good' 
                        ? 'bg-green-500/10 border-green-500' 
                        : item.type === 'improve'
                        ? 'bg-orange-500/10 border-orange-500'
                        : 'bg-slate-800/50 border-slate-600'
                }`}>
                    <p className="text-slate-200 text-sm mb-1">"{item.text}"</p>
                    <div className="flex items-start gap-2 mt-2">
                        {item.type === 'good' ? (
                            <CheckCircle size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                        ) : item.type === 'improve' ? (
                            <AlertCircle size={14} className="text-orange-400 mt-0.5 flex-shrink-0" />
                        ) : (
                            <Lightbulb size={14} className="text-cyan-400 mt-0.5 flex-shrink-0" />
                        )}
                        <p className={`text-xs ${
                            item.type === 'good' ? 'text-green-400' : 
                            item.type === 'improve' ? 'text-orange-400' : 'text-cyan-400'
                        }`}>
                            {item.feedback}
                        </p>
                    </div>
                    {item.type === 'improve' && item.suggestion && (
                        <div className="mt-2 p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                            <p className="text-xs text-cyan-300">
                                <span className="font-semibold">💡 Try saying:</span> "{item.suggestion}"
                            </p>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

const ActiveInterviewView = ({ onEndQuestion, userProfile, difficulty = 'intermediate' }) => {
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
    const [showChat, setShowChat] = useState(true);
    const [theme, setTheme] = useState(() => localStorage.getItem('interview_theme') || 'meet');
    
    const timerRef = useRef(null);
    const meetingTimerRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const videoPreviewRef = useRef(null);
    const streamRef = useRef(null);
    const chatContainerRef = useRef(null);

    const currentTheme = THEMES[theme];

    // Get user profile
    const savedUser = localStorage.getItem('user');
    const userData = savedUser ? JSON.parse(savedUser) : {};
    const profile = userProfile || {
        name: userData?.name || 'Candidate',
        role: userData?.role || 'Professional',
        experience: userData?.experience_years || '',
        salary: userData?.salary_expectation || ''
    };

    // Save theme preference
    const handleThemeChange = (newTheme) => {
        setTheme(newTheme);
        localStorage.setItem('interview_theme', newTheme);
    };

    // Generate line-by-line feedback
    const generateLineFeedback = (transcript, analysisData) => {
        if (!transcript) return null;
        
        const sentences = transcript.split(/(?<=[.!?])\s+/).filter(s => s.trim());
        if (sentences.length === 0) return null;

        const lineAnalysis = sentences.map((sentence, idx) => {
            const lowerSentence = sentence.toLowerCase();
            
            const hasSpecifics = /\d+|specifically|for example|such as|instance/i.test(sentence);
            const hasAction = /i (led|created|developed|implemented|managed|achieved|improved|built)/i.test(sentence);
            const hasResult = /result|outcome|impact|increased|decreased|saved|reduced|grew/i.test(sentence);
            const hasFillers = /\b(um|uh|you know|basically|actually|literally)\b/i.test(sentence) ||
                               /\blike,?\s+(um|uh|so|you know)\b/i.test(sentence) ||
                               /^(like|so like)\b/i.test(sentence.trim());
            const isVague = sentence.length < 20 && !hasSpecifics;
            const startsWeak = /^(so|well|i mean|i think)/i.test(sentence);
            
            if (hasFillers) {
                return { text: sentence, type: 'improve', feedback: 'Try to minimize filler words for more confident delivery.' };
            } else if (hasAction && hasResult) {
                return { text: sentence, type: 'good', feedback: 'Excellent! You used action verbs and mentioned results.' };
            } else if (hasSpecifics) {
                return { text: sentence, type: 'good', feedback: 'Great use of specific details and examples.' };
            } else if (isVague && startsWeak) {
                return { text: sentence, type: 'improve', feedback: 'Consider starting with a stronger, more direct statement.' };
            } else if (hasAction) {
                return { text: sentence, type: 'good', feedback: 'Good use of action verbs to describe your contributions.' };
            } else {
                return { text: sentence, type: 'neutral', feedback: 'Consider adding specific metrics or examples here.' };
            }
        });

        const goodItems = lineAnalysis.filter(i => i.type === 'good').slice(0, 2);
        const improveItems = lineAnalysis.filter(i => i.type === 'improve').slice(0, 2);
        
        return { lineAnalysis: [...goodItems, ...improveItems].slice(0, 4) };
    };

    // Fetch questions on mount
    useEffect(() => {
        const fetchQuestions = async () => {
            setIsLoadingQuestions(true);
            try {
                const formData = new FormData();
                formData.append('role', profile.role || 'General');
                formData.append('difficulty', difficulty);
                if (profile.experience) formData.append('experienceYears', profile.experience);

                const response = await fetch(`${API_URL}/questions/generate`, {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();
                
                if (data.questions && data.questions.length > 0) {
                    setQuestions(data.questions);
                    setMessages([{ 
                        role: 'ai', 
                        text: `Welcome ${profile.name}! Let's begin your **${profile.role}** interview.\n\n**Question 1 of ${data.questions.length}:**\n\n${data.questions[0].question}`,
                        isQuestion: true
                    }]);
                } else {
                    const fallbackQuestions = [
                        { id: 1, question: "Tell me about yourself and your experience.", topic: "Introduction" },
                        { id: 2, question: "What are your key strengths?", topic: "Behavioral" },
                        { id: 3, question: "Where do you see yourself in 5 years?", topic: "Career Goals" }
                    ];
                    setQuestions(fallbackQuestions);
                    setMessages([{ 
                        role: 'ai', 
                        text: `Welcome ${profile.name}! Let's begin your interview.\n\n**Question 1 of ${fallbackQuestions.length}:**\n\n${fallbackQuestions[0].question}`,
                        isQuestion: true
                    }]);
                }
            } catch (error) {
                console.error('Error fetching questions:', error);
                const fallbackQuestions = [
                    { id: 1, question: "Tell me about yourself and your experience.", topic: "Introduction" },
                    { id: 2, question: "What are your key strengths?", topic: "Behavioral" },
                    { id: 3, question: "Where do you see yourself in 5 years?", topic: "Career Goals" }
                ];
                setQuestions(fallbackQuestions);
                setMessages([{ 
                    role: 'ai', 
                    text: `Welcome ${profile.name}! Let's begin.\n\n**Question 1 of ${fallbackQuestions.length}:**\n\n${fallbackQuestions[0].question}`,
                    isQuestion: true
                }]);
            } finally {
                setIsLoadingQuestions(false);
            }
        };

        fetchQuestions();
    }, []);

    // Auto-scroll chat
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    // Recording timer
    useEffect(() => {
        if (isRecording) {
            timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
        } else {
            clearInterval(timerRef.current);
            setTimer(0);
        }
        return () => clearInterval(timerRef.current);
    }, [isRecording]);

    // Meeting timer
    useEffect(() => {
        meetingTimerRef.current = setInterval(() => setMeetingTimer(t => t + 1), 1000);
        return () => clearInterval(meetingTimerRef.current);
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const currentQuestion = questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex >= questions.length - 1;

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
            streamRef.current = stream;

            if (videoPreviewRef.current) {
                videoPreviewRef.current.srcObject = stream;
            }

            const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });

            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            recorder.onstop = async () => {
                setIsProcessing(true);
                const videoBlob = new Blob(audioChunksRef.current, { type: 'video/webm' });
                audioChunksRef.current = [];

                const formData = new FormData();
                formData.append("file", videoBlob, "recording.webm");
                formData.append("questionId", currentQuestion?.id || "dynamic");
                formData.append("question", currentQuestion?.question || "Tell me about yourself");
                formData.append("role", profile.role || "candidate");
                
                if (profile.name) formData.append("candidateName", profile.name);
                if (profile.experience) formData.append("experienceYears", profile.experience);
                if (profile.salary) formData.append("salaryExpectation", profile.salary);

                try {
                    const response = await fetch(`${API_URL}/analyze`, {
                        method: "POST",
                        body: formData,
                    });

                    if (!response.ok) throw new Error("Analysis failed");

                    const data = await response.json();
                    const transcript = data.transcript || "(No speech detected)";
                    
                    let lineFeedback;
                    if (data.lineAnalysis && data.lineAnalysis.length > 0) {
                        lineFeedback = { lineAnalysis: data.lineAnalysis };
                    } else {
                        lineFeedback = generateLineFeedback(transcript, data);
                    }
                    
                    setMessages(prev => [...prev, { 
                        role: 'user', 
                        text: transcript,
                        feedback: lineFeedback
                    }]);

                    const resultWithQuestion = { ...data, question: currentQuestion };
                    setAllResults(prev => [...prev, resultWithQuestion]);
                    setLastResult(data);

                    setTimeout(() => {
                        if (!isLastQuestion) {
                            const nextQ = questions[currentQuestionIndex + 1];
                            setMessages(prev => [...prev, { 
                                role: 'ai', 
                                text: `**Question ${currentQuestionIndex + 2} of ${questions.length}:**\n\n${nextQ.question}`,
                                isQuestion: true
                            }]);
                            setCurrentQuestionIndex(prev => prev + 1);
                        } else {
                            const avgScore = Math.round(
                                allResults.reduce((sum, r) => sum + (r.overallScore || 0), data.overallScore || 0) / 
                                (allResults.length + 1)
                            );
                            const scoreColor = avgScore >= 70 ? '🟢' : avgScore >= 50 ? '🟡' : '🔴';
                            
                            setMessages(prev => [...prev, { 
                                role: 'ai', 
                                text: `${scoreColor} **Interview Complete!**\n\n🎉 You've answered all ${questions.length} questions.\n\n**Average Score: ${avgScore}/100**\n\nClick **"End Call"** for detailed analysis.`
                            }]);
                        }
                    }, 300);

                } catch (error) {
                    console.error("Error sending video:", error);
                    setMessages(prev => [...prev, { 
                        role: 'ai', 
                        text: "⚠️ Sorry, I had trouble analyzing that. Please try again." 
                    }]);
                } finally {
                    setIsProcessing(false);
                    if (streamRef.current) {
                        streamRef.current.getTracks().forEach(track => track.stop());
                        streamRef.current = null;
                    }
                    if (videoPreviewRef.current) {
                        videoPreviewRef.current.srcObject = null;
                    }
                }
            };

            mediaRecorderRef.current = recorder;
            recorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Error accessing camera/microphone:", err);
            alert("Could not access camera/microphone. Please ensure permissions are granted.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const toggleRecording = () => {
        if (!isRecording) {
            startRecording();
        } else {
            stopRecording();
        }
    };

    const handleFinish = () => {
        const summaryResult = lastResult ? {
            ...lastResult,
            allResults: allResults,
            questionsCompleted: allResults.length,
            totalQuestions: questions.length,
            duration: meetingTimer
        } : null;
        onEndQuestion(summaryResult);
    };

    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        if (hrs > 0) {
            return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
        }
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    if (isLoadingQuestions) {
        return (
            <div className={`flex h-full items-center justify-center ${currentTheme.bg}`}>
                <div className="text-center">
                    <Loader2 size={48} className="animate-spin text-cyan-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Preparing Your Interview</h3>
                    <p className={currentTheme.textMuted}>Generating personalized questions for {profile.role}...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`flex flex-col h-full ${currentTheme.bg}`}>
            {/* Top Bar - Meeting Info */}
            <div className={`h-12 sm:h-14 flex items-center justify-between px-2 sm:px-4 border-b ${currentTheme.border}`}>
                <div className="flex items-center gap-2 sm:gap-4">
                    {/* Theme Switcher */}
                    <div className="flex items-center gap-1 bg-black/20 rounded-full p-1">
                        <button
                            onClick={() => handleThemeChange('meet')}
                            className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium transition-all ${
                                theme === 'meet' 
                                    ? 'bg-blue-500 text-white' 
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            <span className="hidden sm:inline">Google </span>Meet
                        </button>
                        <button
                            onClick={() => handleThemeChange('zoom')}
                            className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium transition-all ${
                                theme === 'zoom' 
                                    ? 'bg-[#0e72ed] text-white' 
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            Zoom
                        </button>
                    </div>
                    <div className="hidden sm:block h-6 w-px bg-gray-600"></div>
                    <span className={`hidden sm:inline text-sm font-medium ${currentTheme.text}`}>
                        Mock Interview Session
                    </span>
                    <span className={`hidden md:inline text-xs ${currentTheme.textMuted}`}>
                        | {profile.role} Interview
                    </span>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${currentTheme.buttonBg}`}>
                        <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
                        <span className={`text-sm font-mono ${currentTheme.text}`}>{formatTime(meetingTimer)}</span>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${currentTheme.buttonBg}`}>
                        <Users size={16} className={currentTheme.textMuted} />
                        <span className={`text-sm ${currentTheme.text}`}>2</span>
                    </div>
                    {theme === 'meet' && (
                        <button className={`p-2 rounded-full ${currentTheme.buttonBg} ${currentTheme.buttonHover}`}>
                            <Shield size={18} className={currentTheme.textMuted} />
                        </button>
                    )}
                    <button className={`p-2 rounded-full ${currentTheme.buttonBg} ${currentTheme.buttonHover}`}>
                        <Settings size={18} className={currentTheme.textMuted} />
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Video Area */}
                <div className={`flex-1 flex flex-col ${showChat ? '' : ''}`}>
                    {/* Video Grid */}
                    <div className="flex-1 p-2 sm:p-4 flex flex-col sm:flex-row gap-2 sm:gap-4">
                        {/* AI Interviewer Video (Main) */}
                        <div className={`flex-1 relative rounded-xl overflow-hidden ${currentTheme.videoBg} border ${currentTheme.border} min-h-[200px] sm:min-h-0`}>
                            {/* AI Avatar/Placeholder */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                    <div className={`w-16 h-16 sm:w-24 sm:h-24 mx-auto rounded-full ${theme === 'meet' ? 'bg-blue-600' : 'bg-[#0e72ed]'} flex items-center justify-center mb-2 sm:mb-4`}>
                                        <span className="text-2xl sm:text-4xl font-bold text-white">AI</span>
                                    </div>
                                    <p className={`text-base sm:text-lg font-medium ${currentTheme.text}`}>AI Interviewer</p>
                                    <p className={`text-xs sm:text-sm ${currentTheme.textMuted}`}>Listening...</p>
                                </div>
                            </div>
                            
                            {/* Question Overlay */}
                            <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-4 bg-gradient-to-t from-black/80 to-transparent">
                                <p className={`text-xs ${currentTheme.textMuted} mb-1`}>Question {currentQuestionIndex + 1} of {questions.length}</p>
                                <p className={`text-sm sm:text-lg font-medium ${currentTheme.text} line-clamp-2`}>
                                    {currentQuestion?.question || "Loading question..."}
                                </p>
                            </div>
                        </div>

                        {/* Self View (Picture-in-Picture style) */}
                        <div className={`w-full sm:w-72 h-32 sm:h-auto relative rounded-xl overflow-hidden ${currentTheme.videoBg} border ${currentTheme.border}`}>
                            <video
                                ref={videoPreviewRef}
                                autoPlay
                                muted
                                playsInline
                                className={`w-full h-full object-cover transform scale-x-[-1] ${isRecording ? 'opacity-100' : 'opacity-60'}`}
                            />
                            
                            {/* Status Overlay */}
                            <div className="absolute top-3 left-3 flex items-center gap-2">
                                {isRecording && (
                                    <div className="flex items-center gap-2 bg-red-500/90 backdrop-blur-sm px-2 py-1 rounded-lg">
                                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                        <span className="text-xs font-bold text-white">REC {formatTime(timer)}</span>
                                    </div>
                                )}
                            </div>

                            {/* Name Badge */}
                            <div className="absolute bottom-3 left-3 right-3">
                                <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-2 rounded-lg">
                                    <span className={`text-sm font-medium ${currentTheme.text}`}>{profile.name}</span>
                                    {isMuted && <MicOff size={14} className="text-red-400" />}
                                </div>
                            </div>

                            {/* Processing Overlay */}
                            {isProcessing && (
                                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                                    <div className="text-center">
                                        <RefreshCw size={32} className="animate-spin text-cyan-400 mx-auto mb-2" />
                                        <span className="text-sm text-white">Analyzing...</span>
                                    </div>
                                </div>
                            )}

                            {/* Camera Off Placeholder */}
                            {!isRecording && !isProcessing && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                    <div className="text-center">
                                        <div className={`w-16 h-16 mx-auto rounded-full ${currentTheme.buttonBg} flex items-center justify-center mb-2`}>
                                            <Video size={24} className={currentTheme.textMuted} />
                                        </div>
                                        <p className={`text-xs ${currentTheme.textMuted}`}>Click mic to start</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Bottom Controls Bar */}
                    <div className={`h-20 flex items-center justify-center gap-3 ${currentTheme.controlsBg} border-t ${currentTheme.border}`}>
                        {/* Left Controls */}
                        <div className="flex items-center gap-2">
                            {/* Mic Button */}
                            <button
                                onClick={toggleRecording}
                                disabled={isProcessing}
                                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                                    isRecording 
                                        ? 'bg-red-500 hover:bg-red-600' 
                                        : `${currentTheme.buttonBg} ${currentTheme.buttonHover}`
                                } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {isRecording ? (
                                    <Square size={20} fill="white" className="text-white" />
                                ) : (
                                    <Mic size={20} className={isRecording ? 'text-white' : currentTheme.textMuted} />
                                )}
                            </button>
                            
                            {/* Video Button */}
                            <button
                                onClick={() => setIsVideoOff(!isVideoOff)}
                                className={`w-12 h-12 rounded-full flex items-center justify-center ${currentTheme.buttonBg} ${currentTheme.buttonHover}`}
                            >
                                {isVideoOff ? (
                                    <VideoOff size={20} className="text-red-400" />
                                ) : (
                                    <Video size={20} className={currentTheme.textMuted} />
                                )}
                            </button>

                            {theme === 'zoom' && (
                                <>
                                    <button className={`w-12 h-12 rounded-full flex items-center justify-center ${currentTheme.buttonBg} ${currentTheme.buttonHover}`}>
                                        <Monitor size={20} className={currentTheme.textMuted} />
                                    </button>
                                    <button className={`w-12 h-12 rounded-full flex items-center justify-center ${currentTheme.buttonBg} ${currentTheme.buttonHover}`}>
                                        <Grid size={20} className={currentTheme.textMuted} />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Recording Status */}
                        <div className={`px-4 py-2 rounded-full ${isRecording ? 'bg-red-500/20 border border-red-500/30' : 'bg-black/20'}`}>
                            <div className="flex items-center gap-3">
                                {isRecording && <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>}
                                <span className={`text-sm font-medium ${isRecording ? 'text-red-400' : currentTheme.textMuted}`}>
                                    {isRecording ? 'Recording...' : isProcessing ? 'Processing...' : 'Ready to record'}
                                </span>
                            </div>
                        </div>

                        {/* Right Controls */}
                        <div className="flex items-center gap-2">
                            {/* Chat Toggle */}
                            <button
                                onClick={() => setShowChat(!showChat)}
                                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                    showChat ? currentTheme.accent : currentTheme.buttonBg
                                } ${currentTheme.buttonHover}`}
                            >
                                <MessageSquare size={20} className={showChat ? 'text-white' : currentTheme.textMuted} />
                            </button>

                            {/* More Options */}
                            <button className={`w-12 h-12 rounded-full flex items-center justify-center ${currentTheme.buttonBg} ${currentTheme.buttonHover}`}>
                                <MoreVertical size={20} className={currentTheme.textMuted} />
                            </button>

                            {/* End Call */}
                            <button
                                onClick={handleFinish}
                                disabled={isRecording || isProcessing}
                                className={`px-6 h-12 rounded-full flex items-center gap-2 ${currentTheme.endCall} transition-all ${
                                    (isRecording || isProcessing) ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                                <Phone size={18} className="text-white rotate-[135deg]" />
                                <span className="text-white font-medium">
                                    {isLastQuestion && lastResult ? 'View Results' : 'End Call'}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Chat/Transcript Panel */}
                {showChat && (
                    <div className={`w-96 flex flex-col border-l ${currentTheme.border} ${currentTheme.chatBg}`}>
                        <div className={`h-14 flex items-center justify-between px-4 border-b ${currentTheme.border}`}>
                            <span className={`font-medium ${currentTheme.text}`}>Meeting Chat</span>
                            <button onClick={() => setShowChat(false)} className={`p-2 rounded-full ${currentTheme.buttonBg} ${currentTheme.buttonHover}`}>
                                <Maximize2 size={16} className={currentTheme.textMuted} />
                            </button>
                        </div>
                        
                        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`${msg.role === 'user' ? 'pl-4' : ''}`}>
                                    <div className="flex items-start gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                            msg.role === 'user' 
                                                ? 'bg-green-600' 
                                                : theme === 'meet' ? 'bg-blue-600' : 'bg-[#0e72ed]'
                                        }`}>
                                            <span className="text-xs font-bold text-white">
                                                {msg.role === 'user' ? profile.name?.charAt(0) || 'U' : 'AI'}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-sm font-medium ${currentTheme.text}`}>
                                                    {msg.role === 'user' ? profile.name : 'AI Interviewer'}
                                                </span>
                                                <span className={`text-xs ${currentTheme.textMuted}`}>
                                                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <div className={`text-sm ${currentTheme.text} leading-relaxed`}>
                                                {msg.role === 'user' && msg.feedback ? (
                                                    <TranscriptFeedback transcript={msg.text} feedback={msg.feedback} />
                                                ) : (
                                                    <FormattedText text={msg.text} />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            
                            {isProcessing && (
                                <div className="flex items-start gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${theme === 'meet' ? 'bg-blue-600' : 'bg-[#0e72ed]'}`}>
                                        <span className="text-xs font-bold text-white">AI</span>
                                    </div>
                                    <div className="flex items-center gap-2 p-3 rounded-lg bg-black/20">
                                        <RefreshCw className="animate-spin text-cyan-400" size={14} />
                                        <span className={currentTheme.textMuted}>Analyzing your response...</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Audio Visualizer */}
                        {isRecording && (
                            <div className={`h-16 px-4 border-t ${currentTheme.border} flex items-center gap-3`}>
                                <div className="flex-1">
                                    <AudioVisualizer isActive={isRecording} />
                                </div>
                                <span className={`text-xs ${currentTheme.textMuted}`}>Listening...</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActiveInterviewView;
