import React from 'react';
import { TrendingUp } from 'lucide-react';
import useInView from '../../hooks/useInView';

const AnimatedGraph = () => {
    const [graphRef, isInView] = useInView({ threshold: 0.5 });
    return (
        <div ref={graphRef} className="relative w-80 h-56 bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-2xl overflow-hidden group hover:border-green-500/30 transition-colors">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400">
                        <TrendingUp size={18} />
                    </div>
                    <span className="text-slate-300 font-bold text-sm">Growth Rate</span>
                </div>
                <span className="text-green-400 font-mono font-bold">+145%</span>
            </div>
            <div className="relative h-24 w-full">
                <div className="absolute inset-0 flex flex-col justify-between opacity-10">
                    <div className="w-full h-px bg-white"></div>
                    <div className="w-full h-px bg-white"></div>
                    <div className="w-full h-px bg-white"></div>
                </div>
                <svg className="w-full h-full overflow-visible">
                    <defs>
                        <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#4ade80" stopOpacity="0.5" />
                            <stop offset="100%" stopColor="#4ade80" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    {isInView && (
                        <>
                            <path d="M0,100 C40,90 80,80 120,40 C160,0 200,60 280,10" fill="none" stroke="#4ade80" strokeWidth="3" strokeLinecap="round" className="animate-draw-path" />
                            <path d="M0,100 C40,90 80,80 120,40 C160,0 200,60 280,10 V120 H0 Z" fill="url(#lineGradient)" className="animate-fade-in-delayed opacity-0" />
                            <circle cx="280" cy="10" r="4" fill="#4ade80" className="animate-ping-slow" />
                            <circle cx="280" cy="10" r="4" fill="white" />
                        </>
                    )}
                </svg>
            </div>
        </div>
    );
};

export default AnimatedGraph;
