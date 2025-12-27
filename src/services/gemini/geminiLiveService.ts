import { SYSTEM_INSTRUCTION } from './constants';
// Force Refresh: 2
import { HybridCallbacks } from './types';

declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

export class HybridController {
    private apiKey: string;
    private recognition: any | null = null;
    private micStream: MediaStream | null = null;
    private analyser: AnalyserNode | null = null;
    private stopVolumeTimer: any = null;
    private callbacks: HybridCallbacks = {};
    private chatHistory: any[] = [];
    private isSpeaking: boolean = false;
    private lastSpokeTime: number = 0;
    private audioContext: AudioContext | null = null;

    // Diagnostic State
    private debugState = {
        audioContextState: 'inactive',
        micLabel: 'initializing...',
        recognitionStatus: 'inactive',
        speechApiSupported: false,
        lastError: ''
    };

    constructor() {
        // Robust API Key Retrieval for Production
        this.apiKey = (import.meta.env.VITE_GEMINI_API_KEY || (typeof process !== 'undefined' ? process.env?.API_KEY : '') || '').trim();
    }

    public async startSession(callbacks: HybridCallbacks) {
        this.callbacks = callbacks;
        this.chatHistory = [];

        // --- DEPLOYMENT RESILIENCE: Missing Key Handling ---
        if (!this.apiKey) {
            console.error('[Gemini] Missing API Key. Setup required.');
            this.callbacks.onError?.(new Error("Internal Error: API_KEY missing."));
            this.callbacks.onStatusChange?.('Config Error ❌');

            setTimeout(() => this.speak("System configuration error. Please check the website settings.", false), 500);
            return;
        }

        this.callbacks.onStatusChange?.('Initializing...');

        try {
            // WARM-UP: Create AudioContext immediately on user gesture
            const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
            this.audioContext = new AudioContextClass();
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.micStream = stream;

            // Get Mic Label
            const tracks = stream.getAudioTracks();
            if (tracks.length > 0) {
                this.debugState.micLabel = tracks[0].label || 'Default Microphone';
            }
            this.broadcastDebug();

            this.setupAudioVisualizer(stream);
            this.startSpeechRecognition();
        } catch (err: any) {
            console.warn('[Voice] Mic blocked:', err);
            this.debugState.lastError = err.message;
            this.broadcastDebug();

            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                this.callbacks.onStatusChange?.('Mic Blocked ❌');
                this.callbacks.onError?.(new Error("Microphone access denied. Please allow permissions."));
            } else {
                this.callbacks.onStatusChange?.('Mic Error ❌');
                this.callbacks.onError?.(new Error(`Microphone error: ${err.message} `));
            }
        }
    }

    private broadcastDebug() {
        this.callbacks.onDebug?.({
            audioContextState: this.audioContext?.state || 'inactive',
            micLabel: this.debugState.micLabel,
            recognitionStatus: this.debugState.recognitionStatus,
            speechApiSupported: this.debugState.speechApiSupported,
            lastError: this.debugState.lastError
        });
    }

    private setupAudioVisualizer(stream: MediaStream) {
        if (!this.audioContext) return;

        const source = this.audioContext.createMediaStreamSource(stream);
        this.analyser = this.audioContext.createAnalyser();
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
    }

    private startSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        this.debugState.speechApiSupported = !!SpeechRecognition;
        this.broadcastDebug();

        if (!SpeechRecognition) {
            this.callbacks.onError?.(new Error("Browser Speech Recognition not supported."));
            this.debugState.recognitionStatus = 'not_supported';
            this.broadcastDebug();
            return;
        }

        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-GB';

        this.recognition.onresult = (event: any) => {
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    const transcript = event.results[i][0].transcript.trim();
                    if (transcript) this.handleUserInput(transcript);
                }
            }
        };

        this.recognition.onstart = () => {
            this.debugState.recognitionStatus = 'started';
            this.broadcastDebug();
            this.callbacks.onStatusChange?.('Listening (Mic Active)');
            // GREETING (Strict Wording)
            if (this.chatHistory.length === 0) {
                this.speak("Hello, you’re through to Emergency Tradesmen. Tell me what’s happened and where you are, and I’ll guide you to the right help.");
            }
        };

        this.recognition.onspeechstart = () => this.callbacks.onStatusChange?.('Speech Detected 🗣️');
        this.recognition.onnomatch = () => this.callbacks.onStatusChange?.('No Speech Recognized');

        this.recognition.onerror = (e: any) => {
            if (e.error === 'no-speech') return;
            if (e.error === 'aborted') return;
            if (e.error === 'not-allowed') this.callbacks.onStatusChange?.('Mic Blocked ❌');

            console.warn('[Voice] Error:', e.error);
            this.callbacks.onMessage?.(`System: Mic Error(${e.error})`, 'model');
        };

        this.recognition.onend = () => {
            // Auto-restart if not manually stopped
            if (this.recognition && !this.isSpeaking) {
                try {
                    this.recognition.start();
                } catch (e) { }
            }
        };

        try {
            this.recognition.start();
        } catch (e: any) {
            console.warn('[Voice] Start failed:', e);
            this.debugState.recognitionStatus = 'start_failed';
            this.debugState.lastError = `Start Fail: ${e.message || e} `;
            this.broadcastDebug();
        }
    }

    private async handleUserInput(text: string) {
        if (!text.trim() || this.isSpeaking) return;

        // TIMESTAMP GATE (Echo Prevention)
        if (Date.now() - this.lastSpokeTime < 3000) {
            console.log('[Voice] Ignoring input during speech window (Echo Prevention)');
            return;
        }

        // TEXT FILTER GATE (Backup Echo Prevention)
        const cleanText = text.toLowerCase().trim();
        if (cleanText.includes("emergency tradesmen") || cleanText.includes("through to emergency")) {
            console.log('[Voice] Ignoring self-echo:', text);
            return;
        }

        this.callbacks.onMessage?.(text, 'user');

        // --- OFFLINE EMERGENCY MODE (Priority) ---
        // If we match a keyword, we execute immediately and SKIP the Brain to avoid Quota/Latency issues.
        const lower = text.toLowerCase();
        const commands: Record<string, { route: string, speech: string }> = {
            'plumber': { route: '/emergency-plumber', speech: "Opening Plumber listings. Please select your city to see who is nearby." },
            'pipe': { route: '/emergency-plumber', speech: "Opening Plumber listings. Please select your city to see who is nearby." },
            'leak': { route: '/emergency-plumber', speech: "Opening Plumber listings. Please select your city to see who is nearby." },

            'electrician': { route: '/emergency-electrician', speech: "Opening Electrician listings. Please select your city to see who is nearby." },
            'spark': { route: '/emergency-electrician', speech: "Opening Electrician listings. Please select your city to see who is nearby." },

            'locksmith': { route: '/emergency-locksmith', speech: "Opening Locksmith listings. Please select your city to see who is nearby." },

            'boiler': { route: '/emergency-gas-engineer', speech: "Opening Gas Engineer listings. Please select your city to see who is nearby." },
            'gas': { route: '/emergency-gas-engineer', speech: "Opening Gas Engineer listings. Please select your city to see who is nearby." },

            'drain': { route: '/drain-specialist', speech: "Opening Drain listings. Please select your city to see who is nearby." },

            'help': { route: '/contact', speech: "I am taking you to the support page." },
            'home': { route: '/', speech: "Returning to the main menu." },
            'blog': { route: '/blog', speech: "Opening the advice blog." }
        };

        for (const [key, data] of Object.entries(commands)) {
            if (lower.includes(key)) {
                console.log('[Voice] Fast Command Triggered:', key);
                this.callbacks.onNavigate?.(data.route);
                this.callbacks.onMessage?.(`Navigating to ${key}...`, 'model');

                // Speak safety advice immediately (Offline)
                await this.speak(data.speech);

                // CRITICAL: Stop here. Do not call the API.
                // This prevents "QUOTA_EXCEEDED" errors when we have successfully handled the intent locally.
                this.callbacks.onStatusChange?.('Ready');
                return;
            }
        }

        await this.generateResponse(text);
    }

    private async generateResponse(userText: string) {
        this.callbacks.onStatusChange?.('Thinking...');

        if (this.chatHistory.length === 0) {
            this.chatHistory.push({
                role: "user",
                parts: [{ text: `SYSTEM_INSTRUCTIONS: ${SYSTEM_INSTRUCTION} ` }]
            });
            this.chatHistory.push({
                role: "model",
                parts: [{ text: "Understood. I will act as the Emergency Tradesmen Concierge." }]
            });
        }

        this.chatHistory.push({ role: "user", parts: [{ text: userText }] });

        try {
            const accountId = 'dd742691cc31b1d460788e1084fe3243';
            const gatewayId = 'emergency-tradesmen';
            const provider = 'google-ai-studio';
            const model = 'gemini-2.5-flash';

            const endpoint = `https://gateway.ai.cloudflare.com/v1/${accountId}/${gatewayId}/${provider}/v1beta/models/${model}:generateContent?key=${this.apiKey}`;

            const payload = { contents: this.chatHistory };

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errData = await response.json();
                if (response.status === 429) throw new Error("QUOTA_EXCEEDED");
                throw new Error(errData.error?.message || response.statusText);
            }

            const data = await response.json();
            const candidate = data.candidates?.[0];
            const content = candidate?.content;

            if (content) {
                this.chatHistory.push(content);
                const parts = content.parts || [];
                let spokenText = "";
                for (const part of parts) if (part.text) spokenText += part.text;

                if (spokenText) {
                    let textToSpeak = spokenText;

                    const navMatch = spokenText.match(/\[NAVIGATE:\s*([^\]]+)\]/);
                    if (navMatch) {
                        const route = navMatch[1].trim();
                        textToSpeak = spokenText.replace(navMatch[0], '').trim();
                        this.callbacks.onNavigate?.(route);
                    }

                    this.callbacks.onMessage?.(textToSpeak, 'model');
                    await this.speak(textToSpeak);
                }
            }
            this.callbacks.onStatusChange?.('Ready');

        } catch (e: any) {
            console.error('[Gemini] Brain Error:', e);
            this.callbacks.onMessage?.(`System: ${e.message}`, 'model');

            // FALLBACK BEHAVIOR (When Brain is Dead/Quota is Full)
            if (e.message.includes('QUOTA') || e.message.includes('429')) {
                // Actually navigate to help
                this.callbacks.onNavigate?.('/contact');
                await this.speak("I cannot reach the cloud right now, so I have navigated you to the manual support page.", false);
            } else {
                this.callbacks.onNavigate?.('/');
                await this.speak("Connection error. Please select a trade from the menu.", false);
            }

            this.stopSession();
            this.callbacks.onStatusChange?.('Error ❌');
        }
    }

    private currentUtterance: SpeechSynthesisUtterance | null = null; // Prevent GC

    private async speak(text: string, autoResume = true) {
        this.isSpeaking = true;
        this.lastSpokeTime = Date.now();
        if (this.recognition) this.recognition.stop();
        this.callbacks.onStatusChange?.('Speaking...');

        return new Promise<void>((resolve) => {
            // Cancel any previous speech
            window.speechSynthesis.cancel();

            const utter = new SpeechSynthesisUtterance(text);
            this.currentUtterance = utter; // Store ref to prevent Garbage Collection (Fixes 'Cuts Out')

            // SMART VOICE SELECTION (Detailed)
            const voices = window.speechSynthesis.getVoices();
            console.log('[Voice] Available voices:', voices.map(v => v.name)); // Debug

            // Priority Logic for "Human-like" voices
            const preferredVoice = voices.find(v =>
                v.name.includes("Google UK English Male") ||
                v.name.includes("Microsoft George") || // Common Windows High-Quality
                v.name.includes("Daniel") || // Common Mac High-Quality
                (v.lang === 'en-GB' && v.name.includes("Google")) ||
                (v.lang === 'en-GB' && !v.name.includes("Microsoft Hazel")) // Avoid Hazel (Robot-like)
            ) || voices.find(v => v.lang === 'en-GB');

            if (preferredVoice) {
                console.log('[Voice] Selected:', preferredVoice.name);
                utter.voice = preferredVoice;
            }

            utter.lang = 'en-GB';
            utter.rate = 1.0; // Normal speed
            utter.pitch = 1.0;

            utter.onend = async () => {
                this.isSpeaking = false;
                this.currentUtterance = null;
                await new Promise(r => setTimeout(r, 1000));
                this.callbacks.onStatusChange?.('Ready');
                if (this.recognition && autoResume) {
                    try { this.recognition.start(); } catch (e) { }
                }
                resolve();
            };

            utter.onerror = (e) => {
                console.error('TTS Error', e);
                this.isSpeaking = false;
                this.currentUtterance = null;
                resolve();
            };

            window.speechSynthesis.speak(utter);
        });
    }

    public async stopSession() {
        if (this.recognition) {
            this.recognition.onend = null;
            this.recognition.stop();
            this.recognition = null;
        }
        window.speechSynthesis.cancel();
        if (this.micStream) {
            this.micStream.getTracks().forEach(t => t.stop());
            this.micStream = null;
        }
        if (this.stopVolumeTimer) cancelAnimationFrame(this.stopVolumeTimer);
        this.analyser = null;
        this.chatHistory = [];
        this.isSpeaking = false;

        if (this.audioContext && this.audioContext.state !== 'closed') {
            this.audioContext.close();
        }
    }
}

