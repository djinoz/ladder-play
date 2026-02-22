import { useState } from 'react';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { TextArea } from '../../components/ui/Input';
import { useAuth } from '../../contexts/AuthContext';
import { saveSessionData } from '../../services/db';
import { useNavigate } from 'react-router-dom';

export const ContributionCalibration = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [reflection, setReflection] = useState('');

    const handleSave = async () => {
        if (currentUser) {
            await saveSessionData(currentUser.uid, `contribution_${Date.now()}`, {
                type: 'contribution_calibration',
                completedAt: new Date().toISOString(),
                reflection
            });
        }
        navigate('/dashboard');
    };

    return (
        <div className="w-full max-w-2xl flex flex-col items-center animate-fade-in pb-20">
            <Card className="w-full">
                <CardHeader
                    title="Contribution Calibration"
                    subtitle="A guided reflection on the stakes of your life."
                />
                <div className="bg-primary/10 border border-primary/20 p-6 rounded-xl mt-6 mb-8 text-center shadow-inner">
                    <p className="text-xl font-medium text-primary">"Who would suffer if you disappeared?"</p>
                </div>
                <p className="text-textSecondary mb-6 leading-relaxed">
                    Ground your massive transformational purpose in real stakes. Consider your relationships, the communities you serve, the projects that rely on you, and the specific knowledge or care only you can provide.
                </p>
                <TextArea
                    placeholder="Reflect here..."
                    value={reflection}
                    onChange={(e) => setReflection(e.target.value)}
                    className="min-h-[250px]"
                />
                <div className="flex justify-end mt-4">
                    <Button onClick={handleSave} disabled={!reflection} className="px-8">Complete & Save</Button>
                </div>
            </Card>
        </div>
    );
};
