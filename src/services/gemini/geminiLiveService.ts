
import { GoogleGenAI, LiveServerMessage, Modality, Type, FunctionDeclaration, Blob, Schema } from '@google/genai';
import { SYSTEM_INSTRUCTION } from './constants';

export function decode(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
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
    private inputGainNode: GainNode | null = null;
    private sources = new Set<AudioBufferSourceNode>();
    private mediaStream: MediaStream | null = null;
    private scriptProcessor: ScriptProcessorNode | null = null;

    public async startSession(callbacks: {
        onMessage?: (text: string, role: 'user' | 'model') => void,
        onNavigate?: (view: string) => void,
        onInterrupted?: () => void,
        onError?: (error: any) => void,
        onVolume?: (volume: number) => void
    }) {
        if (this.sessionPromise) return;

        const apiKey = (import.meta.env.VITE_GEMINI_API_KEY || '').trim();
        if (!apiKey) {
            callbacks.onError?.(new Error("MISSING_API_KEY"));
            return;
        }

        const ai = new GoogleGenAI({ apiKey });

        this.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        this.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        this.outputNode = this.outputAudioContext.createGain();
        this.outputNode.connect(this.outputAudioContext.destination);

        try {
            this.mediaStream = await navigator.mediaDevices.getUserMedia({
                audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
            });
        } catch (e) {
            callbacks.onError?.(e);
            return;
        }

        let currentInputTranscription = '';
        let currentOutputTranscription = '';

        // Switching to the STABLE gemini-1.5-flash to rule out preview model metadata errors
        this.sessionPromise = ai.live.connect({
            model: 'models/gemini-1.5-flash',
            callbacks: {
                onopen: () => {
                    console.log('[Gemini] Pipeline established.');
                    if (!this.inputAudioContext || !this.mediaStream) return;
                    if (this.inputAudioContext.state === 'suspended') this.inputAudioContext.resume();

                    const source = this.inputAudioContext.createMediaStreamSource(this.mediaStream);
                    this.inputGainNode = this.inputAudioContext.createGain();
                    this.inputGainNode.gain.value = 5.0; // High Mic Boost

                    this.scriptProcessor = this.inputAudioContext.createScriptProcessor(4096, 1, 1);
                    this.scriptProcessor.onaudioprocess = (e) => {
                        const inputData = e.inputBuffer.getChannelData(0);
                        let sum = 0;
                        for (let i = 0; i < inputData.length; i++) sum += inputData[i] * inputData[i];
                        callbacks.onVolume?.(Math.sqrt(sum / inputData.length));

                        const pcmBlob = this.createBlob(inputData);
                        this.sessionPromise?.then((session) => {
                            try {
                                session.sendRealtimeInput({ media: pcmBlob });
                            } catch (err) { }
                        });
                    };

                    source.connect(this.inputGainNode);
                    this.inputGainNode.connect(this.scriptProcessor);
                    this.scriptProcessor.connect(this.inputAudioContext.destination);

                    // DO NOT CALL session.send() HERE - Rule out startup race conditions
                },
                onmessage: async (message: LiveServerMessage) => {
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
                                callbacks.onNavigate?.((fc.args as any).view);
                                this.sessionPromise?.then(session => session.sendToolResponse({
                                    functionResponses: [{ id: fc.id, name: fc.name, response: { result: "ok" } }]
                                }));
                            }
                        }
                    }

                    // ZIP PROPERTY ACCESS: message.serverContent?.modelTurn?.parts[0]?.inlineData?.data
                    const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;

                    if (base64Audio && this.outputAudioContext) {
                        if (this.outputAudioContext.state === 'suspended') this.outputAudioContext.resume();
                        this.nextStartTime = Math.max(this.nextStartTime, this.outputAudioContext.currentTime);
                        const audioBuffer = await decodeAudioData(decode(base64Audio), this.outputAudioContext, 24000, 1);
                        const source = this.outputAudioContext.createBufferSource();
                        source.buffer = audioBuffer;
                        source.connect(this.outputNode!);
                        source.addEventListener('ended', () => this.sources.delete(source));
                        source.start(this.nextStartTime);
                        this.nextStartTime += audioBuffer.duration;
                        this.sources.add(source);
                    }
                },
                onerror: (e) => {
                    console.error('[Gemini] Pipeline error:', e);
                    callbacks.onError?.(e);
                    this.stopSession();
                },
            },
            config: {
                responseModalities: [Modality.AUDIO],
                systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
                tools: [{ functionDeclarations: [navigateToFunction] }],
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
        for (let i = 0; i < l; i++) int16[i] = data[i] * 32768;
        return { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' };
    }

    private stopAudioOutput() {
        for (const source of this.sources.values()) try { source.stop(); } catch (e) { }
        this.sources.clear();
        this.nextStartTime = 0;
    }

    public async stopSession() {
        if (this.sessionPromise) {
            try { const s = await this.sessionPromise; if (s.close) s.close(); } catch (e) { }
            this.sessionPromise = null;
        }
        this.scriptProcessor?.disconnect();
        this.mediaStream?.getTracks().forEach(t => t.stop());
        this.stopAudioOutput();
        if (this.inputAudioContext?.state !== 'closed') this.inputAudioContext?.close();
        if (this.outputAudioContext?.state !== 'closed') this.outputAudioContext?.close();
        this.inputAudioContext = null; this.outputAudioContext = null;
        this.mediaStream = null; this.scriptProcessor = null;
    }
}
