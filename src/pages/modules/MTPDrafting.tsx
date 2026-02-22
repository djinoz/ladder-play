import { useState } from 'react';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { TextArea } from '../../components/ui/Input';
import { useAuth } from '../../contexts/AuthContext';
import { saveSessionData } from '../../services/db';
import { functions, db } from '../../config/firebase';
import { httpsCallable } from 'firebase/functions';
import { collection, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export const MTPDrafting = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [mtpDraft, setMtpDraft] = useState('');
    const [isSynthesizing, setIsSynthesizing] = useState(false);
    const [error, setError] = useState('');

    const gatherContext = async () => {
        if (!currentUser) return [];
        const q = collection(db, 'users', currentUser.uid, 'sessions');
        const snap = await getDocs(q);
        return snap.docs.map(d => d.data());
    };

    const handleSynthesize = async () => {
        setIsSynthesizing(true);
        setError('');
        try {
            const data = await gatherContext();
            if (data.length === 0) {
                setError("You haven't completed any modules yet. Complete at least one module (like the Meaning Audit or Peak Experience) so the AI has context.");
                setIsSynthesizing(false);
                return;
            }

            const synthesizeMTP = httpsCallable(functions, 'synthesizeMTP');
            const response = await synthesizeMTP({ contextData: data });
            setMtpDraft((response.data as any).synthesis);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to generate MTP. Please try again.");
        } finally {
            setIsSynthesizing(false);
        }
    };

    const handleSave = async () => {
        if (currentUser && mtpDraft) {
            await saveSessionData(currentUser.uid, `mtp_${Date.now()}`, {
                type: 'mtp_draft',
                completedAt: new Date().toISOString(),
                draft: mtpDraft
            });
        }
        navigate('/dashboard');
    };

    return (
        <div className="w-full max-w-3xl flex flex-col items-center animate-fade-in pb-20">
            <Card className="w-full">
                <CardHeader
                    title="MTP Drafting (AI Synthesis)"
                    subtitle="Let the AI review your past modules and propose a Massive Transformational Purpose."
                />

                {!mtpDraft ? (
                    <div className="py-12 flex flex-col items-center text-center">
                        <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-6 text-3xl shadow-[0_0_30px_rgba(56,189,248,0.3)]">
                            ✨
                        </div>
                        <p className="text-textSecondary mb-8 max-w-md">
                            We will gather your Meaning Audit, Peak Experiences, Domains, and Contributions to forge a single driving statement.
                        </p>
                        {error && <p className="text-red-400 mb-6 bg-red-900/20 p-4 rounded-lg text-sm border border-red-900">{error}</p>}
                        <Button onClick={handleSynthesize} disabled={isSynthesizing} className="px-10 py-4 text-lg">
                            {isSynthesizing ? 'Synthesizing...' : 'Generate MTP Draft'}
                        </Button>
                    </div>
                ) : (
                    <div className="mt-8 animate-slide-up">
                        <div className="bg-primary/10 border border-primary/20 p-6 rounded-xl mb-6 shadow-inner">
                            <p className="text-sm font-semibold text-primary mb-2 uppercase tracking-wide">AI Proposal</p>
                            <TextArea
                                value={mtpDraft}
                                onChange={(e) => setMtpDraft(e.target.value)}
                                className="min-h-[250px] font-medium text-lg border-none bg-transparent focus:ring-0 px-0 shadow-none leading-relaxed text-white"
                            />
                        </div>
                        <p className="text-sm text-textSecondary mb-6">
                            Review, edit, and stress-test this draft. Does it still matter if no one knows? Would you pursue it without seeing its completion?
                        </p>
                        <div className="flex justify-between">
                            <Button variant="ghost" onClick={handleSynthesize} disabled={isSynthesizing}>Regenerate</Button>
                            <Button onClick={handleSave}>Accept & Save MTP</Button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
};
