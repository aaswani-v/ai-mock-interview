import React from 'react';

const Input = ({ type = "text", placeholder, icon: Icon, value, onChange, className, ...props }) => (
    <div className={`relative w-full group ${className}`}>
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors pointer-events-none z-10">
            {Icon && <Icon size={18} />}
        </div>
        <input
            {...props}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all relative z-0"
        />
    </div>
);

export default Input;
