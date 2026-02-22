import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { saveSessionData, saveAnonymizedTelemetry } from '../../services/db';

const DOMAINS = [
    'Work & Vocation', 'Relationships', 'Creative Life', 'Contemplative Life',
    'Body & Health', 'Community Contribution', 'Nature', 'Transcendent / Unknown'
];

export const MeaningAudit = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [activeDomainIndex, setActiveDomainIndex] = useState(0);
    const [isEvaluatingFulfillment, setIsEvaluatingFulfillment] = useState(false);
    const [insightMessage, setInsightMessage] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [sessionId] = useState(() => `audit_${Date.now()}`);
    const [saveError, setSaveError] = useState<string | null>(null);

    const [ratings, setRatings] = useState<Record<string, { importance: number, fulfillment: number }>>(() => {
        const init: Record<string, { importance: number, fulfillment: number }> = {};
        DOMAINS.forEach(d => init[d] = { importance: 5, fulfillment: 5 });
        return init;
    });

    const currentDomain = DOMAINS[activeDomainIndex];

    // Progress calculations
    const totalQuestions = DOMAINS.length * 2;
    const currentQuestion = isEvaluatingFulfillment ? DOMAINS.length + activeDomainIndex : activeDomainIndex;
    const progressPercent = Math.round((currentQuestion / totalQuestions) * 100);

    const handleRatingChange = (val: number) => {
        const type = isEvaluatingFulfillment ? 'fulfillment' : 'importance';
        setRatings(prev => ({ ...prev, [currentDomain]: { ...prev[currentDomain], [type]: val } }));
    };

    const getInsight = (domain: string, fulfillment: number, importance: number) => {
        const gap = importance - fulfillment;
        if (gap >= 4) return `Ah, ${domain} is highly important to you but deeply under-fulfilled right now. This is a crucial gap we'll want to explore.`;
        if (gap <= -3) return `Interesting. You feel very fulfilled in ${domain}, despite it not being a primary priority. Sometimes this indicates hidden mastery or outgrown structures.`;
        if (importance >= 8 && fulfillment >= 8) return `Wonderful. ${domain} is a core pillar holding you up right now—high importance and high fulfillment.`;
        if (importance <= 3 && fulfillment <= 3) return `It seems ${domain} simply isn't a focus area for you right now, and that's perfectly okay.`;
        return null;
    };

    const handleBack = () => {
        setInsightMessage(null);
        if (activeDomainIndex > 0) {
            setActiveDomainIndex(prev => prev - 1);
        } else if (isEvaluatingFulfillment) {
            setIsEvaluatingFulfillment(false);
            setActiveDomainIndex(DOMAINS.length - 1);
        } else {
            setStep(0);
        }
    };

    const handleNext = async (skipValue?: number) => {
        setInsightMessage(null); // clear previous

        let currentRatings = ratings;
        if (skipValue !== undefined) {
            currentRatings = {
                ...ratings,
                [currentDomain]: { ...ratings[currentDomain], fulfillment: skipValue }
            };
            setRatings(currentRatings);
        }

        const isComplete = activeDomainIndex === DOMAINS.length - 1 && isEvaluatingFulfillment;
        const currentProgStep = (isEvaluatingFulfillment ? DOMAINS.length + activeDomainIndex : activeDomainIndex) + 1;

        const auditPayload = {
            type: 'meaning_audit',
            status: isComplete ? 'completed' : 'in_progress',
            lastUpdated: new Date().toISOString(),
            ...(isComplete ? { completedAt: new Date().toISOString() } : {}),
            ratings: currentRatings,
            progressStep: currentProgStep,
            totalSteps: DOMAINS.length * 2
        };

        if (currentUser && !isComplete) {
            // Background progressive save
            saveSessionData(currentUser.uid, sessionId, auditPayload).then(() => {
                setSaveError(null);
            }).catch((err) => {
                console.error("[MeaningAudit] Progressive tracking network save failed:", err);
                setSaveError("Note: Unable to sync progress to cloud. Check network.");
            });
        }


        // If we just finished a domain's fulfillment, we can offer a breadcrumb insight
        if (isEvaluatingFulfillment) {
            const insight = getInsight(currentDomain, currentRatings[currentDomain].fulfillment, currentRatings[currentDomain].importance);
            if (insight && activeDomainIndex < DOMAINS.length - 1 && Math.random() > 0.4) {
                // Show insightful breadcrumbs pseudo-randomly so it's not repetitive, but guarantee it exists
                setInsightMessage(insight);
            }
        }

        if (activeDomainIndex < DOMAINS.length - 1) {
            setActiveDomainIndex(prev => prev + 1);
        } else if (!isEvaluatingFulfillment) {
            setIsEvaluatingFulfillment(true);
            setActiveDomainIndex(0);
        } else {
            setStep(2); // Results
            setIsSaving(true);
            try {
                if (currentUser) {
                    await saveSessionData(currentUser.uid, sessionId, auditPayload);
                } else {
                    // Unauthenticated telemetry save
                    await saveAnonymizedTelemetry(auditPayload);
                }
            } finally {
                setIsSaving(false);
            }
        }
    };

    const chartData = DOMAINS.map(domain => ({
        subject: domain.split(' ')[0],
        Importance: ratings[domain].importance,
        Fulfillment: ratings[domain].fulfillment,
        fullMark: 10,
    }));

    return (
        <div className="w-full max-w-3xl flex flex-col items-center animate-fade-in pb-20 mt-4">

            {step === 0 && (
                <Card className="w-full text-center py-12 px-8">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">🧭</div>
                    <h2 className="text-3xl font-bold mb-4">The Meaning Audit</h2>
                    <p className="text-lg text-textSecondary mb-8 max-w-lg mx-auto leading-relaxed">
                        We will look at 8 core domains of human life. First, you'll rate how <strong>important</strong> they are to you. Then, you'll rate how <strong>fulfilled</strong> you currently feel in them.
                    </p>
                    <Button onClick={() => setStep(1)} className="px-8 py-3 text-lg">Begin Audit</Button>
                </Card>
            )}

            {step === 1 && (
                <div className="w-full animate-slide-up">
                    {/* Gamified Progress Bar */}
                    <div className="mb-8">
                        {saveError && <div className="text-amber-400 text-xs text-center mb-3 animate-fade-in font-medium px-4 py-2 bg-amber-900/20 border border-amber-500/20 rounded-lg">{saveError}</div>}
                        <div className="flex justify-between text-xs text-textSecondary font-medium uppercase tracking-wider mb-2">
                            <span>{isEvaluatingFulfillment ? 'Phase 2/2: Fulfillment' : 'Phase 1/2: Importance'}</span>
                            <span>{progressPercent}% Complete</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-white/5">
                            <div
                                className={`h-2 rounded-full transition-all duration-500 ease-out ${isEvaluatingFulfillment
                                    ? 'bg-gradient-to-r from-violet-500 to-violet-400 shadow-[0_0_10px_rgba(139,92,246,0.5)]'
                                    : 'bg-gradient-to-r from-blue-500 to-primary shadow-[0_0_10px_rgba(56,189,248,0.5)]'
                                    }`}
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                    </div>

                    <Card className="w-full relative overflow-hidden">
                        {/* Background domain number watermark */}
                        <div className="absolute top-[-20%] right-[-5%] text-[150px] font-black text-white/[0.02] pointer-events-none select-none">
                            {activeDomainIndex + 1}
                        </div>

                        {insightMessage && (
                            <div className="mb-6 p-4 bg-emerald-900/20 border border-emerald-500/20 rounded-xl text-emerald-200 text-sm animate-fade-in shadow-inner">
                                <strong className="text-emerald-400 block mb-1">Insight</strong>
                                {insightMessage}
                            </div>
                        )}

                        <h2 className={`text-3xl font-bold mb-2 text-center relative z-10 ${isEvaluatingFulfillment ? 'text-violet-400' : 'text-primary'}`}>{currentDomain}</h2>
                        <p className="text-center text-textSecondary mb-8 h-6 relative z-10">
                            {isEvaluatingFulfillment
                                ? "How fulfilled are you currently in this area?"
                                : "How important is this to your sense of a good life?"}
                        </p>

                        <div className="flex flex-col items-center gap-6 mb-8 relative z-10">
                            <span className="text-6xl font-black bg-gradient-to-br from-white to-slate-500 bg-clip-text text-transparent transform transition-all">
                                {isEvaluatingFulfillment ? ratings[currentDomain].fulfillment : ratings[currentDomain].importance}
                            </span>
                            <input
                                type="range"
                                min="1" max="10" step="1"
                                value={isEvaluatingFulfillment ? ratings[currentDomain].fulfillment : ratings[currentDomain].importance}
                                onChange={(e) => handleRatingChange(Number(e.target.value))}
                                className={`w-full max-w-md h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer ${isEvaluatingFulfillment ? 'accent-violet-500' : 'accent-primary'}`}
                            />
                            <div className="flex justify-between w-full max-w-md text-xs text-textSecondary mt-1 px-1">
                                <span>Not at all (1)</span>
                                <span>Deeply (10)</span>
                            </div>
                        </div>

                        {isEvaluatingFulfillment && ratings[currentDomain].importance <= 4 && (
                            <div className="mb-6 p-4 bg-slate-800/30 rounded-xl text-center border border-slate-700/50 relative z-10 w-full max-w-md mx-auto">
                                <p className="text-sm text-slate-400 mb-3">Since importance is low ({ratings[currentDomain].importance}/10), you can skip fulfillment if it's N/A.</p>
                                <Button variant="secondary" className="text-sm py-1.5" onClick={() => handleNext(ratings[currentDomain].importance)}>Mark as N/A & Skip</Button>
                            </div>
                        )}

                        <div className="flex justify-between items-center relative z-10 mt-4 pt-6 border-t border-white/5">
                            <Button variant="secondary" onClick={handleBack} className="text-slate-400 hover:text-white bg-transparent border-transparent px-2">← Back</Button>
                            <Button onClick={() => handleNext()} className={`gap-2 px-6 ${isEvaluatingFulfillment ? 'bg-violet-500 hover:bg-violet-600 border-none text-white' : ''}`}>
                                {activeDomainIndex === 7 && isEvaluatingFulfillment ? 'See Results' : 'Continue'}
                                {activeDomainIndex !== 7 || !isEvaluatingFulfillment ? '→' : ''}
                            </Button>
                        </div>
                    </Card>
                </div>
            )}

            {step === 2 && (
                <div className="w-full animate-slide-up">
                    <h2 className="text-3xl font-bold mb-2 text-center">Your Meaning Map</h2>
                    <p className="text-center text-textSecondary mb-10">
                        The largest gaps between Importance and Fulfillment reveal your coaching priorities.
                    </p>

                    <Card className="w-full h-[500px] mb-8 bg-surface/40">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                                <PolarGrid stroke="#334155" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 10]} max={10} tick={false} axisLine={false} />
                                <Radar name="Importance" dataKey="Importance" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.2} />
                                <Radar name="Fulfillment" dataKey="Fulfillment" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.4} />
                                <Legend />
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} itemStyle={{ color: '#f8fafc' }} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </Card>

                    <div className="flex justify-center flex-col items-center">
                        {!currentUser && (
                            <div className="bg-primary/10 border border-primary/20 p-6 rounded-xl max-w-md text-center mb-6">
                                <h4 className="text-primary font-bold mb-2">Save your map to go deeper</h4>
                                <p className="text-sm text-textSecondary mb-4">You've completed the first module! Create a free account to securely save this map and unlock AI-driven exercises to find your purpose. We never send spam.</p>
                                <Button onClick={() => {
                                    window.localStorage.setItem('pending_audit_data', JSON.stringify({
                                        type: 'meaning_audit',
                                        completedAt: new Date().toISOString(),
                                        ratings
                                    }));
                                    navigate('/login');
                                }} fullWidth>Create Free Account</Button>
                            </div>
                        )}
                        {currentUser && (
                            <Button onClick={() => navigate('/dashboard')} disabled={isSaving}>
                                {isSaving ? 'Saving...' : 'Return to Dashboard'}
                            </Button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
