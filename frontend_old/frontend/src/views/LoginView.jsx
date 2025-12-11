import React, { useState } from 'react';
import { Zap, Star, ChevronRight, Mail, Lock, RefreshCw } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { API_URL } from '../config';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const LoginView = ({ onLogin, onRegisterClick }) => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async () => {
        setError('');

        if (!formData.email || !formData.password) {
            setError("Please fill in all fields.");
            return;
        }

        setLoading(true);
        try {
            // Firebase Login
            await signInWithEmailAndPassword(auth, formData.email, formData.password);

            // onLogin will be handled by Parent App (AuthStateChanged) or we can trigger it
            // But based on previous logic, we might want to just let the AuthState listener handle navigation
            // However, the original code had an onLogin prop that did manual checking.
            // We will perform that check here to match previous behavior if passed.

            if (onLogin) {
                await onLogin();
            }

        } catch (err) {
            console.error(err);
            setError(err.message === "Firebase: Error (auth/invalid-credential)." ? "Invalid email or password." : err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center h-full w-full p-6 animate-fade-in-up relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] animate-float-slow"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-cyan-600/20 rounded-full blur-[120px] animate-float-delayed"></div>
            </div>

            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative z-50">
                <div className="p-10 flex flex-col justify-between bg-gradient-to-br from-slate-900 to-slate-800 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
                    <div>
                        <div className="w-12 h-12 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/30 mb-6">
                            <Zap size={24} className="text-white" />
                        </div>
                        <h2 className="text-4xl font-bold text-white mb-2">Welcome Back</h2>
                        <p className="text-slate-400">Continue your journey to interview mastery.</p>
                    </div>

                    <div className="space-y-6">
                        <div className="p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <Star className="text-yellow-400 fill-yellow-400" size={16} />
                                <span className="text-slate-200 font-bold text-sm">Pro Tip</span>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                "Consistent practice is key. Users who practice 3x a week see a 40% boost in confidence."
                            </p>
                        </div>

                        <div className="text-center">
                            <p className="text-slate-400 text-sm mb-3">Don't have an account?</p>
                            <div className="relative group inline-block w-full md:w-auto">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-full blur opacity-50 group-hover:opacity-100 transition duration-200"></div>
                                <button
                                    onClick={onRegisterClick}
                                    className="relative px-6 py-2 rounded-full bg-slate-900 border border-slate-700 text-white text-sm font-bold shadow-lg hover:bg-slate-800 transition-all w-full md:w-auto flex items-center justify-center gap-2"
                                >
                                    <span>Create Account</span>
                                    <ChevronRight size={14} className="text-cyan-400 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-10 flex flex-col justify-center bg-slate-950/50">
                    <div className="space-y-5">
                        {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl">{error}</div>}

                        <h3 className="text-xl font-bold text-white mb-4">Sign In</h3>

                        <div className="relative z-50">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Email</label>
                            <Input icon={Mail} name="email" placeholder="example@email.com" value={formData.email} onChange={handleChange} />
                        </div>

                        <div className="relative z-50">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Password</label>
                            <Input icon={Lock} type="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} />
                        </div>

                        <Button onClick={handleSubmit} variant="primary" className="w-full mt-4" disabled={loading}>
                            {loading ? <RefreshCw className="animate-spin" /> : "Login"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginView;
