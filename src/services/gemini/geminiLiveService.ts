
import { GoogleGenAI, LiveServerMessage, Modality, Type, FunctionDeclaration, Blob, Schema, HarmCategory, HarmBlockThreshold } from '@google/genai';

const SYSTEM_INSTRUCTION = `You are a calm, friendly, UK-based emergency assistance voice agent for emergencytradesmen.net.
MANDATORY GREETING: You MUST open the conversation with exactly: "Hey this is Emergency Tradesmen! How can I help you today?"
Your role is to help users find the correct emergency tradesperson.`;

export function decode(base64: string) {
    try {
        const binaryString = atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    } catch (e) {
        console.error("Base64 decode failed:", e);
        return new Uint8Array(0);
    }
}

export function encode(bytes: Uint8Array) {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

export async function decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
}

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

export class GeminiLiveController {
    private sessionPromise: Promise<any> | null = null;
    private nextStartTime = 0;
    private inputAudioContext: AudioContext | null = null;
    private outputAudioContext: AudioContext | null = null;
    private outputNode: GainNode | null = null;
    private sources = new Set<AudioBufferSourceNode>();
    private mediaStream: MediaStream | null = null;
    private scriptProcessor: ScriptProcessorNode | null = null;

    public async startSession(callbacks: {
        onMessage?: (text: string, role: 'user' | 'model') => void,
        onNavigate?: (view: string) => void,
        onInterrupted?: () => void,
        onError?: (error: any) => void
    }) {
        if (this.sessionPromise) return;

        const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
        if (!apiKey) {
            console.error("DEBUG: VITE_GEMINI_API_KEY is missing!");
            callbacks.onError?.(new Error("MISSING_API_KEY"));
            return;
        }

        console.log("DEBUG: Initializing Gemini Live with key:", apiKey.substring(0, 5) + "...");
        const ai = new GoogleGenAI({ apiKey: apiKey });

        this.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        this.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        this.outputNode = this.outputAudioContext.createGain();
        this.outputNode.connect(this.outputAudioContext.destination);

        try {
            this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch (e) {
            console.error('Microphone access denied:', e);
            callbacks.onError?.(e);
            return;
        }

        let currentInputTranscription = '';
        let currentOutputTranscription = '';

        // SAFETY SETTINGS: Disable all filtering to prevent 'empty output' from safety refusals
        const safetySettings = [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_CIVIC_INTEGRITY, threshold: HarmBlockThreshold.BLOCK_NONE },
        ];

        this.sessionPromise = ai.live.connect({
            model: 'gemini-2.0-flash-exp', // Using the most stable model for now
            callbacks: {
                onopen: () => {
                    console.log('DEBUG: Session Opened Successfully');
                    if (!this.inputAudioContext || !this.mediaStream) return;

                    if (this.inputAudioContext.state === 'suspended') {
                        this.inputAudioContext.resume();
                    }

                    const source = this.inputAudioContext.createMediaStreamSource(this.mediaStream);
                    this.scriptProcessor = this.inputAudioContext.createScriptProcessor(4096, 1, 1);

                    this.scriptProcessor.onaudioprocess = (e) => {
                        const inputData = e.inputBuffer.getChannelData(0);
                        const pcmBlob = this.createBlob(inputData);
                        this.sessionPromise?.then((session) => {
                            try {
                                session.sendRealtimeInput({ media: pcmBlob });
                            } catch (err) {
                                // Silently ignore audio send errors during transition
                            }
                        });
                    };

                    source.connect(this.scriptProcessor);
                    this.scriptProcessor.connect(this.inputAudioContext.destination);
                },
                onmessage: async (message: LiveServerMessage) => {
                    console.log("DEBUG: Received Message:", JSON.stringify(message).substring(0, 100));

                    if (message.serverContent?.outputTranscription) {
                        currentOutputTranscription += message.serverContent.outputTranscription.text;
                    } else if (message.serverContent?.inputTranscription) {
                        currentInputTranscription += message.serverContent.inputTranscription.text;
                    }

                    if (message.serverContent?.turnComplete) {
                        if (currentInputTranscription.trim()) callbacks.onMessage?.(currentInputTranscription.trim(), 'user');
                        if (currentOutputTranscription.trim()) callbacks.onMessage?.(currentOutputTranscription.trim(), 'model');
                        currentInputTranscription = '';
                        currentOutputTranscription = '';
                    }

                    if (message.toolCall) {
                        for (const fc of message.toolCall.functionCalls) {
                            if (fc.name === 'navigateTo') {
                                const view = (fc.args as any).view;
                                callbacks.onNavigate?.(view);
                                this.sessionPromise?.then((session) => {
                                    session.sendToolResponse({
                                        functionResponses: {
                                            id: fc.id,
                                            name: fc.name,
                                            response: { result: "ok" },
                                        }
                                    });
                                });
                            }
                        }
                    }

                    const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                    if (base64Audio && this.outputAudioContext) {
                        if (this.outputAudioContext.state === 'suspended') {
                            this.outputAudioContext.resume();
                        }
                        this.nextStartTime = Math.max(this.nextStartTime, this.outputAudioContext.currentTime);
                        const audioData = decode(base64Audio);
                        if (audioData.length > 0) {
                            const audioBuffer = await decodeAudioData(audioData, this.outputAudioContext, 24000, 1);
                            const source = this.outputAudioContext.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(this.outputNode!);
                            source.addEventListener('ended', () => this.sources.delete(source));
                            source.start(this.nextStartTime);
                            this.nextStartTime += audioBuffer.duration;
                            this.sources.add(source);
                        }
                    }

                    if (message.serverContent?.interrupted) {
                        this.stopAudioOutput();
                        callbacks.onInterrupted?.();
                    }
                },
                onerror: (e) => {
                    console.error('DEBUG: Gemini Live Socket ERROR:', e);
                    callbacks.onError?.(e);
                    this.stopSession();
                },
                onclose: (e) => {
                    console.log('DEBUG: Session Closed:', e);
                    this.sessionPromise = null;
                },
            },
            config: {
                responseModalities: [Modality.AUDIO],
                systemInstruction: SYSTEM_INSTRUCTION,
                tools: [{ functionDeclarations: [navigateToFunction] }],
                // @ts-ignore - Safety settings might not be in the exact type definition of LiveConfig yet but SDK supports it
                safetySettings: safetySettings,
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
                },
            },
        });

        return this.sessionPromise;
    }

    private createBlob(data: Float32Array): Blob {
        const l = data.length;
        const int16 = new Int16Array(l);
        for (let i = 0; i < l; i++) {
            int16[i] = data[i] * 32768;
        }
        return {
            data: encode(new Uint8Array(int16.buffer)),
            mimeType: 'audio/pcm;rate=16000',
        };
    }

    private stopAudioOutput() {
        for (const source of this.sources.values()) {
            try { source.stop(); } catch (e) { }
        }
        this.sources.clear();
        this.nextStartTime = 0;
    }

    public async stopSession() {
        if (this.sessionPromise) {
            try {
                const session = await this.sessionPromise;
                // @ts-ignore
                if (session.close) session.close();
            } catch (e) {
                console.debug('Error closing session:', e);
            }
            this.sessionPromise = null;
        }

        this.scriptProcessor?.disconnect();
        this.mediaStream?.getTracks().forEach(track => track.stop());
        this.stopAudioOutput();

        if (this.inputAudioContext?.state !== 'closed') {
            this.inputAudioContext?.close();
        }
        if (this.outputAudioContext?.state !== 'closed') {
            this.outputAudioContext?.close();
        }

        this.inputAudioContext = null;
        this.outputAudioContext = null;
        this.mediaStream = null;
        this.scriptProcessor = null;
    }
}
