import React from 'react';
import { FileText, AlertCircle, CheckCircle, BarChart, TrendingUp, Clock, Target, Mic, Video, Brain, Award } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const AnalyticsView = () => {
    // Get user data from localStorage
    const savedUser = localStorage.getItem('user');
    const userData = savedUser ? JSON.parse(savedUser) : {};
    const userName = userData?.name || 'Candidate';
    const userRole = userData?.role || 'Professional';

    return (
        <div className="h-full p-6 max-w-7xl mx-auto overflow-y-auto custom-scrollbar animate-fade-in-up">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Performance Analytics</h2>
                <p className="text-slate-400">Deep dive into your interview metrics and growth as a {userRole}.</p>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <Card className="text-center">
                    <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400 w-fit mx-auto mb-3"><Video size={24} /></div>
                    <div className="text-3xl font-bold text-white">0</div>
                    <div className="text-xs text-slate-500">Interviews Completed</div>
                </Card>
                <Card className="text-center">
                    <div className="p-3 bg-green-500/10 rounded-xl text-green-400 w-fit mx-auto mb-3"><TrendingUp size={24} /></div>
                    <div className="text-3xl font-bold text-white">--</div>
                    <div className="text-xs text-slate-500">Average Score</div>
                </Card>
                <Card className="text-center">
                    <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400 w-fit mx-auto mb-3"><Clock size={24} /></div>
                    <div className="text-3xl font-bold text-white">0</div>
                    <div className="text-xs text-slate-500">Practice Hours</div>
                </Card>
                <Card className="text-center">
                    <div className="p-3 bg-orange-500/10 rounded-xl text-orange-400 w-fit mx-auto mb-3"><Award size={24} /></div>
                    <div className="text-3xl font-bold text-white">0</div>
                    <div className="text-xs text-slate-500">Achievements</div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Skill Radar */}
                <Card className="col-span-1 min-h-[300px] flex flex-col items-center justify-center relative">
                    <h3 className="text-lg font-bold text-slate-300 absolute top-6 left-6">Skill Radar</h3>
                    <div className="relative w-64 h-64 mt-4">
                        <svg viewBox="0 0 100 100" className="w-full h-full">
                            <polygon points="50,10 90,40 70,90 30,90 10,40" fill="none" stroke="#334155" strokeWidth="1" />
                            <polygon points="50,20 80,45 65,80 35,80 20,45" fill="none" stroke="#334155" strokeWidth="1" />
                            <polygon points="50,45 55,47 52,53 48,53 45,47" fill="rgba(148, 163, 184, 0.3)" stroke="#64748b" strokeWidth="1" />
                        </svg>
                        <span className="absolute top-0 left-1/2 -translate-x-1/2 text-xs text-slate-400">Technical</span>
                        <span className="absolute bottom-2 left-8 text-xs text-slate-400">Communication</span>
                        <span className="absolute bottom-2 right-8 text-xs text-slate-400">Problem Solving</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-4">Complete interviews to build your skill radar</p>
                </Card>

                {/* Weekly Progress */}
                <Card className="col-span-2">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-slate-300">Weekly Progress</h3>
                        <span className="text-xs text-slate-500">Last 7 Days</span>
                    </div>
                    <div className="h-64 flex items-end justify-between gap-4 px-4">
                        {[0, 0, 0, 0, 0, 0, 0].map((h, i) => (
                            <div key={i} className="flex flex-col items-center gap-2 group w-full">
                                <div className="relative w-full bg-slate-800 rounded-t-lg overflow-hidden h-full flex items-end">
                                    <div
                                        className="w-full bg-gradient-to-t from-slate-700 to-slate-600 opacity-50 rounded-t-lg"
                                        style={{ height: `${Math.max(h, 5)}%` }}
                                    ></div>
                                </div>
                                <span className="text-xs text-slate-500">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}</span>
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-slate-500 text-center mt-4">No activity this week. Start an interview!</p>
                </Card>
            </div>

            {/* Interview Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                    <div className="flex items-center gap-3 mb-4">
                        <Mic className="text-cyan-400" size={20} />
                        <h3 className="font-bold text-white">Speech Analysis</h3>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm"><span className="text-slate-400">Words Per Minute</span><span className="text-slate-300">-- WPM</span></div>
                        <div className="flex justify-between text-sm"><span className="text-slate-400">Filler Words</span><span className="text-slate-300">--</span></div>
                        <div className="flex justify-between text-sm"><span className="text-slate-400">Clarity Score</span><span className="text-slate-300">--%</span></div>
                    </div>
                </Card>
                <Card>
                    <div className="flex items-center gap-3 mb-4">
                        <Video className="text-purple-400" size={20} />
                        <h3 className="font-bold text-white">Visual Analysis</h3>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm"><span className="text-slate-400">Eye Contact</span><span className="text-slate-300">--%</span></div>
                        <div className="flex justify-between text-sm"><span className="text-slate-400">Body Language</span><span className="text-slate-300">--%</span></div>
                        <div className="flex justify-between text-sm"><span className="text-slate-400">Confidence</span><span className="text-slate-300">--%</span></div>
                    </div>
                </Card>
                <Card>
                    <div className="flex items-center gap-3 mb-4">
                        <Brain className="text-green-400" size={20} />
                        <h3 className="font-bold text-white">Content Analysis</h3>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm"><span className="text-slate-400">Technical Accuracy</span><span className="text-slate-300">--%</span></div>
                        <div className="flex justify-between text-sm"><span className="text-slate-400">Relevance</span><span className="text-slate-300">--%</span></div>
                        <div className="flex justify-between text-sm"><span className="text-slate-400">STAR Method</span><span className="text-slate-300">--%</span></div>
                    </div>
                </Card>
            </div>

            {/* AI Report Section */}
            <Card className="bg-gradient-to-r from-slate-900 to-slate-800 border-l-4 border-l-cyan-500">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                            <FileText className="text-cyan-400" />
                            <h3 className="text-xl font-bold text-white">AI Weekly Report</h3>
                        </div>
                        <p className="text-slate-300 mb-4 leading-relaxed">
                            Hi {userName}! Complete your first mock interview to receive personalized AI-powered feedback and insights tailored to your {userRole} role.
                        </p>
                        <h4 className="font-bold text-slate-200 text-sm uppercase tracking-wider mb-2">Suggested Actions:</h4>
                        <ul className="space-y-2 mb-6">
                            <li className="flex items-center gap-2 text-slate-400 text-sm"><Target size={14} className="text-cyan-400" /> Start your first video interview</li>
                            <li className="flex items-center gap-2 text-slate-400 text-sm"><CheckCircle size={14} className="text-green-400" /> Upload your resume for analysis</li>
                            <li className="flex items-center gap-2 text-slate-400 text-sm"><AlertCircle size={14} className="text-orange-400" /> Practice common {userRole} questions</li>
                        </ul>
                        <Button variant="primary" className="text-sm py-2">Start Practice Interview</Button>
                    </div>
                    <div className="w-full md:w-1/3 bg-slate-900/50 rounded-xl p-4 border border-slate-700">
                        <h4 className="text-slate-400 text-sm mb-4">Recommended Focus Areas</h4>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm text-slate-300"><span>Technical Skills</span><span className="text-cyan-400">Focus</span></div>
                            <div className="w-full h-1.5 bg-slate-800 rounded-full"><div className="w-0 h-full bg-cyan-500 rounded-full"></div></div>

                            <div className="flex justify-between text-sm text-slate-300 mt-2"><span>Communication</span><span className="text-blue-400">Focus</span></div>
                            <div className="w-full h-1.5 bg-slate-800 rounded-full"><div className="w-0 h-full bg-blue-500 rounded-full"></div></div>

                            <div className="flex justify-between text-sm text-slate-300 mt-2"><span>Problem Solving</span><span className="text-green-400">Focus</span></div>
                            <div className="w-full h-1.5 bg-slate-800 rounded-full"><div className="w-0 h-full bg-green-500 rounded-full"></div></div>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default AnalyticsView;
