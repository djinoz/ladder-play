import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader } from '../components/ui/Card';
import { useNavigate } from 'react-router-dom';

export const Login = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const { sendMagicLink, currentUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (currentUser) {
            navigate('/dashboard');
        }
    }, [currentUser, navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        setStatus('loading');
        try {
            await sendMagicLink(email);
            setStatus('success');
        } catch (error) {
            console.error(error);
            setStatus('error');
        }
    };

    return (
        <div className="w-full max-w-md mt-12 mx-auto">
            <Card>
                <CardHeader
                    title="Sign In / Register"
                    subtitle="We use secure, passwordless magic links. Enter your email and we'll send you a link to sign in."
                />
                {status === 'success' ? (
                    <div className="bg-emerald-900/30 border border-emerald-500/50 text-emerald-200 p-4 rounded-lg mt-4 text-center">
                        <p className="font-semibold mb-1">Link Sent!</p>
                        <p className="text-sm">Check your email for the magic link to continue.</p>
                    </div>
                ) : (
                    <form onSubmit={handleLogin} className="flex flex-col mt-4">
                        <Input
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={status === 'loading'}
                        />
                        <Button type="submit" disabled={status === 'loading'} fullWidth>
                            {status === 'loading' ? 'Sending...' : 'Send Magic Link'}
                        </Button>
                        {status === 'error' && <p className="text-red-400 text-sm mt-4 text-center">Failed to send link. Please try again.</p>}
                    </form>
                )}
            </Card>
            <div className="text-center mt-6 flex flex-col gap-2">
                <p className="text-textSecondary text-sm">
                    Creating an account lets you save your MTP drafts and module progress.
                </p>
                <div className="bg-primary/10 border border-primary/20 text-primary px-4 py-3 rounded-lg inline-block mx-auto text-xs mt-2">
                    <strong>🔒 100% Private:</strong> Your email is only used as a secure key to your localized database. No newsletters. No spam. Your data remains strictly yours.
                </div>
            </div>
        </div>
    );
};
