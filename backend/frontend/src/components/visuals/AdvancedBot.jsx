import React from 'react';
import { Cpu } from 'lucide-react';

const AdvancedBot = () => (
    <div className="relative group cursor-pointer w-64 h-64 flex items-center justify-center">
        <div className="absolute inset-0 bg-cyan-500/20 blur-[50px] rounded-full animate-pulse-slow"></div>
        <div className="absolute inset-0 border border-cyan-500/30 rounded-full animate-spin-slow" style={{ animationDuration: '10s' }}>
            <div className="absolute top-0 left-1/2 w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_10px_#22d3ee]"></div>
        </div>
        <div className="relative w-32 h-32 bg-slate-900/80 backdrop-blur-md border border-cyan-400/60 rounded-3xl flex flex-col items-center justify-center shadow-[0_0_40px_rgba(34,211,238,0.4)] z-10 transform group-hover:scale-105 transition-transform duration-300">
            <div className="absolute -top-6 w-12 h-1 bg-cyan-500/50 rounded-full"></div>
            <Cpu size={56} className="text-cyan-300 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
            <div className="flex gap-4 mt-3">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-blink shadow-[0_0_8px_white]"></div>
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-blink shadow-[0_0_8px_white]"></div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/10 to-transparent animate-scan rounded-3xl pointer-events-none"></div>
        </div>
        <div className="absolute -bottom-10 bg-slate-900/90 border border-cyan-500/50 px-4 py-1.5 rounded-full text-cyan-300 text-xs font-bold tracking-widest shadow-lg">
            AI INTERVIEWER
        </div>
    </div>
);

export default AdvancedBot;
