import React, { useState, useEffect } from 'react';
import { Target, CheckCircle, Clock, Plus, Trash2, X, Edit2 } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const GrowthView = () => {
    const [goals, setGoals] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [showAddGoal, setShowAddGoal] = useState(false);
    const [showAddTask, setShowAddTask] = useState(false);
    const [newGoal, setNewGoal] = useState({ title: '', target: 5 });
    const [newTask, setNewTask] = useState({ title: '', priority: 'Medium' });

    // Load data from localStorage on mount
    useEffect(() => {
        const savedGoals = JSON.parse(localStorage.getItem('growthGoals') || '[]');
        const savedTasks = JSON.parse(localStorage.getItem('growthTasks') || '[]');
        
        // If no saved data, create default goals based on user stats
        if (savedGoals.length === 0) {
            const history = JSON.parse(localStorage.getItem('interview_history') || '[]');
            const defaultGoals = [
                { id: 1, title: 'Complete 5 Mock Interviews', target: 5, current: history.length },
                { id: 2, title: 'Achieve 80% Average Score', target: 80, current: history.length > 0 
                    ? Math.round(history.reduce((sum, h) => sum + (h.overallScore || h.overall_score || 0), 0) / history.length)
                    : 0 
                }
            ];
            setGoals(defaultGoals);
            localStorage.setItem('growthGoals', JSON.stringify(defaultGoals));
        } else {
            // Update interview count goal dynamically
            const history = JSON.parse(localStorage.getItem('interview_history') || '[]');
            const updatedGoals = savedGoals.map(g => {
                if (g.title.toLowerCase().includes('interview')) {
                    return { ...g, current: Math.min(history.length, g.target) };
                }
                if (g.title.toLowerCase().includes('score')) {
                    const avgScore = history.length > 0 
                        ? Math.round(history.reduce((sum, h) => sum + (h.overallScore || h.overall_score || 0), 0) / history.length)
                        : 0;
                    return { ...g, current: Math.min(avgScore, g.target) };
                }
                return g;
            });
            setGoals(updatedGoals);
        }

        if (savedTasks.length === 0) {
            const defaultTasks = [
                { id: 1, title: 'Practice behavioral questions', priority: 'High', status: 'pending' },
                { id: 2, title: 'Review technical concepts', priority: 'Medium', status: 'pending' },
                { id: 3, title: 'Update resume summary', priority: 'Low', status: 'pending' }
            ];
            setTasks(defaultTasks);
            localStorage.setItem('growthTasks', JSON.stringify(defaultTasks));
        } else {
            setTasks(savedTasks);
        }
    }, []);

    // Save to localStorage whenever data changes
    const saveGoals = (newGoals) => {
        setGoals(newGoals);
        localStorage.setItem('growthGoals', JSON.stringify(newGoals));
    };

    const saveTasks = (newTasks) => {
        setTasks(newTasks);
        localStorage.setItem('growthTasks', JSON.stringify(newTasks));
    };

    // Goal actions
    const addGoal = () => {
        if (!newGoal.title.trim()) return;
        const goal = {
            id: Date.now(),
            title: newGoal.title,
            target: parseInt(newGoal.target) || 5,
            current: 0
        };
        saveGoals([...goals, goal]);
        setNewGoal({ title: '', target: 5 });
        setShowAddGoal(false);
    };

    const deleteGoal = (id) => {
        saveGoals(goals.filter(g => g.id !== id));
    };

    const incrementGoal = (id) => {
        saveGoals(goals.map(g => 
            g.id === id ? { ...g, current: Math.min(g.current + 1, g.target) } : g
        ));
    };

    // Task actions
    const addTask = () => {
        if (!newTask.title.trim()) return;
        const task = {
            id: Date.now(),
            title: newTask.title,
            priority: newTask.priority,
            status: 'pending'
        };
        saveTasks([...tasks, task]);
        setNewTask({ title: '', priority: 'Medium' });
        setShowAddTask(false);
    };

    const toggleTask = (id) => {
        saveTasks(tasks.map(t => 
            t.id === id ? { ...t, status: t.status === 'done' ? 'pending' : 'done' } : t
        ));
    };

    const deleteTask = (id) => {
        saveTasks(tasks.filter(t => t.id !== id));
    };

    const getPriorityColor = (priority) => {
        switch(priority) {
            case 'High': return 'bg-red-500/20 text-red-300';
            case 'Medium': return 'bg-yellow-500/20 text-yellow-300';
            case 'Low': return 'bg-blue-500/20 text-blue-300';
            default: return 'bg-slate-500/20 text-slate-300';
        }
    };

    const completedTasks = tasks.filter(t => t.status === 'done').length;
    const totalTasks = tasks.length;

    return (
        <div className="min-h-full overflow-y-auto p-4 sm:p-6 max-w-7xl mx-auto animate-fade-in-up">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 sm:mb-8 gap-4">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">Growth Plan</h2>
                    <p className="text-slate-400 text-sm sm:text-base">Track your goals, tasks, and progress.</p>
                </div>
                <Button icon={Plus} variant="primary" onClick={() => setShowAddGoal(true)}>
                    <span className="hidden sm:inline">Add New Goal</span>
                    <span className="sm:hidden">Add Goal</span>
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
                {/* Goals Section */}
                <div className="col-span-1 space-y-4 sm:space-y-6">
                    <h3 className="font-bold text-lg sm:text-xl text-slate-200 flex items-center gap-2">
                        <Target className="text-purple-400" size={20} />
                        Active Goals ({goals.length})
                    </h3>
                    
                    {goals.map(goal => {
                        const progress = Math.round((goal.current / goal.target) * 100);
                        const isCompleted = goal.current >= goal.target;
                        
                        return (
                            <Card key={goal.id} className={`group hover:border-purple-500/30 transition-all ${isCompleted ? 'border-green-500/30 bg-green-500/5' : ''}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className={`font-bold text-sm sm:text-base ${isCompleted ? 'text-green-400' : 'text-white'}`}>
                                        {goal.title}
                                        {isCompleted && <CheckCircle size={14} className="inline ml-2" />}
                                    </h4>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-purple-400">{progress}%</span>
                                        <button 
                                            onClick={() => deleteGoal(goal.id)}
                                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-all"
                                        >
                                            <Trash2 size={14} className="text-red-400" />
                                        </button>
                                    </div>
                                </div>
                                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-2">
                                    <div 
                                        className={`h-full rounded-full transition-all duration-500 ${isCompleted ? 'bg-green-500' : 'bg-purple-500'}`}
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-xs text-slate-500">{goal.current} / {goal.target}</p>
                                    {!isCompleted && (
                                        <button 
                                            onClick={() => incrementGoal(goal.id)}
                                            className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                                        >
                                            +1 Progress
                                        </button>
                                    )}
                                </div>
                            </Card>
                        );
                    })}

                    {/* Add Goal Card */}
                    {showAddGoal ? (
                        <Card className="border-purple-500/30">
                            <input
                                type="text"
                                placeholder="Goal title..."
                                value={newGoal.title}
                                onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm mb-3 focus:outline-none focus:border-purple-500"
                            />
                            <div className="flex gap-2 mb-3">
                                <span className="text-slate-400 text-sm">Target:</span>
                                <input
                                    type="number"
                                    value={newGoal.target}
                                    onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
                                    className="w-20 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-white text-sm focus:outline-none focus:border-purple-500"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button variant="primary" onClick={addGoal} className="flex-1 text-sm py-2">Add</Button>
                                <Button variant="ghost" onClick={() => setShowAddGoal(false)} className="text-sm py-2">Cancel</Button>
                            </div>
                        </Card>
                    ) : (
                        <Card 
                            className="border-dashed border-2 border-slate-700 bg-transparent flex items-center justify-center py-6 sm:py-8 cursor-pointer hover:bg-slate-800/50 transition-colors"
                            onClick={() => setShowAddGoal(true)}
                        >
                            <div className="text-slate-500 flex flex-col items-center">
                                <Plus size={24} className="mb-2" />
                                <span className="text-sm">Create Custom Goal</span>
                            </div>
                        </Card>
                    )}
                </div>

                {/* Tasks Section */}
                <div className="col-span-1 lg:col-span-2">
                    <div className="flex justify-between items-center mb-4 sm:mb-6">
                        <h3 className="font-bold text-lg sm:text-xl text-slate-200 flex items-center gap-2">
                            <CheckCircle className="text-cyan-400" size={20} />
                            Daily Tasks 
                            <span className="text-sm font-normal text-slate-500">({completedTasks}/{totalTasks})</span>
                        </h3>
                        <Button variant="ghost" icon={Plus} onClick={() => setShowAddTask(true)} className="text-sm">
                            Add Task
                        </Button>
                    </div>
                    
                    <div className="space-y-3 sm:space-y-4">
                        {/* Add Task Form */}
                        {showAddTask && (
                            <div className="flex gap-2 p-3 sm:p-4 bg-slate-900 border border-cyan-500/30 rounded-xl sm:rounded-2xl">
                                <input
                                    type="text"
                                    placeholder="Task description..."
                                    value={newTask.title}
                                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                                />
                                <select
                                    value={newTask.priority}
                                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                                    className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-2 text-white text-sm focus:outline-none"
                                >
                                    <option value="High">High</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Low">Low</option>
                                </select>
                                <Button variant="primary" onClick={addTask} className="text-sm">Add</Button>
                                <button onClick={() => setShowAddTask(false)} className="p-2 hover:bg-slate-800 rounded-lg">
                                    <X size={18} className="text-slate-400" />
                                </button>
                            </div>
                        )}

                        {/* Task List */}
                        {tasks.map(task => (
                            <div 
                                key={task.id} 
                                className={`group flex items-center justify-between p-3 sm:p-4 bg-slate-900 border rounded-xl sm:rounded-2xl transition-all ${
                                    task.status === 'done' 
                                        ? 'border-green-500/30 bg-green-500/5' 
                                        : 'border-slate-700 hover:border-cyan-500/30'
                                }`}
                            >
                                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                                    <button
                                        onClick={() => toggleTask(task.id)}
                                        className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center cursor-pointer flex-shrink-0 transition-all ${
                                            task.status === 'done' 
                                                ? 'bg-green-500 border-green-500 text-white' 
                                                : 'border-slate-500 hover:border-cyan-400'
                                        }`}
                                    >
                                        {task.status === 'done' && <CheckCircle size={12} />}
                                    </button>
                                    <div className="min-w-0 flex-1">
                                        <h4 className={`font-bold text-sm sm:text-base truncate ${
                                            task.status === 'done' ? 'text-slate-500 line-through' : 'text-white'
                                        }`}>
                                            {task.title}
                                        </h4>
                                        <div className="flex gap-2 sm:gap-4 mt-1">
                                            <span className="text-xs text-slate-500 flex items-center gap-1">
                                                <Clock size={12} />
                                                Today
                                            </span>
                                            <span className={`text-xs font-bold px-2 rounded-full ${getPriorityColor(task.priority)}`}>
                                                {task.priority}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => deleteTask(task.id)}
                                    className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/20 rounded-lg transition-all ml-2"
                                >
                                    <Trash2 size={16} className="text-red-400" />
                                </button>
                            </div>
                        ))}

                        {tasks.length === 0 && (
                            <div className="text-center py-8 text-slate-500">
                                <CheckCircle size={32} className="mx-auto mb-2 opacity-50" />
                                <p>No tasks yet. Add your first task!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GrowthView;
