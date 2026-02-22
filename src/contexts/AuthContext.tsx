import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../config/firebase';
import { onAuthStateChanged, isSignInWithEmailLink, signInWithEmailLink, sendSignInLinkToEmail, signOut as firebaseSignOut } from 'firebase/auth';
import type { User } from 'firebase/auth';

interface AuthContextType {
    currentUser: User | null;
    loading: boolean;
    sendMagicLink: (email: string) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Check for pending audit data from pre-login flows
                const pendingAuditStr = window.localStorage.getItem('pending_audit_data');
                if (pendingAuditStr) {
                    try {
                        // Remove immediately to prevent multi-tab race conditions
                        window.localStorage.removeItem('pending_audit_data');
                        const pendingData = JSON.parse(pendingAuditStr);
                        const { saveSessionData } = await import('../services/db');
                        await saveSessionData(user.uid, `audit_${Date.now()}`, pendingData);
                    } catch (e) {
                        console.error("Failed to migrate pending audit data:", e);
                    }
                }
            }
            setCurrentUser(user);
            setLoading(false);
        });

        if (isSignInWithEmailLink(auth, window.location.href)) {
            let email = window.localStorage.getItem('emailForSignIn');
            if (!email) {
                email = window.prompt('Please provide your email for confirmation');
            }
            if (email) {
                signInWithEmailLink(auth, email, window.location.href)
                    .then(async () => {
                        window.localStorage.removeItem('emailForSignIn');
                        window.history.replaceState(null, '', window.location.pathname);
                        // Note: Redirection to /dashboard is handled gracefully by Login.tsx's useEffect 
                        // when it detects currentUser. This prevents a hard window.location.href reload 
                        // from killing pending Firebase network writes.
                    })
                    .catch((error) => console.error("Error signing in with link", error));
            }
        }

        return unsubscribe;
    }, []);

    const sendMagicLink = async (email: string) => {
        const actionCodeSettings = {
            url: window.location.origin + window.location.pathname,
            handleCodeInApp: true,
        };
        await sendSignInLinkToEmail(auth, email, actionCodeSettings);
        window.localStorage.setItem('emailForSignIn', email);
    };

    const signOut = () => firebaseSignOut(auth);

    return (
        <AuthContext.Provider value={{ currentUser, loading, sendMagicLink, signOut }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
