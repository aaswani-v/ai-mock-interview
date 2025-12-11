import React from 'react';

const Button = ({ children, onClick, variant = 'primary', className = '', icon: Icon, type = 'button', disabled = false, style = {} }) => {
    const baseStyle = "px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
    const variants = {
        primary: "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:brightness-110",
        secondary: "bg-slate-800 text-cyan-400 border border-cyan-500/30 hover:bg-slate-700 hover:border-cyan-500/60",
        danger: "bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20",
        glass: "backdrop-blur-md bg-white/5 border border-white/10 text-white hover:bg-white/10",
        ghost: "text-slate-400 hover:text-white hover:bg-white/5",
        success: "bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30",
        glow: "bg-white text-blue-900 shadow-[0_0_20px_rgba(255,255,255,0.4)] hover:shadow-[0_0_35px_rgba(255,255,255,0.6)] hover:scale-105"
    };

    return (
        <button type={type} onClick={onClick} disabled={disabled} style={style} className={`${baseStyle} ${variants[variant]} ${className}`}>
            {Icon && <Icon size={20} />}
            {children}
        </button>
    );
};

export default Button;
