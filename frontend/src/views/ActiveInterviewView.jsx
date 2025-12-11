import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, ArrowRight, Video, RefreshCw, Loader2, CheckCircle, AlertCircle, Lightbulb } from 'lucide-react';
import Button from '../components/ui/Button';
import AudioVisualizer from '../components/visuals/AudioVisualizer';
import { API_URL } from '../config';

// Simple markdown-like text parser for chat messages
const FormattedText = ({ text }) => {
    // Parse simple markdown: **bold**, *italic*, line breaks, and horizontal rules
    const parseText = (text) => {
        if (!text) return null;
        
        // Split by line breaks first
        const lines = text.split('\n');
        
        return lines.map((line, lineIdx) => {
            // Handle horizontal rule (---)
            if (line.trim() === '---') {
                return <hr key={lineIdx} className="border-slate-600 my-3" />;
            }
            
            // Handle bold text (**text**)
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

// Line-by-line feedback component with LLM suggestions
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
                    {/* Show suggestion for improvement items */}
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
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [lastResult, setLastResult] = useState(null);
    const [allResults, setAllResults] = useState([]);
    const timerRef = useRef(null);

    // Recording Refs
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const videoPreviewRef = useRef(null);
    const streamRef = useRef(null);
    const chatContainerRef = useRef(null);

    // Get user profile from localStorage if not passed
    const savedUser = localStorage.getItem('user');
    const userData = savedUser ? JSON.parse(savedUser) : {};
    const profile = userProfile || {
        name: userData?.name || 'Candidate',
        role: userData?.role || 'Professional',
        experience: userData?.experience_years || '',
        salary: userData?.salary_expectation || ''
    };

    // Generate line-by-line feedback from transcript
    const generateLineFeedback = (transcript, analysisData) => {
        if (!transcript) return null;
        
        // Split transcript into sentences
        const sentences = transcript.split(/(?<=[.!?])\s+/).filter(s => s.trim());
        
        if (sentences.length === 0) return null;

        const lineAnalysis = sentences.map((sentence, idx) => {
            const lowerSentence = sentence.toLowerCase();
            
            // Check for positive indicators
            const hasSpecifics = /\d+|specifically|for example|such as|instance/i.test(sentence);
            const hasAction = /i (led|created|developed|implemented|managed|achieved|improved|built)/i.test(sentence);
            const hasResult = /result|outcome|impact|increased|decreased|saved|reduced|grew/i.test(sentence);
            
            // Check for areas to improve
            // Note: "like" is only flagged when used as a filler (not in comparisons like "something like X")
            const hasFillers = /\b(um|uh|you know|basically|actually|literally)\b/i.test(sentence) ||
                               /\blike,?\s+(um|uh|so|you know)\b/i.test(sentence) ||
                               /^(like|so like)\b/i.test(sentence.trim());
            const isVague = sentence.length < 20 && !hasSpecifics;
            const startsWeak = /^(so|well|i mean|i think)/i.test(sentence);
            
            if (hasFillers) {
                return {
                    text: sentence,
                    type: 'improve',
                    feedback: 'Try to minimize filler words for more confident delivery.'
                };
            } else if (hasAction && hasResult) {
                return {
                    text: sentence,
                    type: 'good',
                    feedback: 'Excellent! You used action verbs and mentioned results.'
                };
            } else if (hasSpecifics) {
                return {
                    text: sentence,
                    type: 'good',
                    feedback: 'Great use of specific details and examples.'
                };
            } else if (isVague && startsWeak) {
                return {
                    text: sentence,
                    type: 'improve',
                    feedback: 'Consider starting with a stronger, more direct statement.'
                };
            } else if (hasAction) {
                return {
                    text: sentence,
                    type: 'good',
                    feedback: 'Good use of action verbs to describe your contributions.'
                };
            } else {
                return {
                    text: sentence,
                    type: 'neutral',
                    feedback: 'Consider adding specific metrics or examples here.'
                };
            }
        });

        // Limit to first 4 most relevant items
        const goodItems = lineAnalysis.filter(i => i.type === 'good').slice(0, 2);
        const improveItems = lineAnalysis.filter(i => i.type === 'improve').slice(0, 2);
        
        return {
            lineAnalysis: [...goodItems, ...improveItems].slice(0, 4)
        };
    };

    // Fetch LLM-generated questions on mount
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
                    // Fallback questions
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

    useEffect(() => {
        if (isRecording) {
            timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
        } else {
            clearInterval(timerRef.current);
            setTimer(0);
        }
        return () => clearInterval(timerRef.current);
    }, [isRecording]);

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
                    
                    // Use backend line-by-line analysis if available, else fallback to client-side
                    let lineFeedback;
                    if (data.lineAnalysis && data.lineAnalysis.length > 0) {
                        lineFeedback = { lineAnalysis: data.lineAnalysis };
                    } else {
                        lineFeedback = generateLineFeedback(transcript, data);
                    }
                    
                    // Add user's transcribed response with feedback
                    setMessages(prev => [...prev, { 
                        role: 'user', 
                        text: transcript,
                        feedback: lineFeedback
                    }]);

                    // Store result
                    const resultWithQuestion = { ...data, question: currentQuestion };
                    setAllResults(prev => [...prev, resultWithQuestion]);
                    setLastResult(data);

                    // Go directly to next question (no score message in between)
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
                            // Calculate average score
                            const avgScore = Math.round(
                                allResults.reduce((sum, r) => sum + (r.overallScore || 0), data.overallScore || 0) / 
                                (allResults.length + 1)
                            );
                            const scoreColor = avgScore >= 70 ? '🟢' : avgScore >= 50 ? '🟡' : '🔴';
                            
                            setMessages(prev => [...prev, { 
                                role: 'ai', 
                                text: `${scoreColor} **Interview Complete!**\n\n🎉 You've answered all ${questions.length} questions.\n\n**Average Score: ${avgScore}/100**\n\nClick **"View Results"** for detailed analysis.`
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
            totalQuestions: questions.length
        } : null;
        onEndQuestion(summaryResult);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    if (isLoadingQuestions) {
        return (
            <div className="flex h-full items-center justify-center animate-fade-in-up">
                <div className="text-center">
                    <Loader2 size={48} className="animate-spin text-cyan-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Preparing Your Interview</h3>
                    <p className="text-slate-400">Generating personalized questions for {profile.role}...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full animate-fade-in-up">
            {/* Left Panel: Video Preview - LARGER */}
            <div className="w-2/5 bg-slate-900/50 border-r border-slate-700/50 p-6 flex flex-col relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500" />

                <div className="flex justify-between items-center mb-4">
                    <div className="bg-slate-800/80 px-3 py-1.5 rounded-full text-xs font-mono text-slate-300 flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-slate-500'}`}></div>
                        {isRecording ? 'RECORDING' : isProcessing ? 'ANALYZING...' : 'READY'}
                    </div>
                    <div className="bg-slate-800/80 px-4 py-1.5 rounded-full text-sm font-mono text-cyan-400 font-bold">
                        {formatTime(timer)}
                    </div>
                </div>

                {/* Video Preview - MUCH LARGER */}
                <div className="flex-1 flex items-center justify-center">
                    <div className="relative w-full max-w-md aspect-[4/5] rounded-2xl overflow-hidden bg-black border-2 border-slate-700 shadow-2xl">
                        <video
                            ref={videoPreviewRef}
                            autoPlay
                            muted
                            playsInline
                            className={`w-full h-full object-cover transform scale-x-[-1] transition-opacity duration-300 ${isRecording ? 'opacity-100' : 'opacity-40 grayscale'}`}
                        />
                        {!isRecording && !isProcessing && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                <div className="w-24 h-24 rounded-full bg-cyan-500/20 flex items-center justify-center animate-pulse border-2 border-cyan-500/30">
                                    <Video size={40} className="text-cyan-400" />
                                </div>
                            </div>
                        )}
                        {isRecording && (
                            <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-500/30 backdrop-blur-sm border border-red-500/50 px-3 py-1.5 rounded-lg">
                                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                                <span className="text-sm font-bold text-white">REC</span>
                            </div>
                        )}
                        {isProcessing && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                <div className="text-center">
                                    <RefreshCw size={40} className="animate-spin text-cyan-400 mx-auto mb-2" />
                                    <span className="text-sm text-cyan-400">Analyzing...</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="text-center mt-4">
                    <h3 className="text-white font-bold text-lg">{profile.name}</h3>
                    <p className="text-cyan-400 text-sm">{profile.role}</p>
                    <p className="text-slate-500 text-xs mt-1">
                        Question {currentQuestionIndex + 1} of {questions.length}
                    </p>
                </div>
            </div>

            {/* Right Panel: Chat & Controls */}
            <div className="w-3/5 flex flex-col bg-slate-950">
                <div 
                    ref={chatContainerRef}
                    className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar"
                >
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[90%] p-5 rounded-2xl shadow-lg ${
                                msg.role === 'user' 
                                    ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-tr-none' 
                                    : msg.isQuestion
                                    ? 'bg-gradient-to-br from-slate-800 to-slate-900 text-slate-100 rounded-tl-none border border-cyan-500/30'
                                    : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
                            }`}>
                                {msg.role === 'user' && msg.feedback ? (
                                    <TranscriptFeedback transcript={msg.text} feedback={msg.feedback} />
                                ) : (
                                    <div className="leading-relaxed text-base">
                                        <FormattedText text={msg.text} />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {isProcessing && (
                        <div className="flex justify-start">
                            <div className="bg-slate-800 text-slate-200 rounded-2xl rounded-tl-none border border-slate-700 p-4 flex items-center gap-3">
                                <RefreshCw className="animate-spin text-cyan-400" size={18} />
                                <span className="text-slate-400">Analyzing your response...</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div className="h-28 bg-slate-900 border-t border-slate-800 p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                        <button
                            onClick={toggleRecording}
                            disabled={isProcessing}
                            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all transform hover:scale-105 ${
                                isRecording 
                                    ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/40' 
                                    : 'bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/40'
                            } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isRecording ? <Square fill="white" size={24} /> : <Mic fill="white" size={28} />}
                        </button>
                        {/* Recording Timer Display */}
                        <div className={`min-w-[70px] px-3 py-2 rounded-lg font-mono text-lg font-bold flex items-center gap-2 ${
                            isRecording 
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                                : 'bg-slate-800/80 text-cyan-400 border border-slate-700'
                        }`}>
                            {isRecording && (
                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            )}
                            <span>{formatTime(timer)}</span>
                        </div>
                        <div className="flex-1">
                            <div className="h-10 w-full max-w-xs"><AudioVisualizer isActive={isRecording} /></div>
                            <p className="text-xs text-slate-500 mt-1">
                                {isRecording ? 'Recording... Click to stop' : 'Click microphone to start recording'}
                            </p>
                        </div>
                    </div>
                    <Button 
                        variant={isLastQuestion && lastResult ? "primary" : "secondary"} 
                        onClick={handleFinish} 
                        icon={ArrowRight}
                        disabled={isRecording || isProcessing}
                        className="px-6"
                    >
                        {isLastQuestion && lastResult ? "View Results" : "End Interview"}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ActiveInterviewView;
