import React from 'react';
import { ArrowRight, CheckCircle, AlertCircle, Target, Lightbulb, TrendingUp, Award, BookOpen, Zap, ChevronRight, Download, RefreshCw } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const ResumeInsightsView = ({ onContinue, resumeData }) => {
    // Safer default values
    const score = resumeData?.atsScore || 0;
    const scoreColor = score >= 80 ? 'text-green-400' : score >= 60 ? 'text-yellow-400' : 'text-red-400';
    const progressColor = score >= 80 ? '#4ade80' : score >= 60 ? '#facc15' : '#f87171';
    const bgGradient = score >= 80 ? 'from-green-500/20 to-green-500/5' : score >= 60 ? 'from-yellow-500/20 to-yellow-500/5' : 'from-red-500/20 to-red-500/5';

    // Get data arrays with fallbacks
    const skills = resumeData?.skills || [];
    const missingSkills = resumeData?.missingSkills || [];
    const strengths = resumeData?.strengths || [];
    const suggestions = resumeData?.suggestions || [];
    const jobCompatibilities = resumeData?.jobCompatibilities || [];

    // Determine improvement priority areas
    const getImprovementAreas = () => {
        const areas = [];
        if (score < 50) {
            areas.push({ label: 'Critical', color: 'bg-red-500', text: 'Major resume overhaul needed' });
        }
        if (missingSkills.length > 5) {
            areas.push({ label: 'High', color: 'bg-orange-500', text: 'Add more relevant keywords' });
        }
        if (skills.length < 5) {
            areas.push({ label: 'Medium', color: 'bg-yellow-500', text: 'Highlight more skills' });
        }
        return areas;
    };

    return (
        <div className="h-full p-6 max-w-7xl mx-auto animate-fade-in-up overflow-y-auto custom-scrollbar">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-white">Resume Analysis Report</h2>
                    <p className="text-slate-400">{resumeData?.fileName || "Your Resume"} • Analyzed just now</p>
                </div>
                <div className="flex gap-3">
                    <Button onClick={() => window.location.reload()} variant="secondary" icon={RefreshCw}>Re-analyze</Button>
                    <Button onClick={onContinue} icon={ArrowRight}>Continue to Dashboard</Button>
                </div>
            </div>

            {/* Main Score Card */}
            <div className={`mb-8 p-8 rounded-3xl bg-gradient-to-r ${bgGradient} border border-slate-700/50 relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-full blur-3xl"></div>
                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                    {/* Score Circle */}
                    <div className="relative w-48 h-48 flex items-center justify-center flex-shrink-0">
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

                    {/* Score Explanation */}
                    <div className="flex-1 text-center md:text-left">
                        <h3 className={`text-2xl font-bold mb-2 ${scoreColor}`}>
                            {score >= 80 ? "Excellent! Your resume is ATS-ready!" :
                             score >= 60 ? "Good foundation, but room for improvement" :
                             score >= 40 ? "Needs significant improvements" :
                             "Your resume needs a major overhaul"}
                        </h3>
                        <p className="text-slate-400 mb-4 max-w-lg">
                            {score >= 80 ? "Your resume is well-optimized for Applicant Tracking Systems. It contains relevant keywords and is properly formatted." :
                             score >= 60 ? "Your resume has good elements but is missing some key optimizations. Follow our suggestions below to improve your chances." :
                             score >= 40 ? "Your resume may be filtered out by ATS systems. Focus on adding more relevant keywords and improving structure." :
                             "Most ATS systems will likely filter out your resume. A complete restructuring with relevant keywords is recommended."}
                        </p>
                        
                        {/* Quick Stats */}
                        <div className="flex flex-wrap gap-4">
                            <div className="px-4 py-2 bg-slate-800/50 rounded-xl border border-slate-700">
                                <span className="text-2xl font-bold text-cyan-400">{skills.length}</span>
                                <span className="text-slate-500 text-sm ml-2">Skills Found</span>
                            </div>
                            <div className="px-4 py-2 bg-slate-800/50 rounded-xl border border-slate-700">
                                <span className="text-2xl font-bold text-red-400">{missingSkills.length}</span>
                                <span className="text-slate-500 text-sm ml-2">Missing Keywords</span>
                            </div>
                            <div className="px-4 py-2 bg-slate-800/50 rounded-xl border border-slate-700">
                                <span className="text-2xl font-bold text-green-400">{strengths.length}</span>
                                <span className="text-slate-500 text-sm ml-2">Strengths</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Strengths Section */}
                <Card className="border-l-4 border-l-green-500">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-green-500/20 rounded-lg">
                            <Award size={20} className="text-green-400" />
                        </div>
                        <h3 className="font-bold text-lg text-white">Your Strengths</h3>
                    </div>
                    {strengths.length > 0 ? (
                        <div className="space-y-3">
                            {strengths.map((strength, i) => (
                                <div key={i} className="flex items-start gap-3 p-3 bg-green-500/5 rounded-lg border border-green-500/20">
                                    <CheckCircle size={18} className="text-green-400 mt-0.5 flex-shrink-0" />
                                    <p className="text-slate-300 text-sm">{strength}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-500 text-sm">No specific strengths detected. Upload a more detailed resume.</p>
                    )}
                </Card>

                {/* Improvement Suggestions */}
                <Card className="border-l-4 border-l-orange-500">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-orange-500/20 rounded-lg">
                            <Lightbulb size={20} className="text-orange-400" />
                        </div>
                        <h3 className="font-bold text-lg text-white">Improvement Suggestions</h3>
                    </div>
                    {suggestions.length > 0 ? (
                        <div className="space-y-3">
                            {suggestions.map((suggestion, i) => (
                                <div key={i} className="flex items-start gap-3 p-3 bg-orange-500/5 rounded-lg border border-orange-500/20">
                                    <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                                        <span className="text-orange-400 text-xs font-bold">{i + 1}</span>
                                    </div>
                                    <p className="text-slate-300 text-sm">{suggestion}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="flex items-start gap-3 p-3 bg-orange-500/5 rounded-lg border border-orange-500/20">
                                <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                                    <span className="text-orange-400 text-xs font-bold">1</span>
                                </div>
                                <p className="text-slate-300 text-sm">Add quantifiable achievements (e.g., "Increased sales by 25%")</p>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-orange-500/5 rounded-lg border border-orange-500/20">
                                <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                                    <span className="text-orange-400 text-xs font-bold">2</span>
                                </div>
                                <p className="text-slate-300 text-sm">Use action verbs like "Led", "Developed", "Implemented"</p>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-orange-500/5 rounded-lg border border-orange-500/20">
                                <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                                    <span className="text-orange-400 text-xs font-bold">3</span>
                                </div>
                                <p className="text-slate-300 text-sm">Tailor your resume keywords to match job descriptions</p>
                            </div>
                        </div>
                    )}
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Found Skills */}
                <Card>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-cyan-500/20 rounded-lg">
                            <CheckCircle size={20} className="text-cyan-400" />
                        </div>
                        <h3 className="font-bold text-lg text-white">Found Skills & Keywords</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {skills.length > 0 ? (
                            skills.slice(0, 20).map((skill, i) => (
                                <span key={i} className="px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-bold">
                                    {skill}
                                </span>
                            ))
                        ) : (
                            <p className="text-slate-500 text-sm">No specific technical skills detected. Consider adding relevant technologies and tools.</p>
                        )}
                    </div>
                    {skills.length > 20 && (
                        <p className="text-slate-500 text-xs mt-3">+{skills.length - 20} more skills found</p>
                    )}
                </Card>

                {/* Missing Keywords */}
                <Card>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-red-500/20 rounded-lg">
                            <AlertCircle size={20} className="text-red-400" />
                        </div>
                        <h3 className="font-bold text-lg text-white">Critical Missing Keywords</h3>
                        <span className="text-xs text-slate-500 ml-auto">High-demand skills for your target role</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {missingSkills.length > 0 ? (
                            missingSkills.slice(0, 15).map((skill, i) => (
                                <span key={i} className="px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-bold flex items-center gap-1">
                                    <span>+</span> {skill}
                                </span>
                            ))
                        ) : (
                            <div className="flex items-center gap-2 text-green-400">
                                <CheckCircle size={16} />
                                <p className="text-sm">Great! No critical keyword gaps detected.</p>
                            </div>
                        )}
                    </div>
                    {missingSkills.length > 0 && (
                        <p className="text-slate-400 text-xs mt-4 p-3 bg-slate-800/50 rounded-lg">
                            💡 <strong>Pro Tip:</strong> Add these keywords naturally in your work experience and skills sections. Don't just list them - show how you've used them.
                        </p>
                    )}
                </Card>
            </div>

            {/* Action Plan */}
            <Card className="mb-8 bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-purple-500/30">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-purple-500/20 rounded-xl">
                        <Zap size={24} className="text-purple-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-xl text-white">Your Action Plan</h3>
                        <p className="text-slate-400 text-sm">Follow these steps to improve your resume score</p>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
                                <span className="text-cyan-400 font-bold">1</span>
                            </div>
                            <h4 className="font-bold text-white">Add Keywords</h4>
                        </div>
                        <p className="text-slate-400 text-sm">Include the missing keywords in your experience section with specific examples.</p>
                    </div>
                    
                    <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                                <span className="text-purple-400 font-bold">2</span>
                            </div>
                            <h4 className="font-bold text-white">Quantify Results</h4>
                        </div>
                        <p className="text-slate-400 text-sm">Add numbers and metrics to show impact (e.g., "Reduced costs by 30%").</p>
                    </div>
                    
                    <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                                <span className="text-green-400 font-bold">3</span>
                            </div>
                            <h4 className="font-bold text-white">Re-analyze</h4>
                        </div>
                        <p className="text-slate-400 text-sm">After making changes, upload your updated resume to track improvement.</p>
                    </div>
                </div>
            </Card>

            {/* Job Compatibility Section */}
            {jobCompatibilities.length > 0 && (
                <Card className="mb-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <Target size={20} className="text-blue-400" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-white">Job Role Compatibility</h3>
                            <p className="text-xs text-slate-400">How well your resume matches popular tech roles</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {jobCompatibilities.slice(0, 6).map((job, idx) => (
                            <div key={job.roleId || idx} className="flex justify-between items-center p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                                <span className="text-sm text-slate-300 font-medium">{job.roleTitle}</span>
                                <div className="flex items-center gap-3">
                                    <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${job.score >= 80 ? 'bg-green-500' : job.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                            style={{ width: `${job.score}%` }}
                                        ></div>
                                    </div>
                                    <span className={`text-sm font-bold w-12 text-right ${job.score >= 80 ? 'text-green-400' : job.score >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                                        {job.score}%
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Bottom CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-6">
                <Button onClick={onContinue} icon={ArrowRight} className="w-full sm:w-auto">
                    Continue to Dashboard
                </Button>
                <Button onClick={() => window.location.reload()} variant="secondary" icon={RefreshCw} className="w-full sm:w-auto">
                    Upload New Resume
                </Button>
            </div>
        </div>
    );
};

export default ResumeInsightsView;
