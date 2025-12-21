import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import useInView from '../../hooks/useInView';

const AdvancedResumeScanner = () => {
    const [ref, isInView] = useInView({ threshold: 0.3 });
    const [showBadge, setShowBadge] = useState(false);

    useEffect(() => {
        if (isInView) {
            const timer = setTimeout(() => setShowBadge(true), 2500);
            return () => clearTimeout(timer);
        } else {
            setShowBadge(false);
        }
    }, [isInView]);

    return (
        <div
            ref={ref}
            className={`relative w-64 h-80 bg-slate-800 rounded-2xl border border-slate-600 shadow-2xl flex flex-col overflow-hidden group hover:border-cyan-500/50 transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
        >
            {/* Document paper background */}
            <div className="absolute inset-3 bg-white/95 rounded-lg shadow-inner"></div>

            {/* Resume Content */}
            <div className="relative z-10 p-5 text-slate-800">
                {/* Header - Name */}
                <div className={`text-center mb-3 transition-all duration-500 delay-100 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
                    }`}>
                    <div className="h-4 w-28 bg-slate-700 rounded mx-auto mb-1"></div>
                    <div className="h-2 w-36 bg-slate-400 rounded mx-auto"></div>
                </div>

                {/* Divider */}
                <div className={`h-px bg-slate-300 mb-3 transition-all duration-500 delay-200 ${isInView ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
                    }`}></div>

                {/* Experience Section */}
                <div className={`mb-3 transition-all duration-500 delay-300 ${isInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                    }`}>
                    <div className="h-2.5 w-20 bg-slate-600 rounded mb-2"></div>
                    <div className="space-y-1.5 ml-2">
                        <div className="flex items-center gap-1">
                            <div className="w-1 h-1 bg-cyan-500 rounded-full"></div>
                            <div className="h-1.5 w-32 bg-slate-300 rounded"></div>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-1 h-1 bg-cyan-500 rounded-full"></div>
                            <div className="h-1.5 w-28 bg-slate-300 rounded"></div>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-1 h-1 bg-cyan-500 rounded-full"></div>
                            <div className="h-1.5 w-36 bg-slate-300 rounded"></div>
                        </div>
                    </div>
                </div>

                {/* Skills Section */}
                <div className={`mb-3 transition-all duration-500 delay-[400ms] ${isInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                    }`}>
                    <div className="h-2.5 w-14 bg-slate-600 rounded mb-2"></div>
                    <div className="flex flex-wrap gap-1 ml-2">
                        <div className="h-4 w-12 bg-cyan-100 border border-cyan-300 rounded-full"></div>
                        <div className="h-4 w-16 bg-purple-100 border border-purple-300 rounded-full"></div>
                        <div className="h-4 w-10 bg-green-100 border border-green-300 rounded-full"></div>
                        <div className="h-4 w-14 bg-orange-100 border border-orange-300 rounded-full"></div>
                    </div>
                </div>

                {/* Education Section */}
                <div className={`transition-all duration-500 delay-500 ${isInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                    }`}>
                    <div className="h-2.5 w-18 bg-slate-600 rounded mb-2"></div>
                    <div className="space-y-1 ml-2">
                        <div className="h-1.5 w-36 bg-slate-300 rounded"></div>
                        <div className="h-1.5 w-24 bg-slate-200 rounded"></div>
                    </div>
                </div>
            </div>

            {/* Scanning line - animated cyan line moving down */}
            {isInView && (
                <div className="absolute left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_rgba(34,211,238,1),0_0_40px_rgba(34,211,238,0.8)] animate-scan z-20"></div>
            )}

            {/* Scan glow effect that follows the line */}
            {isInView && (
                <div className="absolute inset-0 z-15">
                    <div className="absolute left-0 w-full h-16 bg-gradient-to-b from-cyan-400/30 via-cyan-400/10 to-transparent animate-scan"></div>
                </div>
            )}

            {/* Scan overlay glow */}
            {isInView && (
                <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-cyan-500/10 z-10 animate-scan-overlay rounded-2xl"></div>
            )}

            {/* Match badge - pops in after scan */}
            {showBadge && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-pop-in bg-gradient-to-r from-green-500 to-emerald-500 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-[0_10px_30px_rgba(34,197,94,0.5)] z-30">
                    <Check size={18} fill="white" className="text-green-200" /> MATCH 98%
                </div>
            )}

            {/* Corner scan indicators */}
            {isInView && (
                <>
                    <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-cyan-400 opacity-60"></div>
                    <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-cyan-400 opacity-60"></div>
                    <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-cyan-400 opacity-60"></div>
                    <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-cyan-400 opacity-60"></div>
                </>
            )}
        </div>
    );
};

export default AdvancedResumeScanner;
