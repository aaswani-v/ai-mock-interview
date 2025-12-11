import React from 'react';
import { Award, Star, Shield } from 'lucide-react';

const AdvancedBadge = () => {
    return (
        <div className="relative w-64 h-64 flex items-center justify-center animate-float">
            {/* Rotating Outer Ring */}
            <div className="absolute inset-0 border-2 border-dashed border-yellow-500/30 rounded-full animate-spin-slow" style={{ animationDuration: '20s' }}></div>

            {/* Glowing Background */}
            <div className="absolute inset-4 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-full blur-xl animate-pulse-slow"></div>

            {/* Main Badge Hexagon Shape */}
            <div className="relative w-40 h-48 bg-gradient-to-b from-slate-800 to-slate-900 clip-path-hexagon flex items-center justify-center border-2 border-yellow-500/50 shadow-[0_0_30px_rgba(234,179,8,0.2)]">
                <div className="absolute inset-1 clip-path-hexagon bg-slate-900 flex flex-col items-center justify-center gap-2">
                    <Award size={48} className="text-yellow-400 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
                    <div className="text-center">
                        <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Level 99</div>
                        <div className="text-xl font-black text-white tracking-wider">MASTER</div>
                    </div>
                    <div className="flex gap-1 mt-2">
                        <Star size={10} className="text-yellow-500 fill-yellow-500" />
                        <Star size={10} className="text-yellow-500 fill-yellow-500" />
                        <Star size={10} className="text-yellow-500 fill-yellow-500" />
                    </div>
                </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 bg-slate-800 p-2 rounded-lg border border-slate-700 shadow-xl animate-bounce" style={{ animationDelay: '0.5s' }}>
                <Shield size={20} className="text-cyan-400" />
            </div>
            <div className="absolute -bottom-2 -left-2 bg-slate-800 p-2 rounded-full border border-slate-700 shadow-xl animate-bounce" style={{ animationDelay: '1s' }}>
                <span className="text-xs font-bold text-green-400">Top 1%</span>
            </div>
        </div>
    );
};

export default AdvancedBadge;
