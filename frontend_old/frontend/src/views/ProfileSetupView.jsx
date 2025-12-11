import React, { useState, useEffect } from 'react';
import { Briefcase, Award, Target, CheckCircle } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import { API_URL } from '../config';
import { updateDoc, doc } from 'firebase/firestore';
import { auth, db } from '../firebase';

// Helper to fetch roles
const getJobRoles = async () => {
    try {
        const response = await fetch(`${API_URL}/jobs/roles`);
        if (!response.ok) return {};
        return await response.json();
    } catch (e) {
        console.error("Failed to fetch roles", e);
        return {};
    }
};

const ProfileSetupView = ({ onComplete, updateProfile }) => {
    const [role, setRole] = useState("");
    const [customRole, setCustomRole] = useState("");
    const [experience, setExperience] = useState("");
    const [goal, setGoal] = useState("");
    const [rolesList, setRolesList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getJobRoles().then(data => {
            const roles = data && Object.keys(data).length > 0 ? Object.values(data).map(r => r.title) : [];
            setRolesList([...roles, "Custom Role", "Not Sure / No Idea"]);
            setLoading(false);
        });
    }, []);

    const handleComplete = async () => {
        const finalRole = role === "Custom Role" ? customRole : role;
        const profileData = { role: finalRole, experience, goal };

        // Save to Firestore
        if (auth.currentUser) {
            try {
                await updateDoc(doc(db, "users", auth.currentUser.uid), profileData);
            } catch (e) {
                console.error("Error saving profile:", e);
            }
        }

        updateProfile(profileData);
        onComplete();
    };

    const handleSkipResume = () => {
        // Check if we should update profile anyway or just skip
        // For now, just proceed
        onComplete();
    };

    return (
        <div className="flex flex-col items-center justify-center h-full max-w-lg mx-auto w-full p-6 animate-fade-in-up">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white">Let's Personalize Interaura</h2>
                <p className="text-slate-400 mt-2">Tell us about your goals to get tailored questions.</p>
            </div>
            <Card className="w-full space-y-6">
                <div>
                    <label className="text-sm text-slate-400 mb-2 block">Target Job Role</label>
                    <Select
                        icon={Briefcase}
                        placeholder={loading ? "Loading roles..." : "Select Role"}
                        options={rolesList}
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                    />
                    {role === "Custom Role" && (
                        <input
                            type="text"
                            placeholder="Enter your target role"
                            className="w-full mt-2 bg-slate-900/50 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-500"
                            value={customRole}
                            onChange={(e) => setCustomRole(e.target.value)}
                        />
                    )}
                </div>
                <div>
                    <label className="text-sm text-slate-400 mb-2 block">Experience Level</label>
                    <Select
                        icon={Award}
                        placeholder="Select Level"
                        options={["Intern / Junior", "Mid-Level", "Senior", "Staff / Principal"]}
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                    />
                </div>
                <div>
                    <label className="text-sm text-slate-400 mb-2 block">Primary Goal</label>
                    <Select
                        icon={Target}
                        placeholder="Select Goal"
                        options={["Land a Job", "Build Confidence", "Practice Behavioral", "Mock Assessment"]}
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                    />
                </div>
                <div className="pt-4 space-y-3">
                    <Button className="w-full" onClick={handleComplete} icon={CheckCircle}>Continue to Dashboard</Button>
                    <button onClick={handleSkipResume} className="w-full text-sm text-slate-500 hover:text-slate-300 transition-colors">Skip Resume Upload for Now</button>
                </div>
            </Card>
        </div>
    );
};

export default ProfileSetupView;
