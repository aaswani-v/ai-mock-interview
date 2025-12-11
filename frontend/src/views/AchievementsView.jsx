import React from 'react';
import { Award, Lock, Star } from 'lucide-react';
import Badge from '../components/ui/Badge';

const AchievementsView = () => {
    // Mock Badges for now inside component or move to mockData
    const badges = [
        { id: 1, name: "Early Adopter", desc: "Joined during beta", icon: Star, rarity: "Rare", locked: false },
        { id: 2, name: "Streak Master", desc: "7 day streak", icon: Award, rarity: "Epic", locked: false },
        { id: 3, name: "System Guru", desc: "Ace a system design", icon: Lock, rarity: "Legendary", locked: true },
    ];

    return (
        <div className="h-full p-6 max-w-7xl mx-auto overflow-y-auto custom-scrollbar animate-fade-in-up">
            <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-white mb-4">Achievements</h2>
                <p className="text-slate-400">Unlock badges by mastering skills.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {badges.map(badge => (
                    <div key={badge.id} className={`relative group p-6 rounded-3xl border transition-all duration-300 flex flex-col items-center text-center ${badge.locked ? 'bg-slate-900/30 border-slate-800 opacity-60 grayscale' : 'bg-slate-900 border-slate-700 hover:border-yellow-500/50 hover:shadow-2xl hover:shadow-yellow-500/10'}`}>
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${badge.locked ? 'bg-slate-800 text-slate-600' : 'bg-gradient-to-br from-slate-800 to-slate-900 border border-yellow-500/30 text-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.2)]'}`}>
                            {badge.locked ? <Lock size={32} /> : <badge.icon size={36} />}
                        </div>
                        <h3 className="font-bold text-white mb-1">{badge.name}</h3>
                        <p className="text-xs text-slate-400 mb-3">{badge.desc}</p>
                        <Badge variant={badge.rarity === 'Epic' ? 'purple' : badge.rarity === 'Rare' ? 'warning' : 'neutral'}>{badge.rarity}</Badge>
                    </div>
                ))}
            </div>
        </div>
    )
};

export default AchievementsView;
