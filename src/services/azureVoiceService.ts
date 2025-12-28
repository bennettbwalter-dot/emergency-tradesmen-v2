import * as sdk from 'microsoft-cognitiveservices-speech-sdk';

const AZURE_KEY = import.meta.env.VITE_AZURE_SPEECH_KEY || '';
const AZURE_REGION = import.meta.env.VITE_AZURE_SPEECH_REGION || '';

export class AzureVoiceService {
    private synthesizer: sdk.SpeechSynthesizer | null = null;
    private audioContext: AudioContext | null = null;
    private currentSource: AudioBufferSourceNode | null = null;

    constructor() { }

    private initAudio(): void {
        if (!this.audioContext) {
            try {
                // Standard AudioContext (works on mobile if unlocked)
                const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
                this.audioContext = new AudioContext();
            } catch (e) {
                console.error('[AzureVoice] AudioContext Init Failed:', e);
            }
        }
    }

    public async speak(text: string): Promise<void> {
        // Shadow Counter: Track TTS Usage
        import('@/lib/usage-logger').then(({ usageLogger }) => {
            usageLogger.incrementUsage('azure_tts_chars', text.length);
        });

        return new Promise((resolve) => {
            this.initAudio();

            if (!this.audioContext) {
                console.error('[AzureVoice] No AudioContext');
                resolve();
                return;
            }

            // 1. Resume Context (Critical for Mobile)
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }

            // 2. Kill Previous Audio
            this.stop();

            try {
                // 3. Configure Synthesizer to output raw stream (no auto-play)
                const speechConfig = sdk.SpeechConfig.fromSubscription(AZURE_KEY, AZURE_REGION);
                speechConfig.speechSynthesisVoiceName = "en-US-AvaMultilingualNeural";

                // Set output to null to prevent SDK from trying to play it
                this.synthesizer = new sdk.SpeechSynthesizer(speechConfig, null as any);

                const ssml = `
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
    <voice name="en-US-AvaMultilingualNeural">
        ${text}
    </voice>
</speak>`.trim();

                console.log('[AzureVoice] Synthesizing...');

                this.synthesizer.speakSsmlAsync(
                    ssml,
                    (result) => {
                        if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
                            // 4. Decode and Play Manually
                            const audioData = result.audioData;
                            this.playBuffer(audioData, resolve);
                        } else {
                            console.warn('[AzureVoice] Issue:', result.errorDetails);
                            resolve();
                        }
                        this.synthesizer?.close();
                        this.synthesizer = null;
                    },
                    (err) => {
                        console.error('[AzureVoice] Error:', err);
                        this.synthesizer?.close();
                        this.synthesizer = null;
                        resolve();
                    }
                );

            } catch (e) {
                console.error('[AzureVoice] Setup Failed:', e);
                resolve();
            }
        });
    }

    private playBuffer(arrayBuffer: ArrayBuffer, onComplete: () => void) {
        if (!this.audioContext) { onComplete(); return; }

        this.audioContext.decodeAudioData(arrayBuffer, (decodedBuffer) => {
            try {
                // Create Source
                const source = this.audioContext!.createBufferSource();
                source.buffer = decodedBuffer;
                source.connect(this.audioContext!.destination);

                // Event Listener: The Silver Bullet for Timing
                source.onended = () => {
                    this.currentSource = null;
                    onComplete(); // Resolve Promise ONLY when audio finishes
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
    }

    public unlockAudioContext(): void {
        this.initAudio();
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
}
