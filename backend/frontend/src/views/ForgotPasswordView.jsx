import React, { useState } from 'react';
import { Mail, RefreshCw, ChevronLeft, CheckCircle } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { API_URL } from '../config';

const ForgotPasswordView = ({ onBackToLogin }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async () => {
        setError('');

        if (!email) {
            setError("Please enter your email address.");
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('email', email);
            // Pass the frontend URL for the redirect
            formData.append('redirect_url', `${window.location.origin}/#update-password`);

            const response = await fetch(`${API_URL}/auth/reset-password-request`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                setSubmitted(true);
            } else {
                setError(data.detail || "Something went wrong. Please try again.");
            }
        } catch (err) {
            console.error(err);
            setError("Failed to send reset email. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-full overflow-y-auto flex items-center justify-center w-full py-8 px-4 sm:p-6 animate-fade-in-up">
                <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl text-center">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
                        <CheckCircle size={32} className="text-green-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-3">Check Your Email</h2>
                    <p className="text-slate-400 mb-6">
                        If an account exists for <span className="text-cyan-400">{email}</span>, you'll receive a password reset link shortly.
                    </p>
                    <Button onClick={onBackToLogin} variant="secondary" className="w-full">
                        Back to Login
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-full overflow-y-auto flex items-center justify-center w-full py-8 px-4 sm:p-6 animate-fade-in-up">
            <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>

                <button onClick={onBackToLogin} className="flex items-center text-slate-400 hover:text-white text-sm mb-6 transition-colors">
                    <ChevronLeft size={16} /> Back to Login
                </button>

                <h2 className="text-3xl font-bold text-white mb-2">Forgot Password?</h2>
                <p className="text-slate-400 mb-8">Enter your email and we'll send you a reset link.</p>

                {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl mb-6">{error}</div>}

                <div className="space-y-4">
                    <Input 
                        icon={Mail} 
                        name="email" 
                        placeholder="Email Address" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                    />

                    <Button onClick={handleSubmit} variant="primary" className="w-full mt-2" disabled={loading}>
                        {loading ? <RefreshCw className="animate-spin" /> : "Send Reset Link"}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordView;
