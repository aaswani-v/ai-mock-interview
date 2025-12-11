import React from 'react';
import { Brain, Eye, Mic, FileText, Target, ArrowRight, Home, CheckCircle } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const InterviewResultsView = ({ data, onHome }) => {
    // Parsing Data with Fallbacks
    const transcript = data?.transcript || "No speech detected.";
    const overallScore = data?.overallScore || 0;

    // Scores
    const visualScore = data?.visual ? Math.round((data.visual.eyeContact + data.visual.posture) / 2) : 0;
    const contentData = data?.content || data?.evaluation || {};
    const contentScore = contentData.score ? Math.round(contentData.score * 10) : 0;
    const speechScore = data?.speechScore || 0;

    // Metrics
    const wpm = data?.speech?.wordsPerMinute || data?.wordsPerMinute || 0;
    const fillerCount = data?.speech?.fillerCount || data?.fillerWords || 0;
    const eyeContact = data?.visual?.eyeContact || 0;
    const posture = data?.visual?.posture || 0;
    
    // Enhanced feedback from LLM
    const contentFeedback = contentData.feedback || contentData.reasoning || "Keep practicing to improve your interview skills!";
    const confidenceAssessment = contentData.confidence_assessment || "";
    const communicationQuality = contentData.communication_quality || "";

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-green-400';
        if (score >= 60) return 'text-yellow-400';
        return 'text-orange-400';
    };

    const getScoreLabel = (score) => {
        if (score >= 80) return 'Excellent';
        if (score >= 60) return 'Good';
        if (score >= 40) return 'Needs Improvement';
        return 'Keep Practicing';
    };

    return (
        <div className="h-full overflow-y-auto custom-scrollbar p-6 animate-fade-in-up">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-2">Interview Analysis</h2>
                        <p className="text-slate-400">Your performance breakdown and feedback</p>
                    </div>
                    <Button onClick={onHome} icon={Home} variant="secondary">Back to Dashboard</Button>
                </div>

                {/* Overall Score Card */}
                <div className="mb-8 p-8 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 rounded-3xl border border-cyan-500/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg text-slate-400 font-medium mb-2">Overall Performance</h3>
                            <div className="flex items-baseline gap-3">
                                <span className={`text-7xl font-black ${getScoreColor(overallScore)}`}>{overallScore}</span>
                                <span className="text-3xl text-slate-500">/100</span>
                            </div>
                            <p className={`text-lg font-semibold mt-2 ${getScoreColor(overallScore)}`}>{getScoreLabel(overallScore)}</p>
                        </div>
                        <div className="relative w-40 h-40">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="80" cy="80" r="70" stroke="#1e293b" strokeWidth="12" fill="transparent" />
                                <circle 
                                    cx="80" cy="80" r="70" 
                                    stroke="url(#scoreGradient)" 
                                    strokeWidth="12" 
                                    fill="transparent" 
                                    strokeDasharray={440}
                                    strokeDashoffset={440 - (440 * overallScore / 100)}
                                    strokeLinecap="round"
                                    className="transition-all duration-1000"
                                />
                                <defs>
                                    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#22d3ee" />
                                        <stop offset="100%" stopColor="#3b82f6" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Score Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Visual Score */}
                    <Card className="text-center">
                        <div className="p-4 bg-cyan-500/10 rounded-xl w-fit mx-auto mb-4">
                            <Eye size={28} className="text-cyan-400" />
                        </div>
                        <h3 className="text-slate-400 text-sm uppercase tracking-wider mb-2">Visual Analysis</h3>
                        <span className={`text-4xl font-bold ${getScoreColor(visualScore)}`}>{visualScore}%</span>
                        <div className="mt-4 space-y-3">
                            <div>
                                <div className="flex justify-between text-sm text-slate-400 mb-1">
                                    <span>Eye Contact</span>
                                    <span>{eyeContact}%</span>
                                </div>
                                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-cyan-500" style={{ width: `${eyeContact}%` }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm text-slate-400 mb-1">
                                    <span>Posture</span>
                                    <span>{posture}%</span>
                                </div>
                                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-cyan-500" style={{ width: `${posture}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Content Score */}
                    <Card className="text-center">
                        <div className="p-4 bg-purple-500/10 rounded-xl w-fit mx-auto mb-4">
                            <FileText size={28} className="text-purple-400" />
                        </div>
                        <h3 className="text-slate-400 text-sm uppercase tracking-wider mb-2">Content Quality</h3>
                        <span className={`text-4xl font-bold ${getScoreColor(contentScore)}`}>{contentScore}%</span>
                        <p className="text-sm text-slate-500 mt-4">Based on relevance, accuracy, and structure of your answer</p>
                    </Card>

                    {/* Speech Score */}
                    <Card className="text-center">
                        <div className="p-4 bg-green-500/10 rounded-xl w-fit mx-auto mb-4">
                            <Mic size={28} className="text-green-400" />
                        </div>
                        <h3 className="text-slate-400 text-sm uppercase tracking-wider mb-2">Speech Analysis</h3>
                        <span className={`text-4xl font-bold ${getScoreColor(speechScore)}`}>{Math.round(speechScore)}%</span>
                        <div className="mt-4 flex justify-around">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-white">{wpm}</div>
                                <div className="text-xs text-slate-500 uppercase">WPM</div>
                            </div>
                            <div className="w-[1px] bg-slate-700"></div>
                            <div className="text-center">
                                <div className={`text-2xl font-bold ${fillerCount > 5 ? 'text-red-400' : 'text-green-400'}`}>{fillerCount}</div>
                                <div className="text-xs text-slate-500 uppercase">Fillers</div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* AI Feedback */}
                <Card className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <Brain size={24} className="text-cyan-400" />
                        <h3 className="text-xl font-bold text-white">AI Evaluation</h3>
                    </div>
                    <p className="text-slate-300 text-base leading-relaxed mb-4 italic">"{contentFeedback}"</p>
                    
                    {confidenceAssessment && (
                        <div className="p-4 bg-slate-800/50 rounded-xl mb-3">
                            <p className="text-sm text-slate-400">
                                <strong className="text-cyan-400">Confidence Assessment:</strong> {confidenceAssessment}
                            </p>
                        </div>
                    )}
                    
                    {communicationQuality && (
                        <div className="p-4 bg-slate-800/50 rounded-xl">
                            <p className="text-sm text-slate-400">
                                <strong className="text-purple-400">Communication Quality:</strong> {communicationQuality}
                            </p>
                        </div>
                    )}
                </Card>

                {/* Transcript */}
                <Card className="mb-8">
                    <h3 className="text-lg font-bold text-white mb-4">Your Response</h3>
                    <p className="text-slate-300 leading-relaxed bg-slate-800/50 p-4 rounded-xl">
                        {transcript}
                    </p>
                </Card>

                {/* Suggestions */}
                {contentData.suggestions && contentData.suggestions.length > 0 && (
                    <Card className="mb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <Target size={24} className="text-green-400" />
                            <h3 className="text-xl font-bold text-white">Improvement Suggestions</h3>
                        </div>
                        <ul className="space-y-3">
                            {contentData.suggestions.map((suggestion, idx) => (
                                <li key={idx} className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-xl">
                                    <CheckCircle size={18} className="text-green-400 mt-0.5 flex-shrink-0" />
                                    <span className="text-slate-300 text-sm">
                                        {typeof suggestion === 'object' ? suggestion.improvement : suggestion}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </Card>
                )}

                {/* Action Button */}
                <div className="text-center">
                    <Button onClick={onHome} variant="primary" icon={ArrowRight} className="px-12">
                        Continue Practicing
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default InterviewResultsView;
