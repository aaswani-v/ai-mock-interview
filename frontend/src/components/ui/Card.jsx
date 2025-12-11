import React from 'react';

const Card = ({ children, className = '', glow = false, onClick, style = {} }) => (
    <div
        onClick={onClick}
        style={style}
        className={`backdrop-blur-xl bg-slate-900/60 border border-slate-700/50 rounded-2xl p-6 transition-all duration-300 ${glow ? 'shadow-[0_0_30px_rgba(6,182,212,0.15)] border-cyan-500/30' : ''} ${onClick ? 'cursor-pointer hover:translate-y-[-2px] hover:shadow-lg' : ''} ${className}`}
    >
        {children}
    </div>
);

export default Card;
