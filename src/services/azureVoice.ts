import * as sdk from 'microsoft-cognitiveservices-speech-sdk';

// Config - To be filled by user or env vars
const AZURE_KEY = import.meta.env.VITE_AZURE_SPEECH_KEY || 'PASTE_KEY_HERE';
const AZURE_REGION = import.meta.env.VITE_AZURE_SPEECH_REGION || 'PASTE_REGION_HERE';

let synthesizer: sdk.SpeechSynthesizer | null = null;
let player: sdk.SpeakerAudioDestination | null = null;
let audioConfig: sdk.AudioConfig | null = null;

export function unlockAudioContext() {
    // This is handled by the SDK internally mostly, but we can ensure the
    // context the SDK uses is resumed if we access it, or just rely on the
    // fact that the user gesture called this function.
    // For Azure SDK, creating the synthesizer inside the gesture is safest.
    if (!synthesizer) {
        initSynthesizer();
    }
}

function initSynthesizer() {
    try {
        const speechConfig = sdk.SpeechConfig.fromSubscription(AZURE_KEY, AZURE_REGION);
        speechConfig.speechSynthesisVoiceName = "en-US-AvaMultilingualNeural";

        player = new sdk.SpeakerAudioDestination();
        audioConfig = sdk.AudioConfig.fromSpeakerOutput(player);

        synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);
    } catch (e) {
        console.error("Azure Speech SDK Init Failed:", e);
    }
}

export function playNavigationVoice(text: string) {
    if (!synthesizer) {
        // Try to init if missing, but it might fail autoplay if no gesture active
        initSynthesizer();
    }

    if (synthesizer) {
        synthesizer.speakTextAsync(
            text,
            (result) => {
                if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
                    console.log("Speech synthesized to speaker for text [" + text + "]");
                } else {
                    console.error("Speech synthesis canceled, " + result.errorDetails);
                }
            },
            (err) => {
                console.error("err - " + err);
                synthesizer!.close();
                synthesizer = null;
            }
        );
    }
}
