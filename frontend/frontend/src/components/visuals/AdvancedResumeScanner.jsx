import React from 'react';
import { Check } from 'lucide-react';

const AdvancedResumeScanner = () => (
    <div className="relative w-56 h-72 bg-slate-800 rounded-2xl border border-slate-600 shadow-2xl flex flex-col items-center pt-8 overflow-hidden group hover:border-cyan-500/50 transition-colors duration-500">
        <div className="absolute inset-4 bg-white/5 rounded-lg"></div>
        <div className="w-32 h-3 bg-slate-600 rounded mb-4 shadow-sm"></div>
        <div className="w-40 h-2 bg-slate-600/50 rounded mb-3"></div>
        <div className="w-36 h-2 bg-slate-600/50 rounded mb-3"></div>
        <div className="w-40 h-2 bg-slate-600/50 rounded mb-6"></div>
        <div className="w-24 h-3 bg-slate-600 rounded mb-3"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-cyan-400 shadow-[0_0_30px_rgba(34,211,238,1)] animate-scan z-20"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 to-transparent z-10 animate-scan-overlay"></div>
        <div className="absolute bottom-8 scale-0 animate-pop-in bg-green-500 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-[0_10px_30px_rgba(34,197,94,0.5)] z-30">
            <Check size={18} fill="white" className="text-green-600" /> MATCH 98%
        </div>
    </div>
);

export default AdvancedResumeScanner;
