import React from 'react';
import { Flame, Upload, Award, Zap, ArrowRight, BarChart, Clock } from 'lucide-react';
import Button from '../components/ui/Button';

const DashboardView = ({ onNavigate, user }) => {
    const safeName =
        user?.name ||
        user?.displayName ||
        (user?.email ? user.email.split("@")[0] : "User");
    return (
        <div className="h-full p-6 max-w-7xl mx-auto overflow-y-auto custom-scrollbar animate-fade-in-up">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                <div>
                    <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                        Hello, {safeName}
                    </h2>
                    <p className="text-slate-400 mt-1 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        Ready to crush your next interview?
                    </p>
                </div>
                <div className="flex gap-3">
                    <div className="px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700 flex items-center gap-2 text-sm text-slate-300 shadow-sm">
                        <Flame size={18} className="text-orange-500 fill-orange-500 animate-pulse-slow" />
                        <span className="font-bold text-white">12 Day Streak</span>
                    </div>
                    <Button variant="secondary" icon={Upload} onClick={() => onNavigate('resume-upload')}>New Resume</Button>
                </div>
            </div>

            {/* Quote of the Day */}
            <div className="mb-10 relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700 p-6 flex items-center justify-between shadow-lg">
                <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500"></div>
                <div className="relative z-10">
                    <p className="text-lg md:text-xl font-serif italic text-slate-200">"Success is not final, failure is not fatal: it is the courage to continue that counts."</p>
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
                        <div className="absolute inset-0 rounded-full bg-cyan-500/10 blur-xl animate-pulse-slow"></div>
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="128" cy="128" r="110" stroke="#1e293b" strokeWidth="12" fill="transparent" />
                            <circle cx="128" cy="128" r="110" stroke="url(#gradient)" strokeWidth="12" fill="transparent" strokeDasharray="691" strokeDashoffset="100" strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                            <defs><linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#22d3ee" /><stop offset="100%" stopColor="#3b82f6" /></linearGradient></defs>
                        </svg>
                        <div className="absolute flex flex-col items-center">
                            <span className="text-7xl font-black text-white tracking-tighter">85<span className="text-3xl text-slate-500">%</span></span>
                            <span className="text-green-400 font-bold text-sm bg-green-500/10 px-2 py-1 rounded-full border border-green-500/20 mt-2">Top 10%</span>
                        </div>
                    </div>
                    <p className="text-slate-400 text-sm mt-6 text-center max-w-xs z-10">You're demonstrating strong technical knowledge. Focus on <strong>System Design</strong> to reach 90%.</p>
                </div>

                {/* Start Interview CTA */}
                <div onClick={() => onNavigate('mode-selection')} className="col-span-1 lg:col-span-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl p-8 relative overflow-hidden cursor-pointer group transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-cyan-500/20">
                    <div className="absolute right-0 bottom-0 opacity-20 transform translate-x-10 translate-y-10 group-hover:translate-x-5 group-hover:translate-y-5 transition-transform duration-500">
                        <Zap size={180} fill="white" />
                    </div>
                    <div className="relative z-10 h-full flex flex-col justify-between">
                        <div>
                            <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold text-white mb-3">RECOMMENDED</div>
                            <h3 className="text-3xl font-bold text-white mb-2">Start Mock Interview</h3>
                            <p className="text-blue-100 max-w-sm">Choose your mode: Video, Audio, or Chat-based simulation.</p>
                        </div>
                        <div className="mt-6 flex items-center gap-2 font-bold text-white group-hover:gap-4 transition-all">Begin Session <ArrowRight /></div>
                    </div>
                </div>

                {/* Mini Stats */}
                <div className="col-span-1 bg-slate-900/50 border border-slate-800 rounded-3xl p-6 relative overflow-hidden">
                    <div className="flex justify-between items-center mb-4"><h4 className="font-bold text-slate-300">Skill Breakdown</h4><BarChart size={18} className="text-purple-400" /></div>
                    <div className="space-y-4">
                        {[{ l: 'Technical', v: 92, c: 'bg-purple-500' }, { l: 'Communication', v: 78, c: 'bg-cyan-500' }, { l: 'Problem Solving', v: 85, c: 'bg-green-500' }].map((s, i) => (
                            <div key={i}>
                                <div className="flex justify-between text-xs mb-1 text-slate-400"><span>{s.l}</span><span>{s.v}%</span></div>
                                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden"><div className={`h-full ${s.c}`} style={{ width: `${s.v}%` }}></div></div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent History */}
                <div className="col-span-1 bg-slate-900/50 border border-slate-800 rounded-3xl p-6 flex flex-col">
                    <h4 className="font-bold text-slate-300 mb-4 flex items-center gap-2"><Clock size={16} /> Recent History</h4>
                    <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-2">
                        <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:bg-slate-800 transition-colors cursor-pointer">
                            <div className="flex justify-between items-start mb-1"><span className="text-xs text-slate-400">Yesterday</span><span className="text-xs font-bold text-green-400">92/100</span></div>
                            <div className="font-bold text-white text-sm">System Design: Scaling</div>
                        </div>
                        <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:bg-slate-800 transition-colors cursor-pointer">
                            <div className="flex justify-between items-start mb-1"><span className="text-xs text-slate-400">3 days ago</span><span className="text-xs font-bold text-yellow-400">78/100</span></div>
                            <div className="font-bold text-white text-sm">Behavioral: Conflict</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardView;
