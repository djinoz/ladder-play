"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSpeech = exports.synthesizeMTP = exports.ladderingChat = void 0;
const functions = __importStar(require("firebase-functions"));
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const text_to_speech_1 = __importDefault(require("@google-cloud/text-to-speech"));
// Initialize Anthropic client grabbing the API key from Firebase environment secrets
// Ensure you have set: firebase functions:secrets:set ANTHROPIC_API_KEY
const anthropic = new sdk_1.default({
    apiKey: process.env.ANTHROPIC_API_KEY || "missing",
});
exports.ladderingChat = functions.runWith({ secrets: ["ANTHROPIC_API_KEY"] })
    .https.onCall(async (data, context) => {
    // Only allow authenticated users
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
    }
    const { messages, systemPrompt } = data;
    if (!messages || !Array.isArray(messages)) {
        throw new functions.https.HttpsError('invalid-argument', 'Messages array is required');
    }
    try {
        const response = await anthropic.messages.create({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 1024,
            system: systemPrompt || "You are an empathetic, insightful life coach helping a user uncover their core values through the '5 Whys' laddering technique.",
            messages: messages,
        });
        return {
            reply: response.content[0].text
        };
    }
    catch (error) {
        console.error("Anthropic API Error:", error);
        throw new functions.https.HttpsError('internal', 'AI service failed');
    }
});
exports.synthesizeMTP = functions.runWith({ secrets: ["ANTHROPIC_API_KEY"] })
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
    }
    catch (error) {
        console.error("Anthropic API Error:", error);
        throw new functions.https.HttpsError('internal', 'AI service failed');
    }
});
// Initialize Google Cloud TTS client (automatically uses Firebase environment auth)
const ttsClient = new text_to_speech_1.default.TextToSpeechClient();
exports.generateSpeech = functions.https.onCall(async (data, context) => {
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
            audioConfig: { audioEncoding: 'MP3' },
        };
        const [response] = await ttsClient.synthesizeSpeech(request);
        if (!response.audioContent) {
            throw new functions.https.HttpsError('internal', 'No audio content generated');
        }
        // Convert Uint8Array to base64 string for JSON transfer
        const audioBase64 = Buffer.from(response.audioContent).toString('base64');
        return { audioContent: audioBase64 };
    }
    catch (error) {
        console.error("Google Cloud TTS Error:", error);
        throw new functions.https.HttpsError('internal', 'TTS service failed');
    }
});
//# sourceMappingURL=index.js.map