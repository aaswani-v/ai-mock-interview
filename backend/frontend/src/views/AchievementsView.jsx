import React, { useState, useEffect } from 'react';
import { Award, Lock, Star, Flame, Trophy, Target, Zap, Crown, Medal, BookOpen, Mic, CheckCircle } from 'lucide-react';
import Badge from '../components/ui/Badge';

const AchievementsView = () => {
    const [unlockedBadges, setUnlockedBadges] = useState([]);
    const [stats, setStats] = useState({
        totalInterviews: 0,
        streak: 0,
        avgScore: 0,
        resumeAnalyzed: false
    });

    // All possible achievements
    const allAchievements = [
        { 
            id: 'early_adopter', 
            name: "Early Adopter", 
            desc: "Joined during beta", 
            icon: Star, 
            rarity: "Rare",
            color: "from-yellow-500 to-amber-600",
            condition: () => true // Always unlocked for now
        },
        { 
            id: 'first_interview', 
            name: "First Steps", 
            desc: "Complete your first interview", 
            icon: Mic, 
            rarity: "Common",
            color: "from-green-500 to-emerald-600",
            condition: (s) => s.totalInterviews >= 1
        },
        { 
            id: 'streak_3', 
            name: "Streak Starter", 
            desc: "Achieve a 3-day streak", 
            icon: Flame, 
            rarity: "Common",
            color: "from-orange-500 to-red-600",
            condition: (s) => s.streak >= 3
        },
        { 
            id: 'streak_7', 
            name: "Streak Master", 
            desc: "Achieve a 7-day streak", 
            icon: Flame, 
            rarity: "Epic",
            color: "from-purple-500 to-pink-600",
            condition: (s) => s.streak >= 7
        },
        { 
            id: 'five_interviews', 
            name: "Getting Serious", 
            desc: "Complete 5 interviews", 
            icon: Target, 
            rarity: "Rare",
            color: "from-cyan-500 to-blue-600",
            condition: (s) => s.totalInterviews >= 5
        },
        { 
            id: 'ten_interviews', 
            name: "Interview Pro", 
            desc: "Complete 10 interviews", 
            icon: Trophy, 
            rarity: "Epic",
            color: "from-purple-500 to-violet-600",
            condition: (s) => s.totalInterviews >= 10
        },
        { 
            id: 'high_score', 
            name: "Overachiever", 
            desc: "Score 90% or higher", 
            icon: Crown, 
            rarity: "Legendary",
            color: "from-amber-400 to-yellow-600",
            condition: (s) => s.avgScore >= 90
        },
        { 
            id: 'resume_analyzed', 
            name: "Resume Ready", 
            desc: "Analyze your resume with AI", 
            icon: BookOpen, 
            rarity: "Common",
            color: "from-teal-500 to-cyan-600",
            condition: (s) => s.resumeAnalyzed
        },
        { 
            id: 'perfectionist', 
            name: "Perfectionist", 
            desc: "Complete 5 interviews with 80%+", 
            icon: Medal, 
            rarity: "Legendary",
            color: "from-rose-400 to-pink-600",
            condition: (s) => s.highScoreCount >= 5
        },
    ];

    useEffect(() => {
        // Load stats from localStorage - using correct key names with underscores
        const history = JSON.parse(localStorage.getItem('interview_history') || '[]');
        const streak = parseInt(localStorage.getItem('practice_streak') || '0');
        const resumeData = localStorage.getItem('resume_data');
        
        const totalInterviews = history.length;
        const avgScore = history.length > 0 
            ? Math.round(history.reduce((sum, h) => sum + (h.overallScore || h.overall_score || 0), 0) / history.length)
            : 0;
        const highScoreCount = history.filter(h => (h.overallScore || h.overall_score || 0) >= 80).length;


        const newStats = {
            totalInterviews,
            streak,
            avgScore,
            resumeAnalyzed: !!resumeData,
            highScoreCount
        };
        setStats(newStats);

        // Calculate unlocked badges
        const unlocked = allAchievements
            .filter(a => a.condition(newStats))
            .map(a => a.id);
        setUnlockedBadges(unlocked);
    }, []);

    const getRarityColor = (rarity) => {
        switch(rarity) {
            case 'Common': return 'blue';
            case 'Rare': return 'warning';
            case 'Epic': return 'purple';
            case 'Legendary': return 'gradient';
            default: return 'neutral';
        }
    };

    const unlockedCount = unlockedBadges.length;
    const totalCount = allAchievements.length;
    const progress = Math.round((unlockedCount / totalCount) * 100);

    return (
        <div className="min-h-full overflow-y-auto p-4 sm:p-6 max-w-7xl mx-auto animate-fade-in-up">
            {/* Header */}
            <div className="text-center mb-8 sm:mb-12">
                <h2 className="text-2xl sm:text-4xl font-bold text-white mb-2 sm:mb-4">Achievements</h2>
                <p className="text-slate-400 text-sm sm:text-base">Unlock badges by mastering skills and completing challenges.</p>
                
                {/* Progress Bar */}
                <div className="mt-6 max-w-md mx-auto">
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-400">Progress</span>
                        <span className="text-cyan-400 font-bold">{unlockedCount}/{totalCount} ({progress}%)</span>
                    </div>
                    <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Achievements Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                {allAchievements.map(achievement => {
                    const isUnlocked = unlockedBadges.includes(achievement.id);
                    const Icon = achievement.icon;
                    
                    return (
                        <div 
                            key={achievement.id} 
                            className={`relative group p-4 sm:p-6 rounded-2xl sm:rounded-3xl border transition-all duration-300 flex flex-col items-center text-center ${
                                isUnlocked 
                                    ? 'bg-slate-900 border-slate-700 hover:border-yellow-500/50 hover:shadow-2xl hover:shadow-yellow-500/10' 
                                    : 'bg-slate-900/30 border-slate-800 opacity-60 grayscale'
                            }`}
                        >
                            {/* Badge Icon */}
                            <div className={`w-14 h-14 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mb-3 sm:mb-4 transition-transform group-hover:scale-110 ${
                                isUnlocked 
                                    ? `bg-gradient-to-br ${achievement.color} shadow-lg`
                                    : 'bg-slate-800 text-slate-600'
                            }`}>
                                {isUnlocked ? (
                                    <Icon size={24} className="text-white sm:w-9 sm:h-9" />
                                ) : (
                                    <Lock size={20} className="sm:w-8 sm:h-8" />
                                )}
                            </div>
                            
                            {/* Badge Info */}
                            <h3 className="font-bold text-white text-sm sm:text-base mb-1">{achievement.name}</h3>
                            <p className="text-xs text-slate-400 mb-2 sm:mb-3 line-clamp-2">{achievement.desc}</p>
                            
                            {/* Rarity Badge */}
                            <Badge variant={getRarityColor(achievement.rarity)}>
                                {achievement.rarity}
                            </Badge>

                            {/* Unlocked Checkmark */}
                            {isUnlocked && (
                                <div className="absolute top-2 right-2 sm:top-3 sm:right-3 w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center">
                                    <CheckCircle size={12} className="text-white sm:w-4 sm:h-4" />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Stats Summary */}
            <div className="mt-8 sm:mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-cyan-400">{stats.totalInterviews}</div>
                    <div className="text-xs sm:text-sm text-slate-500">Interviews</div>
                </div>
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-orange-400">{stats.streak}</div>
                    <div className="text-xs sm:text-sm text-slate-500">Day Streak</div>
                </div>
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-purple-400">{stats.avgScore}%</div>
                    <div className="text-xs sm:text-sm text-slate-500">Avg Score</div>
                </div>
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-yellow-400">{unlockedCount}</div>
                    <div className="text-xs sm:text-sm text-slate-500">Badges</div>
                </div>
            </div>
        </div>
    );
};

export default AchievementsView;
