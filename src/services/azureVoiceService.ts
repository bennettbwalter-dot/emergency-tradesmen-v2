import * as sdk from 'microsoft-cognitiveservices-speech-sdk';

const AZURE_KEY = import.meta.env.VITE_AZURE_SPEECH_KEY || '';
const AZURE_REGION = import.meta.env.VITE_AZURE_SPEECH_REGION || '';

export class AzureVoiceService {
    private synthesizer: sdk.SpeechSynthesizer | null = null;
    private player: sdk.SpeakerAudioDestination | null = null;
    private audioConfig: sdk.AudioConfig | null = null;

    constructor() { }

    private initAudio(): void {
        if (!this.player) {
            try {
                this.player = new sdk.SpeakerAudioDestination();
                this.audioConfig = sdk.AudioConfig.fromSpeakerOutput(this.player);
            } catch (e) {
                console.error('[AzureVoice] Audio Init Failed:', e);
            }
        }
    }

    public async speak(text: string): Promise<void> {
        return new Promise((resolve, reject) => {
            // 1. Ensure Audio Output Exists (Reuse single context)
            this.initAudio();

            if (!this.player || !this.audioConfig) {
                console.error('[AzureVoice] No Audio Device');
                resolve();
                return;
            }

            // 2. Kill OLD Synthesizer (if any hanging)
            if (this.synthesizer) {
                try { this.synthesizer.close(); } catch (e) { }
                this.synthesizer = null;
            }

            try {
                // 3. Create FRESH Synthesizer (Prevents network drift)
                const speechConfig = sdk.SpeechConfig.fromSubscription(AZURE_KEY, AZURE_REGION);
                speechConfig.speechSynthesisVoiceName = "en-GB-HollieNeural";

                this.synthesizer = new sdk.SpeechSynthesizer(speechConfig, this.audioConfig);

                const ssml = `
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-GB">
    <voice name="en-GB-HollieNeural">
        ${text}
    </voice>
</speak>`.trim();

                console.log('[AzureVoice] Speaking...');

                this.synthesizer.speakSsmlAsync(
                    ssml,
                    (result) => {
                        if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
                            console.log('[AzureVoice] Synthesis Success');
                        } else {
                            console.warn('[AzureVoice] Issue:', result.errorDetails);
                        }
                        // CLOSE the synthesizer to free network resources
                        // accessible audio buffer stays in 'this.player'
                        this.synthesizer?.close();
                        this.synthesizer = null;
                        resolve();
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

    public stop(): void {
        // Pause audio but keep context alive
        if (this.player) {
            this.player.pause();
        }
        // Kill synthesizer connection
        if (this.synthesizer) {
            try { this.synthesizer.close(); } catch (e) { }
            this.synthesizer = null;
        }
    }

    public unlockAudioContext(): void {
        this.initAudio();
    }
}
