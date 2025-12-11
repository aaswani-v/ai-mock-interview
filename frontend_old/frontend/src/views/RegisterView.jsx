import React, { useState } from 'react';
import { User, Mail, Lock, RefreshCw, ChevronLeft } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { API_URL } from '../config';
import { createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

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

        setLoading(true);
        try {
            // 1. Create Sync User in Backend first (or parallel) - Original code did sync
            // Actually original code logic: User registers with Firebase, then we handle profile.
            // Wait, look at previous RegisterView logic:
            /* 
               const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
               // Send email verification
               await sendEmailVerification(userCredential.user);
               setPendingEmail(formData.email);
               
               // Calls backend register API to sync
               await registerUser({ email: formData.email, password: formData.password, name: formData.name });
            */

            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);

            await sendEmailVerification(userCredential.user);

            // Sync with backend (optional but good for DB record)
            try {
                await fetch(`${API_URL}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: formData.email, password: formData.password, name: formData.name }),
                });
            } catch (backendError) {
                console.warn("Backend sync failed", backendError);
                // Non-blocking
            }

            setPendingEmail(formData.email);
            onRegisterSuccess();

        } catch (err) {
            console.error(err);
            if (err.code === 'auth/email-already-in-use') {
                try {
                    // Try logging in 
                    const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
                    if (!userCredential.user.emailVerified) {
                        await sendEmailVerification(userCredential.user);
                        setPendingEmail(formData.email);
                        onRegisterSuccess();
                        return;
                    } else {
                        setError("Account already exists and is verified. Please Login.");
                    }
                } catch (loginErr) {
                    setError("Email is already registered. Please login.");
                }
            } else if (err.code === 'auth/weak-password') {
                setError("Password should be at least 6 characters.");
            } else {
                setError(err.message);
            }
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
