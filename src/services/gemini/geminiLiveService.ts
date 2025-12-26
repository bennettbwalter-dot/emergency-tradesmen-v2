
import { GoogleGenAI, Type, FunctionDeclaration, Schema } from '@google/genai';
import { SYSTEM_INSTRUCTION } from './constants';
import { HybridCallbacks } from './types';

const navigateToFunction: FunctionDeclaration = {
    name: 'navigateTo',
    parameters: {
        type: Type.OBJECT,
        description: 'Navigates the user to a different view in the application portal.',
        properties: {
            view: {
                type: Type.STRING,
                description: 'The target view name. One of: dashboard, services, blog, premium, contact, analytics, settings, profile.',
            },
        },
        required: ['view'],
    } as Schema,
};

export class HybridController {
    private geminiModel: any;
    private chat: any;
    private recognition: any | null = null;
    private micStream: MediaStream | null = null;
    private analyser: AnalyserNode | null = null;
    private stopVolumeTimer: any = null;
    private callbacks: HybridCallbacks = {};
    private currentUtterance: SpeechSynthesisUtterance | null = null;

    constructor() {
        const geminiKey = (import.meta.env.VITE_GEMINI_API_KEY || '').trim();
        const genAI = new GoogleGenAI(geminiKey);
        this.geminiModel = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            systemInstruction: SYSTEM_INSTRUCTION,
            tools: [{ functionDeclarations: [navigateToFunction] }]
        });
    }

    public async startSession(callbacks: HybridCallbacks) {
        this.callbacks = callbacks;
        this.chat = this.geminiModel.startChat();

        // 1. Initialize Local Volume Monitoring (for UI feedback)
        try {
            this.micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const source = audioCtx.createMediaStreamSource(this.micStream);
            this.analyser = audioCtx.createAnalyser();
            this.analyser.fftSize = 256;
            source.connect(this.analyser);

            const bufferLength = this.analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const updateVolume = () => {
                if (!this.analyser) return;
                this.analyser.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
                const average = sum / bufferLength / 255;
                this.callbacks.onVolume?.(average);
                this.stopVolumeTimer = requestAnimationFrame(updateVolume);
            };
            updateVolume();
        } catch (err) {
            console.warn('[Volume] Could not start mic feedback:', err);
        }

        // 2. Initialize Speech Recognition (Input)
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
            this.recognition.lang = 'en-GB';

            this.recognition.onresult = (event: any) => {
                // If we're speaking, ignore results to prevent echoing back
                if (window.speechSynthesis.speaking) return;

                const results = event.results;
                for (let i = event.resultIndex; i < results.length; ++i) {
                    if (results[i].isFinal) {
                        const transcript = results[i][0].transcript.trim();
                        if (transcript) this.handleUserInput(transcript);
                    }
                }
            };

            this.recognition.onend = () => {
                // Restart if still active
                if (this.recognition) this.recognition.start();
            };

            this.recognition.start();
            this.callbacks.onStatusChange?.('Awaiting Voice...');
        } else {
            this.callbacks.onError?.(new Error("Speech Recognition not supported in this browser."));
        }

        // 3. Initial Greeting
        this.handleUserInput("Please greet the user now.");
    }

    private async handleUserInput(text: string) {
        if (!text.trim()) return;

        if (text !== "Please greet the user now.") {
            this.callbacks.onMessage?.(text, 'user');
        }

        this.callbacks.onStatusChange?.('Thinking...');

        try {
            const result = await this.chat.sendMessageStream(text);
            let fullResponseString = '';

            for await (const chunk of result.stream) {
                const chunkText = chunk.text();
                fullResponseString += chunkText;

                // Handle tool calls (navigation)
                const calls = chunk.functionCalls();
                if (calls) {
                    for (const call of calls) {
                        if (call.name === 'navigateTo') {
                            this.callbacks.onNavigate?.((call.args as any).view);
                        }
                    }
                }
            }

            if (fullResponseString) {
                this.callbacks.onMessage?.(fullResponseString, 'model');
                await this.speak(fullResponseString);
            }

            this.callbacks.onStatusChange?.('Awaiting Voice...');
        } catch (e) {
            console.error('[Gemini] Chat Error:', e);
            this.callbacks.onError?.(e);
        }
    }

    private async speak(text: string) {
        return new Promise((resolve) => {
            if (this.currentUtterance) {
                window.speechSynthesis.cancel();
            }

            this.callbacks.onStatusChange?.('Speaking...');

            const utterance = new SpeechSynthesisUtterance(text);

            // Prioritize high-quality British voices
            const voices = window.speechSynthesis.getVoices();
            const preferredVoices = [
                'Google UK English Female',
                'Microsoft Hazel',
                'Daniel',
                'en-GB'
            ];

            let selectedVoice = voices.find(v => preferredVoices.some(pref => v.name.includes(pref)));
            if (!selectedVoice) selectedVoice = voices.find(v => v.lang.includes('en-GB'));

            if (selectedVoice) utterance.voice = selectedVoice;
            utterance.rate = 1.0;
            utterance.pitch = 1.0;

            utterance.onend = () => {
                this.currentUtterance = null;
                resolve(true);
            };

            utterance.onerror = (e) => {
                console.error('[SpeechSynth] Error:', e);
                this.currentUtterance = null;
                resolve(false);
            };

            this.currentUtterance = utterance;
            window.speechSynthesis.speak(utterance);
        });
    }

    public async stopSession() {
        if (this.recognition) {
            this.recognition.onend = null;
            this.recognition.stop();
            this.recognition = null;
        }
        window.speechSynthesis.cancel();
        if (this.micStream) {
            this.micStream.getTracks().forEach(t => t.stop());
            this.micStream = null;
        }
        if (this.stopVolumeTimer) {
            cancelAnimationFrame(this.stopVolumeTimer);
        }
        this.analyser = null;
    }
}
