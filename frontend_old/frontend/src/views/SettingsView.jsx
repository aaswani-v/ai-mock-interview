import React from 'react';
import { Moon, Bell, Trash2 } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const SettingsView = ({ onNavigate }) => (
    <div className="h-full p-6 max-w-4xl mx-auto animate-fade-in-up">
        <h2 className="text-3xl font-bold text-white mb-8">Settings</h2>
        <div className="space-y-6">
            <Card>
                <h3 className="font-bold text-xl text-white mb-4 border-b border-slate-700 pb-2">Account</h3>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center font-bold text-slate-400">AL</div>
                        <div>
                            <div className="font-bold text-white">Alex Lewis</div>
                            <div className="text-xs text-slate-500">alex@example.com</div>
                        </div>
                    </div>
                    <Button variant="secondary" onClick={() => onNavigate('profile')}>Manage Profile</Button>
                </div>
            </Card>

            <Card>
                <h3 className="font-bold text-xl text-white mb-4 border-b border-slate-700 pb-2">Preferences</h3>
                <div className="space-y-4">
                    <div className="flex justify-between items-center p-2 hover:bg-slate-800/30 rounded-lg transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-800 rounded-lg"><Moon size={18} className="text-slate-400" /></div>
                            <span className="text-slate-300">Dark Mode</span>
                        </div>
                        <div className="w-12 h-6 bg-cyan-600 rounded-full relative cursor-pointer"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div></div>
                    </div>
                    <div className="flex justify-between items-center p-2 hover:bg-slate-800/30 rounded-lg transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-800 rounded-lg"><Bell size={18} className="text-slate-400" /></div>
                            <span className="text-slate-300">Email Notifications</span>
                        </div>
                        <div className="w-12 h-6 bg-cyan-600 rounded-full relative cursor-pointer"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div></div>
                    </div>
                </div>
            </Card>

            <Card className="border-red-900/20">
                <h3 className="font-bold text-xl text-red-400 mb-4 border-b border-red-900/20 pb-2">Danger Zone</h3>
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="text-slate-200 font-medium">Delete Account</h4>
                        <p className="text-xs text-slate-500">Permanently remove your data</p>
                    </div>
                    <Button variant="danger" icon={Trash2}>Delete</Button>
                </div>
            </Card>
        </div>
    </div>
);

export default SettingsView;
