import * as sdk from 'microsoft-cognitiveservices-speech-sdk';

const AZURE_KEY = import.meta.env.VITE_AZURE_SPEECH_KEY || '';
const AZURE_REGION = import.meta.env.VITE_AZURE_SPEECH_REGION || '';

export class AzureVoiceService {
    private synthesizer: sdk.SpeechSynthesizer | null = null;
    private player: sdk.SpeakerAudioDestination | null = null;
    private audioConfig: sdk.AudioConfig | null = null;

    constructor() {
        // Lazy init to respect mobile constraints
    }

    public initialize(): void {
        if (this.synthesizer) return;

        try {
            console.log('[AzureVoice] Initializing Service...');
            const speechConfig = sdk.SpeechConfig.fromSubscription(AZURE_KEY, AZURE_REGION);
            speechConfig.speechSynthesisVoiceName = "en-US-AvaMultilingualNeural";

            this.player = new sdk.SpeakerAudioDestination();
            this.audioConfig = sdk.AudioConfig.fromSpeakerOutput(this.player);

            this.synthesizer = new sdk.SpeechSynthesizer(speechConfig, this.audioConfig);
        } catch (e) {
            console.error('[AzureVoice] Init Failed:', e);
        }
    }

    public async speak(text: string): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.synthesizer) {
                this.initialize();
            }

            if (!this.synthesizer) {
                console.error('[AzureVoice] Synthesizer not available');
                resolve(); // resolve to not block app
                return;
            }

            // Construct SSML with Pause Support
            // Note: The user provided specific SSML structure requirement.
            const ssml = `
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
    <voice name="en-US-AvaMultilingualNeural">
        ${text}
    </voice>
</speak>`.trim();

            console.log('[AzureVoice] Speaking SSML:', ssml);

            this.synthesizer.speakSsmlAsync(
                ssml,
                (result) => {
                    if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
                        console.log('[AzureVoice] Synthesis Success');
                        resolve();
                    } else {
                        console.warn('[AzureVoice] Synthesis Canceled/Failed:', result.errorDetails);
                        resolve(); // Resolve to unblock
                    }
                },
                (err) => {
                    console.error('[AzureVoice] Synthesis Error:', err);
                    this.synthesizer?.close();
                    this.synthesizer = null;
                    resolve();
                }
            );
        });
    }

    public stop(): void {
        if (this.player) {
            this.player.pause(); // Stop audio output immediately
        }
        if (this.synthesizer) {
            try {
                this.synthesizer.close();
            } catch (e) { }
            this.synthesizer = null;
        }
    }

    // Helper to ensure AudioContext is warm (Mobile requirement)
    public unlockAudioContext(): void {
        this.initialize();
        // Just init is enough for Azure SDK in most cases as it attaches to AudioContext on creation
    }
}
