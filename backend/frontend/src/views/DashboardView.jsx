import React, { useState, useEffect } from 'react';
import { Flame, Upload, Award, Zap, ArrowRight, BarChart, Clock, Video, TrendingUp, Target, CheckCircle, RefreshCw, FileText, ChevronRight } from 'lucide-react';
import Button from '../components/ui/Button';
import { API_URL } from '../config';

const DashboardView = ({ onNavigate, user }) => {
    // Get user data from localStorage for complete profile
    const savedUser = localStorage.getItem('user');
    const userData = savedUser ? JSON.parse(savedUser) : {};
    const userId = userData?.uid;
    
    // Get interview history from localStorage
    const [history, setHistory] = useState([]);
    const [streak, setStreak] = useState(0);
    const [loading, setLoading] = useState(true);
    const [resumeScore, setResumeScore] = useState(null);
    const [stats, setStats] = useState({
        totalInterviews: 0,
        avgScore: 0,
        readinessScore: 0,
        technicalScore: 0,
        communicationScore: 0,
        problemSolvingScore: 0,
        improvement: 0
    });
    
    useEffect(() => {
        const fetchData = async () => {
            // First try to fetch from backend
            if (userId) {
                try {
                    const response = await fetch(`${API_URL}/interviews/${userId}`);
                    const data = await response.json();
                    
                    if (data.success && data.interviews) {
                        const interviews = data.interviews;
                        setHistory(interviews);
                        localStorage.setItem('interview_history', JSON.stringify(interviews));
                        
                        // Calculate stats from backend data
                        if (interviews.length > 0) {
                            const totalInterviews = interviews.length;
                            const avgScore = Math.round(
                                interviews.reduce((sum, h) => sum + (h.overall_score || h.overallScore || 0), 0) / totalInterviews
                            );
                            const avgVisual = Math.round(
                                interviews.reduce((sum, h) => sum + (h.visual_score || h.visualScore || 0), 0) / totalInterviews
                            );
                            const avgContent = Math.round(
                                interviews.reduce((sum, h) => sum + (h.content_score || h.contentScore || 0), 0) / totalInterviews
                            );
                            const avgSpeech = Math.round(
                                interviews.reduce((sum, h) => sum + (h.speech_score || h.speechScore || 0), 0) / totalInterviews
                            );
                            
                            // Calculate improvement
                            let improvement = 0;
                            if (interviews.length >= 2) {
                                const latest = interviews[0].overall_score || interviews[0].overallScore || 0;
                                const previous = interviews[1].overall_score || interviews[1].overallScore || 0;
                                improvement = latest - previous;
                            }
                            
                            setStats({
                                totalInterviews,
                                avgScore,
                                readinessScore: avgScore,
                                technicalScore: avgContent,
                                communicationScore: avgSpeech,
                                problemSolvingScore: avgVisual,
                                improvement
                            });
                        }
                    }
                } catch (error) {
                    console.error('Error fetching from backend:', error);
                    // Fall through to localStorage
                }
            }
            
            // Load from localStorage as fallback (always try this)
            try {
                const savedHistory = JSON.parse(localStorage.getItem('interview_history') || '[]');
                console.log('Loaded from localStorage:', savedHistory.length, 'interviews');
                
                // Only use localStorage if we didn't get data from backend
                if (savedHistory.length > 0) {
                    setHistory(prev => prev.length > 0 ? prev : savedHistory);
                    
                    // Always recalculate stats from whatever data we have
                    const historyToUse = savedHistory;
                    const totalInterviews = historyToUse.length;
                    const avgScore = Math.round(
                        historyToUse.reduce((sum, h) => sum + (h.overallScore || h.overall_score || 0), 0) / totalInterviews
                    );
                    const avgVisual = Math.round(
                        historyToUse.reduce((sum, h) => sum + (h.visualScore || h.visual_score || 0), 0) / totalInterviews
                    );
                    const avgContent = Math.round(
                        historyToUse.reduce((sum, h) => sum + (h.contentScore || h.content_score || 0), 0) / totalInterviews
                    );
                    const avgSpeech = Math.round(
                        historyToUse.reduce((sum, h) => sum + (h.speechScore || h.speech_score || 0), 0) / totalInterviews
                    );
                    
                    console.log('Calculated stats:', { totalInterviews, avgScore, avgVisual, avgContent, avgSpeech });
                    
                    setStats({
                        totalInterviews,
                        avgScore,
                        readinessScore: avgScore,
                        technicalScore: avgContent,
                        communicationScore: avgSpeech,
                        problemSolvingScore: avgVisual,
                        improvement: 0
                    });
                }
                
                // Load streak
                const savedStreak = parseInt(localStorage.getItem('practice_streak') || '0');
                setStreak(savedStreak);
                
                // Load resume score
                const savedResume = localStorage.getItem('resume_data');
                if (savedResume) {
                    try {
                        const resumeData = JSON.parse(savedResume);
                        setResumeScore(resumeData.atsScore || null);
                    } catch (e) {
                        console.error('Error parsing resume data:', e);
                    }
                }
            } catch (e) {
                console.error('Error loading interview history:', e);
            }
            
            setLoading(false);
        };

        fetchData();
    }, [userId]);
    
    const safeName =
        user?.name ||
        userData?.name ||
        user?.displayName ||
        (user?.email ? user.email.split("@")[0] : "User");
    
    const userRole = user?.role || userData?.role || 'Professional';
    
    // Format date for history display
    const formatDate = (dateStr) => {
        if (!dateStr) return 'Recently';
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return 'Recently';
        
        const now = new Date();
        const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString();
    };
    
    // Get score color
    const getScoreColor = (score) => {
        if (score >= 70) return 'text-green-400';
        if (score >= 50) return 'text-yellow-400';
        return 'text-red-400';
    };
    
    // Calculate stroke dashoffset for progress circle (691 = full circle)
    const progressOffset = 691 - (691 * stats.readinessScore / 100);
    
    return (
        <div className="h-full p-6 max-w-7xl mx-auto overflow-y-auto custom-scrollbar animate-fade-in-up">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 md:mb-8 gap-4">
                <div>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                        Hello, {safeName}
                    </h2>
                    <p className="text-slate-400 mt-1 flex items-center gap-2 text-sm md:text-base">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        {stats.totalInterviews > 0 
                            ? `${stats.totalInterviews} interviews completed`
                            : 'Ready to crush your next interview?'}
                    </p>
                </div>
                <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                    <div className="px-3 sm:px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700 flex items-center gap-2 text-sm text-slate-300 shadow-sm">
                        <Flame size={18} className={`${streak > 0 ? 'text-orange-500 fill-orange-500 animate-pulse-slow' : 'text-slate-500'}`} />
                        <span className="font-bold text-white">{streak}<span className="hidden sm:inline"> Day Streak</span></span>
                    </div>
                    <Button variant="secondary" icon={Upload} onClick={() => onNavigate('resume-upload')} className="flex-1 sm:flex-none">
                        <span className="hidden sm:inline">New Resume</span>
                        <span className="sm:hidden">Resume</span>
                    </Button>
                </div>
            </div>

            {/* Quote of the Day */}
            <div className="mb-8 md:mb-10 relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700 p-4 sm:p-6 flex items-center justify-between shadow-lg">
                <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500"></div>
                <div className="relative z-10">
                    <p className="text-base sm:text-lg md:text-xl font-light text-slate-200 leading-relaxed">"Success is not final, failure is not fatal: it is the courage to continue that counts."</p>
                    <p className="text-sm text-cyan-400 mt-2 font-semibold">— Winston Churchill</p>
                </div>
                <Award className="text-slate-700 opacity-20 absolute right-4 -bottom-4 w-32 h-32 transform rotate-12" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-10">
                {/* Readiness Card */}
                <div className="col-span-1 md:col-span-2 lg:col-span-2 row-span-2 relative group overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-[#0a0a1a] border border-slate-800 p-8 flex flex-col items-center justify-center">
                    <div className="absolute top-0 right-0 p-32 bg-cyan-500/5 rounded-full blur-[80px]"></div>
                    <h3 className="text-lg font-bold text-slate-400 uppercase tracking-widest mb-6 z-10">Interview Readiness</h3>
                    <div className="relative w-64 h-64 flex items-center justify-center z-10">
                        <div className={`absolute inset-0 rounded-full ${stats.readinessScore > 0 ? 'bg-cyan-500/10' : 'bg-slate-500/10'} blur-xl animate-pulse-slow`}></div>
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="128" cy="128" r="110" stroke="#1e293b" strokeWidth="12" fill="transparent" />
                            <circle 
                                cx="128" 
                                cy="128" 
                                r="110" 
                                stroke="url(#gradient)" 
                                strokeWidth="12" 
                                fill="transparent" 
                                strokeDasharray="691" 
                                strokeDashoffset={progressOffset} 
                                strokeLinecap="round" 
                                className="transition-all duration-1000 ease-out" 
                            />
                            <defs><linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#22d3ee" /><stop offset="100%" stopColor="#3b82f6" /></linearGradient></defs>
                        </svg>
                        <div className="absolute flex flex-col items-center">
                            <span className="text-7xl font-black text-white tracking-tighter">
                                {stats.readinessScore}<span className="text-3xl text-slate-500">%</span>
                            </span>
                            <span className={`text-slate-400 font-bold text-sm bg-slate-500/10 px-2 py-1 rounded-full border border-slate-500/20 mt-2`}>
                                {stats.readinessScore >= 70 ? 'Interview Ready!' :
                                 stats.readinessScore >= 40 ? 'Keep Practicing' :
                                 stats.readinessScore > 0 ? 'Getting Started' : 'Start practicing'}
                            </span>
                        </div>
                    </div>
                    <p className="text-slate-400 text-sm mt-6 text-center max-w-xs z-10">
                        {stats.totalInterviews > 0 
                            ? `Based on ${stats.totalInterviews} interview${stats.totalInterviews > 1 ? 's' : ''}. Average score: ${stats.avgScore}%`
                            : 'Complete your first mock interview to see your readiness score!'}
                    </p>
                </div>

                {/* Start Interview CTA */}
                <div onClick={() => onNavigate('interview')} className="col-span-1 lg:col-span-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl p-8 relative overflow-hidden cursor-pointer group transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-cyan-500/20">
                    <div className="absolute right-0 bottom-0 opacity-20 transform translate-x-10 translate-y-10 group-hover:translate-x-5 group-hover:translate-y-5 transition-transform duration-500">
                        <Video size={180} fill="white" />
                    </div>
                    <div className="relative z-10 h-full flex flex-col justify-between">
                        <div>
                            <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold text-white mb-3">VIDEO INTERVIEW</div>
                            <h3 className="text-3xl font-bold text-white mb-2">Start Mock Interview</h3>
                            <p className="text-blue-100 max-w-sm">Practice with AI-powered video interview simulation for {userRole} role.</p>
                        </div>
                        <div className="mt-6 flex items-center gap-2 font-bold text-white group-hover:gap-4 transition-all">Begin Session <ArrowRight /></div>
                    </div>
                </div>

                {/* Skill Breakdown */}
                <div className="col-span-1 bg-slate-900/50 border border-slate-800 rounded-3xl p-6 relative overflow-hidden">
                    <div className="flex justify-between items-center mb-4"><h4 className="font-bold text-slate-300">Skill Breakdown</h4><BarChart size={18} className="text-purple-400" /></div>
                    <div className="space-y-4">
                        {[
                            { l: 'Technical', v: stats.technicalScore, c: 'bg-purple-500' }, 
                            { l: 'Communication', v: stats.communicationScore, c: 'bg-cyan-500' }, 
                            { l: 'Problem Solving', v: stats.problemSolvingScore, c: 'bg-green-500' }
                        ].map((s, i) => (
                            <div key={i}>
                                <div className="flex justify-between text-xs mb-1 text-slate-400"><span>{s.l}</span><span>{s.v}%</span></div>
                                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden"><div className={`h-full ${s.c} transition-all duration-500`} style={{ width: `${s.v}%` }}></div></div>
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-slate-500 mt-4 text-center">
                        {stats.totalInterviews > 0 ? 'Based on your interview history' : 'Complete interviews to track skills'}
                    </p>
                </div>

                {/* Resume ATS Score Widget */}
                <div 
                    onClick={() => onNavigate('resume-upload')}
                    className="col-span-1 bg-slate-900/50 border border-slate-800 rounded-3xl p-6 relative overflow-hidden cursor-pointer group hover:border-cyan-500/50 transition-all"
                >
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold text-slate-300">Resume Score</h4>
                        <FileText size={18} className="text-cyan-400" />
                    </div>
                    
                    {resumeScore !== null ? (
                        <div className="flex flex-col items-center">
                            {/* Score Circle */}
                            <div className="relative w-24 h-24 mb-3">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="48" cy="48" r="40" stroke="#1e293b" strokeWidth="6" fill="transparent" />
                                    <circle
                                        cx="48" cy="48" r="40"
                                        stroke={resumeScore >= 80 ? '#4ade80' : resumeScore >= 60 ? '#facc15' : '#f87171'}
                                        strokeWidth="6"
                                        fill="transparent"
                                        strokeDasharray="251"
                                        strokeDashoffset={251 - (251 * resumeScore) / 100}
                                        strokeLinecap="round"
                                        className="transition-all duration-1000"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className={`text-2xl font-bold ${
                                        resumeScore >= 80 ? 'text-green-400' : resumeScore >= 60 ? 'text-yellow-400' : 'text-red-400'
                                    }`}>{resumeScore}</span>
                                </div>
                            </div>
                            <p className={`text-sm font-medium ${
                                resumeScore >= 80 ? 'text-green-400' : resumeScore >= 60 ? 'text-yellow-400' : 'text-red-400'
                            }`}>
                                {resumeScore >= 80 ? 'Excellent' : resumeScore >= 60 ? 'Good' : resumeScore >= 40 ? 'Needs Work' : 'Critical'}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">ATS Compatibility</p>
                            <div className="flex items-center gap-1 mt-3 text-xs text-cyan-400 group-hover:gap-2 transition-all">
                                <span>Update Resume</span>
                                <ChevronRight size={14} />
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center py-4">
                            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-3">
                                <Upload size={24} className="text-slate-500" />
                            </div>
                            <p className="text-slate-400 text-sm text-center mb-2">No resume analyzed</p>
                            <div className="flex items-center gap-1 text-xs text-cyan-400 group-hover:gap-2 transition-all">
                                <span>Upload Resume</span>
                                <ChevronRight size={14} />
                            </div>
                        </div>
                    )}
                </div>

                {/* Recent History */}
                <div className="col-span-1 bg-slate-900/50 border border-slate-800 rounded-3xl p-6 flex flex-col">
                    <h4 className="font-bold text-slate-300 mb-4 flex items-center gap-2"><Clock size={16} /> Recent Interviews</h4>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {history.length > 0 ? (
                            <div className="space-y-3">
                                {history.slice(0, 3).map((item, idx) => {
                                    // Handle both snake_case and camelCase
                                    const score = item.overallScore || item.overall_score || 0;
                                    const date = item.date || item.session_date;
                                    const difficulty = item.difficulty || 'Interview';
                                    
                                    return (
                                        <div key={item.id || idx} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                                    score >= 70 ? 'bg-green-500/20' :
                                                    score >= 50 ? 'bg-yellow-500/20' : 'bg-red-500/20'
                                                }`}>
                                                    {score >= 70 ? (
                                                        <CheckCircle size={18} className="text-green-400" />
                                                    ) : (
                                                        <Target size={18} className={score >= 50 ? 'text-yellow-400' : 'text-red-400'} />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm text-white font-medium capitalize">{difficulty}</p>
                                                    <p className="text-xs text-slate-500">{formatDate(date)}</p>
                                                </div>
                                            </div>
                                            <span className={`text-lg font-bold ${getScoreColor(score)}`}>
                                                {score}%
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center">
                                <div className="text-center py-6">
                                    <Clock size={32} className="mx-auto text-slate-600 mb-3" />
                                    <p className="text-slate-500 text-sm">No interview history yet</p>
                                    <p className="text-slate-600 text-xs mt-1">Start your first interview!</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardView;
