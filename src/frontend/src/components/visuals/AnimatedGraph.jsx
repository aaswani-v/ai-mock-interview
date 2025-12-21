import React, { useState, useEffect } from 'react';
import { TrendingUp, Zap, Target } from 'lucide-react';
import useInView from '../../hooks/useInView';

const AnimatedGraph = () => {
    const [graphRef, isInView] = useInView({ threshold: 0.3 });
    const [animatedValue, setAnimatedValue] = useState(0);
    const [showStats, setShowStats] = useState(false);

    // Animate the percentage counter
    useEffect(() => {
        if (!isInView) {
            setAnimatedValue(0);
            setShowStats(false);
            return;
        }

        const targetValue = 145;
        const duration = 2000;
        const steps = 60;
        const increment = targetValue / steps;
        let current = 0;

        const interval = setInterval(() => {
            current += increment;
            if (current >= targetValue) {
                setAnimatedValue(targetValue);
                clearInterval(interval);
                setTimeout(() => setShowStats(true), 300);
            } else {
                setAnimatedValue(Math.floor(current));
            }
        }, duration / steps);

        return () => clearInterval(interval);
    }, [isInView]);

    return (
        <div
            ref={graphRef}
            className={`relative w-80 h-72 bg-gradient-to-br from-slate-900/95 via-slate-800/90 to-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden group hover:border-green-500/40 transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95'
                }`}
        >
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-radial from-green-500/10 to-transparent blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-radial from-emerald-500/10 to-transparent blur-2xl"></div>

            {/* Header */}
            <div className={`flex justify-between items-center mb-4 transition-all duration-500 delay-200 ${isInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                }`}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/30 to-emerald-500/20 flex items-center justify-center text-green-400 border border-green-500/30 shadow-[0_0_20px_rgba(74,222,128,0.2)]">
                        <TrendingUp size={20} />
                    </div>
                    <div>
                        <span className="text-slate-200 font-bold text-sm block">Performance</span>
                        <span className="text-slate-500 text-xs">Last 30 days</span>
                    </div>
                </div>
                <div className={`text-right transition-all duration-700 delay-500 ${isInView ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                    }`}>
                    <span className="text-3xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                        +{animatedValue}%
                    </span>
                </div>
            </div>

            {/* Graph area */}
            <div className="relative h-28 w-full mb-4">
                {/* Grid lines with labels */}
                <div className={`absolute inset-0 flex flex-col justify-between transition-opacity duration-500 delay-300 ${isInView ? 'opacity-100' : 'opacity-0'
                    }`}>
                    {[100, 75, 50, 25].map((val, i) => (
                        <div key={val} className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-600 w-6">{val}</span>
                            <div className="flex-1 h-px bg-slate-700/50"></div>
                        </div>
                    ))}
                </div>

                <svg className="w-full h-full overflow-visible absolute inset-0" style={{ marginLeft: '32px', width: 'calc(100% - 32px)' }}>
                    <defs>
                        <linearGradient id="lineGradientEnhanced" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#4ade80" stopOpacity="0.6" />
                            <stop offset="50%" stopColor="#22c55e" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#4ade80" stopOpacity="0" />
                        </linearGradient>
                        <filter id="graphGlow">
                            <feGaussianBlur stdDeviation="2" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>
                    {isInView && (
                        <>
                            {/* Area fill with gradient */}
                            <path
                                d="M0,95 C30,88 60,82 90,55 C120,28 150,45 180,30 C210,15 230,8 250,5 V110 H0 Z"
                                fill="url(#lineGradientEnhanced)"
                                className="animate-fade-in-delayed opacity-0"
                                style={{ animationDelay: '0.5s' }}
                            />
                            {/* Main line with glow */}
                            <path
                                d="M0,95 C30,88 60,82 90,55 C120,28 150,45 180,30 C210,15 230,8 250,5"
                                fill="none"
                                stroke="url(#lineGradientStroke)"
                                strokeWidth="3"
                                strokeLinecap="round"
                                filter="url(#graphGlow)"
                                className="animate-draw-path"
                                style={{
                                    stroke: '#4ade80',
                                    strokeDasharray: '500',
                                    strokeDashoffset: '500',
                                    animation: 'drawPath 2s ease-out forwards'
                                }}
                            />
                            {/* Data points */}
                            {[[0, 95], [90, 55], [180, 30], [250, 5]].map(([x, y], i) => (
                                <g key={i} className="animate-fade-in-delayed opacity-0" style={{ animationDelay: `${0.5 + i * 0.2}s` }}>
                                    <circle cx={x} cy={y} r="6" fill="#1e293b" stroke="#4ade80" strokeWidth="2" />
                                    <circle cx={x} cy={y} r="3" fill="#4ade80" />
                                </g>
                            ))}
                            {/* Endpoint with ping effect */}
                            <circle cx="250" cy="5" r="8" fill="#4ade80" className="animate-ping opacity-30" />
                            <circle cx="250" cy="5" r="5" fill="white" className="drop-shadow-[0_0_10px_rgba(74,222,128,0.8)]" />
                        </>
                    )}
                </svg>
            </div>

            {/* Stats row */}
            <div className={`grid grid-cols-3 gap-3 transition-all duration-500 ${showStats ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}>
                <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
                    <div className="flex items-center gap-1 mb-1">
                        <Zap size={12} className="text-yellow-400" />
                        <span className="text-[10px] text-slate-400 uppercase">Sessions</span>
                    </div>
                    <span className="text-lg font-bold text-white">24</span>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
                    <div className="flex items-center gap-1 mb-1">
                        <Target size={12} className="text-cyan-400" />
                        <span className="text-[10px] text-slate-400 uppercase">Accuracy</span>
                    </div>
                    <span className="text-lg font-bold text-white">87%</span>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
                    <div className="flex items-center gap-1 mb-1">
                        <TrendingUp size={12} className="text-green-400" />
                        <span className="text-[10px] text-slate-400 uppercase">Rank</span>
                    </div>
                    <span className="text-lg font-bold text-white">#12</span>
                </div>
            </div>

            {/* Glowing effect when in view */}
            {isInView && (
                <div className="absolute inset-0 bg-gradient-to-t from-green-500/5 via-transparent to-transparent rounded-3xl pointer-events-none"></div>
            )}
        </div>
    );
};

export default AnimatedGraph;
