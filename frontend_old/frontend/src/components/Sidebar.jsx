import React from 'react';
import {
    LayoutGrid, User, Mic, BarChart2, Target, Medal, BookOpen, FileText, Settings, Zap, LogOut
} from 'lucide-react';

const Sidebar = ({ currentView, setView, onLogout }) => {
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'mode-selection', label: 'Interview', icon: Mic },
        { id: 'analytics', label: 'Analytics', icon: BarChart2 },
        { id: 'growth', label: 'Growth Plan', icon: Target },
        { id: 'achievements', label: 'Achievements', icon: Medal },
        { id: 'resources', label: 'Resources', icon: BookOpen },
        { id: 'resume-insights', label: 'Resume', icon: FileText },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    return (
        <div className="hidden md:flex flex-col bg-[#050510] border-r border-slate-800 h-full p-4 transition-all duration-300 w-20 hover:w-64 group z-30 absolute left-0 top-0 bottom-0 shadow-2xl">
            <div className="text-xl font-bold text-white mb-10 flex items-center gap-3 px-1 py-2 overflow-hidden whitespace-nowrap">
                <div className="w-10 h-10 min-w-[2.5rem] rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400 border border-cyan-500/30">
                    <Zap size={20} fill="currentColor" />
                </div>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">INTERAURA</span>
            </div>

            <div className="flex-1 space-y-1 overflow-hidden">
                {menuItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => setView(item.id)}
                        className={`w-full text-left px-3 py-3 rounded-xl flex gap-4 items-center transition-all duration-200 whitespace-nowrap overflow-hidden ${currentView === item.id ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'}`}
                    >
                        <item.icon size={24} className={`min-w-[24px] transition-colors ${currentView === item.id ? 'text-cyan-400' : 'text-slate-500'}`} />
                        <span className="font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">{item.label}</span>
                        {currentView === item.id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_cyan] opacity-0 group-hover:opacity-100"></div>}
                    </button>
                ))}
            </div>

            <div className="pt-4 border-t border-slate-800 mt-4 px-1 overflow-hidden">
                <div
                    onClick={onLogout}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800/50 cursor-pointer transition-colors whitespace-nowrap"
                >
                    <div className="w-10 h-10 min-w-[2.5rem] rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center font-bold text-white text-sm">AL</div>
                    <div className="flex-1 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="text-sm font-bold text-white truncate">Alex Lewis</div>
                        <div className="text-xs text-slate-500 truncate">Click to Logout</div>
                    </div>
                    <LogOut size={16} className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100" />
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
