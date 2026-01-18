
import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
import { usageLogger } from '@/lib/usage-logger';

const AZURE_KEY = (import.meta.env.VITE_AZURE_SPEECH_KEY || '').trim();
const AZURE_REGION = (import.meta.env.VITE_AZURE_SPEECH_REGION || 'uksouth').trim();

console.log(`[AzureVoice] SDK Version: ${sdk.SpeechRecognizer.prototype.constructor.name} init with region ${AZURE_REGION}`);

export class AzureVoiceService {
    private synthesizer: sdk.SpeechSynthesizer | null = null;
    private audioContext: AudioContext | null = null;
    private currentSource: AudioBufferSourceNode | null = null;
    private useFallback: boolean = false;

    private recognizer: sdk.SpeechRecognizer | null = null;
    private recognizerActive: boolean = false;
    private sttProcessor: ScriptProcessorNode | null = null;
    private sttStream: sdk.PushAudioInputStream | null = null;
    private sttAnalyser: AnalyserNode | null = null;
    private currentVolume: number = 0;

    constructor() {
        // Initialize fallback synth if needed
        if (window.speechSynthesis) {
            // Pre-load voices
            window.speechSynthesis.getVoices();
        }
    }

    public getAudioContext(): AudioContext {
        if (!this.audioContext) {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            this.audioContext = new AudioContext();
        }
        return this.audioContext;
    }

    public getVolume(): number {
        return this.currentVolume;
    }

    private initAudio(): void {
        this.getAudioContext();
    }

    // --- AZURE STT (RECOGNITION) ---
    public async startRecognition(
        onResult: (text: string, isFinal: boolean) => void,
        onError: (error: string) => void,
        locale: string = 'en-GB',
        mediaStream?: MediaStream
    ): Promise<void> {
        if (this.recognizerActive) return;

        try {
            console.log(`[AzureVoice] Starting Azure STT (${locale})...`);
            console.log(`[AzureVoice] Key length: ${AZURE_KEY.length}, Region: ${AZURE_REGION}`);

            if (!AZURE_KEY || AZURE_KEY.length < 10) {
                throw new Error("Invalid Azure Speech Key. Please check your .env file.");
            }

            const speechConfig = sdk.SpeechConfig.fromSubscription(AZURE_KEY, AZURE_REGION);
            speechConfig.speechRecognitionLanguage = locale;

            // CRITICAL: Request microphone permission FIRST and verify stream is active
            console.log(`[AzureVoice] Requesting microphone permission...`);
            let testStream: MediaStream;
            try {
                testStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const audioTracks = testStream.getAudioTracks();
                console.log(`[AzureVoice] Got ${audioTracks.length} audio track(s)`);
                if (audioTracks.length > 0) {
                    const track = audioTracks[0];
                    console.log(`[AzureVoice] Audio Track: label="${track.label}", enabled=${track.enabled}, muted=${track.muted}, readyState=${track.readyState}`);
                    if (track.muted || track.readyState !== 'live') {
                        throw new Error(`Microphone track is not live: muted=${track.muted}, readyState=${track.readyState}`);
                    }
                }
                // Stop the test stream - SDK will create its own
                testStream.getTracks().forEach(t => t.stop());
            } catch (micError) {
                console.error(`[AzureVoice] Microphone access failed:`, micError);
                throw new Error(`Microphone access failed: ${micError}`);
            }

            // Use SDK's default microphone input
            console.log(`[AzureVoice] Creating AudioConfig with default mic...`);
            const audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();

            console.log(`[AzureVoice] Initializing Recognizer...`);
            this.recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

            this.recognizer.recognizing = (s, e) => {
                if (e.result.text) {
                    console.debug('[AzureVoice] SDK Recognizing (Interim):', e.result.text);
                    onResult(e.result.text, false);
                }
            };

            this.recognizer.recognized = (s, e) => {
                console.log('[AzureVoice] SDK Recognized Event. Reason:', e.result.reason, 'Text:', e.result.text || '(empty)');

                if (e.result.reason === sdk.ResultReason.RecognizedSpeech) {
                    // Filter out empty results
                    if (e.result.text && e.result.text.trim().length > 0) {
                        console.log('[AzureVoice] SDK Recognized FINAL:', e.result.text);
                        onResult(e.result.text, true);
                    } else {
                        console.warn('[AzureVoice] SDK returned empty recognition result - ignoring');
                    }
                } else if (e.result.reason === sdk.ResultReason.NoMatch) {
                    const noMatch = sdk.NoMatchDetails.fromResult(e.result);
                    console.warn('[AzureVoice] SDK NoMatch. Reason:', noMatch.reason);

                    // Specific mapping for common issues
                    let displayMsg = '';
                    if (noMatch.reason === sdk.NoMatchReason.InitialSilenceTimeout) displayMsg = '(Silence)';
                    else if (noMatch.reason === sdk.NoMatchReason.BabbleTimeout) displayMsg = '(Too much noise)';
                    else displayMsg = '(Unrecognized audio)';

                    // Notify UI with a specific hint
                    onResult(displayMsg, false);
                }
            };

            this.recognizer.canceled = (s, e) => {
                console.warn('[AzureVoice] Recognition Canceled. Reason:', e.reason);
                if (e.reason === sdk.CancellationReason.Error) {
                    console.error('[AzureVoice] Cancellation Error Code:', e.errorCode);
                    console.error('[AzureVoice] Cancellation Error Details:', e.errorDetails);
                    onError(`Azure Error: ${e.errorDetails} (Code: ${e.errorCode})`);
                }
                this.recognizerActive = false;
            };

            this.recognizer.sessionStopped = (s, e) => {
                console.log('[AzureVoice] Session Stopped');
                this.recognizerActive = false;
            };

            this.recognizer.sessionStarted = (s, e) => {
                console.log('[AzureVoice] *** SESSION STARTED *** - Recognition is now active');
            };

            this.recognizer.speechStartDetected = (s, e) => {
                console.log('[AzureVoice] *** SPEECH START DETECTED ***');
            };

            this.recognizer.speechEndDetected = (s, e) => {
                console.log('[AzureVoice] *** SPEECH END DETECTED ***');
            };

            await new Promise<void>((resolve, reject) => {
                if (!this.recognizer) {
                    reject(new Error('Recognizer not initialized'));
                    return;
                }
                this.recognizer.startContinuousRecognitionAsync(
                    () => {
                        this.recognizerActive = true;
                        console.log('[AzureVoice] *** RECOGNITION STARTED SUCCESSFULLY ***');
                        resolve();
                    },
                    (err) => {
                        console.error('[AzureVoice] Recognition Start Failed:', err);
                        reject(err);
                    }
                );
            });

        } catch (e) {
            console.error('[AzureVoice] Recognition Setup Exception:', e);
            onError(`Setup Exception: ${String(e)}`);
        }
    }

    public async stopRecognition(): Promise<void> {
        if (!this.recognizer || !this.recognizerActive) return;

        if (this.sttProcessor) {
            this.sttProcessor.disconnect();
            this.sttProcessor.onaudioprocess = null;
            this.sttProcessor = null;
        }
        if (this.sttAnalyser) {
            this.sttAnalyser.disconnect();
            this.sttAnalyser = null;
        }
        if (this.sttStream) {
            this.sttStream.close();
            this.sttStream = null;
        }
        this.currentVolume = 0;

        return new Promise((resolve) => {
            this.recognizer!.stopContinuousRecognitionAsync(
                () => {
                    this.recognizerActive = false;
                    resolve();
                },
                (err) => {
                    console.warn('[AzureVoice] Stop Recognition Failed:', err);
                    this.recognizerActive = false;
                    resolve();
                }
            );
        });
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
                // Force UK South as env var might be incorrect and causing WebSocket errors
                const region = AZURE_REGION;
                const speechConfig = sdk.SpeechConfig.fromSubscription(AZURE_KEY, region);

                // American Woman Voice (Ava) - ALWAYS used for everything globally as per user request
                const voiceName = "en-US-AvaMultilingualNeural";
                speechConfig.speechSynthesisVoiceName = voiceName;

                this.synthesizer = new sdk.SpeechSynthesizer(speechConfig, null as any);

                // XML Escape text
                const escapedText = text
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&apos;');

                const ssml = `
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
    <voice name="${voiceName}">
        ${escapedText}
    </voice>
</speak>`.trim();

                console.log(`[AzureVoice] Synthesizing via Azure (Region: ${region}, Voice: ${voiceName})...`);

                this.synthesizer.speakSsmlAsync(
                    ssml,
                    (result) => {
                        if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
                            const audioData = result.audioData;
                            this.playBuffer(audioData, resolve);
                        } else {
                            const cancellation = sdk.CancellationDetails.fromResult(result);
                            console.error('[AzureVoice] Azure Synthesis Failed:', cancellation.errorDetails || result.errorDetails || 'Unknown Error');
                            console.error('[AzureVoice] Result Reason:', result.reason);

                            this.synthesizer?.close();
                            this.synthesizer = null;

                            // *** TRIGGER FALLBACK ***
                            this.useFallback = true;
                            this.speakNative(text, countryCode).then(resolve);
                        }
                    },
                    (err) => {
                        console.error('[AzureVoice] Synthesis Synthesis Exception:', err);
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
