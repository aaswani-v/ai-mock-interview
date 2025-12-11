import React, { useState, useEffect, useRef } from 'react';
import { Cpu, Mic, Square, ArrowRight } from 'lucide-react';
import Button from '../components/ui/Button';
import AudioVisualizer from '../components/visuals/AudioVisualizer';

const ActiveInterviewView = ({ question, onEndQuestion }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [messages, setMessages] = useState([{ role: 'ai', text: question.text }]);
    const [timer, setTimer] = useState(0);
    const [confidence, setConfidence] = useState(85);
    const timerRef = useRef(null);

    useEffect(() => {
        if (isRecording) {
            timerRef.current = setInterval(() => {
                setTimer(t => t + 1);
                // Simulate fluctuating confidence
                setConfidence(prev => Math.min(100, Math.max(60, prev + (Math.random() - 0.5) * 5)));
            }, 1000);
        } else {
            clearInterval(timerRef.current);
            setTimer(0);
        }
        return () => clearInterval(timerRef.current);
    }, [isRecording]);

    const toggleRecording = () => {
        if (!isRecording) {
            setIsRecording(true);
        } else {
            setIsRecording(false);
            setMessages(prev => [...prev, { role: 'user', text: "I believe the Virtual DOM is a lightweight copy of the actual DOM..." }]);
            setTimeout(() => {
                setMessages(prev => [...prev, { role: 'ai', text: "Good start. Can you elaborate on the reconciliation process?" }]);
            }, 1500);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <div className="flex h-full animate-fade-in-up gap-6 p-6">
            {/* Left Panel: Avatar & Live Analysis */}
            <div className="w-1/3 bg-slate-900/50 border border-slate-700/50 rounded-3xl p-8 flex flex-col items-center justify-between relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-red-500" />

                <div className="flex justify-between w-full mb-8">
                    <div className="bg-slate-800/80 px-3 py-1 rounded-full text-xs font-mono text-slate-300 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div> LIVE
                    </div>
                    <div className="bg-slate-800/80 px-3 py-1 rounded-full text-xs font-mono text-cyan-400">
                        {formatTime(timer)}
                    </div>
                </div>

                <div className="relative mb-8">
                    <div className={`w-48 h-48 rounded-full bg-gradient-to-tr from-cyan-600 to-purple-600 flex items-center justify-center shadow-[0_0_50px_rgba(34,211,238,0.3)] transition-all duration-500 ${isRecording ? 'scale-95 opacity-80' : 'scale-100 opacity-100 animate-pulse-slow'}`}>
                        <Cpu className="w-20 h-20 text-white/90" />
                    </div>
                    {!isRecording && <div className="absolute inset-0 border-2 border-cyan-400 rounded-full animate-ping opacity-20" />}
                </div>

                <div className="w-full space-y-4">
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                        <div className="flex justify-between text-xs text-slate-400 mb-2">
                            <span>Confidence Level</span>
                            <span>{Math.round(confidence)}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-500 ${confidence > 80 ? 'bg-green-500' : confidence > 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                style={{ width: `${confidence}%` }}
                            ></div>
                        </div>
                    </div>
                    <div className="text-center">
                        <p className="text-cyan-400 text-sm font-mono tracking-wider animate-pulse">{isRecording ? "ANALYZING SPEECH PATTERNS..." : "WAITING FOR RESPONSE"}</p>
                    </div>
                </div>
            </div>

            {/* Right Panel: Chat & Controls */}
            <div className="w-2/3 flex flex-col bg-slate-900/50 border border-slate-700/50 rounded-3xl overflow-hidden">
                <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-5 rounded-2xl shadow-lg ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'}`}>
                                <p className="leading-relaxed text-base">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="h-32 bg-slate-900 border-t border-slate-800 p-6 flex items-center justify-between gap-6">
                    <div className="flex items-center gap-6 flex-1">
                        <button
                            onClick={toggleRecording}
                            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all transform hover:scale-105 ${isRecording ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30' : 'bg-cyan-500 hover:bg-cyan-600 shadow-lg shadow-cyan-500/30'}`}
                        >
                            {isRecording ? <Square fill="white" size={24} /> : <Mic fill="white" size={28} />}
                        </button>
                        <div className="flex-1">
                            <div className="h-8 w-full max-w-xs"><AudioVisualizer isActive={isRecording} /></div>
                        </div>
                    </div>
                    <Button variant="secondary" onClick={onEndQuestion} icon={ArrowRight}>Next Question</Button>
                </div>
            </div>
        </div>
    );
};

export default ActiveInterviewView;
