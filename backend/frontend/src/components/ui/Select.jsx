import React from 'react';
import { ChevronRight } from 'lucide-react';

const Select = ({ options, icon: Icon, placeholder, value, onChange }) => (
    <div className="relative w-full group">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors pointer-events-none z-10">
            {Icon && <Icon size={18} />}
        </div>
        <select
            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-slate-300 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 appearance-none transition-all cursor-pointer relative z-0"
            value={value}
            onChange={onChange}
        >
            <option value="" disabled>{placeholder}</option>
            {options.map((opt, idx) => <option key={idx} value={opt}>{opt}</option>)}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none z-10">
            <ChevronRight size={16} className="rotate-90" />
        </div>
    </div>
);

export default Select;
