
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Compass, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const AppLayout = () => {
    const { currentUser, signOut } = useAuth();
    const location = useLocation();

    return (
        <div className="min-h-screen print:min-h-0 print:block flex flex-col items-center print:bg-white print:text-black">
            {/* Dynamic Background */}
            <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black overflow-hidden pointer-events-none print:hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/10 blur-[150px]"></div>
            </div>

            <header className="w-full max-w-5xl px-6 py-6 flex justify-between items-center z-10 glass-panel border-t-0 border-r-0 border-l-0 border-b border-white/5 rounded-none shadow-none bg-transparent/20 print:hidden">
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="p-2 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                        <Compass className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                        Compass
                    </span>
                </Link>
                <nav>
                    {currentUser ? (
                        <div className="flex items-center gap-4">
                            {location.pathname !== '/dashboard' && (
                                <Link to="/dashboard" className="text-sm font-medium text-textSecondary hover:text-white transition-colors">
                                    Dashboard
                                </Link>
                            )}
                            <button
                                onClick={signOut}
                                className="flex items-center gap-2 text-sm text-slate-400 hover:text-red-400 transition-colors"
                                title={`Sign Out ${currentUser.displayName || currentUser.email || ''}`}
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <Link to="/login" className="text-sm font-medium text-primary hover:text-sky-300 transition-colors">
                            Sign In
                        </Link>
                    )}
                </nav>
            </header>

            <main className="flex-1 print:flex-none print:block w-full max-w-4xl px-4 py-8 md:py-12 z-10 flex flex-col items-center">
                <Outlet />
            </main>

            <footer className="w-full py-6 text-center text-xs text-textSecondary z-10 print:hidden">
                <p>A meaning-making toolkit.</p>
            </footer>
        </div>
    );
};
