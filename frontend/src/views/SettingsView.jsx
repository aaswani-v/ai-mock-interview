import React, { useState, useEffect } from 'react';
import { Moon, Bell, Trash2, LogOut, Sun, User, Shield, Download, HelpCircle, ChevronRight } from 'lucide-react';
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

    // Load preferences from localStorage
    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem('settings_darkMode');
        return saved !== null ? JSON.parse(saved) : true;
    });
    
    const [notifications, setNotifications] = useState(() => {
        const saved = localStorage.getItem('settings_notifications');
        return saved !== null ? JSON.parse(saved) : true;
    });

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Save preferences to localStorage
    useEffect(() => {
        localStorage.setItem('settings_darkMode', JSON.stringify(darkMode));
    }, [darkMode]);

    useEffect(() => {
        localStorage.setItem('settings_notifications', JSON.stringify(notifications));
    }, [notifications]);

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

    // Handle delete account
    const handleDeleteAccount = () => {
        // Clear all localStorage data
        localStorage.clear();
        if (onLogout) {
            onLogout();
        } else {
            window.location.reload();
        }
    };

    // Export user data
    const handleExportData = () => {
        const data = {
            user: userData,
            interviews: JSON.parse(localStorage.getItem('interviewHistory') || '[]'),
            goals: JSON.parse(localStorage.getItem('growthGoals') || '[]'),
            tasks: JSON.parse(localStorage.getItem('growthTasks') || '[]'),
            settings: {
                darkMode,
                notifications
            }
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `interaura-data-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const stats = {
        interviews: JSON.parse(localStorage.getItem('interview_history') || '[]').length,
        streak: parseInt(localStorage.getItem('practice_streak') || '0'),
        goalsCompleted: JSON.parse(localStorage.getItem('growthGoals') || '[]').filter(g => g.current >= g.target).length
    };

    return (
        <div className="min-h-full overflow-y-auto p-4 sm:p-6 max-w-4xl mx-auto animate-fade-in-up">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8">Settings</h2>
            
            <div className="space-y-4 sm:space-y-6">
                {/* Account Section */}
                <Card>
                    <h3 className="font-bold text-lg sm:text-xl text-white mb-4 border-b border-slate-700 pb-2">Account</h3>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white text-lg">
                                {getInitials(userName)}
                            </div>
                            <div>
                                <div className="font-bold text-white text-sm sm:text-base">{userName}</div>
                                <div className="text-xs sm:text-sm text-slate-500">{userEmail}</div>
                            </div>
                        </div>
                        <Button variant="secondary" onClick={() => onNavigate('profile')} className="w-full sm:w-auto">
                            Manage Profile
                        </Button>
                    </div>
                    
                    {/* Quick Stats */}
                    <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-3 gap-2 sm:gap-4">
                        <div className="text-center p-2 sm:p-3 bg-slate-800/50 rounded-xl">
                            <div className="text-lg sm:text-xl font-bold text-cyan-400">{stats.interviews}</div>
                            <div className="text-xs text-slate-500">Interviews</div>
                        </div>
                        <div className="text-center p-2 sm:p-3 bg-slate-800/50 rounded-xl">
                            <div className="text-lg sm:text-xl font-bold text-orange-400">{stats.streak}</div>
                            <div className="text-xs text-slate-500">Day Streak</div>
                        </div>
                        <div className="text-center p-2 sm:p-3 bg-slate-800/50 rounded-xl">
                            <div className="text-lg sm:text-xl font-bold text-green-400">{stats.goalsCompleted}</div>
                            <div className="text-xs text-slate-500">Goals Done</div>
                        </div>
                    </div>
                </Card>

                {/* Preferences Section */}
                <Card>
                    <h3 className="font-bold text-lg sm:text-xl text-white mb-4 border-b border-slate-700 pb-2">Preferences</h3>
                    <div className="space-y-3 sm:space-y-4">
                        {/* Dark Mode Toggle */}
                        <div className="flex justify-between items-center p-2 sm:p-3 hover:bg-slate-800/30 rounded-lg transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-800 rounded-lg">
                                    {darkMode ? <Moon size={18} className="text-cyan-400" /> : <Sun size={18} className="text-yellow-400" />}
                                </div>
                                <div>
                                    <span className="text-slate-300 text-sm sm:text-base">Dark Mode</span>
                                    <p className="text-xs text-slate-500 hidden sm:block">Use dark theme across the app</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setDarkMode(!darkMode)}
                                className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${darkMode ? 'bg-cyan-600' : 'bg-slate-600'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${darkMode ? 'right-1' : 'left-1'}`}></div>
                            </button>
                        </div>
                        
                        {/* Notifications Toggle */}
                        <div className="flex justify-between items-center p-2 sm:p-3 hover:bg-slate-800/30 rounded-lg transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-800 rounded-lg">
                                    <Bell size={18} className={notifications ? 'text-cyan-400' : 'text-slate-400'} />
                                </div>
                                <div>
                                    <span className="text-slate-300 text-sm sm:text-base">Notifications</span>
                                    <p className="text-xs text-slate-500 hidden sm:block">Receive practice reminders</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setNotifications(!notifications)}
                                className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${notifications ? 'bg-cyan-600' : 'bg-slate-600'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${notifications ? 'right-1' : 'left-1'}`}></div>
                            </button>
                        </div>
                    </div>
                </Card>

                {/* Data & Privacy Section */}
                <Card>
                    <h3 className="font-bold text-lg sm:text-xl text-white mb-4 border-b border-slate-700 pb-2">Data & Privacy</h3>
                    <div className="space-y-2">
                        <button 
                            onClick={handleExportData}
                            className="w-full flex items-center justify-between p-3 hover:bg-slate-800/30 rounded-lg transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-800 rounded-lg">
                                    <Download size={18} className="text-slate-400" />
                                </div>
                                <div className="text-left">
                                    <span className="text-slate-300 text-sm sm:text-base">Export Data</span>
                                    <p className="text-xs text-slate-500">Download your interview history</p>
                                </div>
                            </div>
                            <ChevronRight size={18} className="text-slate-500" />
                        </button>
                    </div>
                </Card>

                {/* Session Section */}
                <Card>
                    <h3 className="font-bold text-lg sm:text-xl text-white mb-4 border-b border-slate-700 pb-2">Session</h3>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h4 className="text-slate-200 font-medium text-sm sm:text-base">Sign Out</h4>
                            <p className="text-xs text-slate-500">Sign out from your account</p>
                        </div>
                        <Button variant="secondary" icon={LogOut} onClick={handleLogout} className="w-full sm:w-auto">
                            Logout
                        </Button>
                    </div>
                </Card>

                {/* Danger Zone */}
                <Card className="border-red-900/30">
                    <h3 className="font-bold text-lg sm:text-xl text-red-400 mb-4 border-b border-red-900/20 pb-2">Danger Zone</h3>
                    
                    {!showDeleteConfirm ? (
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h4 className="text-slate-200 font-medium text-sm sm:text-base">Delete Account</h4>
                                <p className="text-xs text-slate-500">Permanently remove all your data</p>
                            </div>
                            <Button variant="danger" icon={Trash2} onClick={() => setShowDeleteConfirm(true)} className="w-full sm:w-auto">
                                Delete
                            </Button>
                        </div>
                    ) : (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                            <p className="text-red-300 text-sm mb-4">
                                ⚠️ This action cannot be undone. All your interviews, goals, and settings will be permanently deleted.
                            </p>
                            <div className="flex gap-3">
                                <Button variant="danger" onClick={handleDeleteAccount} className="flex-1">
                                    Yes, Delete Everything
                                </Button>
                                <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)} className="flex-1">
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    )}
                </Card>

                {/* Help Section */}
                <div className="text-center py-4 text-slate-500 text-sm">
                    <HelpCircle size={16} className="inline mr-1" />
                    Need help? Contact support@interaura.app
                </div>
            </div>
        </div>
    );
};

export default SettingsView;
