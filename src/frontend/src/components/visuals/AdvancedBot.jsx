import React, { useState, useEffect } from 'react';
import { Cpu, Mic, MessageSquare, Sparkles } from 'lucide-react';
import useInView from '../../hooks/useInView';

const AdvancedBot = () => {
    const [ref, isInView] = useInView({ threshold: 0.3 });
    const [pulseRings, setPulseRings] = useState([]);
    const [isListening, setIsListening] = useState(false);

    // Simulate listening state toggle
    useEffect(() => {
        if (!isInView) return;
        const interval = setInterval(() => {
            setIsListening(prev => !prev);
        }, 3000);
        return () => clearInterval(interval);
    }, [isInView]);

    // Create pulse ring effect
    useEffect(() => {
        if (!isInView) return;
        const interval = setInterval(() => {
            setPulseRings(prev => [...prev.slice(-3), Date.now()]);
        }, 1500);
        return () => clearInterval(interval);
    }, [isInView]);

    return (
        <div
            ref={ref}
            className={`relative group cursor-pointer w-72 h-72 flex items-center justify-center transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
        >
            {/* Ambient glow background */}
            <div className="absolute inset-0 bg-gradient-radial from-cyan-500/30 via-cyan-500/10 to-transparent blur-3xl animate-pulse" style={{ animationDuration: '3s' }}></div>

            {/* Expanding pulse rings */}
            {pulseRings.map((id) => (
                <div
                    key={id}
                    className="absolute inset-8 border-2 border-cyan-400/50 rounded-full animate-ping"
                    style={{ animationDuration: '2s' }}
                ></div>
            ))}

            {/* Outer rotating ring with multiple dots */}
            <div className="absolute inset-4 border border-cyan-500/40 rounded-full animate-spin-slow" style={{ animationDuration: '15s' }}>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-cyan-400 rounded-full shadow-[0_0_15px_#22d3ee,0_0_30px_#22d3ee]"></div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-cyan-300 rounded-full shadow-[0_0_10px_#22d3ee]"></div>
                <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-cyan-300 rounded-full shadow-[0_0_10px_#22d3ee]"></div>
                <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-cyan-300 rounded-full shadow-[0_0_10px_#22d3ee]"></div>
            </div>

            {/* Inner counter-rotating ring */}
            <div className="absolute inset-12 border border-purple-500/30 rounded-full animate-spin-slow" style={{ animationDuration: '10s', animationDirection: 'reverse' }}>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-purple-400 rounded-full shadow-[0_0_10px_#a855f7]"></div>
            </div>

            {/* Main bot head */}
            <div className="relative w-36 h-36 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 backdrop-blur-md border-2 border-cyan-400/60 rounded-3xl flex flex-col items-center justify-center shadow-[0_0_50px_rgba(34,211,238,0.4),inset_0_1px_0_rgba(255,255,255,0.1)] z-10 transform group-hover:scale-105 transition-all duration-300">

                {/* Top antenna */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full mb-1 transition-all duration-300 ${isListening
                            ? 'bg-green-400 shadow-[0_0_15px_#4ade80,0_0_30px_#4ade80] animate-pulse'
                            : 'bg-cyan-400 shadow-[0_0_10px_#22d3ee]'
                        }`}></div>
                    <div className="w-0.5 h-4 bg-gradient-to-b from-slate-400 to-slate-600 rounded-full"></div>
                </div>

                {/* Side decorations */}
                <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-cyan-400 via-cyan-500 to-cyan-400 rounded-full shadow-[0_0_10px_#22d3ee]"></div>
                <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-cyan-400 via-cyan-500 to-cyan-400 rounded-full shadow-[0_0_10px_#22d3ee]"></div>

                {/* CPU Icon with glow */}
                <div className="relative">
                    <Cpu size={52} className="text-cyan-300 drop-shadow-[0_0_15px_rgba(34,211,238,0.9)]" />
                    <Sparkles size={16} className="absolute -top-1 -right-1 text-yellow-400 animate-pulse" />
                </div>

                {/* Eyes/indicators */}
                <div className="flex gap-5 mt-3">
                    <div className={`w-2 h-2 rounded-full transition-all duration-300 ${isListening
                            ? 'bg-green-400 shadow-[0_0_12px_#4ade80,0_0_24px_#4ade80] scale-125'
                            : 'bg-white shadow-[0_0_8px_white] animate-blink'
                        }`}></div>
                    <div className={`w-2 h-2 rounded-full transition-all duration-300 ${isListening
                            ? 'bg-green-400 shadow-[0_0_12px_#4ade80,0_0_24px_#4ade80] scale-125'
                            : 'bg-white shadow-[0_0_8px_white] animate-blink'
                        }`}></div>
                </div>

                {/* Scanning line effect */}
                <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
                    <div className="absolute inset-x-0 h-8 bg-gradient-to-b from-cyan-400/20 via-cyan-400/10 to-transparent animate-scan"></div>
                </div>

                {/* Voice wave indicator when listening */}
                {isListening && (
                    <div className="absolute -bottom-4 flex gap-1 items-end">
                        <div className="w-1 h-3 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                        <div className="w-1 h-5 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-1 h-4 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-1 h-6 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                        <div className="w-1 h-3 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                )}
            </div>

            {/* Status badge */}
            <div className={`absolute -bottom-12 flex items-center gap-2 bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95 border px-5 py-2 rounded-full shadow-lg transition-all duration-300 ${isListening
                    ? 'border-green-500/50 shadow-[0_0_20px_rgba(74,222,128,0.3)]'
                    : 'border-cyan-500/50 shadow-[0_0_20px_rgba(34,211,238,0.2)]'
                }`}>
                {isListening ? (
                    <>
                        <Mic size={14} className="text-green-400 animate-pulse" />
                        <span className="text-green-300 text-xs font-bold tracking-widest uppercase">Listening...</span>
                    </>
                ) : (
                    <>
                        <MessageSquare size={14} className="text-cyan-400" />
                        <span className="text-cyan-300 text-xs font-bold tracking-widest uppercase">AI Interviewer</span>
                    </>
                )}
            </div>

            {/* Corner sparkles */}
            <div className="absolute top-8 right-8 w-2 h-2 bg-cyan-300 rounded-full animate-ping opacity-60" style={{ animationDuration: '2s' }}></div>
            <div className="absolute bottom-16 left-8 w-1.5 h-1.5 bg-purple-300 rounded-full animate-ping opacity-50" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}></div>
        </div>
    );
};

export default AdvancedBot;
