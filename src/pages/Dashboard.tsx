import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import ReactMarkdown from 'react-markdown';
import { db } from '../config/firebase';
import { collection, getDocs, query } from 'firebase/firestore';

export const Dashboard = () => {
    const { currentUser } = useAuth();
    const [sessions, setSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSession, setSelectedSession] = useState<any | null>(null);

    useEffect(() => {
        if (!currentUser) return;

        const fetchHistory = async () => {
            try {
                const q = query(
                    collection(db, 'users', currentUser.uid, 'sessions'),
                    // Assuming we ordered by ID string or added a timestamp
                );
                const querySnapshot = await getDocs(q);
                const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                // Sort effectively (newest first assuming timestamp based ids)
                data.sort((a, b) => b.id.localeCompare(a.id));
                setSessions(data);
            } catch (err) {
                console.error("Failed to load history", err);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [currentUser]);

    const hasCompletedAudit = sessions.some(s => s.type === 'meaning_audit' && (s.status === 'completed' || s.completedAt));
    const hasCompletedLaddering = sessions.some(s => s.type === 'laddering_ai' && (s.status === 'completed' || s.completedAt));
    const areCoreModulesFinished = hasCompletedAudit && hasCompletedLaddering;
    const hasOtherModules = sessions.some(s => s.type !== 'meaning_audit' && (s.status === 'completed' || s.completedAt));
    const canExportPdf = hasCompletedAudit && hasOtherModules;

    // Calculate generic progress count for UI
    const modulesCompletedCount = new Set(sessions.filter(s => s.status === 'completed' || s.completedAt).map(s => s.type)).size;
    const totalModules = 6; // Not counting 90-day experiment as a core input module

    const isCoreLocked = !areCoreModulesFinished;
    const isMtpLocked = modulesCompletedCount < 4;

    const ProgressIndicator = ({ type }: { type: string }) => {
        const session = sessions.find(s => s.type === type);
        const isDone = session?.status === 'completed' || session?.completedAt;
        let pText = '0%';
        let pClass = 'bg-slate-800/80 border-slate-700 text-slate-500 w-8';
        let pHover = 'Not started yet.';

        if (isDone) {
            pText = '✓';
            pClass = 'bg-emerald-900/30 border-emerald-500/30 text-emerald-400 w-8';
            pHover = 'Module 100% completed.';
        } else if (session?.progressStep && session?.totalSteps) {
            pText = Math.round((session.progressStep / session.totalSteps) * 100) + '%';
            pClass = 'bg-primary/20 border-primary/30 text-primary whitespace-nowrap px-2';
            pHover = `In progress: ${"Step " + session.progressStep + " of " + session.totalSteps}.`;
        } else if (session) {
            pText = 'Started';
            pClass = 'bg-primary/20 border-primary/30 text-primary whitespace-nowrap px-2 text-[10px]';
            pHover = 'Module started but not finished.';
        }

        return (
            <div className="absolute top-4 right-4 group z-20">
                <div className={`h-8 min-w-[32px] rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold shadow-inner transition-all ${pClass}`}>
                    {pText}
                </div>
                <div className="absolute top-full right-0 mt-2 w-48 p-2 bg-slate-800 text-slate-200 text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 text-center border border-slate-700 pointer-events-none">
                    {pHover}
                </div>
            </div>
        );
    };

    return (
        <div className="w-full max-w-4xl mx-auto flex flex-col gap-8 animate-fade-in pb-12 relative">

            {/* Print-only Disclaimer / Progress Header */}
            <div className="hidden print:block mb-8 pb-6 border-b border-slate-300">
                <h2 className="text-4xl font-bold text-black mb-2">Meaning & Purpose Report</h2>
                <div className="flex items-center gap-4 mb-4">
                    <span className="text-lg font-medium text-slate-700">Progress: {modulesCompletedCount} / {totalModules} Modules</span>
                    <div className="w-64 h-4 bg-slate-200 rounded-full overflow-hidden">
                        <div className="bg-slate-800 h-full" style={{ width: `${(modulesCompletedCount / totalModules) * 100}%` }}></div>
                    </div>
                </div>
                <div className="p-4 bg-slate-100 border border-slate-300 rounded-lg text-slate-800 text-sm">
                    <strong>Interim Draft Disclaimer:</strong> This document represents a snapshot of your ongoing work.
                    Your outputs and Massive Transformational Purpose (MTP) will evolve as you complete more modules
                    and gain deeper clarity. Treat this as an emerging hypothesis, not a final destination.
                </div>
            </div>

            <div className="flex justify-between items-end pb-6 border-b border-surface print:hidden">
                <div>
                    <h1 className="text-3xl font-bold text-textPrimary mb-1">Your Compass</h1>
                    <p className="text-textSecondary text-sm">{currentUser?.email}</p>
                </div>

                {canExportPdf ? (
                    <Button variant="secondary" onClick={() => window.print()} className="gap-2 shadow-md">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        Export PDF
                    </Button>
                ) : (
                    <div className="text-right group relative cursor-help">
                        <div className="text-sm font-medium mb-1 text-slate-300">Unlock PDF Export</div>
                        <div className="w-48 h-2 bg-slate-800 rounded-full overflow-hidden border border-white/5 ml-auto">
                            <div className="bg-gradient-to-r from-blue-500 to-primary h-full" style={{ width: `${(Math.min(modulesCompletedCount, 2) / 2) * 100}%` }}></div>
                        </div>
                        <div className="text-xs text-slate-400 mt-2">Complete Audit & 1 other module</div>

                        {/* Hover Tooltip */}
                        <div className="absolute top-full right-0 mt-2 w-64 p-3 bg-slate-800 text-slate-200 text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 text-left border border-slate-700 pointer-events-none">
                            Your Meaning & Purpose report becomes significantly more valuable once you've generated enough structured data. Complete the Meaning Audit and at least one other module to unlock the PDF generation feature!
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:hidden">

                {/* Module 1 */}
                <Card className="hover:border-primary/50 transition-colors group cursor-pointer relative overflow-hidden">
                    <Link to="/audit" className="absolute inset-0 z-10" />
                    <ProgressIndicator type="meaning_audit" />
                    <div className="w-12 h-12 bg-sky-900/40 rounded-xl flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform">📊</div>
                    <CardHeader title="Module 1: Meaning Audit" subtitle="Map the gap between importance and fulfillment across 8 life domains." />
                </Card>

                {/* Module 2 */}
                <Card className="hover:border-primary/50 transition-colors group cursor-pointer relative overflow-hidden">
                    <Link to="/laddering" className="absolute inset-0 z-10" />
                    <ProgressIndicator type="laddering_ai" />
                    <div className="w-12 h-12 bg-sky-900/40 rounded-xl flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform">🪜</div>
                    <CardHeader title="Module 2: Values Laddering (AI)" subtitle="Voice-enabled AI 5-whys reflection based on what feels good." />
                </Card>

                {/* Module 3 */}
                <Card className={isCoreLocked ? "opacity-50 grayscale border-slate-800 transition-colors group relative overflow-hidden cursor-not-allowed" : "hover:border-amber-500/50 transition-colors group cursor-pointer relative overflow-hidden"}>
                    {isCoreLocked ? (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[1px]">
                            <div className="bg-slate-800 text-slate-200 text-xs py-1.5 px-3 rounded-md shadow-xl border border-slate-700 font-medium">
                                Complete Modules 1 & 2 first
                            </div>
                        </div>
                    ) : (
                        <Link to="/peak" className="absolute inset-0 z-10" />
                    )}
                    <ProgressIndicator type="peak_experience" />
                    <div className={`w-12 h-12 bg-amber-900/40 rounded-xl flex items-center justify-center text-xl mb-4 transition-transform ${isCoreLocked ? '' : 'group-hover:scale-110'}`}>🏔️</div>
                    <CardHeader title="Module 3: Peak Experience" subtitle="Mine 3 peak moments for repeating patterns." />
                </Card>

                {/* Module 4 */}
                <Card className={isCoreLocked ? "opacity-50 grayscale border-slate-800 transition-colors group relative overflow-hidden cursor-not-allowed" : "hover:border-emerald-500/50 transition-colors group cursor-pointer relative overflow-hidden"}>
                    {isCoreLocked ? (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[1px]">
                            <div className="bg-slate-800 text-slate-200 text-xs py-1.5 px-3 rounded-md shadow-xl border border-slate-700 font-medium">
                                Complete Modules 1 & 2 first
                            </div>
                        </div>
                    ) : (
                        <Link to="/explore" className="absolute inset-0 z-10" />
                    )}
                    <ProgressIndicator type="domain_exploration" />
                    <div className={`w-12 h-12 bg-emerald-900/40 rounded-xl flex items-center justify-center text-xl mb-4 transition-transform ${isCoreLocked ? '' : 'group-hover:scale-110'}`}>🌐</div>
                    <CardHeader title="Module 4: Domain Exploration" subtitle="Explore the 10 post-scarcity domains." />
                </Card>

                {/* Module 5 */}
                <Card className={isCoreLocked ? "opacity-50 grayscale border-slate-800 transition-colors group relative overflow-hidden cursor-not-allowed" : "hover:border-rose-500/50 transition-colors group cursor-pointer relative overflow-hidden"}>
                    {isCoreLocked ? (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[1px]">
                            <div className="bg-slate-800 text-slate-200 text-xs py-1.5 px-3 rounded-md shadow-xl border border-slate-700 font-medium">
                                Complete Modules 1 & 2 first
                            </div>
                        </div>
                    ) : (
                        <Link to="/contribution" className="absolute inset-0 z-10" />
                    )}
                    <ProgressIndicator type="contribution" />
                    <div className={`w-12 h-12 bg-rose-900/40 rounded-xl flex items-center justify-center text-xl mb-4 transition-transform ${isCoreLocked ? '' : 'group-hover:scale-110'}`}>🤝</div>
                    <CardHeader title="Module 5: Contribution Calibration" subtitle="Reflect on the stakes and who relies on you." />
                </Card>

                {/* Module 6 */}
                <Card className={isMtpLocked ? "opacity-50 grayscale border-slate-800 transition-colors group relative overflow-hidden cursor-not-allowed" : "hover:border-indigo-500/50 transition-colors group cursor-pointer relative overflow-hidden"}>
                    {isMtpLocked ? (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[1px]">
                            <div className="bg-slate-800 text-slate-200 text-xs py-1.5 px-3 rounded-md shadow-xl border border-slate-700 font-medium">
                                Complete 4 modules first
                            </div>
                        </div>
                    ) : (
                        <Link to="/mtp" className="absolute inset-0 z-10" />
                    )}
                    <ProgressIndicator type="mtp_draft" />
                    <div className={`w-12 h-12 bg-indigo-900/40 rounded-xl flex items-center justify-center text-xl mb-4 transition-transform ${isMtpLocked ? '' : 'group-hover:scale-110'}`}>✨</div>
                    <CardHeader title="Module 6: MTP Drafting (AI)" subtitle="Synthesize all previous modules into your Massive Transformational Purpose." />
                </Card>

                {/* Module 7 */}
                <Card className={isMtpLocked ? "opacity-50 grayscale border-slate-800 transition-colors group relative overflow-hidden cursor-not-allowed md:col-span-2 max-w-lg mx-auto w-full" : "hover:border-violet-500/50 transition-colors group cursor-pointer relative overflow-hidden md:col-span-2 max-w-lg mx-auto w-full"}>
                    {isMtpLocked ? (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[1px]">
                            <div className="bg-slate-800 text-slate-200 text-xs py-1.5 px-3 rounded-md shadow-xl border border-slate-700 font-medium">
                                Complete 4 modules first
                            </div>
                        </div>
                    ) : (
                        <Link to="/experiment" className="absolute inset-0 z-10" />
                    )}
                    <ProgressIndicator type="experiment" />
                    <div className={`w-12 h-12 bg-violet-900/40 rounded-xl flex items-center justify-center text-xl mb-4 transition-transform ${isMtpLocked ? '' : 'group-hover:scale-110'}`}>🧪</div>
                    <CardHeader title="Module 7: 90-Day Experiment" subtitle="Commit to one small concrete action." />
                </Card>

            </div>

            <h2 className="text-2xl font-semibold mt-8 border-b border-surface pb-4 print:hidden">Activity History</h2>

            {loading ? (
                <p className="text-textSecondary text-center py-8 print:hidden">Loading history...</p>
            ) : sessions.length === 0 ? (
                <Card className="bg-surface/30 text-center py-12 border border-dashed border-slate-700 print:hidden">
                    <p className="text-textSecondary mb-4">No activity recorded yet.</p>
                    <Link to="/audit">
                        <Button variant="secondary">Start your first Meaning Audit</Button>
                    </Link>
                </Card>
            ) : (
                <div className="flex flex-col gap-4 print:hidden">
                    {sessions.map(sess => (
                        <Card key={sess.id} className="flex justify-between items-center py-4 bg-surface/50">
                            <div>
                                <h4 className="font-semibold text-textPrimary capitalize">
                                    {sess.type ? sess.type.replace('_', ' ') : 'Module Session'}
                                </h4>
                                <p className="text-xs text-textSecondary">
                                    {new Date(sess.completedAt || sess.lastUpdated || Date.now()).toLocaleString()}
                                </p>
                            </div>
                            <Button variant="ghost" className="text-sm border border-slate-700" onClick={() => setSelectedSession(sess)}>View Data</Button>
                        </Card>
                    ))}
                </div>
            )}

            {selectedSession && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedSession(null)}>
                    <div className="bg-surface border border-white/10 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center p-4 border-b border-white/5">
                            <h3 className="font-semibold text-textPrimary capitalize">
                                {selectedSession.type ? selectedSession.type.replace('_', ' ') : 'Session Data'}
                            </h3>
                            <button onClick={() => setSelectedSession(null)} className="text-textSecondary hover:text-white transition-colors text-2xl leading-none">&times;</button>
                        </div>
                        <div className="p-4 overflow-y-auto w-full">
                            <div className="flex flex-col gap-2 text-sm text-textSecondary mb-4">
                                {selectedSession.lastUpdated && (
                                    <div><strong>Last Updated:</strong> {new Date(selectedSession.lastUpdated).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                                )}
                                {selectedSession.completedAt && (
                                    <div><strong>Completed At:</strong> {new Date(selectedSession.completedAt).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                                )}
                                <div><strong>Status:</strong> <span className={selectedSession.status === 'completed' ? 'text-emerald-400' : 'text-primary'}>{selectedSession.status || 'Unknown'}</span></div>
                            </div>

                            {selectedSession.type === 'meaning_audit' && selectedSession.ratings ? (
                                <div className="w-full h-[400px] bg-surface/40 rounded-xl overflow-hidden mt-2 border border-slate-700/50">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={
                                            ['Work & Vocation', 'Relationships', 'Creative Life', 'Contemplative Life', 'Body & Health', 'Community Contribution', 'Nature', 'Transcendent / Unknown'].map(domain => ({
                                                subject: domain.split(' ')[0],
                                                Importance: selectedSession.ratings[domain]?.importance || 0,
                                                Fulfillment: selectedSession.ratings[domain]?.fulfillment || 0,
                                                fullMark: 10,
                                            }))
                                        }>
                                            <PolarGrid stroke="#334155" />
                                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                            <PolarRadiusAxis angle={30} domain={[0, 10]} max={10} tick={false} axisLine={false} />
                                            <Radar name="Importance" dataKey="Importance" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.2} />
                                            <Radar name="Fulfillment" dataKey="Fulfillment" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.4} />
                                            <Legend />
                                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} itemStyle={{ color: '#f8fafc' }} />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : selectedSession.type === 'laddering_ai' && selectedSession.messages ? (
                                <div className="flex flex-col gap-3 mt-4">
                                    {selectedSession.messages.map((m: any, i: number) => {
                                        // Calculate depth for color gradation (0 to 1 based on position in chat)
                                        const depth = Math.min(1, i / Math.max(1, selectedSession.messages.length - 1));

                                        // Interpolate from a light blue/slate to a deeper violet/indigo as the ladder goes deeper
                                        // For user: primary (blue) to purple
                                        // For AI: slate to dark indigo
                                        const isUser = m.role === 'user';

                                        // HSL interpolation for user messages: from H=199 (sky blue) to H=262 (violet)
                                        const userHue = Math.round(199 + depth * (262 - 199));
                                        // HSL interpolation for AI messages: from slate to darker indigo
                                        const aiHue = Math.round(214 + depth * (240 - 214));

                                        const bgColor = isUser
                                            ? `hsla(${userHue}, 80%, 40%, ${0.2 + depth * 0.3})`
                                            : `hsla(${aiHue}, 30%, 25%, ${0.4 + depth * 0.6})`;

                                        const borderColor = isUser
                                            ? `hsla(${userHue}, 80%, 60%, 0.3)`
                                            : `hsla(${aiHue}, 40%, 40%, 0.3)`;

                                        return (
                                            <div key={i} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                                                <div
                                                    className={`p-3 rounded-2xl max-w-[85%] shadow-sm prose prose-sm prose-invert prose-p:leading-relaxed prose-li:my-1 prose-ul:my-2 prose-ol:my-2 ${isUser ? 'rounded-tr-sm text-white' : 'rounded-tl-sm text-slate-200'
                                                        }`}
                                                    style={{
                                                        backgroundColor: bgColor,
                                                        borderColor: borderColor,
                                                        borderWidth: '1px'
                                                    }}
                                                >
                                                    <div className="text-[10px] opacity-50 mb-1 uppercase tracking-wider font-semibold">
                                                        {isUser ? 'You' : 'Guide'} • Level {Math.floor(i / 2) + 1}
                                                    </div>
                                                    <ReactMarkdown>{m.content}</ReactMarkdown>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : selectedSession.type === 'mtp_draft' && selectedSession.draft ? (
                                <div className="prose prose-sm prose-invert prose-p:leading-relaxed text-white max-w-none bg-surface/40 p-6 rounded-xl border border-slate-700/50 mt-4">
                                    <ReactMarkdown>{selectedSession.draft}</ReactMarkdown>
                                </div>
                            ) : selectedSession.type === 'domain_exploration' && selectedSession.ratings ? (
                                <div className="grid grid-cols-2 gap-4 mt-4">
                                    {Object.entries(selectedSession.ratings).map(([domainId, r]: any) => (
                                        <div key={domainId} className="bg-surface/40 p-4 rounded-xl border border-slate-700/50">
                                            <div className="font-semibold capitalize text-slate-200 mb-1">{domainId}</div>
                                            <div className="text-xs text-slate-400">Aliveness: <span className="text-white font-medium">{r.alive}/5</span></div>
                                            <div className="text-xs text-slate-400">Neglect: <span className="text-white font-medium">{r.neglected}/5</span></div>
                                        </div>
                                    ))}
                                </div>
                            ) : selectedSession.type === 'peak_experience' && selectedSession.experiences ? (
                                <div className="flex flex-col gap-4 mt-4">
                                    {Object.entries(selectedSession.experiences).filter(([_, v]) => v).map(([k, v]: any) => (
                                        <div key={k} className="bg-surface/40 p-4 rounded-xl border border-slate-700/50">
                                            <div className="font-semibold text-primary text-lg mb-2 capitalize">Most {k}</div>
                                            <div className="text-sm text-slate-300 leading-relaxed">{v}</div>
                                        </div>
                                    ))}
                                </div>
                            ) : selectedSession.type === 'contribution' && selectedSession.responses ? (
                                <div className="flex flex-col gap-4 mt-4">
                                    {Object.entries(selectedSession.responses).map(([k, v]: any) => (
                                        <div key={k} className="bg-surface/40 p-4 rounded-xl border border-slate-700/50">
                                            <div className="font-semibold capitalize text-primary mb-2">{k.replace(/([A-Z])/g, ' $1').trim()}</div>
                                            <div className="text-sm text-slate-300 leading-relaxed">{v}</div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <pre className="bg-slate-900 p-4 rounded-lg text-xs md:text-sm text-slate-300 overflow-x-auto whitespace-pre-wrap font-mono border border-slate-800 mt-4">
                                    {JSON.stringify(selectedSession, null, 2)}
                                </pre>
                            )}
                        </div>
                        <div className="p-4 border-t border-white/5 bg-slate-900/50 text-right">
                            <Button variant="secondary" onClick={() => setSelectedSession(null)}>Close</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Print-only Detailed Results */}
            <div className="hidden print:flex flex-col gap-8 mt-4 bg-white text-black p-0 rounded-xl shadow-none w-full max-w-none">
                <h1 className="text-3xl font-bold border-b border-slate-300 pb-2 mb-6 text-black">Completed Modules Data</h1>
                {[...sessions]
                    .filter(s => s.status === 'completed' || s.completedAt)
                    .sort((a, b) => {
                        const order = ['meaning_audit', 'laddering_ai', 'peak_experience', 'domain_exploration', 'contribution', 'mtp_draft', 'experiment'];
                        return order.indexOf(a.type) - order.indexOf(b.type);
                    })
                    .map(sess => (
                        <div key={'print-' + sess.id} className="mb-8 break-inside-avoid border border-slate-200 p-6 rounded-lg bg-slate-50 text-black">
                            <h3 className="text-2xl font-bold mb-4 capitalize border-b border-slate-300 pb-2 text-slate-800">
                                {sess.type ? sess.type.replace('_', ' ') : 'Module Session'}
                            </h3>
                            {sess.type === 'meaning_audit' && sess.ratings && (
                                <div className="w-full flex justify-center mt-4">
                                    <RadarChart cx="50%" cy="50%" outerRadius={100} width={500} height={300} data={
                                        ['Work & Vocation', 'Relationships', 'Creative Life', 'Contemplative Life', 'Body & Health', 'Community Contribution', 'Nature', 'Transcendent / Unknown'].map(domain => ({
                                            subject: domain.split(' ')[0],
                                            Importance: sess.ratings[domain]?.importance || 0,
                                            Fulfillment: sess.ratings[domain]?.fulfillment || 0,
                                            fullMark: 10,
                                        }))
                                    }>
                                        <PolarGrid stroke="#cbd5e1" />
                                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 12 }} />
                                        <PolarRadiusAxis angle={30} domain={[0, 10]} max={10} tick={false} axisLine={false} />
                                        <Radar name="Importance" dataKey="Importance" stroke="#0284c7" fill="#0284c7" fillOpacity={0.2} />
                                        <Radar name="Fulfillment" dataKey="Fulfillment" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.4} />
                                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                    </RadarChart>
                                </div>
                            )}
                            {sess.type === 'laddering_ai' && sess.messages && (
                                <div className="flex flex-col gap-2">
                                    <h4 className="font-semibold text-slate-700">AI Final Synthesis:</h4>
                                    {sess.messages.filter((m: any) => m.role === 'assistant').slice(-1).map((m: any, i: number) => (
                                        <div key={i} className="prose prose-sm text-black max-w-none">
                                            <ReactMarkdown>{m.content}</ReactMarkdown>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {sess.type === 'mtp_draft' && sess.draft && (
                                <div className="prose prose-sm text-black max-w-none">
                                    <ReactMarkdown>{sess.draft}</ReactMarkdown>
                                </div>
                            )}
                            {sess.type === 'domain_exploration' && sess.ratings && (
                                <div className="grid grid-cols-2 gap-4">
                                    {Object.entries(sess.ratings).map(([domainId, r]: any) => (
                                        <div key={domainId} className="mb-2">
                                            <div className="font-semibold capitalize">{domainId}</div>
                                            <div className="text-sm">Aliveness: {r.alive}/5 | Neglected: {r.neglected}/5</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {sess.type === 'peak_experience' && sess.experiences && (
                                <div className="flex flex-col gap-4 mt-4">
                                    {Object.entries(sess.experiences).filter(([_, v]) => v).map(([k, v]: any) => (
                                        <div key={k}>
                                            <div className="font-semibold text-slate-800 text-lg capitalize">Most {k}</div>
                                            <div className="text-sm text-slate-700 mt-1">{v}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {sess.type === 'contribution' && sess.responses && (
                                <div className="flex flex-col gap-4">
                                    {Object.entries(sess.responses).map(([k, v]: any) => (
                                        <div key={k}>
                                            <div className="font-semibold capitalize text-slate-800">{k}</div>
                                            <div className="text-sm text-slate-700">{v}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}

                <div className="mt-12 pt-6 border-t border-slate-300 text-xs text-slate-500 text-center">
                    <strong>Disclaimer:</strong> This application and report are provided as-is without warranty.
                    This tool is not designed for professional coaching, therapy, or counselling, it is merely a framework for self-reflection.
                    You should always seek professional advice where appropriate.
                </div>
            </div>

        </div>
    );
};
