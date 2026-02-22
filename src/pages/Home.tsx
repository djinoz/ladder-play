import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowRight, Play } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const Home = () => {
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

    return (
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto pt-12 md:pt-20 pb-20 relative">
            <div className="mb-8 p-4 bg-primary/10 rounded-full shadow-[0_0_40px_rgba(56,189,248,0.2)]">
                <Compass className="w-16 h-16 text-primary" />
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">
                Discover <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">What You're For</span>
            </h1>

            <p className="text-lg md:text-xl text-textSecondary mb-10 leading-relaxed font-light">
                Compass is a guided, self-directed journal to map your life's meaning, trace your peak experiences, and design experiments for growth.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                <Link to="/audit">
                    <Button className="w-full sm:w-auto text-lg px-8 py-4 gap-2 shadow-lg">
                        Start the Audit <ArrowRight className="w-5 h-5" />
                    </Button>
                </Link>
            </div>

            <div className="mt-24 glass-panel rounded-2xl p-8 text-left w-full border border-white/5 bg-gradient-to-br from-surface/80 to-background/80">
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <div className="w-2 h-6 bg-primary rounded-full"></div>
                    How it works
                </h3>
                <ul className="space-y-10 text-textSecondary">
                    <li className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5 text-sm font-medium text-primary shadow-inner">1</div>
                        <div>
                            <strong className="block text-white mb-1 tracking-wide">The Meaning Audit</strong>
                            <span>No account required for the first module. Jump right in and map your current fulfillment across 8 domains.</span>
                        </div>
                    </li>
                    <li className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5 text-sm font-medium text-primary shadow-inner">2</div>
                        <div>
                            <strong className="block text-white mb-1 tracking-wide">Save & Reflect</strong>
                            <span>
                                Create a free account with just your email to save your progress and return to your journal.
                                <span className="block mt-2 text-primary font-medium bg-primary/10 border border-primary/20 p-3 rounded-lg text-sm">
                                    We don't send newsletters, we don't growth-hack, and we don't sell data. We just use your email as a secure key to your private journal.
                                </span>
                            </span>
                        </div>
                    </li>
                    <li className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5 text-sm font-medium text-primary shadow-inner">3</div>
                        <div className="w-full">
                            <strong className="block text-white mb-1 tracking-wide">Go Deeper</strong>
                            <span className="block mb-4">Unlock premium AI-guided analysis and voice interactions to synthesise your massive transformational purpose.</span>

                            <div className="relative rounded-xl overflow-hidden border border-white/10 shadow-lg group w-full sm:w-3/4 mx-auto mt-6">
                                <img src="/dashboard-preview.png" alt="Dashboard Preview" className="w-full h-auto object-contain bg-slate-900 transition-transform duration-700 group-hover:scale-105" />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent flex items-end p-4">
                                    <Button variant="secondary" onClick={() => setIsVideoModalOpen(true)} className="gap-2 text-sm bg-slate-800/80 hover:bg-slate-700 backdrop-blur border-white/10">
                                        <Play className="w-4 h-4 text-primary" /> Learn more...
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </li>
                </ul>
            </div>

            {isVideoModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in" onClick={() => setIsVideoModalOpen(false)}>
                    <div className="bg-surface border border-white/10 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center p-4 border-b border-white/5">
                            <h3 className="font-semibold text-textPrimary">Compass Platform Demo</h3>
                            <button onClick={() => setIsVideoModalOpen(false)} className="text-textSecondary hover:text-white transition-colors text-2xl leading-none">&times;</button>
                        </div>
                        <div className="aspect-video bg-black flex items-center justify-center relative">
                            {/* Placeholder for YouTube Embed */}
                            <div className="text-center">
                                <Play className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                                <p className="text-slate-500 font-medium">Here is where we will demo the full dashboard.</p>
                                <p className="text-slate-600 text-sm mt-2">(YouTube iframe goes here)</p>
                            </div>
                        </div>
                        <div className="p-4 bg-slate-900/50 text-right">
                            <Button variant="secondary" onClick={() => setIsVideoModalOpen(false)}>Dismiss</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
