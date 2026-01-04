
import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
import { usageLogger } from '@/lib/usage-logger';

const AZURE_KEY = import.meta.env.VITE_AZURE_SPEECH_KEY || '';
const AZURE_REGION = import.meta.env.VITE_AZURE_SPEECH_REGION || 'uksouth';

export class AzureVoiceService {
    private synthesizer: sdk.SpeechSynthesizer | null = null;
    private audioContext: AudioContext | null = null;
    private currentSource: AudioBufferSourceNode | null = null;
    private useFallback: boolean = false;

    constructor() {
        // Initialize fallback synth if needed
        if (window.speechSynthesis) {
            // Pre-load voices
            window.speechSynthesis.getVoices();
        }
    }

    private initAudio(): void {
        if (!this.audioContext) {
            try {
                const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
                this.audioContext = new AudioContext();
            } catch (e) {
                console.error('[AzureVoice] AudioContext Init Failed:', e);
            }
        }
    }

    public async speak(text: string, countryCode: string = 'GB'): Promise<void> {
        // Shadow Counter - FIRE AND FORGET
        usageLogger.incrementUsage('azure_tts_chars', text.length).catch(e => {
            console.warn('[AzureVoice] Usage logging failed:', e.message);
        });

        // If fallback mode is already active, use it directly
        if (this.useFallback) {
            return this.speakNative(text, countryCode);
        }

        return new Promise((resolve) => {
            this.initAudio();

            if (!this.audioContext && !this.useFallback) {
                console.error('[AzureVoice] No AudioContext');
                resolve();
                return;
            }

            if (this.audioContext?.state === 'suspended') {
                this.audioContext.resume();
            }

            this.stop();

            try {
                // Hardcoded Critical Path to ensure Human Voice
                const speechConfig = sdk.SpeechConfig.fromSubscription(AZURE_KEY, AZURE_REGION);

                // American Woman Voice (Ava) - Requested to be used globally
                const voiceName = "en-US-AvaMultilingualNeural";
                speechConfig.speechSynthesisVoiceName = voiceName;

                this.synthesizer = new sdk.SpeechSynthesizer(speechConfig, null as any);

                const ssml = `
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${countryCode === 'US' ? 'en-US' : 'en-GB'}">
    <voice name="${voiceName}">
        ${text}
    </voice>
</speak>`.trim();

                console.log(`[AzureVoice] Synthesizing via Azure (${countryCode}) using American Woman voice...`);

                this.synthesizer.speakSsmlAsync(
                    ssml,
                    (result) => {
                        if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
                            const audioData = result.audioData;
                            this.playBuffer(audioData, resolve);
                        } else {
                            console.warn('[AzureVoice] Azure Failed, switching to Fallback:', result.errorDetails);
                            this.synthesizer?.close();
                            this.synthesizer = null;

                            // *** TRIGGER FALLBACK ***
                            this.useFallback = true;
                            this.speakNative(text, countryCode).then(resolve);
                        }
                    },
                    (err) => {
                        console.error('[AzureVoice] Error:', err);
                        this.synthesizer?.close();
                        this.synthesizer = null;
                        this.useFallback = true;
                        this.speakNative(text, countryCode).then(resolve);
                    }
                );

            } catch (e) {
                console.error('[AzureVoice] Setup Exception, using Fallback:', e);
                this.useFallback = true;
                this.speakNative(text, countryCode).then(resolve);
            }
        });
    }

    // --- FALLBACK: Web Speech API ---
    private async speakNative(text: string, countryCode: string = 'GB'): Promise<void> {
        return new Promise((resolve) => {
            const synth = window.speechSynthesis;
            if (!synth) { resolve(); return; }

            synth.cancel();

            const utterance = new SpeechSynthesisUtterance(text);

            // Try to find a US Voice
            const voices = synth.getVoices();
            const usVoice = voices.find(v => v.lang === 'en-US' || v.name.includes('US') || v.name.includes('United States'));
            const gbVoice = voices.find(v => v.lang === 'en-GB');

            if (usVoice) {
                utterance.voice = usVoice;
                console.log('[AzureVoice] Using Native US Voice:', usVoice.name);
            } else if (gbVoice) {
                utterance.voice = gbVoice;
            }

            utterance.rate = 1.0;
            utterance.pitch = 1.0;

            utterance.onend = () => { resolve(); };
            utterance.onerror = () => { resolve(); };

            synth.speak(utterance);
        });
    }

    private playBuffer(arrayBuffer: ArrayBuffer, onComplete: () => void) {
        if (!this.audioContext) { onComplete(); return; }

        this.audioContext.decodeAudioData(arrayBuffer, (decodedBuffer) => {
            try {
                const source = this.audioContext!.createBufferSource();
                source.buffer = decodedBuffer;
                source.connect(this.audioContext!.destination);
                source.onended = () => {
                    this.currentSource = null;
                    onComplete();
                };
                this.currentSource = source;
                source.start(0);
            } catch (e) {
                console.error('[AzureVoice] Playback Failed:', e);
                onComplete();
            }
        }, (err) => {
            console.error('[AzureVoice] Decode Failed:', err);
            onComplete();
        });
    }

    public stop(): void {
        if (this.currentSource) {
            try { this.currentSource.stop(); } catch (e) { }
            this.currentSource = null;
        }
        if (this.synthesizer) {
            try { this.synthesizer.close(); } catch (e) { }
            this.synthesizer = null;
        }
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
    }

    public unlockAudioContext(): void {
        this.initAudio();
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        // Also unlock native synth just in case
        if (window.speechSynthesis) window.speechSynthesis.resume();
    }
}
