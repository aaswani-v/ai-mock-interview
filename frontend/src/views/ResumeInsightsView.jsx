import React from 'react';
import { ArrowRight, CheckCircle, AlertCircle, Target } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const ResumeInsightsView = ({ onContinue, resumeData }) => {
    // Safer default values
    const score = resumeData?.atsScore || 0;
    const scoreColor = score >= 80 ? 'text-green-400' : score >= 60 ? 'text-yellow-400' : 'text-red-400';
    const progressColor = score >= 80 ? '#4ade80' : score >= 60 ? '#facc15' : '#f87171';

    return (
        <div className="h-full p-6 max-w-6xl mx-auto animate-fade-in-up overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-white">Resume Analysis</h2>
                    <p className="text-slate-400">{resumeData?.fileName || "Uploaded Resume"}</p>
                </div>
                <Button onClick={onContinue} icon={ArrowRight}>Dashboard</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="col-span-1 flex flex-col items-center justify-center text-center">
                    <div className="relative w-48 h-48 flex items-center justify-center mb-4">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="96" cy="96" r="80" stroke="#1e293b" strokeWidth="12" fill="transparent" />
                            <circle
                                cx="96" cy="96" r="80"
                                stroke={progressColor}
                                strokeWidth="12"
                                fill="transparent"
                                strokeDasharray="502"
                                strokeDashoffset={502 - (502 * score) / 100}
                                strokeLinecap="round"
                                className="transition-all duration-1000 ease-out"
                            />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                            <span className={`text-5xl font-black ${scoreColor}`}>{score}</span>
                            <span className="text-slate-500 text-sm font-bold mt-1">ATS SCORE</span>
                        </div>
                    </div>
                    <p className="text-slate-400 text-sm mt-2">
                        {score >= 80 ? "Your resume is highly optimized!" :
                            score >= 60 ? "Good start, but needs improvements." :
                                "Needs significant improvements for ATS."}
                    </p>
                </Card>

                <Card className="col-span-2 space-y-6">
                    {/* Skills Found */}
                    <div>
                        <h3 className="font-bold text-lg text-white mb-3 flex items-center gap-2">
                            <CheckCircle size={20} className="text-cyan-400" /> Found Skills & Keywords
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {resumeData?.skills?.slice(0, 15).map((skill, i) => (
                                <span key={i} className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-bold">
                                    {skill}
                                </span>
                            ))}
                            {(!resumeData?.skills || resumeData.skills.length === 0) && <p className="text-slate-500 text-sm">No specific technical skills detected.</p>}
                        </div>
                    </div>

                    {/* Missing Skills */}
                    <div>
                        <h3 className="font-bold text-lg text-white mb-3 flex items-center gap-2">
                            <AlertCircle size={20} className="text-red-400" /> Critical Missing Keywords
                        </h3>
                        <p className="text-xs text-slate-500 mb-3">Based on high-demand skills for tech roles:</p>
                        <div className="flex flex-wrap gap-2">
                            {resumeData?.missingSkills?.slice(0, 10).map((skill, i) => (
                                <span key={i} className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-bold">
                                    {skill}
                                </span>
                            ))}
                            {(!resumeData?.missingSkills || resumeData.missingSkills.length === 0) && <p className="text-green-500 text-sm">No critical gaps found!</p>}
                        </div>
                    </div>

                    {/* Compatibility Insight */}
                    <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                        <div className="flex items-center gap-3 mb-4">
                            <Target className="text-blue-400" size={24} />
                            <div>
                                <h4 className="font-bold text-white text-sm">Job Compatibility</h4>
                                <p className="text-xs text-slate-400">Match against 30+ Tech Roles</p>
                            </div>
                        </div>

                        <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                            {resumeData?.jobCompatibilities?.map((job) => (
                                <div key={job.roleId} className="flex justify-between items-center bg-slate-900/50 p-2 rounded-lg border border-slate-700/50">
                                    <span className="text-sm text-slate-300 font-medium">{job.roleTitle}</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${job.score >= 80 ? 'bg-green-500' : job.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                style={{ width: `${job.score}%` }}
                                            ></div>
                                        </div>
                                        <span className={`text-xs font-bold ${job.score >= 80 ? 'text-green-400' : job.score >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                                            {job.score}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default ResumeInsightsView;
