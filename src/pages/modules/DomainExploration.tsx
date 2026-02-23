import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { saveSessionData } from '../../services/db';
import { useNavigate } from 'react-router-dom';

const POST_SCARCITY_DOMAINS = [
    { id: 'creative', name: 'Creative Expression', desc: 'Making art, music, writing, and aesthetics.' },
    { id: 'wisdom', name: 'Wisdom Transmission', desc: 'Teaching, mentoring, and passing down deep knowledge.' },
    { id: 'ecological', name: 'Ecological Stewardship', desc: 'Restoring and protecting natural systems.' },
    { id: 'care', name: 'Care & Healing', desc: 'Directly alleviating suffering in others.' },
    { id: 'community', name: 'Community Weaving', desc: 'Building and maintaining social coherence.' },
    { id: 'systems', name: 'Systems Engineering', desc: 'Designing better societal or infrastructural systems.' },
    { id: 'science', name: 'Scientific Discovery', desc: 'Expanding human understanding of reality.' },
    { id: 'philosophy', name: 'Philosophical Inquiry', desc: 'Exploring meaning, ethics, and fundamental truth.' },
    { id: 'performance', name: 'Embodied Performance', desc: 'Dance, athletics, and pushing human physical limits.' },
    { id: 'tech', name: 'Technological Innovation', desc: 'Building tools that expand capability.' }
];

const ALIVENESS_LABELS: Record<number, string> = {
    1: 'Lifeless',
    2: 'Uninspiring',
    3: 'Neutral',
    4: 'Engaging',
    5: 'Exhilarating!'
};

const NEGLECT_LABELS: Record<number, string> = {
    1: 'Super-engaged',
    2: 'Attended to',
    3: 'Neutral',
    4: 'A bit neglected',
    5: 'Very neglected'
};

export const DomainExploration = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [ratings, setRatings] = useState<Record<string, { alive: number, neglected: number }>>({});

    const handleRating = (id: string, field: 'alive' | 'neglected', value: number) => {
        setRatings(prev => ({
            ...prev,
            [id]: { ...(prev[id] || { alive: 3, neglected: 3 }), [field]: value }
        }));
    };

    const handleSave = async () => {
        if (currentUser) {
            await saveSessionData(currentUser.uid, `domainexp_${Date.now()}`, {
                type: 'domain_exploration',
                completedAt: new Date().toISOString(),
                ratings
            });
        }
        navigate('/dashboard');
    };

    return (
        <div className="w-full max-w-4xl flex flex-col items-center animate-fade-in pb-20">
            <div className="text-center mb-10 w-full">
                <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-emerald-400 to-sky-400 bg-clip-text text-transparent">Domain Exploration</h2>
                <p className="text-textSecondary text-lg max-w-2xl mx-auto">
                    Explore the 10 post-scarcity domains. Rate each on two axes: how <strong>alive</strong> the pursuit makes you feel, and how <strong>neglected</strong> it currently is in your life.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                {POST_SCARCITY_DOMAINS.map((domain) => (
                    <Card key={domain.id} className="flex flex-col gap-4 border border-white/5 hover:border-primary/30 transition-colors">
                        <div>
                            <h3 className="text-xl font-bold text-slate-100">{domain.name}</h3>
                            <p className="text-sm text-slate-400">{domain.desc}</p>
                        </div>

                        <div className="flex flex-col gap-3 mt-auto">
                            <div>
                                <div className="flex justify-between text-xs text-slate-400 mb-1">
                                    <span>Aliveness</span>
                                    <span className="text-primary font-bold">{ALIVENESS_LABELS[ratings[domain.id]?.alive || 3]}</span>
                                </div>
                                <input
                                    type="range" min="1" max="5" step="1"
                                    value={ratings[domain.id]?.alive || 3}
                                    onChange={(e) => handleRating(domain.id, 'alive', Number(e.target.value))}
                                    className="w-full accent-emerald-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>

                            <div>
                                <div className="flex justify-between text-xs text-slate-400 mb-1">
                                    <span>Neglect</span>
                                    <span className="text-rose-400 font-bold">{NEGLECT_LABELS[ratings[domain.id]?.neglected || 3]}</span>
                                </div>
                                <input
                                    type="range" min="1" max="5" step="1"
                                    value={ratings[domain.id]?.neglected || 3}
                                    onChange={(e) => handleRating(domain.id, 'neglected', Number(e.target.value))}
                                    className="w-full accent-rose-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>
                        </div>

                        {(ratings[domain.id]?.alive >= 4 && ratings[domain.id]?.neglected <= 2) && (
                            <div className="mt-2 text-xs bg-amber-500/10 text-amber-300 border border-amber-500/20 p-2 rounded text-center">
                                ✨ High Potential for MTP
                            </div>
                        )}
                    </Card>
                ))}
            </div>

            <div className="mt-12 w-full flex justify-end">
                <Button onClick={handleSave} className="px-10 py-4 text-lg">Save Exploration</Button>
            </div>
        </div>
    );
};
