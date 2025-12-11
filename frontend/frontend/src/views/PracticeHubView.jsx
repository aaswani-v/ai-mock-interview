import React from 'react';
import { BookOpen, Search, Clock, CheckCircle, Bookmark, Share2, ExternalLink } from 'lucide-react';
import Input from '../components/ui/Input';

const PracticeHubView = () => (
    <div className="h-full p-6 max-w-7xl mx-auto overflow-y-auto custom-scrollbar animate-fade-in-up">
        <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-white">Resources Library</h2>
            <div className="flex gap-4 w-1/3">
                <Input icon={Search} placeholder="Search guides, videos..." />
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
                { t: "Mastering the STAR Method", type: "Guide", time: "5 min read", img: "bg-blue-900", link: "#" },
                { t: "System Design: Load Balancers", type: "Video", time: "12 min watch", img: "bg-purple-900", link: "#" },
                { t: "React Reconciliation Explained", type: "Article", time: "8 min read", img: "bg-cyan-900", link: "#" },
                { t: "Negotiating Your Salary", type: "Guide", time: "6 min read", img: "bg-green-900", link: "#" },
                { t: "Top 50 Behavioral Questions", type: "List", time: "15 min read", img: "bg-orange-900", link: "#" }
            ].map((res, i) => (
                <a key={i} href={res.link} target="_blank" rel="noopener noreferrer" className="block group bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden cursor-pointer hover:border-cyan-500/50 transition-all hover:translate-y-[-2px]">
                    <div className={`h-40 w-full ${res.img} opacity-50 group-hover:opacity-70 transition-opacity flex items-center justify-center relative`}>
                        <BookOpen className="text-white opacity-20" size={48} />
                        <div className="absolute top-4 right-4 bg-black/50 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><ExternalLink size={16} className="text-white" /></div>
                    </div>
                    <div className="p-5">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">{res.type}</span>
                            <span className="text-xs text-slate-500 flex items-center gap-1"><Clock size={12} /> {res.time}</span>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-4 group-hover:text-cyan-300 transition-colors">{res.t}</h3>
                        <div className="flex justify-between items-center border-t border-slate-800 pt-4">
                            <div className="text-xs text-green-400 flex items-center gap-1"><CheckCircle size={12} /> Verified</div>
                            <div className="flex gap-2">
                                <button className="text-slate-400 hover:text-white transition-colors"><Bookmark size={18} /></button>
                                <button className="text-slate-400 hover:text-white transition-colors"><Share2 size={18} /></button>
                            </div>
                        </div>
                    </div>
                </a>
            ))}
        </div>
    </div>
);

export default PracticeHubView;
