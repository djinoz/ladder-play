import * as functions from "firebase-functions";
import Anthropic from "@anthropic-ai/sdk";
import textToSpeech from "@google-cloud/text-to-speech";

// Initialize Anthropic client grabbing the API key from Firebase environment secrets
// Ensure you have set: firebase functions:secrets:set ANTHROPIC_API_KEY
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || "missing",
});

export const ladderingChat = functions.runWith({ secrets: ["ANTHROPIC_API_KEY"] })
    .https.onCall(async (data, context) => {
        // Only allow authenticated users
        if (!context.auth) {
            throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
        }

        const { messages, currentTurn = 1, maxTurns = 5 } = data;

        if (!messages || !Array.isArray(messages)) {
            throw new functions.https.HttpsError('invalid-argument', 'Messages array is required');
        }

        const isFinalTurn = currentTurn >= maxTurns;

        const baseKellyPrompt = `You are a therapist conducting a "Kelly Laddering" session to discover the user's core constructs.
CORE STANCE:
- Be genuinely curious, not leading. Discover, do not confirm.
- Maintain "credulous listening": treat every response as meaningful.
- Resist the urge to interpret or reflect back prematurely. The user's words are the data.
- Do not offer candidate answers or assume the user's position.

QUESTIONING TECHNIQUE:
- NEVER paraphrase upward. Use the user's EXACT words in your questions.
- Primary probe format: "And why is [their exact phrase] important to you?"
- Alternative probes: "What would it mean if you didn't have that?" or "What does that give you?"
- Do NOT ask "how does that make you feel?".
- Ask ONLY ONE short question at a time. Do not add filler text.`;

        const finalTurnPrompt = `You are a therapist concluding a "Kelly Laddering" session.
You have gone through enough iterations. This is the final turn. Do NOT ask any more questions.
Instead, "Close the Ladder" using the following format:
1. Summarize the full ladder back to the client in their own words, from bottom to top, formatting the ladder elements as a bulleted list.
2. Add a clear double newline, then tentatively offer 3-5 core constructs (values) that emerged from their words, formatted as a numbered list.
3. Add a clear double newline, then end by asking exactly: "So it sounds like what matters most is what we've outlined here... does that feel like an accurate picture?"
Keep your tone collaborative and tentative. Offer the output as a hypothesis, not a verdict. Remember to use proper markdown formatting and line breaks for readability.`;

        const promptToUse = isFinalTurn ? finalTurnPrompt : baseKellyPrompt;

        try {
            const response = await anthropic.messages.create({
                model: "claude-haiku-4-5-20251001",
                max_tokens: 1024,
                system: promptToUse,
                messages: messages,
            });

            return {
                reply: response.content[0].text,
                isConcluded: isFinalTurn
            };
        } catch (error) {
            console.error("Anthropic API Error:", error);
            throw new functions.https.HttpsError('internal', 'AI service failed');
        }
    });

export const synthesizeMTP = functions.runWith({ secrets: ["ANTHROPIC_API_KEY"] })
    .https.onCall(async (data, context) => {
        if (!context.auth) {
            throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
        }

        const { contextData } = data;

        try {
            const prompt = `Based on the following user data gathered from meaning-making exercises, synthesise a single, coherent Massive Transformational Purpose (MTP) draft for them. The MTP should be ambitious, emotionally resonant, and grounded in their peak experiences and contributions. Do not include introductory fluff, just provide the drafted MTP statement and a short paragraph explaining why it fits them. \n\n[SYSTEM NOTE: If history grows extensive, older sessions are pre-summarized below to minimize token cost while retaining crucial backstory.]\n\nUser Data: ${JSON.stringify(contextData)}`;

            const response = await anthropic.messages.create({
                model: "claude-haiku-4-5-20251001",
                max_tokens: 1500,
                messages: [{ role: "user", content: prompt }]
            });

            return {
                synthesis: response.content[0].text
            };
        } catch (error) {
            console.error("Anthropic API Error:", error);
            throw new functions.https.HttpsError('internal', 'AI service failed');
        }
    });

// Initialize Google Cloud TTS client (automatically uses Firebase environment auth)
const ttsClient = new textToSpeech.TextToSpeechClient();

export const generateSpeech = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be logged in to use TTS');
    }

    const { text } = data;

    if (!text || typeof text !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'Text is required');
    }

    try {
        const request = {
            input: { text: text },
            voice: { languageCode: 'en-US', name: 'en-US-Journey-F' }, // Using a premium Journey voice
            audioConfig: { audioEncoding: 'MP3' as const },
        };

        const [response] = await ttsClient.synthesizeSpeech(request);

        if (!response.audioContent) {
            throw new functions.https.HttpsError('internal', 'No audio content generated');
        }

        // Convert Uint8Array to base64 string for JSON transfer
        const audioBase64 = Buffer.from(response.audioContent as Uint8Array).toString('base64');
        return { audioContent: audioBase64 };

    } catch (error) {
        console.error("Google Cloud TTS Error:", error);
        throw new functions.https.HttpsError('internal', 'TTS service failed');
    }
});
