const admin = require('firebase-admin');
admin.initializeApp({
    projectId: 'ladder-play'
});

const db = admin.firestore();

async function analyze() {
    console.log("Fetching recent laddering sessions...");
    try {
        // We'll check all users' sessions (requires subcollection group query or checking anonymized_sessions)
        const snapshot = await db.collection('anonymized_sessions')
            .where('type', '==', 'laddering_ai')
            .orderBy('completedAt', 'desc')
            .limit(5)
            .get();

        if (snapshot.empty) {
            console.log('No recent sessions found in anonymized_sessions.');
            return;
        }

        snapshot.forEach(doc => {
            console.log(`\n\n=== Session ID: ${doc.id} | Completed: ${doc.data().completedAt} ===`);
            const messages = doc.data().messages || [];
            messages.forEach((m, i) => {
                console.log(`[${m.role.toUpperCase()}] (${i + 1}): ${m.content}`);
            });
        });
    } catch (e) {
        console.error("Error fetching sessions:", e);
    }
}

analyze();
