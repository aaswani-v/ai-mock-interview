import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import useInView from '../../hooks/useInView';

const AutoChecklist = ({ items = ["System Design Practice", "Mock Interview with AI", "Review Resume Feedback", "Practice Behavioral Q's"] }) => {
    const [ref, isInView] = useInView({ threshold: 0.3 });
    const [checkedIndices, setCheckedIndices] = useState([]);
    const [cycleKey, setCycleKey] = useState(0);

    useEffect(() => {
        if (!isInView) {
            setCheckedIndices([]);
            return;
        }

        let timeouts = [];

        // Check items one by one
        items.forEach((_, idx) => {
            const timeout = setTimeout(() => {
                setCheckedIndices(prev => [...prev, idx]);
            }, 600 + (idx * 900));
            timeouts.push(timeout);
        });

        // Reset and repeat after all items are checked
        const resetTimeout = setTimeout(() => {
            setCheckedIndices([]);
            setCycleKey(prev => prev + 1);
        }, 600 + (items.length * 900) + 2000);
        timeouts.push(resetTimeout);

        return () => timeouts.forEach(clearTimeout);
    }, [isInView, cycleKey, items.length]);

    return (
        <div
            ref={ref}
            className={`relative bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 shadow-2xl transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
        >
            {/* Header */}
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-700">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                    <Check size={16} className="text-white" />
                </div>
                <span className="text-sm font-bold text-slate-300 uppercase tracking-wider">Daily Goals</span>
            </div>

            {/* Checklist items */}
            <div className="space-y-4">
                {items.map((item, idx) => {
                    const isChecked = checkedIndices.includes(idx);
                    return (
                        <div
                            key={idx}
                            className={`flex items-center gap-4 transition-all duration-500 ${isChecked ? 'opacity-100' : 'opacity-60'
                                }`}
                            style={{ transitionDelay: `${idx * 100}ms` }}
                        >
                            {/* Checkbox */}
                            <div className={`relative w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all duration-300 ${isChecked
                                    ? 'bg-gradient-to-br from-green-500 to-emerald-500 border-green-400 shadow-[0_0_15px_rgba(34,197,94,0.5)]'
                                    : 'border-slate-600 bg-slate-800 hover:border-slate-500'
                                }`}>
                                {isChecked && (
                                    <Check
                                        size={14}
                                        className="text-white animate-check-bounce"
                                        strokeWidth={3}
                                    />
                                )}
                                {/* Ripple effect on check */}
                                {isChecked && (
                                    <div className="absolute inset-0 rounded-lg bg-green-400 animate-ping opacity-30"></div>
                                )}
                            </div>

                            {/* Text */}
                            <span className={`text-sm font-medium transition-all duration-300 ${isChecked
                                    ? 'text-slate-200 line-through decoration-green-400/50'
                                    : 'text-slate-400'
                                }`}>
                                {item}
                            </span>

                            {/* Completion indicator */}
                            {isChecked && (
                                <div className="ml-auto">
                                    <span className="text-xs text-green-400 font-bold">✓ Done</span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Progress bar */}
            <div className="mt-5 pt-4 border-t border-slate-700">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span>Progress</span>
                    <span className="text-green-400 font-bold">{checkedIndices.length}/{items.length}</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                        style={{ width: `${(checkedIndices.length / items.length) * 100}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
};

export default AutoChecklist;
