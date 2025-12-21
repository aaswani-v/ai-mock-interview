import React, { useState } from 'react';
import { Mail, RefreshCw, CheckCircle, Clock } from 'lucide-react';
import Button from '../components/ui/Button';
import { API_URL } from '../config';

const EmailVerificationPendingView = ({ email, onBackToLogin, onResendEmail }) => {
    const [resending, setResending] = useState(false);
    const [resent, setResent] = useState(false);

    const handleResend = async () => {
        setResending(true);
        try {
            const formData = new FormData();
            formData.append('email', email);

            await fetch(`${API_URL}/auth/resend-confirmation`, {
                method: 'POST',
                body: formData
            });

            setResent(true);
            setTimeout(() => setResent(false), 5000);
        } catch (err) {
            console.error('Resend failed:', err);
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="min-h-full overflow-y-auto flex items-center justify-center w-full py-8 px-4 sm:p-6 animate-fade-in-up">
            <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-500"></div>
                
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center border border-amber-500/30">
                    <Mail size={40} className="text-amber-400" />
                </div>
                
                <h2 className="text-2xl font-bold text-white mb-3">Verify Your Email</h2>
                
                <p className="text-slate-400 mb-2">
                    We've sent a verification link to:
                </p>
                <p className="text-cyan-400 font-medium mb-6">
                    {email}
                </p>
                
                <div className="bg-slate-800/50 rounded-xl p-4 mb-6 text-left">
                    <div className="flex items-start gap-3">
                        <Clock size={20} className="text-amber-400 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-slate-300">
                            <p className="font-medium mb-1">Check your inbox</p>
                            <p className="text-slate-400 text-xs">Click the link in the email to verify your account. If you don't see it, check your spam folder.</p>
                        </div>
                    </div>
                </div>
                
                <div className="space-y-3">
                    <Button 
                        onClick={handleResend} 
                        variant="secondary" 
                        className="w-full" 
                        disabled={resending || resent}
                    >
                        {resending ? (
                            <RefreshCw className="animate-spin" size={18} />
                        ) : resent ? (
                            <><CheckCircle size={18} className="mr-2" /> Email Sent!</>
                        ) : (
                            "Resend Verification Email"
                        )}
                    </Button>
                    
                    <button 
                        onClick={onBackToLogin} 
                        className="text-sm text-slate-400 hover:text-white transition-colors"
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EmailVerificationPendingView;
