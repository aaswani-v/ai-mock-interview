import React from 'react';
import { MapPin, Edit3, Flame, CheckCircle, Award, User, Target, Zap, Globe, Smartphone } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

const ProfileView = ({ profile, onNavigate }) => (
    <div className="h-full p-6 max-w-4xl mx-auto animate-fade-in-up">
        <div className="relative mb-20">
            <div className="h-48 w-full bg-gradient-to-r from-cyan-600 to-blue-600 rounded-3xl relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            </div>
            <div className="absolute -bottom-16 left-8 flex items-end gap-6">
                <div className="w-32 h-32 rounded-full bg-slate-900 p-1.5 shadow-xl">
                    <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center text-4xl font-bold text-slate-400 border border-slate-700">
                        AL
                    </div>
                </div>
                <div className="mb-4">
                    <h2 className="text-3xl font-bold text-white">Alex Lewis</h2>
                    <p className="text-slate-400 flex items-center gap-2"><MapPin size={16} /> New York, USA</p>
                </div>
            </div>
            <div className="absolute -bottom-16 right-8 flex gap-3">
                <Button variant="secondary" icon={Edit3}>Edit Profile</Button>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="flex items-center gap-4">
                <div className="p-3 bg-orange-500/10 rounded-xl text-orange-400"><Flame size={24} /></div>
                <div>
                    <div className="text-2xl font-bold text-white">12</div>
                    <div className="text-xs text-slate-500">Day Streak</div>
                </div>
            </Card>
            <Card className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400"><CheckCircle size={24} /></div>
                <div>
                    <div className="text-2xl font-bold text-white">45</div>
                    <div className="text-xs text-slate-500">Questions Solved</div>
                </div>
            </Card>
            <Card className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400"><Award size={24} /></div>
                <div>
                    <div className="text-2xl font-bold text-white">Top 10%</div>
                    <div className="text-xs text-slate-500">Global Rank</div>
                </div>
            </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
                <Card>
                    <h3 className="font-bold text-xl text-white mb-6 flex items-center gap-2"><User size={20} className="text-cyan-400" /> Personal Information</h3>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Full Name</label>
                            <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700 text-slate-200">Alex Lewis</div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Email</label>
                            <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700 text-slate-200">alex@example.com</div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Phone</label>
                            <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700 text-slate-200">+1 (555) 000-0000</div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Location</label>
                            <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700 text-slate-200">New York, USA</div>
                        </div>
                    </div>
                </Card>

                <Card>
                    <h3 className="font-bold text-xl text-white mb-6 flex items-center gap-2"><Target size={20} className="text-purple-400" /> Career Goals</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Target Role</label>
                            <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700 text-white font-medium flex justify-between items-center">
                                {profile.role || 'Not Set'}
                                <Badge variant="info">Primary</Badge>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Experience Level</label>
                            <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700 text-white font-medium">
                                {profile.experience || 'Not Set'}
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Current Focus</label>
                            <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700 text-white font-medium">
                                {profile.goal || 'Not Set'}
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="space-y-6">
                <Card className="bg-gradient-to-b from-slate-900 to-slate-800">
                    <h3 className="font-bold text-white mb-4">Subscription</h3>
                    <div className="text-center py-4">
                        <div className="inline-block p-3 rounded-full bg-slate-800 mb-2"><Zap size={24} className="text-slate-500" /></div>
                        <div className="text-lg font-bold text-slate-300">Free Plan</div>
                        <p className="text-xs text-slate-500 mb-4">Limited daily interviews</p>
                        <Button variant="primary" className="w-full text-sm">Upgrade to Pro</Button>
                    </div>
                </Card>

                <Card>
                    <h3 className="font-bold text-white mb-4">Linked Accounts</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-700">
                            <div className="flex items-center gap-3">
                                <Globe size={18} className="text-slate-400" /> <span className="text-sm text-slate-300">Google</span>
                            </div>
                            <CheckCircle size={16} className="text-green-500" />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-700">
                            <div className="flex items-center gap-3">
                                <Smartphone size={18} className="text-slate-400" /> <span className="text-sm text-slate-300">Apple</span>
                            </div>
                            <div className="text-xs text-cyan-400 cursor-pointer">Connect</div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    </div>
);

export default ProfileView;
