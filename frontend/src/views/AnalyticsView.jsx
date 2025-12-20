import React, { useState, useEffect } from 'react';
import { FileText, AlertCircle, CheckCircle, BarChart, TrendingUp, TrendingDown, Clock, Target, Mic, Video, Brain, Award, RefreshCw, BookOpen, ExternalLink } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { API_URL } from '../config';

const AnalyticsView = () => {
    const [loading, setLoading] = useState(true);
    const [performance, setPerformance] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [interviewHistory, setInterviewHistory] = useState([]);

    // Get user data from localStorage
    const savedUser = localStorage.getItem('user');
    const userData = savedUser ? JSON.parse(savedUser) : {};
    const userName = userData?.name || 'Candidate';
    const userRole = userData?.role || 'Professional';
    const userId = userData?.uid;

    // Fetch performance data from backend
    useEffect(() => {
        const fetchData = async () => {
            if (!userId) {
                // Load from localStorage if no userId
                const cachedPerformance = localStorage.getItem('performance_data');
                const cachedHistory = localStorage.getItem('interview_history');
                
                if (cachedPerformance) {
                    setPerformance(JSON.parse(cachedPerformance));
                }
                if (cachedHistory) {
                    setInterviewHistory(JSON.parse(cachedHistory));
                }
                setLoading(false);
                return;
            }

            try {
                // Fetch performance stats
                const perfResponse = await fetch(`${API_URL}/performance/${userId}`);
                const perfData = await perfResponse.json();
                
                if (perfData.success) {
                    setPerformance(perfData.stats);
                    localStorage.setItem('performance_data', JSON.stringify(perfData.stats));
                }

                // Fetch recommendations
                const recResponse = await fetch(`${API_URL}/recommendations/${userId}`);
                const recData = await recResponse.json();
                
                if (recData.success) {
                    setRecommendations(recData.recommendations);
                }

                // Fetch interview history
                const histResponse = await fetch(`${API_URL}/interviews/${userId}`);
                const histData = await histResponse.json();
                
                if (histData.success) {
                    setInterviewHistory(histData.interviews);
                    localStorage.setItem('interview_history', JSON.stringify(histData.interviews));
                }
            } catch (error) {
                console.error('Error fetching performance data:', error);
                // Fallback to localStorage
                const cachedPerformance = localStorage.getItem('performance_data');
                const cachedHistory = localStorage.getItem('interview_history');
                
                if (cachedPerformance) {
                    setPerformance(JSON.parse(cachedPerformance));
                }
                if (cachedHistory) {
                    setInterviewHistory(JSON.parse(cachedHistory));
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [userId]);

    // Calculate stats from performance data or history
    const stats = performance || {
        total_interviews: interviewHistory.length,
        avg_overall_score: interviewHistory.length > 0 
            ? Math.round(interviewHistory.reduce((sum, i) => sum + (i.overallScore || i.overall_score || 0), 0) / interviewHistory.length)
            : 0,
        avg_visual_score: interviewHistory.length > 0
            ? Math.round(interviewHistory.reduce((sum, i) => sum + (i.visualScore || i.visual_score || 0), 0) / interviewHistory.length)
            : 0,
        avg_content_score: interviewHistory.length > 0
            ? Math.round(interviewHistory.reduce((sum, i) => sum + (i.contentScore || i.content_score || 0), 0) / interviewHistory.length)
            : 0,
        avg_speech_score: interviewHistory.length > 0
            ? Math.round(interviewHistory.reduce((sum, i) => sum + (i.speechScore || i.speech_score || 0), 0) / interviewHistory.length)
            : 0,
        improvement: 0,
        best_score: interviewHistory.length > 0
            ? Math.max(...interviewHistory.map(i => i.overallScore || i.overall_score || 0))
            : 0
    };

    // Calculate practice hours (assuming avg 5 min per interview)
    const practiceHours = Math.round((stats.total_interviews * 5) / 60 * 10) / 10;

    // Get weekly data for chart
    const getWeeklyData = () => {
        const now = new Date();
        const weekData = [0, 0, 0, 0, 0, 0, 0];
        
        interviewHistory.forEach(interview => {
            const date = new Date(interview.date || interview.session_date);
            const daysDiff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
            if (daysDiff >= 0 && daysDiff < 7) {
                const dayIndex = 6 - daysDiff; // Reverse so today is last
                weekData[dayIndex] = Math.max(weekData[dayIndex], interview.overallScore || interview.overall_score || 0);
            }
        });
        
        return weekData;
    };

    const weeklyData = getWeeklyData();
    const maxWeeklyScore = Math.max(...weeklyData, 1);

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center">
                    <RefreshCw size={48} className="animate-spin text-cyan-400 mx-auto mb-4" />
                    <p className="text-slate-400">Loading analytics...</p>
                </div>
            </div>
        );
    }

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
                    <div className="text-3xl font-bold text-white">{stats.total_interviews}</div>
                    <div className="text-xs text-slate-500">Interviews Completed</div>
                </Card>
                <Card className="text-center">
                    <div className="p-3 bg-green-500/10 rounded-xl text-green-400 w-fit mx-auto mb-3">
                        {stats.improvement >= 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                    </div>
                    <div className="text-3xl font-bold text-white">{stats.avg_overall_score || '--'}%</div>
                    <div className="text-xs text-slate-500">Average Score</div>
                    {stats.improvement !== 0 && (
                        <div className={`text-xs mt-1 ${stats.improvement > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {stats.improvement > 0 ? '+' : ''}{stats.improvement}% from last
                        </div>
                    )}
                </Card>
                <Card className="text-center">
                    <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400 w-fit mx-auto mb-3"><Clock size={24} /></div>
                    <div className="text-3xl font-bold text-white">{practiceHours}</div>
                    <div className="text-xs text-slate-500">Practice Hours</div>
                </Card>
                <Card className="text-center">
                    <div className="p-3 bg-orange-500/10 rounded-xl text-orange-400 w-fit mx-auto mb-3"><Award size={24} /></div>
                    <div className="text-3xl font-bold text-white">{stats.best_score || '--'}</div>
                    <div className="text-xs text-slate-500">Best Score</div>
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
                            <polygon points="50,30 70,50 60,70 40,70 30,50" fill="none" stroke="#334155" strokeWidth="1" />
                            {/* Actual skill polygon based on scores */}
                            <polygon 
                                points={`50,${50 - (stats.avg_content_score || 0) * 0.4} ${50 + (stats.avg_visual_score || 0) * 0.4},${50 + (stats.avg_visual_score || 0) * 0.2} ${50 + (stats.avg_speech_score || 0) * 0.2},${50 + (stats.avg_speech_score || 0) * 0.4} ${50 - (stats.avg_speech_score || 0) * 0.2},${50 + (stats.avg_speech_score || 0) * 0.4} ${50 - (stats.avg_visual_score || 0) * 0.4},${50 + (stats.avg_visual_score || 0) * 0.2}`}
                                fill="rgba(34, 211, 238, 0.3)" 
                                stroke="#22d3ee" 
                                strokeWidth="2" 
                            />
                        </svg>
                        <span className="absolute top-0 left-1/2 -translate-x-1/2 text-xs text-slate-400">Content ({stats.avg_content_score || 0}%)</span>
                        <span className="absolute bottom-2 left-4 text-xs text-slate-400">Speech ({stats.avg_speech_score || 0}%)</span>
                        <span className="absolute bottom-2 right-4 text-xs text-slate-400">Visual ({stats.avg_visual_score || 0}%)</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-4">
                        {stats.total_interviews > 0 ? `Based on ${stats.total_interviews} interviews` : 'Complete interviews to build your skill radar'}
                    </p>
                </Card>

                {/* Weekly Progress */}
                <Card className="col-span-2">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-slate-300">Weekly Progress</h3>
                        <span className="text-xs text-slate-500">Last 7 Days</span>
                    </div>
                    <div className="h-64 flex items-end justify-between gap-4 px-4">
                        {weeklyData.map((score, i) => (
                            <div key={i} className="flex flex-col items-center gap-2 group w-full">
                                <div className="relative w-full bg-slate-800 rounded-t-lg overflow-hidden h-full flex items-end">
                                    <div
                                        className={`w-full rounded-t-lg transition-all duration-500 ${
                                            score > 0 ? 'bg-gradient-to-t from-cyan-600 to-cyan-400' : 'bg-slate-700'
                                        }`}
                                        style={{ height: `${Math.max((score / 100) * 100, 5)}%` }}
                                    >
                                        {score > 0 && (
                                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {score}%
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <span className="text-xs text-slate-500">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}</span>
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-slate-500 text-center mt-4">
                        {stats.total_interviews > 0 ? 'Your highest scores per day' : 'No activity this week. Start an interview!'}
                    </p>
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
                        <div className="flex justify-between text-sm"><span className="text-slate-400">Average Score</span><span className="text-slate-300">{stats.avg_speech_score || '--'}%</span></div>
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-cyan-500 transition-all" style={{ width: `${stats.avg_speech_score || 0}%` }}></div>
                        </div>
                        <div className="flex justify-between text-sm"><span className="text-slate-400">Target</span><span className="text-green-400">80%+</span></div>
                    </div>
                </Card>
                <Card>
                    <div className="flex items-center gap-3 mb-4">
                        <Video className="text-purple-400" size={20} />
                        <h3 className="font-bold text-white">Visual Analysis</h3>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm"><span className="text-slate-400">Average Score</span><span className="text-slate-300">{stats.avg_visual_score || '--'}%</span></div>
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500 transition-all" style={{ width: `${stats.avg_visual_score || 0}%` }}></div>
                        </div>
                        <div className="flex justify-between text-sm"><span className="text-slate-400">Target</span><span className="text-green-400">75%+</span></div>
                    </div>
                </Card>
                <Card>
                    <div className="flex items-center gap-3 mb-4">
                        <Brain className="text-green-400" size={20} />
                        <h3 className="font-bold text-white">Content Analysis</h3>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm"><span className="text-slate-400">Average Score</span><span className="text-slate-300">{stats.avg_content_score || '--'}%</span></div>
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 transition-all" style={{ width: `${stats.avg_content_score || 0}%` }}></div>
                        </div>
                        <div className="flex justify-between text-sm"><span className="text-slate-400">Target</span><span className="text-green-400">70%+</span></div>
                    </div>
                </Card>
            </div>

            {/* Learning Recommendations */}
            {recommendations.length > 0 && (
                <Card className="mb-8">
                    <div className="flex items-center gap-3 mb-6">
                        <BookOpen className="text-orange-400" size={24} />
                        <h3 className="text-xl font-bold text-white">Personalized Learning Path</h3>
                    </div>
                    <div className="space-y-4">
                        {recommendations.map((rec, idx) => (
                            <div key={idx} className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                                    <div className="flex items-center gap-3">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                            rec.priority === 'High' ? 'bg-red-500/20 text-red-400' :
                                            rec.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                            'bg-green-500/20 text-green-400'
                                        }`}>{rec.priority} Priority</span>
                                        <span className="text-white font-medium">{rec.domain}</span>
                                    </div>
                                    <div className="text-sm">
                                        <span className="text-slate-500 text-xs">Current: </span>
                                        <span className={`font-bold ${rec.current_score >= 70 ? 'text-green-400' : rec.current_score >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                                            {rec.current_score}%
                                        </span>
                                        <span className="text-slate-400"> → Target: </span>
                                        <span className="text-green-400 font-bold">{rec.target_score}%</span>
                                    </div>
                                </div>
                                
                                {rec.resources && rec.resources.length > 0 && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                                        {rec.resources.map((resource, ridx) => (
                                            <a 
                                                key={ridx} 
                                                href={resource.link} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg hover:bg-slate-700/50 transition-colors group"
                                            >
                                                <div className="p-2 bg-cyan-500/10 rounded-lg">
                                                    <BookOpen size={16} className="text-cyan-400" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-white truncate group-hover:text-cyan-400 transition-colors">{resource.title}</p>
                                                    <p className="text-xs text-slate-500">{resource.type} • {resource.duration}</p>
                                                </div>
                                                <ExternalLink size={14} className="text-slate-500 group-hover:text-cyan-400" />
                                            </a>
                                        ))}
                                    </div>
                                )}

                                {rec.improvement_tips && (
                                    <div className="mt-4 pt-4 border-t border-slate-700">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tips</p>
                                        <ul className="space-y-1">
                                            {rec.improvement_tips.map((tip, tidx) => (
                                                <li key={tidx} className="flex items-center gap-2 text-sm text-slate-400">
                                                    <CheckCircle size={12} className="text-green-400" />
                                                    {tip}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* AI Report Section */}
            <Card className="bg-gradient-to-r from-slate-900 to-slate-800 border-l-4 border-l-cyan-500">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                            <FileText className="text-cyan-400" />
                            <h3 className="text-xl font-bold text-white">AI Weekly Report</h3>
                        </div>
                        <p className="text-slate-300 mb-4 leading-relaxed">
                            {stats.total_interviews > 0 
                                ? `Great progress, ${userName}! You've completed ${stats.total_interviews} interview${stats.total_interviews > 1 ? 's' : ''} with an average score of ${stats.avg_overall_score}%. ${stats.improvement > 0 ? `You've improved by ${stats.improvement}% since your last interview!` : 'Keep practicing to improve your scores!'}`
                                : `Hi ${userName}! Complete your first mock interview to receive personalized AI-powered feedback and insights tailored to your ${userRole} role.`
                            }
                        </p>
                        <h4 className="font-bold text-slate-200 text-sm uppercase tracking-wider mb-2">Suggested Actions:</h4>
                        <ul className="space-y-2 mb-6">
                            {stats.total_interviews === 0 ? (
                                <>
                                    <li className="flex items-center gap-2 text-slate-400 text-sm"><Target size={14} className="text-cyan-400" /> Start your first video interview</li>
                                    <li className="flex items-center gap-2 text-slate-400 text-sm"><CheckCircle size={14} className="text-green-400" /> Upload your resume for analysis</li>
                                    <li className="flex items-center gap-2 text-slate-400 text-sm"><AlertCircle size={14} className="text-orange-400" /> Practice common {userRole} questions</li>
                                </>
                            ) : (
                                <>
                                    {stats.avg_speech_score < 70 && <li className="flex items-center gap-2 text-slate-400 text-sm"><Mic size={14} className="text-cyan-400" /> Focus on speech clarity and pace</li>}
                                    {stats.avg_visual_score < 70 && <li className="flex items-center gap-2 text-slate-400 text-sm"><Video size={14} className="text-purple-400" /> Work on eye contact and posture</li>}
                                    {stats.avg_content_score < 70 && <li className="flex items-center gap-2 text-slate-400 text-sm"><Brain size={14} className="text-green-400" /> Structure answers with STAR method</li>}
                                    <li className="flex items-center gap-2 text-slate-400 text-sm"><Target size={14} className="text-cyan-400" /> Complete 3 more interviews this week</li>
                                </>
                            )}
                        </ul>
                        <Button variant="primary" className="text-sm py-2">Start Practice Interview</Button>
                    </div>
                    <div className="w-full md:w-1/3 bg-slate-900/50 rounded-xl p-4 border border-slate-700">
                        <h4 className="text-slate-400 text-sm mb-4">Skill Focus Areas</h4>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm text-slate-300"><span>Content Quality</span><span className={stats.avg_content_score >= 70 ? 'text-green-400' : 'text-cyan-400'}>{stats.avg_content_score >= 70 ? 'Good' : 'Focus'}</span></div>
                            <div className="w-full h-1.5 bg-slate-800 rounded-full"><div className={`h-full rounded-full ${stats.avg_content_score >= 70 ? 'bg-green-500' : 'bg-cyan-500'}`} style={{ width: `${stats.avg_content_score || 0}%` }}></div></div>

                            <div className="flex justify-between text-sm text-slate-300 mt-2"><span>Speech Delivery</span><span className={stats.avg_speech_score >= 70 ? 'text-green-400' : 'text-blue-400'}>{stats.avg_speech_score >= 70 ? 'Good' : 'Focus'}</span></div>
                            <div className="w-full h-1.5 bg-slate-800 rounded-full"><div className={`h-full rounded-full ${stats.avg_speech_score >= 70 ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${stats.avg_speech_score || 0}%` }}></div></div>

                            <div className="flex justify-between text-sm text-slate-300 mt-2"><span>Visual Presence</span><span className={stats.avg_visual_score >= 70 ? 'text-green-400' : 'text-purple-400'}>{stats.avg_visual_score >= 70 ? 'Good' : 'Focus'}</span></div>
                            <div className="w-full h-1.5 bg-slate-800 rounded-full"><div className={`h-full rounded-full ${stats.avg_visual_score >= 70 ? 'bg-green-500' : 'bg-purple-500'}`} style={{ width: `${stats.avg_visual_score || 0}%` }}></div></div>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default AnalyticsView;
