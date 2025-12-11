import React from 'react';
import {
    Brain, FileText, Target, Activity, Star, Zap, ArrowRight, ChevronRight,
    BookOpen, Layers
} from 'lucide-react';
import OrbitalSystem from '../components/visuals/OrbitalSystem';
import AdvancedBot from '../components/visuals/AdvancedBot';
import AdvancedResumeScanner from '../components/visuals/AdvancedResumeScanner';
import AnimatedGraph from '../components/visuals/AnimatedGraph';
import AdvancedBadge from '../components/visuals/AdvancedBadge';
import AutoChecklist from '../components/visuals/AutoChecklist';
import TiltCard from '../components/ui/TiltCard';
import Button from '../components/ui/Button';

const LandingView = ({ onStart }) => {
    return (
        <div className="relative w-full h-full overflow-y-auto custom-scrollbar overflow-x-hidden text-slate-200 font-sans selection:bg-cyan-500/30">
            <div className="flex flex-col items-center w-full relative">
                {/* GLOBAL BACKGROUND PARTICLES */}

                {/* HERO SECTION */}
                <div className="relative min-h-screen w-full flex flex-col items-center justify-center py-20 z-10">
                    <div className="absolute inset-0 flex items-center justify-center overflow-hidden opacity-100 pointer-events-none">
                        <OrbitalSystem centerIcon={Brain} orbitingIcons={[FileText, Target, Activity]} label="" color="cyan" delay={0} />
                        <div className="absolute w-[800px] h-[800px] border border-purple-500/20 rounded-full animate-spin-slow" style={{ animationDuration: '60s' }}></div>
                        <div className="absolute w-[450px] h-[450px] border-2 border-green-500/10 rounded-full animate-spin-slow" style={{ animationDuration: '30s', animationDirection: 'reverse' }}></div>
                    </div>

                    <div className="relative z-20 text-center max-w-5xl px-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/80 border border-cyan-500/30 text-cyan-400 mb-8 backdrop-blur-md shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                            <Star size={16} className="animate-pulse" />
                            <span className="text-xs font-bold tracking-[0.2em] uppercase">Next Gen Interview Prep</span>
                        </div>

                        <h1 className="text-6xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-400 to-purple-500 text-white mb-8 leading-tight tracking-tight drop-shadow-[0_0_40px_rgba(34,211,238,0.2)] bg-[length:200%_auto] animate-gradient-x hover:bg-right transition-all duration-500 cursor-default">
                            INTERAURA
                        </h1>

                        <div className="h-8 md:h-12 mb-12 flex justify-center">
                            <p className="text-xl md:text-2xl text-slate-400 font-mono border-r-4 border-cyan-500 pr-2 animate-typewriter overflow-hidden whitespace-nowrap w-fit">
                                Real-time mock interviews + personalized feedback
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-center gap-6 mb-24 relative group">
                            <button onClick={onStart} className="relative px-12 py-6 bg-white text-slate-900 text-xl font-bold rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_50px_rgba(255,255,255,0.6)] group">
                                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 opacity-20 group-hover:opacity-40 animate-shine-slow"></div>
                                <span className="relative z-10 flex items-center gap-3">
                                    <Zap className="text-purple-600 group-hover:text-purple-800 transition-colors" fill="currentColor" />
                                    START YOUR JOURNEY
                                    <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                                </span>
                            </button>
                        </div>
                    </div>

                    <div className="absolute bottom-10 animate-bounce text-slate-500 flex flex-col items-center gap-2">
                        <span className="text-xs uppercase tracking-widest">Scroll Down</span>
                        <ChevronRight className="rotate-90" />
                    </div>
                </div>

                {/* SCROLL JOURNEY */}
                <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-20 space-y-40">
                    <div className="flex flex-col md:flex-row items-center justify-center gap-16">
                        <div className="order-2 md:order-1 max-w-md text-center md:text-right">
                            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">AI Interviewer</h2>
                            <p className="text-slate-400 text-lg">Meet your 24/7 mock interviewer. It adapts to your tone, asks follow-up questions, and simulates real interview pressure.</p>
                        </div>
                        <div className="order-1 md:order-2"><AdvancedBot /></div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-16">
                        <div><AdvancedResumeScanner /></div>
                        <div className="max-w-md text-center md:text-left">
                            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Smart Resume Analysis</h2>
                            <p className="text-slate-400 text-lg">Our engine scans your resume in seconds, identifying key skills and generating questions specifically tailored to your profile.</p>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-16">
                        <div className="order-2 md:order-1 max-w-md text-center md:text-right">
                            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Track Your Growth</h2>
                            <p className="text-slate-400 text-lg">Visualize your progress over time. Watch your confidence and technical accuracy scores climb with every practice session.</p>
                        </div>
                        <div className="order-1 md:order-2"><AnimatedGraph /></div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-16">
                        <div><AdvancedBadge /></div>
                        <div className="max-w-md text-center md:text-left">
                            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Earn Recognition</h2>
                            <p className="text-slate-400 text-lg">Unlock achievements and badges as you master different interview domains. Prove you're in the top 1% of candidates.</p>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-16">
                        <div className="order-2 md:order-1 max-w-md text-center md:text-right">
                            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Automated Roadmap</h2>
                            <p className="text-slate-400 text-lg">Never wonder what to study next. Our AI generates a daily checklist of tasks to keep your preparation on track.</p>
                        </div>
                        <div className="order-1 md:order-2"><AutoChecklist /></div>
                    </div>
                </div>

                {/* CORE MODULES */}
                <div className="relative w-full py-32 px-6 max-w-7xl mx-auto z-10 mt-20">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-500 mb-6">CORE SYSTEM MODULES</h2>
                        <div className="w-32 h-1.5 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 mx-auto rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 perspective-1000">
                        {/* CARD 1: Personalized Resources */}
                        <TiltCard className="h-[450px] flip-card-container group cursor-pointer border-none bg-transparent shadow-none hover:shadow-none">
                            <div className="flip-card-inner">
                                {/* FRONT */}
                                <div className="flip-card-front bg-white/5 border border-white/10 backdrop-blur-xl">
                                    <div className="absolute inset-0 p-8 flex flex-col items-center text-center">
                                        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 flex items-center justify-center mb-8 border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.2)] group-hover:scale-110 transition-transform duration-500 relative overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent animate-pulse"></div>
                                            <BookOpen size={48} className="text-cyan-300 relative z-10" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-cyan-300 transition-colors">Personalized Resources</h3>
                                        <p className="text-slate-300 leading-relaxed text-sm">Curated learning materials hand-picked by AI based on your specific performance gaps.</p>
                                        <div className="mt-auto w-full pt-6 border-t border-white/5">
                                            <span className="text-cyan-400 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2">Hover for Details <ArrowRight size={14} /></span>
                                        </div>
                                    </div>
                                </div>
                                {/* BACK */}
                                <div className="flip-card-back bg-slate-900 border border-cyan-500/30 flex flex-col items-center justify-center p-8 text-center bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
                                    <BookOpen size={48} className="text-cyan-500 mb-6" />
                                    <h3 className="text-xl font-bold text-white mb-4">What You Get</h3>
                                    <p className="text-slate-300 leading-relaxed">
                                        Access over <span className="text-cyan-400 font-bold">500+ coding problems</span>, in-depth system design guides, and behavioral interview cheatsheets tailored exactly to your current skill level.
                                    </p>
                                    <Button variant="primary" className="mt-8 text-sm py-2">Start Learning</Button>
                                </div>
                            </div>
                        </TiltCard>

                        {/* CARD 2: Adaptive Difficulty */}
                        <TiltCard className="h-[450px] flip-card-container group cursor-pointer border-none bg-transparent shadow-none hover:shadow-none">
                            <div className="flip-card-inner">
                                {/* FRONT */}
                                <div className="flip-card-front bg-white/5 border border-white/10 backdrop-blur-xl">
                                    <div className="absolute inset-0 p-8 flex flex-col items-center text-center">
                                        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-8 border border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.2)] group-hover:scale-110 transition-transform duration-500 relative overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-t from-purple-500/10 to-transparent animate-pulse"></div>
                                            <Layers size={48} className="text-purple-300 relative z-10" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-purple-300 transition-colors">Adaptive Difficulty</h3>
                                        <p className="text-slate-300 leading-relaxed text-sm">Dynamic questioning engine that adjusts complexity in real-time based on your previous answers.</p>
                                        <div className="mt-auto w-full pt-6 border-t border-white/5">
                                            <span className="text-purple-400 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2">Hover for Details <ArrowRight size={14} /></span>
                                        </div>
                                    </div>
                                </div>
                                {/* BACK */}
                                <div className="flip-card-back bg-slate-900 border border-purple-500/30 flex flex-col items-center justify-center p-8 text-center">
                                    <Layers size={48} className="text-purple-500 mb-6" />
                                    <h3 className="text-xl font-bold text-white mb-4">How It Works</h3>
                                    <p className="text-slate-300 leading-relaxed">
                                        The engine starts with easy questions to build confidence, then rapidly scales to <span className="text-purple-400 font-bold">FAANG-level hard problems</span> as you demonstrate proficiency.
                                    </p>
                                    <Button variant="primary" className="mt-8 text-sm py-2 !bg-purple-600 !shadow-purple-500/30">Challenge Mode</Button>
                                </div>
                            </div>
                        </TiltCard>

                        {/* CARD 3: Real-time Feedback */}
                        <TiltCard className="h-[450px] flip-card-container group cursor-pointer border-none bg-transparent shadow-none hover:shadow-none">
                            <div className="flip-card-inner">
                                {/* FRONT */}
                                <div className="flip-card-front bg-white/5 border border-white/10 backdrop-blur-xl">
                                    <div className="absolute inset-0 p-8 flex flex-col items-center text-center">
                                        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-green-500/20 to-emerald-500/20 flex items-center justify-center mb-8 border border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.2)] group-hover:scale-110 transition-transform duration-500 relative overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-t from-green-500/10 to-transparent animate-pulse"></div>
                                            <Activity size={48} className="text-green-300 relative z-10" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-green-300 transition-colors">Real-time Feedback</h3>
                                        <p className="text-slate-300 leading-relaxed text-sm">Instant, granular analysis of your communication style, technical accuracy, and pacing.</p>
                                        <div className="mt-auto w-full pt-6 border-t border-white/5">
                                            <span className="text-green-400 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2">Hover for Details <ArrowRight size={14} /></span>
                                        </div>
                                    </div>
                                </div>
                                {/* BACK */}
                                <div className="flip-card-back bg-slate-900 border border-green-500/30 flex flex-col items-center justify-center p-8 text-center">
                                    <Activity size={48} className="text-green-500 mb-6" />
                                    <h3 className="text-xl font-bold text-white mb-4">Deep Analytics</h3>
                                    <p className="text-slate-300 leading-relaxed">
                                        Our AI analyzes your <span className="text-green-400 font-bold">speech rate, filler words, body language</span>, and code optimality to provide a comprehensive scorecard after every session.
                                    </p>
                                    <Button variant="primary" className="mt-8 text-sm py-2 !bg-green-600 !shadow-green-500/30">View Analytics</Button>
                                </div>
                            </div>
                        </TiltCard>
                    </div>
                </div>

                <div className="h-20"></div>
            </div>
        </div>
    );
};

export default LandingView;
