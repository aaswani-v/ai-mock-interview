import React from 'react';
import { Target, CheckCircle, Clock, Calendar } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { MOCK_TASKS, MOCK_GOALS } from '../data/mockData';

const GrowthView = () => (
    <div className="h-full p-6 max-w-7xl mx-auto overflow-y-auto custom-scrollbar animate-fade-in-up">
        <div className="flex justify-between items-end mb-8">
            <div>
                <h2 className="text-3xl font-bold text-white mb-2">Growth Plan</h2>
                <p className="text-slate-400">Track your goals, tasks, and habits.</p>
            </div>
            <Button icon={Target} variant="primary">Add New Goal</Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Goal Setting Engine */}
            <div className="col-span-1 space-y-6">
                <h3 className="font-bold text-xl text-slate-200 flex items-center gap-2"><Target className="text-purple-400" /> Active Goals</h3>
                {MOCK_GOALS.map(goal => (
                    <Card key={goal.id} className="group hover:border-purple-500/30 transition-all">
                        <div className="flex justify-between mb-2">
                            <h4 className="font-bold text-white">{goal.title}</h4>
                            <span className="text-xs font-bold text-purple-400">{Math.round((goal.current / goal.target) * 100)}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-2">
                            <div className="h-full bg-purple-500 rounded-full" style={{ width: `${(goal.current / goal.target) * 100}%` }}></div>
                        </div>
                        <p className="text-xs text-slate-500">{goal.current} / {goal.target} completed</p>
                    </Card>
                ))}
                <Card className="border-dashed border-2 border-slate-700 bg-transparent flex items-center justify-center py-8 cursor-pointer hover:bg-slate-800/50">
                    <div className="text-slate-500 flex flex-col items-center">
                        <Target size={24} className="mb-2" />
                        <span>Create Custom Goal</span>
                    </div>
                </Card>
            </div>

            {/* Kanban Task Board (Simplified) */}
            <div className="col-span-2">
                <h3 className="font-bold text-xl text-slate-200 flex items-center gap-2 mb-6"><CheckCircle className="text-cyan-400" /> Daily Priorities</h3>
                <div className="space-y-4">
                    {MOCK_TASKS.map(task => (
                        <div key={task.id} className="flex items-center justify-between p-4 bg-slate-900 border border-slate-700 rounded-2xl hover:border-cyan-500/30 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer ${task.status === 'done' ? 'bg-green-500 border-green-500 text-white' : 'border-slate-500'}`}>
                                    {task.status === 'done' && <CheckCircle size={14} />}
                                </div>
                                <div>
                                    <h4 className={`font-bold ${task.status === 'done' ? 'text-slate-500 line-through' : 'text-white'}`}>{task.title}</h4>
                                    <div className="flex gap-4 mt-1">
                                        <span className="text-xs text-slate-500 flex items-center gap-1"><Clock size={12} /> Today</span>
                                        <span className={`text-xs font-bold px-2 rounded-full ${task.priority === 'High' ? 'bg-red-500/20 text-red-300' : task.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-blue-500/20 text-blue-300'}`}>{task.priority}</span>
                                    </div>
                                </div>
                            </div>
                            <Button variant="ghost" className="text-xs py-1 px-3">Details</Button>
                        </div>
                    ))}
                    <Button variant="secondary" className="w-full border-dashed border-slate-700" icon={Calendar}>View Full Schedule</Button>
                </div>
            </div>
        </div>
    </div>
);

export default GrowthView;
