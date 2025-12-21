import React, { useState, useEffect } from 'react';
import { Flame } from 'lucide-react';
import useInView from '../../hooks/useInView';

const StreakFlame = ({ streak = 7 }) => {
    const [ref, isInView] = useInView({ threshold: 0.3 });
    const [embers, setEmbers] = useState([]);

    // Generate random embers continuously
    useEffect(() => {
        if (!isInView) return;

        const interval = setInterval(() => {
            const newEmber = {
                id: Date.now() + Math.random(),
                left: 20 + Math.random() * 60,
                delay: Math.random() * 0.3,
                size: 3 + Math.random() * 6,
                duration: 1 + Math.random() * 1.5,
            };
            setEmbers(prev => [...prev.slice(-12), newEmber]);
        }, 150);

        return () => clearInterval(interval);
    }, [isInView]);

    return (
        <div
            ref={ref}
            className={`relative transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
        >
            {/* Main container */}
            <div className="relative w-48 h-64 flex flex-col items-center justify-end">

                {/* Large ambient glow */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full bg-gradient-radial from-orange-500/40 via-orange-600/20 to-transparent blur-3xl animate-glow-pulse"></div>

                {/* Secondary glow layer */}
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full bg-gradient-radial from-yellow-400/30 to-transparent blur-2xl animate-glow-pulse" style={{ animationDelay: '0.5s' }}></div>

                {/* SVG Flame - More realistic shape */}
                <div className="relative w-36 h-44 flex items-end justify-center">
                    <svg
                        viewBox="0 0 100 140"
                        className="w-full h-full absolute bottom-0"
                        style={{ filter: 'drop-shadow(0 0 20px rgba(251, 146, 60, 0.8)) drop-shadow(0 0 40px rgba(251, 146, 60, 0.5))' }}
                    >
                        <defs>
                            {/* Main flame gradient */}
                            <linearGradient id="flameGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                                <stop offset="0%" stopColor="#dc2626" />
                                <stop offset="30%" stopColor="#ea580c" />
                                <stop offset="60%" stopColor="#f97316" />
                                <stop offset="80%" stopColor="#fbbf24" />
                                <stop offset="100%" stopColor="#fef08a" />
                            </linearGradient>

                            {/* Inner flame gradient - hotter */}
                            <linearGradient id="innerFlameGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                                <stop offset="0%" stopColor="#f97316" />
                                <stop offset="40%" stopColor="#fbbf24" />
                                <stop offset="70%" stopColor="#fef08a" />
                                <stop offset="100%" stopColor="#fffbeb" />
                            </linearGradient>

                            {/* Core flame - white hot */}
                            <linearGradient id="coreFlameGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                                <stop offset="0%" stopColor="#fef08a" />
                                <stop offset="50%" stopColor="#fefce8" />
                                <stop offset="100%" stopColor="#ffffff" />
                            </linearGradient>

                            {/* Glow filter */}
                            <filter id="flameGlow" x="-50%" y="-50%" width="200%" height="200%">
                                <feGaussianBlur stdDeviation="3" result="blur" />
                                <feMerge>
                                    <feMergeNode in="blur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>

                        {/* Back flame - largest, red/orange */}
                        <path
                            d="M50 140 C20 120, 10 90, 15 60 C18 40, 30 25, 40 15 C45 8, 48 3, 50 0 C52 3, 55 8, 60 15 C70 25, 82 40, 85 60 C90 90, 80 120, 50 140 Z"
                            fill="url(#flameGradient)"
                            className="animate-flame-wave origin-bottom"
                            filter="url(#flameGlow)"
                        />

                        {/* Left flicker */}
                        <path
                            d="M30 135 C15 115, 8 85, 20 55 C25 40, 35 30, 40 25 C38 45, 25 70, 25 95 C25 110, 28 125, 30 135 Z"
                            fill="url(#flameGradient)"
                            className="animate-flame-flicker origin-bottom opacity-80"
                            style={{ animationDelay: '0.2s' }}
                        />

                        {/* Right flicker */}
                        <path
                            d="M70 135 C85 115, 92 85, 80 55 C75 40, 65 30, 60 25 C62 45, 75 70, 75 95 C75 110, 72 125, 70 135 Z"
                            fill="url(#flameGradient)"
                            className="animate-flame-flicker origin-bottom opacity-80"
                            style={{ animationDelay: '0.4s' }}
                        />

                        {/* Middle flame */}
                        <path
                            d="M50 135 C30 115, 22 85, 28 55 C32 35, 42 20, 48 10 C49 5, 50 2, 50 0 C50 2, 51 5, 52 10 C58 20, 68 35, 72 55 C78 85, 70 115, 50 135 Z"
                            fill="url(#innerFlameGradient)"
                            className="animate-flame-flicker origin-bottom"
                            style={{ animationDelay: '0.1s' }}
                        />

                        {/* Inner flame - brightest */}
                        <path
                            d="M50 130 C38 110, 32 80, 38 50 C42 32, 47 18, 50 8 C53 18, 58 32, 62 50 C68 80, 62 110, 50 130 Z"
                            fill="url(#innerFlameGradient)"
                            className="animate-flame-wave origin-bottom"
                            style={{ animationDelay: '0.15s' }}
                        />

                        {/* Core flame - white hot center */}
                        <path
                            d="M50 125 C42 105, 38 75, 43 50 C46 35, 48 22, 50 15 C52 22, 54 35, 57 50 C62 75, 58 105, 50 125 Z"
                            fill="url(#coreFlameGradient)"
                            className="animate-flame-flicker origin-bottom"
                            style={{ animationDelay: '0.05s' }}
                        />

                        {/* Tiny hot core */}
                        <ellipse
                            cx="50"
                            cy="110"
                            rx="8"
                            ry="15"
                            fill="white"
                            className="animate-flame-flicker origin-center opacity-90"
                        />
                    </svg>

                    {/* Embers floating up */}
                    {embers.map(ember => (
                        <div
                            key={ember.id}
                            className="absolute rounded-full"
                            style={{
                                left: `${ember.left}%`,
                                bottom: '35%',
                                width: `${ember.size}px`,
                                height: `${ember.size}px`,
                                background: `radial-gradient(circle, #fbbf24 0%, #f97316 50%, transparent 100%)`,
                                animation: `ember-rise ${ember.duration}s ease-out forwards`,
                                animationDelay: `${ember.delay}s`,
                                boxShadow: '0 0 8px rgba(251, 191, 36, 0.9), 0 0 12px rgba(249, 115, 22, 0.6)'
                            }}
                        ></div>
                    ))}

                    {/* Streak number overlay - centered in flame */}
                    <div className="absolute bottom-14 left-1/2 -translate-x-1/2 z-20">
                        <span
                            className="text-5xl font-black"
                            style={{
                                color: '#1e293b',
                                textShadow: '0 0 10px rgba(255,255,255,0.8), 0 0 20px rgba(255,255,255,0.6), 0 0 30px rgba(251,191,36,0.4)',
                                WebkitTextStroke: '1px rgba(255,255,255,0.3)'
                            }}
                        >
                            {streak}
                        </span>
                    </div>
                </div>

                {/* Fire base glow */}
                <div className="relative w-40 h-6 -mt-2">
                    <div className="absolute inset-0 bg-gradient-to-t from-orange-600/60 via-orange-500/30 to-transparent rounded-full blur-md"></div>
                    <div className="absolute inset-x-4 inset-y-0 bg-gradient-to-t from-yellow-400/40 to-transparent rounded-full blur-sm"></div>
                </div>

                {/* Label badge */}
                <div className="mt-4 flex items-center gap-2 bg-gradient-to-r from-slate-800/95 via-slate-900/95 to-slate-800/95 px-5 py-2.5 rounded-full border border-orange-500/40 shadow-[0_0_25px_rgba(251,146,60,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]">
                    <Flame size={18} className="text-orange-400 animate-pulse" fill="currentColor" />
                    <span className="text-sm font-bold bg-gradient-to-r from-orange-300 via-yellow-300 to-orange-300 bg-clip-text text-transparent uppercase tracking-wider">Day Streak</span>
                </div>

                {/* Sparkle effects around the flame */}
                <div className="absolute top-8 left-6 w-2 h-2 bg-yellow-300 rounded-full animate-ping opacity-60" style={{ animationDuration: '2s' }}></div>
                <div className="absolute top-16 right-4 w-1.5 h-1.5 bg-orange-300 rounded-full animate-ping opacity-50" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}></div>
                <div className="absolute top-6 right-10 w-1 h-1 bg-yellow-200 rounded-full animate-ping opacity-40" style={{ animationDuration: '3s', animationDelay: '1s' }}></div>
            </div>
        </div>
    );
};

export default StreakFlame;
