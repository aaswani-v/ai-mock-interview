import React, { useState, useEffect } from 'react';
import { Moon, Bell, Trash2, LogOut, Sun } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const SettingsView = ({ onNavigate, onLogout }) => {
    // Get user data from localStorage
    const savedUser = localStorage.getItem('user');
    const userData = savedUser ? JSON.parse(savedUser) : {};
    
    const userName = userData?.name || 'User';
    const userEmail = userData?.email || 'Not set';
    
    // Generate initials from name
    const getInitials = (name) => {
        if (!name) return 'U';
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    // Dark mode state (always dark by default since app is dark themed)
    const [darkMode, setDarkMode] = useState(true);
    const [notifications, setNotifications] = useState(true);

    // Handle logout
    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('session');
        if (onLogout) {
            onLogout();
        } else {
            window.location.reload();
        }
    };

    return (
        <div className="h-full overflow-y-auto p-6 max-w-4xl mx-auto animate-fade-in-up">
            <h2 className="text-3xl font-bold text-white mb-8">Settings</h2>
            <div className="space-y-6">
                <Card>
                    <h3 className="font-bold text-xl text-white mb-4 border-b border-slate-700 pb-2">Account</h3>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white">
                                {getInitials(userName)}
                            </div>
                            <div>
                                <div className="font-bold text-white">{userName}</div>
                                <div className="text-xs text-slate-500">{userEmail}</div>
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
                                <div className="p-2 bg-slate-800 rounded-lg">
                                    {darkMode ? <Moon size={18} className="text-cyan-400" /> : <Sun size={18} className="text-yellow-400" />}
                                </div>
                                <span className="text-slate-300">Dark Mode</span>
                            </div>
                            <div 
                                onClick={() => setDarkMode(!darkMode)}
                                className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${darkMode ? 'bg-cyan-600' : 'bg-slate-600'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${darkMode ? 'right-1' : 'left-1'}`}></div>
                            </div>
                        </div>
                        <div className="flex justify-between items-center p-2 hover:bg-slate-800/30 rounded-lg transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-800 rounded-lg"><Bell size={18} className="text-slate-400" /></div>
                                <span className="text-slate-300">Email Notifications</span>
                            </div>
                            <div 
                                onClick={() => setNotifications(!notifications)}
                                className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${notifications ? 'bg-cyan-600' : 'bg-slate-600'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${notifications ? 'right-1' : 'left-1'}`}></div>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card>
                    <h3 className="font-bold text-xl text-white mb-4 border-b border-slate-700 pb-2">Session</h3>
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="text-slate-200 font-medium">Sign Out</h4>
                            <p className="text-xs text-slate-500">Sign out from your account</p>
                        </div>
                        <Button variant="secondary" icon={LogOut} onClick={handleLogout}>Logout</Button>
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
};

export default SettingsView;
