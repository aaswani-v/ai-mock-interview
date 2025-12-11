import React from 'react';
import { Sparkles, Zap, Flame, ArrowLeft, Clock, Target, Brain } from 'lucide-react';
import Button from '../components/ui/Button';

const DifficultySelectionView = ({ onSelect, onBack }) => {
    const difficulties = [
        {
            id: 'beginner',
            title: 'Beginner',
            subtitle: 'Getting Started',
            description: 'Basic questions with friendly guidance. Perfect for freshers or career changers.',
            icon: Sparkles,
            color: 'from-green-500 to-emerald-600',
            borderColor: 'border-green-500/30',
            shadowColor: 'shadow-green-500/20',
            features: ['Foundational concepts', 'Detailed feedback', 'Confidence building'],
            duration: '~5 min',
            questions: '3 questions'
        },
        {
            id: 'intermediate',
            title: 'Intermediate',
            subtitle: 'Level Up',
            description: 'Standard technical questions testing practical knowledge and experience.',
            icon: Zap,
            color: 'from-blue-500 to-cyan-600',
            borderColor: 'border-cyan-500/30',
            shadowColor: 'shadow-cyan-500/20',
            features: ['Role-specific scenarios', 'Behavioral questions', 'Technical depth'],
            duration: '~8 min',
            questions: '3 questions',
            recommended: true
        },
        {
            id: 'advanced',
            title: 'Advanced',
            subtitle: 'Challenge Mode',
            description: 'Complex scenarios and deep technical discussions for senior roles.',
            icon: Flame,
            color: 'from-orange-500 to-red-600',
            borderColor: 'border-orange-500/30',
            shadowColor: 'shadow-orange-500/20',
            features: ['System design', 'Leadership scenarios', 'Edge cases'],
            duration: '~10 min',
            questions: '3 questions'
        }
    ];

    return (
        <div className="h-full flex flex-col items-center justify-center p-8 animate-fade-in-up">
            {/* Header */}
            <div className="text-center mb-10">
                <h2 className="text-4xl font-black text-white mb-3">
                    Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Challenge Level</span>
                </h2>
                <p className="text-slate-400 max-w-lg mx-auto">
                    Select the difficulty that matches your experience. Questions will be tailored to your chosen level.
                </p>
            </div>

            {/* Difficulty Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full mb-10">
                {difficulties.map((difficulty) => {
                    const Icon = difficulty.icon;
                    return (
                        <div
                            key={difficulty.id}
                            onClick={() => onSelect(difficulty.id)}
                            className={`relative group cursor-pointer rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 border ${difficulty.borderColor} p-6 transition-all duration-300 hover:scale-[1.03] hover:shadow-xl ${difficulty.shadowColor}`}
                        >
                            {/* Recommended Badge */}
                            {difficulty.recommended && (
                                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full text-xs font-bold text-white shadow-lg">
                                    RECOMMENDED
                                </div>
                            )}

                            {/* Icon */}
                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${difficulty.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                                <Icon size={32} className="text-white" />
                            </div>

                            {/* Title & Subtitle */}
                            <div className="mb-3">
                                <h3 className="text-2xl font-bold text-white">{difficulty.title}</h3>
                                <p className="text-sm text-slate-500 font-medium">{difficulty.subtitle}</p>
                            </div>

                            {/* Description */}
                            <p className="text-slate-400 text-sm mb-4 leading-relaxed">
                                {difficulty.description}
                            </p>

                            {/* Features */}
                            <ul className="space-y-2 mb-4">
                                {difficulty.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-center gap-2 text-sm text-slate-300">
                                        <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${difficulty.color}`}></div>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            {/* Meta Info */}
                            <div className="flex items-center gap-4 pt-4 border-t border-slate-700/50">
                                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                    <Clock size={14} />
                                    {difficulty.duration}
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                    <Target size={14} />
                                    {difficulty.questions}
                                </div>
                            </div>

                            {/* Hover Overlay */}
                            <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${difficulty.color} opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none`}></div>
                        </div>
                    );
                })}
            </div>

            {/* Back Button */}
            <Button variant="ghost" icon={ArrowLeft} onClick={onBack}>
                Back to Dashboard
            </Button>
        </div>
    );
};

export default DifficultySelectionView;
