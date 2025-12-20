import React from 'react';
import { Check } from 'lucide-react';
import useInView from '../../hooks/useInView';

const AdvancedResumeScanner = () => {
    const [ref, isInView] = useInView({ threshold: 0.3 });
    
    return (
        <div 
            ref={ref}
            className={`relative w-56 h-72 bg-slate-800 rounded-2xl border border-slate-600 shadow-2xl flex flex-col items-center pt-8 overflow-hidden group hover:border-cyan-500/50 transition-all duration-700 ${
                isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
        >
            {/* Document background glow */}
            <div className="absolute inset-4 bg-white/5 rounded-lg"></div>
            
            {/* Document lines - animate in sequentially */}
            <div className={`w-32 h-3 bg-slate-600 rounded mb-4 shadow-sm transition-all duration-500 delay-100 ${
                isInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
            }`}></div>
            <div className={`w-40 h-2 bg-slate-600/50 rounded mb-3 transition-all duration-500 delay-200 ${
                isInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
            }`}></div>
            <div className={`w-36 h-2 bg-slate-600/50 rounded mb-3 transition-all duration-500 delay-300 ${
                isInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
            }`}></div>
            <div className={`w-40 h-2 bg-slate-600/50 rounded mb-6 transition-all duration-500 delay-[400ms] ${
                isInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
            }`}></div>
            <div className={`w-24 h-3 bg-slate-600 rounded mb-3 transition-all duration-500 delay-500 ${
                isInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
            }`}></div>
            
            {/* Scanning line - only animate when in view */}
            {isInView && (
                <div className="absolute top-0 left-0 w-full h-1 bg-cyan-400 shadow-[0_0_30px_rgba(34,211,238,1)] animate-scan z-20"></div>
            )}
            
            {/* Scan overlay glow */}
            {isInView && (
                <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 to-transparent z-10 animate-scan-overlay"></div>
            )}
            
            {/* Match badge - pops in after scan */}
            {isInView && (
                <div className="absolute bottom-8 scale-0 animate-pop-in bg-green-500 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-[0_10px_30px_rgba(34,197,94,0.5)] z-30">
                    <Check size={18} fill="white" className="text-green-600" /> MATCH 98%
                </div>
            )}
        </div>
    );
};

export default AdvancedResumeScanner;
