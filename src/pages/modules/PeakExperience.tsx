import { useState } from 'react';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { TextArea } from '../../components/ui/Input';
import { useAuth } from '../../contexts/AuthContext';
import { saveSessionData } from '../../services/db';
import { useNavigate } from 'react-router-dom';

export const PeakExperience = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [experiences, setExperiences] = useState<{
        alive: string;
        useful: string;
        yourself: string;
    }>({ alive: '', useful: '', yourself: '' });

    const handleSave = async () => {
        if (currentUser) {
            await saveSessionData(currentUser.uid, `peak_${Date.now()}`, {
                type: 'peak_experience',
                completedAt: new Date().toISOString(),
                experiences
            });
        }
        navigate('/dashboard');
    };

    return (
        <div className="w-full max-w-2xl flex flex-col items-center animate-fade-in pb-20">
            <Card className="w-full">
                {step === 0 && (
                    <div className="text-center py-8">
                        <h2 className="text-3xl font-bold mb-4">Peak Experience Archaeology</h2>
                        <p className="text-textSecondary mb-8 text-lg">
                            We will recall three peak experiences from your life to mine for repeating patterns.
                        </p>
                        <Button onClick={() => setStep(1)} className="px-8 py-3">Start</Button>
                    </div>
                )}

                {step === 1 && (
                    <div className="animate-slide-up">
                        <CardHeader title="1. Most Alive" subtitle="Recall a moment when you felt most vividly alive and engaged." />
                        <TextArea
                            placeholder="Describe the moment, who was there, and what was at stake..."
                            value={experiences.alive}
                            onChange={(e) => setExperiences(prev => ({ ...prev, alive: e.target.value }))}
                        />
                        <div className="flex justify-end mt-4">
                            <Button onClick={() => setStep(2)} disabled={!experiences.alive}>Next</Button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="animate-slide-up">
                        <CardHeader title="2. Most Useful" subtitle="Recall a moment when you felt you were making the most profound contribution." />
                        <TextArea
                            placeholder="Describe what you were contributing, and to whom..."
                            value={experiences.useful}
                            onChange={(e) => setExperiences(prev => ({ ...prev, useful: e.target.value }))}
                        />
                        <div className="flex justify-between mt-4">
                            <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
                            <Button onClick={() => setStep(3)} disabled={!experiences.useful}>Next</Button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="animate-slide-up">
                        <CardHeader title="3. Most Yourself" subtitle="Recall a moment when you felt most authentically yourself, undistorted by expectations." />
                        <TextArea
                            placeholder="Describe the context and how it felt..."
                            value={experiences.yourself}
                            onChange={(e) => setExperiences(prev => ({ ...prev, yourself: e.target.value }))}
                        />
                        <div className="flex justify-between mt-4">
                            <Button variant="ghost" onClick={() => setStep(2)}>Back</Button>
                            <Button onClick={handleSave} disabled={!experiences.yourself}>Complete & Save</Button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
};
