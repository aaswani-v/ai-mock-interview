import React, { useState } from 'react';
import { User, Mail, Lock, RefreshCw, ChevronLeft } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { API_URL } from '../config';

const RegisterView = ({ onRegisterSuccess, onLoginClick, setPendingEmail }) => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async () => {
        setError('');

        if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
            setError("Please fill in all fields.");
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (formData.password.length < 6) {
            setError("Password should be at least 6 characters.");
            return;
        }

        setLoading(true);
        try {
            // Call Supabase backend API for signup
            const formDataObj = new FormData();
            formDataObj.append('email', formData.email);
            formDataObj.append('password', formData.password);
            formDataObj.append('name', formData.name);

            const response = await fetch(`${API_URL}/auth/signup`, {
                method: 'POST',
                body: formDataObj
            });

            const data = await response.json();
            
            if (data.success) {
                // Store user data
                const userData = {
                    uid: data.user.uid,
                    email: data.user.email,
                    name: formData.name,
                    emailVerified: true // Supabase handles email verification differently
                };
                
                localStorage.setItem('user', JSON.stringify(userData));
                if (data.session) {
                    localStorage.setItem('session', JSON.stringify(data.session));
                }
                
                setPendingEmail(formData.email);
                onRegisterSuccess(userData);
            } else {
                setError(data.detail || "Registration failed. Please try again.");
            }

        } catch (err) {
            console.error(err);
            setError(err.message || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center h-full w-full p-6 animate-fade-in-up">
            <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-500"></div>

                <button onClick={onLoginClick} className="flex items-center text-slate-400 hover:text-white text-sm mb-6 transition-colors">
                    <ChevronLeft size={16} /> Back to Login
                </button>

                <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
                <p className="text-slate-400 mb-8">Start your interview preparation today.</p>

                {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl mb-6">{error}</div>}

                <div className="space-y-4">
                    <Input icon={User} name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} />
                    <Input icon={Mail} name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} />
                    <Input icon={Lock} type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} />
                    <Input icon={Lock} type="password" name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} />

                    <Button onClick={handleSubmit} variant="primary" className="w-full mt-2" disabled={loading}>
                        {loading ? <RefreshCw className="animate-spin" /> : "Sign Up"}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default RegisterView;
