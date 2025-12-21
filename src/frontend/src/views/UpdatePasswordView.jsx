import React, { useState, useEffect } from 'react';
import { Lock, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { API_URL } from '../config';

const UpdatePasswordView = ({ accessToken, onSuccess, onBackToLogin }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async () => {
        setError('');

        if (!password || !confirmPassword) {
            setError("Please fill in all fields.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        if (!accessToken) {
            setError("Invalid or expired reset link. Please request a new one.");
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('access_token', accessToken);
            formData.append('new_password', password);

            const response = await fetch(`${API_URL}/auth/update-password`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                setSuccess(true);
            } else {
                setError(data.detail || "Failed to update password. Please try again.");
            }
        } catch (err) {
            console.error(err);
            setError("Failed to update password. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-full overflow-y-auto flex items-center justify-center w-full py-8 px-4 sm:p-6 animate-fade-in-up">
                <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl text-center">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
                        <CheckCircle size={32} className="text-green-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-3">Password Updated!</h2>
                    <p className="text-slate-400 mb-6">
                        Your password has been successfully updated. You can now log in with your new password.
                    </p>
                    <Button onClick={onBackToLogin} variant="primary" className="w-full">
                        Go to Login
                    </Button>
                </div>
            </div>
        );
    }

    if (!accessToken) {
        return (
            <div className="min-h-full overflow-y-auto flex items-center justify-center w-full py-8 px-4 sm:p-6 animate-fade-in-up">
                <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl text-center">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
                        <AlertCircle size={32} className="text-red-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-3">Invalid Link</h2>
                    <p className="text-slate-400 mb-6">
                        This password reset link is invalid or has expired. Please request a new one.
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
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-cyan-500"></div>

                <h2 className="text-3xl font-bold text-white mb-2">Set New Password</h2>
                <p className="text-slate-400 mb-8">Enter your new password below.</p>

                {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl mb-6">{error}</div>}

                <div className="space-y-4">
                    <Input 
                        icon={Lock} 
                        type="password"
                        name="password" 
                        placeholder="New Password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                    />
                    <Input 
                        icon={Lock} 
                        type="password"
                        name="confirmPassword" 
                        placeholder="Confirm New Password" 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                    />

                    <Button onClick={handleSubmit} variant="primary" className="w-full mt-2" disabled={loading}>
                        {loading ? <RefreshCw className="animate-spin" /> : "Update Password"}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default UpdatePasswordView;
