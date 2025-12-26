
import { GoogleGenAI, Type, FunctionDeclaration, Schema } from '@google/genai';
import { createClient } from '@neuphonic/neuphonic-js';
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
    private neuphonicClient: any;
    private audioContext: AudioContext | null = null;
    private recognition: any | null = null;
    private isSpeaking = false;

    private micStream: MediaStream | null = null;
    private analyser: AnalyserNode | null = null;
    private stopVolumeTimer: any = null;
    private callbacks: HybridCallbacks = {};

    constructor() {
        const geminiKey = (import.meta.env.VITE_GEMINI_API_KEY || '').trim();
        const genAI = new GoogleGenAI(geminiKey);
        this.geminiModel = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            systemInstruction: SYSTEM_INSTRUCTION,
            tools: [{ functionDeclarations: [navigateToFunction] }]
        });

        const neuKey = (import.meta.env.VITE_NEUPHONIC_API_KEY || '').trim();
        if (neuKey) {
            this.neuphonicClient = createClient({ apiKey: neuKey });
        }
    }

    public async startSession(callbacks: HybridCallbacks) {
        this.callbacks = callbacks;
        this.chat = this.geminiModel.startChat();

        // Initialize Local Volume Monitoring (for UI feedback)
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

        // Initialize Speech Recognition
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
            this.recognition.lang = 'en-GB';

            this.recognition.onresult = (event: any) => {
                const transcript = Array.from(event.results)
                    .map((result: any) => result[0])
                    .map((result: any) => result.transcript)
                    .join('');

                if (event.results[0].isFinal) {
                    this.handleUserInput(transcript);
                }
            };

            this.recognition.onerror = (e: any) => {
                console.error('[SpeechRec] Error:', e);
                if (e.error !== 'no-speech') this.callbacks.onError?.(e);
            };

            this.recognition.start();
            this.callbacks.onStatusChange?.('Awaiting Voice...');
        } else {
            this.callbacks.onError?.(new Error("Speech Recognition not supported in this browser."));
        }

        // Initial Greeting
        this.handleUserInput("Please greet the user now.");
    }

    private async handleUserInput(text: string) {
        if (!text.trim()) return;

        // Don't show the 'kickstart' message to user
        if (text !== "Please greet the user now.") {
            this.callbacks.onMessage?.(text, 'user');
        }

        this.callbacks.onStatusChange?.('Thinking...');

        try {
            const result = await this.chat.sendMessageStream(text);
            let fullResponse = '';

            for await (const chunk of result.stream) {
                const chunkText = chunk.text();
                fullResponse += chunkText;

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

            if (fullResponse) {
                this.callbacks.onMessage?.(fullResponse, 'model');
                await this.speak(fullResponse);
            }

            this.callbacks.onStatusChange?.('Awaiting Voice...');
        } catch (e) {
            console.error('[Gemini] Chat Error:', e);
            this.callbacks.onError?.(e);
        }
    }

    private async speak(text: string) {
        if (!this.neuphonicClient) {
            console.warn("Neuphonic key missing, falling back to silent mode.");
            return;
        }

        this.callbacks.onStatusChange?.('Speaking...');
        this.isSpeaking = true;

        try {
            const tts = await this.neuphonicClient.tts.subscribe({
                voice_id: 'ebde0efd-652f-4886-905c-3004464c01f6', // High quality British Female
                model: 'neu_hq'
            });

            // Play audio chunks as they arrive
            tts.on('data', (audio: ArrayBuffer) => {
                this.playAudioChunk(audio);
            });

            tts.send({ text });

            // Wait a bit for the audio to finish (approximate)
            await new Promise(resolve => setTimeout(resolve, text.length * 60));
        } catch (e) {
            console.error('[Neuphonic] Error:', e);
        } finally {
            this.isSpeaking = false;
        }
    }

    private async playAudioChunk(data: ArrayBuffer) {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        }

        const buffer = await this.audioContext.decodeAudioData(data);
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(this.audioContext.destination);
        source.start();
    }

    public async stopSession() {
        if (this.micStream) {
            this.micStream.getTracks().forEach(t => t.stop());
            this.micStream = null;
        }
        if (this.stopVolumeTimer) {
            cancelAnimationFrame(this.stopVolumeTimer);
        }
        this.analyser = null;
        if (this.recognition) {
            this.recognition.stop();
            this.recognition = null;
        }
        if (this.audioContext) {
            await this.audioContext.close();
            this.audioContext = null;
        }
    }
}
