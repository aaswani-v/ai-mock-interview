import React, { useState, useEffect } from 'react';
import { BookOpen, Play, FileText, ExternalLink, Search, Filter, RefreshCw, Target, TrendingUp, Lightbulb, Video, Award, ChevronRight, Star, Clock } from 'lucide-react';
import Card from '../components/ui/Card';
import { API_URL } from '../config';

const PracticeHubView = () => {
    const [loading, setLoading] = useState(true);
    const [recommendations, setRecommendations] = useState([]);
    const [statsSummary, setStatsSummary] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    // Get user data
    const savedUser = localStorage.getItem('user');
    const userData = savedUser ? JSON.parse(savedUser) : {};
    const userId = userData?.uid;
    const userRole = userData?.role || 'Professional';

    // Static learning resources (enhanced with more categories)
    const staticResources = [
        // Communication Skills
        { id: 1, title: "STAR Method Interview Guide", category: "Communication", type: "Article", duration: "15 min", link: "https://www.indeed.com/career-advice/interviewing/how-to-use-the-star-interview-response-technique", rating: 4.8 },
        { id: 2, title: "Public Speaking for Interviews", category: "Communication", type: "Video", duration: "25 min", link: "https://www.youtube.com/results?search_query=interview+public+speaking+tips", rating: 4.6 },
        { id: 3, title: "Body Language Masterclass", category: "Communication", type: "Course", duration: "1 hour", link: "https://www.coursera.org/courses?query=body%20language", rating: 4.7 },
        
        // Technical Skills
        { id: 4, title: "Data Structures Crash Course", category: "Technical", type: "Course", duration: "3 hours", link: "https://www.coursera.org/courses?query=data%20structures", rating: 4.9 },
        { id: 5, title: "System Design Interview Prep", category: "Technical", type: "Guide", duration: "2 hours", link: "https://github.com/donnemartin/system-design-primer", rating: 4.9 },
        { id: 6, title: "LeetCode Top Interview Questions", category: "Technical", type: "Practice", duration: "10+ hours", link: "https://leetcode.com/explore/interview/", rating: 4.8 },
        
        // Behavioral Skills
        { id: 7, title: "Top 50 Behavioral Questions", category: "Behavioral", type: "Guide", duration: "1 hour", link: "https://www.themuse.com/advice/30-behavioral-interview-questions-you-should-be-ready-to-answer", rating: 4.7 },
        { id: 8, title: "Emotional Intelligence at Work", category: "Behavioral", type: "Course", duration: "2 hours", link: "https://www.linkedin.com/learning/topics/emotional-intelligence", rating: 4.5 },
        { id: 9, title: "Handling Difficult Questions", category: "Behavioral", type: "Video", duration: "20 min", link: "https://www.youtube.com/results?search_query=handle+difficult+interview+questions", rating: 4.6 },
        
        // General Interview Prep
        { id: 10, title: "Interview Confidence Building", category: "General", type: "Video", duration: "15 min", link: "https://www.youtube.com/results?search_query=interview+confidence+tips", rating: 4.4 },
        { id: 11, title: "Resume Optimization Tips", category: "General", type: "Article", duration: "10 min", link: "https://www.resumegenius.com/blog/resume-help/how-to-make-a-resume", rating: 4.6 },
        { id: 12, title: "Salary Negotiation Strategies", category: "General", type: "Guide", duration: "30 min", link: "https://www.glassdoor.com/blog/guide/how-to-negotiate-your-salary/", rating: 4.8 }
    ];

    const categories = ['all', 'Communication', 'Technical', 'Behavioral', 'General'];

    // Fetch personalized recommendations
    useEffect(() => {
        const fetchRecommendations = async () => {
            if (!userId) {
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`${API_URL}/recommendations/${userId}`);
                const data = await response.json();

                if (data.success) {
                    setRecommendations(data.recommendations || []);
                    setStatsSummary(data.stats_summary || null);
                }
            } catch (error) {
                console.error('Error fetching recommendations:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendations();
    }, [userId]);

    // Filter resources
    const filteredResources = staticResources.filter(resource => {
        const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             resource.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    // Get icon for resource type
    const getTypeIcon = (type) => {
        switch (type) {
            case 'Video': return <Play size={16} />;
            case 'Article': return <FileText size={16} />;
            case 'Course': return <BookOpen size={16} />;
            case 'Guide': return <Lightbulb size={16} />;
            case 'Practice': return <Target size={16} />;
            default: return <FileText size={16} />;
        }
    };

    // Get color for category
    const getCategoryColor = (category) => {
        switch (category) {
            case 'Communication': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'Technical': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
            case 'Behavioral': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'General': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
            default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
        }
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center">
                    <RefreshCw size={48} className="animate-spin text-cyan-400 mx-auto mb-4" />
                    <p className="text-slate-400">Loading learning resources...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full p-6 max-w-7xl mx-auto overflow-y-auto custom-scrollbar animate-fade-in-up">
            {/* Header */}
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Practice Hub</h2>
                <p className="text-slate-400">Personalized learning resources to help you ace your {userRole} interview.</p>
            </div>

            {/* Stats Summary */}
            {statsSummary && statsSummary.total_interviews > 0 && (
                <Card className="mb-8 bg-gradient-to-r from-slate-900 to-slate-800 border-l-4 border-l-cyan-500">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-cyan-500/20 rounded-xl">
                                <TrendingUp size={24} className="text-cyan-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Your Progress</h3>
                                <p className="text-slate-400 text-sm">
                                    {statsSummary.total_interviews} interviews completed • Average score: {statsSummary.avg_score}%
                                </p>
                            </div>
                        </div>
                        {statsSummary.improvement !== 0 && (
                            <div className={`px-4 py-2 rounded-full ${
                                statsSummary.improvement > 0 
                                    ? 'bg-green-500/20 text-green-400' 
                                    : 'bg-red-500/20 text-red-400'
                            }`}>
                                <span className="font-bold">
                                    {statsSummary.improvement > 0 ? '+' : ''}{statsSummary.improvement}% from last
                                </span>
                            </div>
                        )}
                    </div>
                </Card>
            )}

            {/* Personalized Recommendations */}
            {recommendations.length > 0 && (
                <div className="mb-10">
                    <div className="flex items-center gap-3 mb-6">
                        <Target className="text-cyan-400" size={24} />
                        <h3 className="text-xl font-bold text-white">Recommended for You</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {recommendations.map((rec, idx) => (
                            <Card key={idx} className="border-l-4 border-l-cyan-500 hover:border-l-cyan-400 transition-all group">
                                <div className="flex items-center justify-between mb-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                        rec.priority === 'High' ? 'bg-red-500/20 text-red-400' :
                                        rec.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                        'bg-green-500/20 text-green-400'
                                    }`}>{rec.priority} Priority</span>
                                    <span className={`text-sm font-bold ${
                                        rec.current_score >= 70 ? 'text-green-400' : 
                                        rec.current_score >= 50 ? 'text-yellow-400' : 'text-red-400'
                                    }`}>{rec.current_score}%</span>
                                </div>
                                <h4 className="text-lg font-bold text-white mb-2">{rec.domain}</h4>
                                <div className="mb-4">
                                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                                        <span>Current</span>
                                        <span>Target: {rec.target_score}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all"
                                            style={{ width: `${(rec.current_score / rec.target_score) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                                
                                {rec.resources && rec.resources.length > 0 && (
                                    <div className="space-y-2">
                                        {rec.resources.slice(0, 2).map((resource, ridx) => (
                                            <a 
                                                key={ridx}
                                                href={resource.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 p-2 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-colors"
                                            >
                                                <div className="p-1.5 bg-cyan-500/10 rounded-lg">
                                                    {getTypeIcon(resource.type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-white truncate">{resource.title}</p>
                                                    <p className="text-xs text-slate-500">{resource.type} • {resource.duration}</p>
                                                </div>
                                                <ExternalLink size={14} className="text-slate-500" />
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                    <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search resources..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                selectedCategory === cat
                                    ? 'bg-cyan-500 text-white'
                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                            }`}
                        >
                            {cat === 'all' ? 'All' : cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Resource Library */}
            <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <BookOpen size={20} className="text-purple-400" />
                    Resource Library
                </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredResources.map(resource => (
                    <a
                        key={resource.id}
                        href={resource.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group"
                    >
                        <Card className="h-full hover:border-cyan-500/50 transition-all group-hover:bg-slate-800/70">
                            <div className="flex items-start justify-between mb-3">
                                <div className={`p-2 rounded-lg ${getCategoryColor(resource.category)}`}>
                                    {getTypeIcon(resource.type)}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Star size={14} className="text-yellow-500 fill-yellow-500" />
                                    <span className="text-sm text-slate-400">{resource.rating}</span>
                                </div>
                            </div>
                            <h4 className="text-white font-medium mb-2 group-hover:text-cyan-400 transition-colors">
                                {resource.title}
                            </h4>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-1 rounded-full text-xs border ${getCategoryColor(resource.category)}`}>
                                        {resource.category}
                                    </span>
                                    <span className="text-xs text-slate-500 flex items-center gap-1">
                                        <Clock size={12} />
                                        {resource.duration}
                                    </span>
                                </div>
                                <ExternalLink size={14} className="text-slate-500 group-hover:text-cyan-400" />
                            </div>
                        </Card>
                    </a>
                ))}
            </div>

            {filteredResources.length === 0 && (
                <div className="text-center py-12">
                    <Search size={48} className="mx-auto text-slate-600 mb-4" />
                    <h4 className="text-xl font-bold text-slate-400 mb-2">No resources found</h4>
                    <p className="text-slate-500">Try adjusting your search or filter criteria</p>
                </div>
            )}

            {/* Tips Section */}
            <Card className="mt-10 bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-purple-500/30">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-purple-500/20 rounded-xl">
                        <Award size={24} className="text-purple-400" />
                    </div>
                    <div>
                        <h4 className="text-lg font-bold text-white mb-2">Pro Tip</h4>
                        <p className="text-slate-300">
                            Spend at least 30 minutes daily practicing with these resources. 
                            Focus on your weak areas identified in the Analytics section for maximum improvement. 
                            Remember: consistent practice beats cramming!
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default PracticeHubView;
