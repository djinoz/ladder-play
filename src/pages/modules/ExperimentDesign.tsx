import { useState } from 'react';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../contexts/AuthContext';
import { saveSessionData } from '../../services/db';
import { useNavigate } from 'react-router-dom';

export const ExperimentDesign = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [experiment, setExperiment] = useState({
        action: '',
        startDate: '',
        checkInDate: '',
        accountabilityPerson: ''
    });

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (currentUser) {
            await saveSessionData(currentUser.uid, `experiment_${Date.now()}`, {
                type: 'experiment_90_days',
                completedAt: new Date().toISOString(),
                experiment
            });
        }
        navigate('/dashboard');
    };

    return (
        <div className="w-full max-w-2xl flex flex-col items-center animate-fade-in pb-20">
            <Card className="w-full">
                <CardHeader
                    title="90-Day Experiment Design"
                    subtitle="Design one small, concrete action that enacts your Massive Transformational Purpose at minimal scale."
                />

                <form onSubmit={handleSave} className="flex flex-col gap-4 mt-6">
                    <Input
                        label="What is the small concrete action?"
                        placeholder="e.g. Write 500 words every morning, host one community dinner"
                        value={experiment.action}
                        onChange={(e) => setExperiment(prev => ({ ...prev, action: e.target.value }))}
                        required
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            type="date"
                            label="Start Date"
                            value={experiment.startDate}
                            onChange={(e) => setExperiment(prev => ({ ...prev, startDate: e.target.value }))}
                            required
                        />
                        <Input
                            type="date"
                            label="Check-in Date"
                            value={experiment.checkInDate}
                            onChange={(e) => setExperiment(prev => ({ ...prev, checkInDate: e.target.value }))}
                            required
                        />
                    </div>
                    <Input
                        label="Name one person who knows about this commitment"
                        placeholder="e.g. Sarah, my coach"
                        value={experiment.accountabilityPerson}
                        onChange={(e) => setExperiment(prev => ({ ...prev, accountabilityPerson: e.target.value }))}
                        required
                    />
                    <div className="mt-6 flex justify-end">
                        <Button type="submit">Commit & Save</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};
