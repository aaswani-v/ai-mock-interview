import React, { useState } from 'react';
import { Mail, RefreshCw } from 'lucide-react';
import Button from '../components/ui/Button';
import { auth } from '../firebase';

const VerificationView = ({ email, onComplete }) => {
    const [checking, setChecking] = useState(false);
    const [msg, setMsg] = useState(null);

    const handleCheckVerification = async () => {
        if (!auth.currentUser) return;
        setChecking(true);
        setMsg(null);
        try {
            await auth.currentUser.reload();
            if (auth.currentUser.emailVerified) {
                setMsg({ error: false, text: "Success! Email Verified. Redirecting..." });
                setTimeout(onComplete, 1500);
            } else {
                setMsg({ error: true, text: "Email not verified yet. Please check spam folder." });
            }
        } catch (e) {
            setMsg({ error: true, text: "Verification check failed. Try logging in." });
        } finally {
            setChecking(false);
        }
    };

    return (
        <div className="flex items-center justify-center h-full w-full p-6 animate-fade-in-up">
            <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-cyan-500/30 rounded-3xl p-8 shadow-2xl text-center relative z-50">
                <div className="w-20 h-20 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Mail size={40} className="text-cyan-400 animate-pulse-slow" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Verify Your Email</h2>
                {email && <p className="text-cyan-300 font-mono text-sm mb-4">{email}</p>}

                <p className="text-slate-300 leading-relaxed mb-6">
                    We've sent a verification link to your email. Please check your inbox (and spam folder).
                </p>

                {msg && (
                    <div className={`mb-6 p-3 rounded-xl text-sm ${msg.error ? 'bg-red-500/10 text-red-300 border border-red-500/20' : 'bg-green-500/10 text-green-300 border border-green-500/20'}`}>
                        {msg.text}
                    </div>
                )}

                <Button onClick={handleCheckVerification} variant="primary" className="w-full" disabled={checking}>
                    {checking ? <RefreshCw className="animate-spin" /> : "I've Verified My Email"}
                </Button>
            </div>
        </div>
    );
};

export default VerificationView;
