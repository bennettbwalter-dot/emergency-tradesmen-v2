
import { GoogleGenAI, LiveServerMessage, Modality, Type, FunctionDeclaration, Blob, Schema, HarmCategory, HarmBlockThreshold } from '@google/genai';

// MINIMAL: Rules out safety refusals and complex logic crashes
const DIAGNOSTIC_INSTRUCTION = "You are a helpful assistant. Say: 'Hey this is Emergency Tradesmen! How can I help you today?'";

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
        onError?: (error: any) => void,
        onVolume?: (volume: number) => void
    }) {
        if (this.sessionPromise) return;

        const apiKey = (import.meta.env.VITE_GEMINI_API_KEY || '').trim();

        // Safety check: Alert if key is missing or placeholder
        if (!apiKey || apiKey === 'undefined' || apiKey.length < 10) {
            callbacks.onError?.(new Error("CRITICAL: VITE_GEMINI_API_KEY is missing or invalid in environment."));
            return;
        }

        // Diagnostic Log: Verify key presence without exposing full key
        console.log(`[DEBUG] Initializing Gemini Live with key: ${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`);

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
            console.error('Microphone access denied:', e);
            callbacks.onError?.(e);
            return;
        }

        let currentInputTranscription = '';
        let currentOutputTranscription = '';

        this.sessionPromise = ai.live.connect({
            model: 'gemini-2.0-flash-exp', // Most stable Live model
            callbacks: {
                onopen: () => {
                    console.log('Gemini Live session opened');
                    if (!this.inputAudioContext || !this.mediaStream) return;
                    if (this.inputAudioContext.state === 'suspended') this.inputAudioContext.resume();

                    const source = this.inputAudioContext.createMediaStreamSource(this.mediaStream);
                    this.scriptProcessor = this.inputAudioContext.createScriptProcessor(4096, 1, 1);

                    this.scriptProcessor.onaudioprocess = (e) => {
                        const inputData = e.inputBuffer.getChannelData(0);

                        // Volume Meter logic
                        let sum = 0;
                        for (let i = 0; i < inputData.length; i++) sum += inputData[i] * inputData[i];
                        callbacks.onVolume?.(Math.sqrt(sum / inputData.length));

                        const pcmBlob = this.createBlob(inputData);
                        this.sessionPromise?.then((session) => {
                            try {
                                session.sendRealtimeInput({ media: pcmBlob });
                            } catch (err) {
                                // Silently handle
                            }
                        });
                    };

                    source.connect(this.scriptProcessor);
                    this.scriptProcessor.connect(this.inputAudioContext.destination);

                    // FORCE KICKSTART: Explicitly tell the model to talk
                    this.sessionPromise.then(session => {
                        session.send({ text: "Hello, please introduce yourself and greet the user." });
                    });
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

                    // Safe part access
                    const parts = message.serverContent?.modelTurn?.parts;
                    const base64Audio = parts && parts.length > 0 ? parts[0].inlineData?.data : null;

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

                    if (message.serverContent?.interrupted) {
                        this.stopAudioOutput();
                        callbacks.onInterrupted?.();
                    }
                },
                onerror: (e) => {
                    console.error('Gemini Live error:', e);
                    callbacks.onError?.(e);
                    this.stopSession();
                },
                onclose: (e) => {
                    console.log('Gemini Live closed:', e);
                    this.sessionPromise = null;
                },
            },
            config: {
                // ENABLING BOTH MODALITIES TO PREVENT 'EMPTY OUTPUT'
                responseModalities: [Modality.AUDIO, Modality.TEXT],
                systemInstruction: { parts: [{ text: DIAGNOSTIC_INSTRUCTION }] },
                // DISABLE ALL SAFETY TO RULE OUT SILENT REFUSALS
                safetySettings: [
                    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
                    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
                    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE }
                ],
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
                if (session.close) session.close();
            } catch (e) {
                console.debug('Error closing session:', e);
            }
            this.sessionPromise = null;
        }
        this.scriptProcessor?.disconnect();
        this.mediaStream?.getTracks().forEach(track => track.stop());
        this.stopAudioOutput();
        if (this.inputAudioContext?.state !== 'closed') this.inputAudioContext?.close();
        if (this.outputAudioContext?.state !== 'closed') this.outputAudioContext?.close();
        this.inputAudioContext = null;
        this.outputAudioContext = null;
        this.mediaStream = null;
        this.scriptProcessor = null;
    }
}
