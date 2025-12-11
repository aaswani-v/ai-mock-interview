import React from 'react';
import { FileText, AlertCircle, CheckCircle } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';

const AnalyticsView = () => (
    <div className="h-full p-6 max-w-7xl mx-auto overflow-y-auto custom-scrollbar animate-fade-in-up">
        <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Performance Analytics</h2>
            <p className="text-slate-400">Deep dive into your interview metrics and weekly growth.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Radar Chart Simulation */}
            <Card className="col-span-1 min-h-[300px] flex flex-col items-center justify-center relative">
                <h3 className="text-lg font-bold text-slate-300 absolute top-6 left-6">Skill Radar</h3>
                <div className="relative w-64 h-64 mt-4">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                        <polygon points="50,10 90,40 70,90 30,90 10,40" fill="none" stroke="#334155" strokeWidth="1" />
                        <polygon points="50,20 80,45 65,80 35,80 20,45" fill="none" stroke="#334155" strokeWidth="1" />
                        <polygon points="50,15 85,42 68,85 32,82 15,45" fill="rgba(34, 211, 238, 0.2)" stroke="#22d3ee" strokeWidth="2" />
                        <circle cx="50" cy="15" r="2" fill="#22d3ee" />
                        <circle cx="85" cy="42" r="2" fill="#22d3ee" />
                        <circle cx="68" cy="85" r="2" fill="#22d3ee" />
                        <circle cx="32" cy="82" r="2" fill="#22d3ee" />
                        <circle cx="15" cy="45" r="2" fill="#22d3ee" />
                    </svg>
                    <span className="absolute top-0 left-1/2 -translate-x-1/2 text-xs text-slate-400">Technical</span>
                    <span className="absolute bottom-2 left-8 text-xs text-slate-400">Communication</span>
                    <span className="absolute bottom-2 right-8 text-xs text-slate-400">Problem Solving</span>
                </div>
            </Card>

            {/* Weekly Progress */}
            <Card className="col-span-2">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-300">Weekly Progress</h3>
                    <Select options={['Last 7 Days', 'Last Month']} placeholder="Last 7 Days" />
                </div>
                <div className="h-64 flex items-end justify-between gap-4 px-4">
                    {[40, 65, 45, 80, 55, 90, 85].map((h, i) => (
                        <div key={i} className="flex flex-col items-center gap-2 group w-full">
                            <div className="relative w-full bg-slate-800 rounded-t-lg overflow-hidden h-full flex items-end">
                                <div
                                    className="w-full bg-gradient-to-t from-cyan-600 to-blue-500 opacity-80 group-hover:opacity-100 transition-all duration-500 rounded-t-lg"
                                    style={{ height: `${h}%` }}
                                ></div>
                            </div>
                            <span className="text-xs text-slate-500">Day {i + 1}</span>
                        </div>
                    ))}
                </div>
            </Card>
        </div>

        {/* AI Weekly Report */}
        <Card className="bg-gradient-to-r from-slate-900 to-slate-800 border-l-4 border-l-cyan-500">
            <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                        <FileText className="text-cyan-400" />
                        <h3 className="text-xl font-bold text-white">AI Weekly Report</h3>
                    </div>
                    <p className="text-slate-300 mb-4 leading-relaxed">
                        You've shown a <strong className="text-green-400">15% improvement</strong> in answering behavioral questions.
                        Your pacing has stabilized, but you tend to rush during system design explanations.
                    </p>
                    <h4 className="font-bold text-slate-200 text-sm uppercase tracking-wider mb-2">Key Action Items:</h4>
                    <ul className="space-y-2 mb-6">
                        <li className="flex items-center gap-2 text-slate-400 text-sm"><AlertCircle size={14} className="text-orange-400" /> Slow down when explaining DB Schema</li>
                        <li className="flex items-center gap-2 text-slate-400 text-sm"><CheckCircle size={14} className="text-green-400" /> Continue using STAR method</li>
                    </ul>
                    <Button variant="secondary" className="text-sm py-2">Download Full Report</Button>
                </div>
                <div className="w-full md:w-1/3 bg-slate-900/50 rounded-xl p-4 border border-slate-700">
                    <h4 className="text-slate-400 text-sm mb-4">Focus Areas for Next Week</h4>
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm text-slate-300"><span>System Design</span><span className="text-orange-400">High Priority</span></div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full"><div className="w-3/4 h-full bg-orange-500 rounded-full"></div></div>

                        <div className="flex justify-between text-sm text-slate-300 mt-2"><span>Algorithms</span><span className="text-blue-400">Medium</span></div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full"><div className="w-1/2 h-full bg-blue-500 rounded-full"></div></div>
                    </div>
                </div>
            </div>
        </Card>
    </div>
);

export default AnalyticsView;
