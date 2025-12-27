
import { GoogleGenerativeAI, FunctionDeclaration, Schema, Type } from '@google/generative-ai';
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
        const genAI = new GoogleGenerativeAI(geminiKey);
        this.geminiModel = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            systemInstruction: SYSTEM_INSTRUCTION,
            tools: [{ functionDeclarations: [navigateToFunction] }]
        });
    }

    public async startSession(callbacks: HybridCallbacks) {
        this.callbacks = callbacks;
        this.chat = this.geminiModel.startChat();
        this.callbacks.onStatusChange?.('Waiting for Mic...');

        // 1. Initialize Microphone (Non-blocking)
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                this.micStream = stream;
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

                // 2. Start Listening ONLY after mic access is granted
                this.startSpeechRecognition();
            })
            .catch(err => {
                console.warn('[Voice] Mic blocked:', err);
                this.callbacks.onStatusChange?.('Mic Blocked');
                // Even without mic, let's greet the user so they know the AI is alive
                this.handleUserInput("Please greet the user now.");
            });
    }

    private startSpeechRecognition() {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
            this.recognition.lang = 'en-GB';

            this.recognition.onresult = (event: any) => {
                if (window.speechSynthesis.speaking) return;
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        const transcript = event.results[i][0].transcript.trim();
                        if (transcript) this.handleUserInput(transcript);
                    }
                }
            };

            this.recognition.onstart = () => {
                this.callbacks.onStatusChange?.('Awaiting Voice...');
            };

            this.recognition.onerror = (e: any) => {
                if (e.error === 'not-allowed') this.callbacks.onStatusChange?.('Mic Blocked');
            };

            this.recognition.onend = () => {
                if (this.recognition) {
                    try { this.recognition.start(); } catch (e) { }
                }
            };

            try {
                this.recognition.start();
            } catch (e) {
                console.warn('[Voice] Recognition start failed:', e);
            }
        } else {
            this.callbacks.onError?.(new Error("Browser Speech Recognition not supported."));
        }

        // Trigger Initial Greeting
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
            let fullText = '';
            for await (const chunk of result.stream) {
                const chunkText = chunk.text();
                fullText += chunkText;
                const calls = chunk.functionCalls();
                if (calls) {
                    for (const call of calls) {
                        if (call.name === 'navigateTo') {
                            this.callbacks.onNavigate?.((call.args as any).view);
                        }
                    }
                }
            }

            if (fullText) {
                this.callbacks.onMessage?.(fullText, 'model');
                await this.speak(fullText);
            }
            this.callbacks.onStatusChange?.('Awaiting Voice...');
        } catch (e) {
            console.error('[Gemini] Response failed:', e);
            this.callbacks.onError?.(e);
        }
    }

    private async speak(text: string) {
        return new Promise((resolve) => {
            window.speechSynthesis.cancel();
            this.callbacks.onStatusChange?.('Speaking...');

            const utterance = new SpeechSynthesisUtterance(text);
            const setBestVoice = () => {
                const voices = window.speechSynthesis.getVoices();
                const preferred = ['Google UK English Female', 'Microsoft Hazel', 'Daniel', 'en-GB'];
                let voice = voices.find(v => preferred.some(p => v.name.includes(p)));
                if (!voice) voice = voices.find(v => v.lang.slice(0, 5) === 'en-GB');
                if (voice) utterance.voice = voice;
            };

            setBestVoice();
            if (window.speechSynthesis.onvoiceschanged !== undefined) {
                window.speechSynthesis.onvoiceschanged = setBestVoice;
            }

            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            utterance.onend = () => resolve(true);
            utterance.onerror = (e) => {
                console.error('[Voice] Playback error:', e);
                resolve(false);
            };

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
        if (this.stopVolumeTimer) cancelAnimationFrame(this.stopVolumeTimer);
        this.analyser = null;
    }
}
