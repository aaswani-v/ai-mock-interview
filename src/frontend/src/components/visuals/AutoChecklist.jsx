import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';

const AutoChecklist = ({ items = ["System Design Practice", "Mock Interview with AI", "Review Resume Feedback"] }) => {
    const [checkedIndices, setCheckedIndices] = useState([]);

    useEffect(() => {
        let timeouts = [];
        items.forEach((_, idx) => {
            const timeout = setTimeout(() => {
                setCheckedIndices(prev => [...prev, idx]);
            }, 500 + (idx * 800));
            timeouts.push(timeout);
        });
        return () => timeouts.forEach(clearTimeout);
    }, []); // Run on mount

    return (
        <div className="space-y-3">
            {items.map((item, idx) => (
                <div key={idx} className={`flex items-center gap-3 transition-all duration-500 ${checkedIndices.includes(idx) ? 'opacity-100 translate-x-0' : 'opacity-50 translate-x-2'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border transition-colors duration-500 ${checkedIndices.includes(idx) ? 'bg-green-500 border-green-500 text-white shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'border-slate-600 bg-slate-800'}`}>
                        {checkedIndices.includes(idx) && <Check size={14} />}
                    </div>
                    <span className={`text-sm ${checkedIndices.includes(idx) ? 'text-slate-200' : 'text-slate-500'}`}>{item}</span>
                </div>
            ))}
        </div>
    );
};

export default AutoChecklist;
