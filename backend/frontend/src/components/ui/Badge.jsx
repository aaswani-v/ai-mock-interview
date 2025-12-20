import React from 'react';

const Badge = ({ children, variant = 'neutral' }) => {
    const variants = {
        neutral: 'bg-slate-800 text-slate-300 border-slate-700',
        success: 'bg-green-500/10 text-green-400 border-green-500/20',
        warning: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
        danger: 'bg-red-500/10 text-red-400 border-red-500/20',
        info: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
        purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
    };
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${variants[variant]} flex items-center gap-1 w-fit`}>
            {children}
        </span>
    );
};

export default Badge;
