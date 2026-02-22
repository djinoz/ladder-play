import { db } from '../config/firebase';
import { doc, setDoc, getDoc, collection, addDoc } from 'firebase/firestore';

export const saveUserSectionData = async (userId: string, section: string, data: any) => {
    const docRef = doc(db, 'users', userId);
    await setDoc(docRef, { [section]: data }, { merge: true });
};

export const getUserData = async (userId: string) => {
    const docRef = doc(db, 'users', userId);
    const snap = await getDoc(docRef);
    return snap.exists() ? snap.data() : null;
};

export const saveSessionData = async (userId: string, sessionId: string, data: any) => {
    try {
        const sessionRef = doc(db, 'users', userId, 'sessions', sessionId);
        await setDoc(sessionRef, data, { merge: true });

        // Pass data off to telemetry stream automatically
        await saveAnonymizedTelemetry(data);
    } catch (error) {
        console.error("Error saving session data:", error);
        alert(`Failed to save data. Please check that Firestore rules are deployed. Error: ${(error as any).message}`);
        throw error;
    }
};

export const saveAnonymizedTelemetry = async (data: any) => {
    try {
        // Generate or retrieve a persistent unauthenticated session ID
        let localTelemetryId = localStorage.getItem('compass_telemetry_id');
        if (!localTelemetryId) {
            localTelemetryId = crypto.randomUUID ? crypto.randomUUID() : `anon_${Date.now()}_${Math.random()}`;
            localStorage.setItem('compass_telemetry_id', localTelemetryId);
        }

        const anonymizedData = { ...data };
        delete anonymizedData.email;
        delete anonymizedData.name;
        delete anonymizedData.userId;

        const telemetryRef = collection(db, 'anonymized_sessions');
        await addDoc(telemetryRef, {
            ...anonymizedData,
            clientTelemetryId: localTelemetryId,
            capturedAt: new Date().toISOString()
        });
    } catch (telemetryErr) {
        // Non-critical background task
        console.error("Failed to save anonymized telemetry:", telemetryErr);
    }
};

export const getUserProfile = async (userId: string) => {
    try {
        const userRef = doc(db, 'users', userId);
        const docSnap = await getDoc(userRef);
        return docSnap.exists() ? docSnap.data() : null;
    } catch (error) {
        console.error("Error fetching user profile:", error);
        throw error;
    }
};

export const getSessionData = async (userId: string, sessionId: string) => {
    const sessionRef = doc(db, 'users', userId, 'sessions', sessionId);
    const snap = await getDoc(sessionRef);
    return snap.exists() ? snap.data() : null;
};
