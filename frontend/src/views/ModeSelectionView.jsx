import React from 'react';
import { Video, Mic, MessageCircle, ArrowRight } from 'lucide-react';

const ModeSelectionView = ({ onSelectMode }) => {
    const modes = [
        { id: 'video', title: 'Video Interview', icon: Video, desc: 'Full simulation with camera and mic analysis.', color: 'cyan' },
        { id: 'audio', title: 'Voice Only', icon: Mic, desc: 'Focus on your vocal tone and clarity.', color: 'purple' },
        { id: 'chat', title: 'Text Chat', icon: MessageCircle, desc: 'Practice your written communication logic.', color: 'green' }
    ];

    return (
        <div className="h-full p-6 max-w-6xl mx-auto flex flex-col justify-center animate-fade-in-up">
            <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-white mb-4">Choose Interview Mode</h2>
                <p className="text-slate-400">Select how you want to practice today.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {modes.map((mode) => (
                    <div
                        key={mode.id}
                        onClick={() => onSelectMode(mode.id)}
                        className={`group relative bg-slate-900 border border-slate-700 rounded-3xl p-8 cursor-pointer transition-all hover:-translate-y-2 hover:shadow-2xl hover:border-${mode.color}-500/50`}
                    >
                        <div className={`w-20 h-20 rounded-2xl bg-${mode.color}-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                            <mode.icon size={40} className={`text-${mode.color}-400`} />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">{mode.title}</h3>
                        <p className="text-slate-400 leading-relaxed mb-8">{mode.desc}</p>
                        <div className={`absolute bottom-8 right-8 w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-${mode.color}-500 transition-colors`}>
                            <ArrowRight size={20} className="text-white" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ModeSelectionView;
