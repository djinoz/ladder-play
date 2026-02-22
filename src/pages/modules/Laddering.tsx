import { useState, useRef, useEffect } from 'react';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

import { useAuth } from '../../contexts/AuthContext';
import { saveSessionData } from '../../services/db';
import { functions } from '../../config/firebase';
import { httpsCallable } from 'firebase/functions';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, Volume2, VolumeX, Send } from 'lucide-react';

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export const Laddering = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputMsg, setInputMsg] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isVoiceMode, setIsVoiceMode] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isVoiceSupported, setIsVoiceSupported] = useState(true);
    const isRecordingRef = useRef(false);
    const wasRecordingBeforeSpeechRef = useRef(false);

    const endOfMessagesRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        // Initialize Web Speech API
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = false;

            recognitionRef.current.onresult = (event: any) => {
                let newTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    newTranscript += event.results[i][0].transcript + ' ';
                }
                setInputMsg(prev => prev + (prev && newTranscript.trim() ? ' ' : '') + newTranscript.trim());
            };

            recognitionRef.current.onend = () => {
                if (isRecordingRef.current) {
                    try { recognitionRef.current.start(); } catch (e) {
                        isRecordingRef.current = false;
                        setIsRecording(false);
                    }
                } else {
                    setIsRecording(false);
                }
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error("Speech recognition error", event.error);
                isRecordingRef.current = false;
                setIsRecording(false);
                if (event.error === 'not-allowed' || event.error === 'service-not-allowed' || event.error === 'network') {
                    alert(`Voice recognition failed (${event.error}).\n\nThis is typically caused by browser privacy shields (like Brave) blocking the speech recognition server. Please try Chrome or Safari.`);
                }
            };
        } else {
            setIsVoiceSupported(false);
        }
    }, []);

    const toggleRecording = () => {
        if (!recognitionRef.current) return alert("Voice recognition not supported in this browser.");

        if (isRecording) {
            isRecordingRef.current = false;
            setIsRecording(false);
            recognitionRef.current.stop();
        } else {
            isRecordingRef.current = true;
            setIsRecording(true);
            recognitionRef.current.start();
        }
    };

    const speakText = async (text: string) => {
        if (!isVoiceMode) return;

        // If we are currently recording, stop listening so we don't pick up our own voice
        if (isRecordingRef.current && recognitionRef.current) {
            wasRecordingBeforeSpeechRef.current = true;
            isRecordingRef.current = false;
            setIsRecording(false);
            try { recognitionRef.current.stop(); } catch (e) { }
        }

        const engine = import.meta.env.VITE_TTS_ENGINE || 'local';

        const onSpeechEnd = () => {
            // Once speech synthesis is done, if we were recording before, start it back up again
            if (wasRecordingBeforeSpeechRef.current && recognitionRef.current) {
                wasRecordingBeforeSpeechRef.current = false;
                isRecordingRef.current = true;
                setIsRecording(true);
                try { recognitionRef.current.start(); } catch (e) { }
            }
        };

        if (engine === 'google') {
            try {
                const generateSpeech = httpsCallable(functions, 'generateSpeech');
                const response = await generateSpeech({ text });
                const audioContent = (response.data as any).audioContent;

                // Convert base64 to blob and play string
                const binaryString = window.atob(audioContent);
                const len = binaryString.length;
                const bytes = new Uint8Array(len);
                for (let i = 0; i < len; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                const blob = new Blob([bytes], { type: 'audio/mp3' });
                const url = URL.createObjectURL(blob);
                const audio = new Audio(url);

                audio.onended = () => {
                    URL.revokeObjectURL(url);
                    onSpeechEnd();
                };

                await audio.play();
            } catch (error) {
                console.error("Google TTS Playback Error:", error);
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.onend = onSpeechEnd;
                window.speechSynthesis.speak(utterance);
            }
        } else {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.onend = onSpeechEnd;
            window.speechSynthesis.speak(utterance);
        }
    };

    const handleSend = async () => {
        if (!inputMsg.trim()) return;
        const newMsg: ChatMessage = { role: 'user', content: inputMsg.trim() };
        const newHistory = [...messages, newMsg];
        setMessages(newHistory);
        setInputMsg('');
        setIsProcessing(true);

        try {
            const ladderingChat = httpsCallable(functions, 'ladderingChat');
            const response = await ladderingChat({
                messages: newHistory.map(m => ({ role: m.role, content: m.content })),
                systemPrompt: "You are an empathetic, insightful life coach helping a user uncover their core values through the '5 Whys' laddering technique. You ask short, probing questions like 'Why did that matter to you?' based on their input. Only ask one question at a time."
            });

            const replyText = (response.data as any).reply;
            const aiMsg: ChatMessage = { role: 'assistant', content: replyText };
            setMessages(prev => [...prev, aiMsg]);

            // This is now async, but we don't need to await it here since it's just audio playing in the background
            speakText(replyText);

        } catch (error) {
            console.error("Chat error", error);
            setMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble connecting to my AI core. Please try again." }]);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSave = async () => {
        if (currentUser && messages.length > 0) {
            await saveSessionData(currentUser.uid, `laddering_${Date.now()}`, {
                type: 'laddering_ai',
                completedAt: new Date().toISOString(),
                messages
            });
        }
        navigate('/dashboard');
    };

    return (
        <div className="w-full max-w-3xl flex flex-col h-[80vh] animate-fade-in relative z-10">
            <Card className="flex flex-col h-full bg-surface/80 border-white/5 relative overflow-hidden">

                <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/5">
                    <CardHeader title="Values Laddering" subtitle="Answer what felt good, and let's explore why." />
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" className={`px-3 py-1 text-sm ${isVoiceMode ? 'text-primary' : 'text-slate-500'}`} onClick={() => setIsVoiceMode(!isVoiceMode)}>
                            {isVoiceMode ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                        </Button>
                        <Button variant="secondary" className="px-3 py-1 text-sm" onClick={handleSave}>End & Save</Button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                    {messages.length === 0 && (
                        <div className="text-center text-textSecondary mt-20">
                            <p className="mb-2">Enter a recent activity or choice that felt deeply good.</p>
                            <p className="text-sm">I'll ask you why it mattered.</p>
                        </div>
                    )}
                    {messages.map((m, i) => (
                        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`p-4 rounded-2xl max-w-[80%] shadow-lg ${m.role === 'user'
                                ? 'bg-primary/20 text-white rounded-tr-sm border border-primary/30'
                                : 'bg-slate-800 text-slate-200 rounded-tl-sm border border-slate-700'
                                }`}>
                                {m.content}
                            </div>
                        </div>
                    ))}
                    {isProcessing && (
                        <div className="flex justify-start">
                            <div className="p-4 rounded-2xl bg-slate-800 text-slate-400 rounded-tl-sm animate-pulse">
                                Reflecting...
                            </div>
                        </div>
                    )}
                    <div ref={endOfMessagesRef} />
                </div>

                <div className="flex items-end gap-2 bg-background p-2 rounded-xl border border-slate-700 focus-within:border-primary/50 transition-colors">
                    <button
                        type="button"
                        onClick={toggleRecording}
                        disabled={!isVoiceSupported}
                        className={`p-3 rounded-lg flex-shrink-0 transition-colors group relative ${!isVoiceSupported ? 'opacity-50 cursor-not-allowed bg-slate-800 text-slate-600' :
                            isRecording ? 'bg-red-500/20 text-red-500 animate-pulse' : 'bg-slate-800 text-slate-400 hover:text-primary hover:bg-slate-700'
                            }`}
                    >
                        {isRecording ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                        {!isVoiceSupported && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 text-slate-200 text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 text-center border border-slate-700 pointer-events-none">
                                Voice recognition blocked by browser (common in Brave). Try Chrome or Safari.
                            </div>
                        )}
                    </button>
                    <textarea
                        className="flex-1 bg-transparent border-none text-textPrimary resize-none min-h-[50px] max-h-[150px] p-3 focus:outline-none focus:ring-0"
                        placeholder="Type your response or tap mic..."
                        value={inputMsg}
                        onChange={(e) => setInputMsg(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                    />
                    <Button onClick={handleSend} disabled={isProcessing || !inputMsg.trim()} className="p-3 h-auto">
                        <Send className="w-5 h-5" />
                    </Button>
                </div>
            </Card>
        </div>
    );
};
