import React, { useState, useEffect } from 'react';
import { MapPin, Edit3, Flame, CheckCircle, Award, User, Target, Zap, Globe, Smartphone, Save, X } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { API_URL } from '../config';

const ProfileView = ({ profile, onNavigate }) => {
    // Get user data from localStorage for complete profile
    const savedUser = localStorage.getItem('user');
    const userData = savedUser ? JSON.parse(savedUser) : {};

    // Merge profile prop with stored user data
    const initialProfile = {
        name: profile?.name || userData?.name || 'User',
        email: profile?.email || userData?.email || 'Not set',
        role: profile?.role || userData?.role || 'Not Set',
        experience: profile?.experience || userData?.experience_years || 'Not Set',
        salary: profile?.salary || userData?.salary_expectation || 'Not Set',
        goal: profile?.goal || 'Interview Preparation'
    };

    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState(initialProfile);
    const [displayProfile, setDisplayProfile] = useState(initialProfile);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setDisplayProfile(initialProfile);
        setEditForm(initialProfile);
    }, [JSON.stringify(initialProfile)]); // Deep comparison for simple object

    // Generate initials from name
    const getInitials = (name) => {
        if (!name) return 'U';
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    const handleEditToggle = () => {
        if (!isEditing) {
            setEditForm(displayProfile);
        }
        setIsEditing(!isEditing);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Update Backend
            if (userData?.uid) {
                const formData = new FormData();
                formData.append('user_id', userData.uid);
                formData.append('name', editForm.name);
                formData.append('role', editForm.role);
                formData.append('experienceYears', editForm.experience);
                formData.append('salaryExpectation', editForm.salary);

                const response = await fetch(`${API_URL}/profile/update`, {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    throw new Error('Failed to update profile on server');
                }
            }

            // Update Local Storage
            const updatedUser = {
                ...userData,
                name: editForm.name,
                role: editForm.role,
                experience_years: editForm.experience,
                salary_expectation: editForm.salary
            };
            localStorage.setItem('user', JSON.stringify(updatedUser));

            // Update State
            setDisplayProfile(editForm);
            setIsEditing(false);

            // Force reload to update header/sidebar if needed, or better, use a context/callback
            // For now, we update local state which is good enough for this view
            window.dispatchEvent(new Event('storage')); // Trigger update for other components listening to storage

        } catch (error) {
            console.error("Error saving profile:", error);
            alert("Failed to save profile changes. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="h-full overflow-y-auto p-6 max-w-4xl mx-auto animate-fade-in-up">
            <div className="relative mb-20">
                <div className="h-48 w-full bg-gradient-to-r from-cyan-600 to-blue-600 rounded-3xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                </div>
                <div className="absolute -bottom-16 left-8 flex items-end gap-6">
                    <div className="w-32 h-32 rounded-full bg-slate-900 p-1.5 shadow-xl">
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-4xl font-bold text-white border border-slate-700">
                            {getInitials(displayProfile.name)}
                        </div>
                    </div>
                    <div className="mb-4">
                        <h2 className="text-3xl font-bold text-white">{displayProfile.name}</h2>
                        <p className="text-slate-400 flex items-center gap-2"><MapPin size={16} /> {displayProfile.role || 'Professional'}</p>
                    </div>
                </div>
                <div className="absolute -bottom-16 right-8 flex gap-3">
                    {isEditing ? (
                        <>
                            <Button variant="danger" icon={X} onClick={handleEditToggle} disabled={isSaving}>Cancel</Button>
                            <Button variant="primary" icon={Save} onClick={handleSave} loading={isSaving}>Save Changes</Button>
                        </>
                    ) : (
                        <Button variant="secondary" icon={Edit3} onClick={handleEditToggle}>Edit Profile</Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="flex items-center gap-4">
                    <div className="p-3 bg-orange-500/10 rounded-xl text-orange-400"><Flame size={24} /></div>
                    <div>
                        <div className="text-2xl font-bold text-white">0</div>
                        <div className="text-xs text-slate-500">Day Streak</div>
                    </div>
                </Card>
                <Card className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400"><CheckCircle size={24} /></div>
                    <div>
                        <div className="text-2xl font-bold text-white">0</div>
                        <div className="text-xs text-slate-500">Questions Solved</div>
                    </div>
                </Card>
                <Card className="flex items-center gap-4">
                    <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400"><Award size={24} /></div>
                    <div>
                        <div className="text-2xl font-bold text-white">--</div>
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
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="name"
                                        value={editForm.name}
                                        onChange={handleChange}
                                        className="w-full p-3 bg-slate-900 rounded-xl border border-slate-700 text-slate-200 focus:border-cyan-500 focus:outline-none"
                                    />
                                ) : (
                                    <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700 text-slate-200">{displayProfile.name}</div>
                                )}
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Email</label>
                                <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700 text-slate-400 cursor-not-allowed" title="Email cannot be changed">{displayProfile.email}</div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Role</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="role"
                                        value={editForm.role}
                                        onChange={handleChange}
                                        className="w-full p-3 bg-slate-900 rounded-xl border border-slate-700 text-slate-200 focus:border-cyan-500 focus:outline-none"
                                    />
                                ) : (
                                    <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700 text-slate-200">{displayProfile.role}</div>
                                )}
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Experience</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="experience"
                                        value={editForm.experience}
                                        onChange={handleChange}
                                        placeholder="e.g. 3 years, Senior"
                                        className="w-full p-3 bg-slate-900 rounded-xl border border-slate-700 text-slate-200 focus:border-cyan-500 focus:outline-none"
                                    />
                                ) : (
                                    <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700 text-slate-200">{displayProfile.experience}</div>
                                )}
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <h3 className="font-bold text-xl text-white mb-6 flex items-center gap-2"><Target size={20} className="text-purple-400" /> Career Goals</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Target Role</label>
                                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700 text-white font-medium flex justify-between items-center">
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="role" // Reusing role as target role for now
                                            value={editForm.role}
                                            onChange={handleChange}
                                            className="bg-transparent border-none text-white focus:outline-none w-full"
                                        />
                                    ) : (
                                        displayProfile.role
                                    )}
                                    <Badge variant="info">Primary</Badge>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Experience Level</label>
                                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700 text-white font-medium">
                                    {displayProfile.experience}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Current Focus</label>
                                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700 text-white font-medium">
                                    {displayProfile.goal}
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
                            <p className="text-xs text-slate-500 mb-4">Unlimited interviews</p>
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
                                <div className="text-xs text-cyan-400 cursor-pointer">Connect</div>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-700">
                                <div className="flex items-center gap-3">
                                    <Smartphone size={18} className="text-slate-400" /> <span className="text-sm text-slate-300">GitHub</span>
                                </div>
                                <div className="text-xs text-cyan-400 cursor-pointer">Connect</div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ProfileView;
