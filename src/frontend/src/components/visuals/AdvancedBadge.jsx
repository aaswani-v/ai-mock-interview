import React, { useState, useEffect } from 'react';
import { Award, Star, Shield, Crown, Zap, Trophy } from 'lucide-react';
import useInView from '../../hooks/useInView';

const AdvancedBadge = () => {
    const [ref, isInView] = useInView({ threshold: 0.3 });
    const [sparkles, setSparkles] = useState([]);
    const [showDetails, setShowDetails] = useState(false);

    // Generate sparkle effects
    useEffect(() => {
        if (!isInView) return;

        const interval = setInterval(() => {
            const newSparkle = {
                id: Date.now(),
                x: 20 + Math.random() * 60,
                y: 20 + Math.random() * 60,
                size: 4 + Math.random() * 8,
                duration: 0.5 + Math.random() * 0.5,
            };
            setSparkles(prev => [...prev.slice(-6), newSparkle]);
        }, 400);

        // Show details after animation
        const timer = setTimeout(() => setShowDetails(true), 800);

        return () => {
            clearInterval(interval);
            clearTimeout(timer);
        };
    }, [isInView]);

    return (
        <div
            ref={ref}
            className={`relative w-72 h-72 flex items-center justify-center transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
        >
            {/* Ambient glow */}
            <div className="absolute inset-0 bg-gradient-radial from-yellow-500/20 via-orange-500/10 to-transparent blur-3xl animate-pulse" style={{ animationDuration: '3s' }}></div>

            {/* Outer rotating rings */}
            <div className="absolute inset-2 border-2 border-dashed border-yellow-500/30 rounded-full animate-spin-slow" style={{ animationDuration: '25s' }}>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <Star size={14} className="text-yellow-400 fill-yellow-400" />
                </div>
            </div>

            <div className="absolute inset-8 border border-orange-400/20 rounded-full animate-spin-slow" style={{ animationDuration: '15s', animationDirection: 'reverse' }}>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
                    <Zap size={12} className="text-orange-400" />
                </div>
            </div>

            {/* Main Badge - Hexagon with 3D effect */}
            <div className="relative w-44 h-52 animate-float" style={{ animationDuration: '4s' }}>
                {/* Shadow/depth layer */}
                <div className="absolute inset-0 bg-gradient-to-b from-yellow-900/50 to-orange-900/50 clip-path-hexagon translate-y-2 blur-sm"></div>

                {/* Outer glow ring */}
                <div className="absolute -inset-1 bg-gradient-to-b from-yellow-400 via-orange-500 to-yellow-400 clip-path-hexagon opacity-60 blur-sm animate-pulse"></div>

                {/* Main badge body */}
                <div className="absolute inset-0 bg-gradient-to-b from-slate-800 via-slate-900 to-slate-800 clip-path-hexagon border-2 border-yellow-500/60 shadow-[0_0_40px_rgba(234,179,8,0.3),inset_0_2px_0_rgba(255,255,255,0.1)]">

                    {/* Inner content area */}
                    <div className="absolute inset-2 clip-path-hexagon bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center gap-2 p-4">

                        {/* Crown at top */}
                        <Crown size={24} className="text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)] -mt-2" />

                        {/* Award icon with glow */}
                        <div className="relative">
                            <Award size={56} className="text-yellow-400 drop-shadow-[0_0_20px_rgba(234,179,8,0.6)]" />
                            <div className="absolute inset-0 animate-ping opacity-20">
                                <Award size={56} className="text-yellow-400" />
                            </div>
                        </div>

                        {/* Level and title */}
                        <div className="text-center">
                            <div className="text-[10px] uppercase tracking-[0.2em] text-yellow-500/80 font-bold mb-0.5">Level 99</div>
                            <div className="text-2xl font-black bg-gradient-to-r from-yellow-300 via-yellow-100 to-yellow-300 bg-clip-text text-transparent tracking-wider drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]">
                                MASTER
                            </div>
                        </div>

                        {/* Stars */}
                        <div className="flex gap-1.5 mt-1">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    size={14}
                                    className={`transition-all duration-500`}
                                    style={{
                                        animationDelay: `${i * 0.1}s`,
                                        color: '#facc15',
                                        fill: '#facc15',
                                        filter: 'drop-shadow(0 0 4px rgba(250, 204, 21, 0.8))'
                                    }}
                                />
                            ))}
                        </div>

                        {/* Shimmer effect */}
                        <div className="absolute inset-0 clip-path-hexagon overflow-hidden pointer-events-none">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shine-slow"></div>
                        </div>
                    </div>
                </div>

                {/* Sparkle effects */}
                {sparkles.map(sparkle => (
                    <div
                        key={sparkle.id}
                        className="absolute pointer-events-none"
                        style={{
                            left: `${sparkle.x}%`,
                            top: `${sparkle.y}%`,
                            animation: `pop-in ${sparkle.duration}s ease-out forwards`
                        }}
                    >
                        <Star
                            size={sparkle.size}
                            className="text-yellow-300 fill-yellow-300"
                            style={{ filter: 'drop-shadow(0 0 4px rgba(250, 204, 21, 0.8))' }}
                        />
                    </div>
                ))}
            </div>

            {/* Floating achievement badges */}
            <div className={`absolute -top-2 -right-2 bg-gradient-to-br from-slate-800 to-slate-900 p-3 rounded-xl border border-cyan-500/50 shadow-[0_10px_30px_rgba(0,0,0,0.3),0_0_20px_rgba(34,211,238,0.2)] transition-all duration-500 ${showDetails ? 'opacity-100 translate-y-0 rotate-0' : 'opacity-0 -translate-y-4 rotate-12'
                }`}>
                <Shield size={22} className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
            </div>

            <div className={`absolute -bottom-1 -left-2 bg-gradient-to-br from-slate-800 to-slate-900 px-3 py-2 rounded-full border border-green-500/50 shadow-[0_10px_30px_rgba(0,0,0,0.3),0_0_20px_rgba(74,222,128,0.2)] transition-all duration-500 delay-200 ${showDetails ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}>
                <span className="text-xs font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">Top 1%</span>
            </div>

            <div className={`absolute top-1/2 -right-6 bg-gradient-to-br from-slate-800 to-slate-900 p-2 rounded-lg border border-purple-500/50 shadow-[0_10px_30px_rgba(0,0,0,0.3),0_0_20px_rgba(168,85,247,0.2)] transition-all duration-500 delay-300 ${showDetails ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
                }`}>
                <Trophy size={18} className="text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]" />
            </div>
        </div>
    );
};

export default AdvancedBadge;
