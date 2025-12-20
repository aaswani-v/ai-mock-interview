import React, { useState } from 'react';
import {
    LayoutGrid, User, Mic, BarChart2, Target, Medal, BookOpen, FileText, Settings, Zap, LogOut, Menu, X
} from 'lucide-react';

const MobileNav = ({ currentView, setView, onLogout }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    // Get user data from localStorage
    const savedUser = localStorage.getItem('user');
    const userData = savedUser ? JSON.parse(savedUser) : {};
    const userName = userData?.name || 'User';
    
    // Generate initials from name
    const getInitials = (name) => {
        if (!name) return 'U';
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'interview', label: 'Interview', icon: Mic },
        { id: 'analytics', label: 'Analytics', icon: BarChart2 },
        { id: 'growth', label: 'Growth Plan', icon: Target },
        { id: 'achievements', label: 'Achievements', icon: Medal },
        { id: 'resources', label: 'Resources', icon: BookOpen },
        { id: 'resume-upload', label: 'Resume', icon: FileText },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    const handleNavClick = (id) => {
        setView(id);
        setIsOpen(false);
    };

    return (
        <>
            {/* Mobile Header Bar */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#050510]/95 backdrop-blur-lg border-b border-slate-800 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400 border border-cyan-500/30">
                        <Zap size={16} fill="currentColor" />
                    </div>
                    <span className="font-bold text-white text-lg">INTERAURA</span>
                </div>
                
                <button 
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 rounded-lg bg-slate-800/50 text-white"
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {isOpen && (
                <div 
                    className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Mobile Slide-out Menu */}
            <div className={`md:hidden fixed top-0 right-0 bottom-0 z-50 w-72 bg-[#050510] border-l border-slate-800 transform transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="p-4 pt-16 pb-8 h-full flex flex-col">
                    {/* User Profile */}
                    <div className="mb-6 p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center font-bold text-white">
                                {getInitials(userName)}
                            </div>
                            <div>
                                <div className="text-white font-bold">{userName}</div>
                                <div className="text-xs text-slate-500">Welcome back!</div>
                            </div>
                        </div>
                    </div>

                    {/* Menu Items */}
                    <div className="flex-1 space-y-1 overflow-y-auto">
                        {menuItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => handleNavClick(item.id)}
                                className={`w-full text-left px-4 py-3 rounded-xl flex gap-4 items-center transition-all duration-200 ${
                                    currentView === item.id 
                                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' 
                                        : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                                }`}
                            >
                                <item.icon size={20} className={currentView === item.id ? 'text-cyan-400' : 'text-slate-500'} />
                                <span className="font-medium">{item.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Logout Button */}
                    <div className="pt-4 border-t border-slate-800 mt-4 pb-safe">
                        <button
                            onClick={() => {
                                onLogout();
                                setIsOpen(false);
                            }}
                            className="w-full flex items-center gap-3 p-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                        >
                            <LogOut size={20} />
                            <span className="font-medium">Logout</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom Navigation Bar for quick access */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#050510]/95 backdrop-blur-lg border-t border-slate-800 px-2 py-2 flex justify-around">
                {[
                    { id: 'dashboard', icon: LayoutGrid },
                    { id: 'interview', icon: Mic },
                    { id: 'analytics', icon: BarChart2 },
                    { id: 'resources', icon: BookOpen },
                    { id: 'profile', icon: User },
                ].map(item => (
                    <button
                        key={item.id}
                        onClick={() => setView(item.id)}
                        className={`p-3 rounded-xl transition-all ${
                            currentView === item.id 
                                ? 'bg-cyan-500/20 text-cyan-400' 
                                : 'text-slate-500 hover:text-white'
                        }`}
                    >
                        <item.icon size={22} />
                    </button>
                ))}
            </div>
        </>
    );
};

export default MobileNav;
