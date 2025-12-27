
import { SYSTEM_INSTRUCTION } from './constants';
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
    private currentUtterance: SpeechSynthesisUtterance | null = null;

    // Diagnostic State
    private debugState = {
        audioContextState: 'inactive',
        micLabel: 'initializing...',
        recognitionStatus: 'inactive',
        speechApiSupported: false,
        lastError: ''
    };

    constructor() {
        this.apiKey = (import.meta.env.VITE_GEMINI_API_KEY || (typeof process !== 'undefined' ? process.env?.API_KEY : '') || '').trim();
    }

    public async startSession(callbacks: HybridCallbacks) {
        this.callbacks = callbacks;
        this.chatHistory = [];

        if (!this.apiKey) {
            this.callbacks.onError?.(new Error("Internal Error: API_KEY missing."));
            this.callbacks.onStatusChange?.('Config Error ❌');
            setTimeout(() => this.speak("System configuration error. Please check the website settings.", false), 500);
            return;
        }

        this.callbacks.onStatusChange?.('Initializing...');

        try {
            const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
            this.audioContext = new AudioContextClass();
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.micStream = stream;

            const tracks = stream.getAudioTracks();
            if (tracks.length > 0) {
                this.debugState.micLabel = tracks[0].label || 'Default Microphone';
            }
            this.broadcastDebug();

            this.setupAudioVisualizer(stream);
            this.startSpeechRecognition();
        } catch (err: any) {
            console.warn('[Voice] Init error:', err);
            this.debugState.lastError = err.message;
            this.broadcastDebug();
            this.callbacks.onStatusChange?.('Error ❌');
            this.callbacks.onError?.(new Error(`Mic Error: ${err.message}`));
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

        const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        const updateVolume = () => {
            if (!this.analyser) return;
            this.analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
            this.callbacks.onVolume?.(sum / dataArray.length / 255);
            this.stopVolumeTimer = requestAnimationFrame(updateVolume);
        };
        updateVolume();
    }

    private startSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.debugState.speechApiSupported = !!SpeechRecognition;

        if (!SpeechRecognition) {
            this.callbacks.onError?.(new Error("Speech Recognition not supported."));
            return;
        }

        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-GB';

        this.recognition.onresult = this.handleRecognitionResult.bind(this);

        this.recognition.onstart = () => {
            this.debugState.recognitionStatus = 'started';
            this.broadcastDebug();
            this.callbacks.onStatusChange?.('Ready');

            if (this.chatHistory.length === 0) {
                // Mobile Failsafe: Wait for voices
                if (window.speechSynthesis.getVoices().length === 0) {
                    window.speechSynthesis.onvoiceschanged = () => {
                        this.speak("Hello, you’re through to Emergency Tradesmen. Tell me what’s happened and where you are?");
                        window.speechSynthesis.onvoiceschanged = null;
                    };
                } else {
                    this.speak("Hello, you’re through to Emergency Tradesmen. Tell me what’s happened and where you are?");
                }
            }
        };

        this.recognition.onend = () => {
            if (this.recognition && !this.isSpeaking) {
                try { this.recognition.start(); } catch (e) { }
            }
        };

        try {
            this.recognition.start();
        } catch (e: any) {
            console.error('[Voice] Start error:', e);
        }
    }

    private handleRecognitionResult(event: any) {
        if (this.isSpeaking) return; // Nuclear block

        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                const transcript = event.results[i][0].transcript.trim();
                if (transcript) this.handleUserInput(transcript);
            }
        }
    }

    private async handleUserInput(text: string) {
        if (!text.trim() || this.isSpeaking) return;

        // Earmuff Delay
        if (Date.now() - this.lastSpokeTime < 2000) return;

        this.callbacks.onMessage?.(text, 'user');

        // --- 1. OFFLINE TRIAGE (Instant local responses) ---
        const lower = text.toLowerCase();
        const routes: Record<string, { route: string, name: string }> = {
            'plumber': { route: '/emergency-plumber', name: 'plumber' },
            'leak': { route: '/emergency-plumber', name: 'plumber' },
            'pipe': { route: '/emergency-plumber', name: 'plumber' },
            'water': { route: '/emergency-plumber', name: 'plumber' },
            'flood': { route: '/emergency-plumber', name: 'plumber' },

            'electrician': { route: '/emergency-electrician', name: 'electrician' },
            'spark': { route: '/emergency-electrician', name: 'electrician' },
            'power': { route: '/emergency-electrician', name: 'electrician' },

            'locksmith': { route: '/emergency-locksmith', name: 'locksmith' },
            'key': { route: '/emergency-locksmith', name: 'locksmith' },
            'locked out': { route: '/emergency-locksmith', name: 'locksmith' },

            'gas': { route: '/emergency-gas-engineer', name: 'gas engineer' },
            'boiler': { route: '/emergency-gas-engineer', name: 'gas engineer' },

            'drain': { route: '/drain-specialist', name: 'drain specialist' },
            'sewage': { route: '/drain-specialist', name: 'drain specialist' },

            'glazier': { route: '/emergency-glazier', name: 'glazier' },
            'glass': { route: '/emergency-glazier', name: 'glazier' }
        };

        for (const [key, data] of Object.entries(routes)) {
            if (lower.includes(key)) {
                console.log('[Voice] Local Match Found:', key);
                this.callbacks.onNavigate?.(data.route);
                this.callbacks.onMessage?.(`Navigating to emergency ${data.name}...`, 'model');

                // Professional confirmation (Offline)
                await this.speak(`I’m showing you the nearest available emergency ${data.name} services. Please tap Select City to find who is available in your area.`);
                this.callbacks.onStatusChange?.('Ready');
                return; // SKIP API CALL
            }
        }

        // --- 2. ONLINE BRAIN FALLBACK ---
        await this.generateResponse(text);
    }

    private async generateResponse(userText: string) {
        this.callbacks.onStatusChange?.('Thinking...');

        if (this.chatHistory.length === 0) {
            this.chatHistory.push({
                role: "user",
                parts: [{ text: `SYSTEM_INSTRUCTIONS: ${SYSTEM_INSTRUCTION}` }]
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
            const endpoint = `https://gateway.ai.cloudflare.com/v1/${accountId}/${gatewayId}/google-ai-studio/v1beta/models/gemini-2.0-flash:generateContent?key=${this.apiKey}`;

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: this.chatHistory })
            });

            if (!response.ok) throw new Error("API Connection Error");

            const data = await response.json();
            const content = data.candidates?.[0]?.content;

            if (content) {
                this.chatHistory.push(content);
                let spokenText = content.parts?.[0]?.text || "";

                // Nav Tag
                const navMatch = spokenText.match(/\[NAVIGATE:\s*([^\]]+)\]/);
                if (navMatch) {
                    this.callbacks.onNavigate?.(navMatch[1].trim());
                    spokenText = spokenText.replace(navMatch[0], '').trim();
                }

                if (spokenText) {
                    this.callbacks.onMessage?.(spokenText, 'model');
                    await this.speak(spokenText);
                }
            }
            this.callbacks.onStatusChange?.('Ready');
        } catch (e: any) {
            console.error('[Voice] API Error:', e);
            this.callbacks.onStatusChange?.('Quota Full ❌');
            this.callbacks.onNavigate?.('/contact');
            await this.speak("I am having trouble connecting to the cloud right now, so I have moved you to our support page for manual assistance.");
            this.callbacks.onStatusChange?.('Ready');
        }
    }

    private async speak(text: string, autoResume = true) {
        this.isSpeaking = true;
        this.lastSpokeTime = Date.now();

        // Muzzle Recognition
        if (this.recognition) {
            try { this.recognition.stop(); } catch (e) { }
        }

        this.callbacks.onStatusChange?.('Speaking...');

        return new Promise<void>((resolve) => {
            window.speechSynthesis.cancel();
            const utter = new SpeechSynthesisUtterance(text);
            this.currentUtterance = utter;

            // BEST BRITISH VOICE LOGIC (Optimized for Mobile & Desktop)
            const voices = window.speechSynthesis.getVoices();
            const preferred =
                voices.find(v => v.name.includes("Google UK English Male")) ||
                voices.find(v => v.name.includes("Google UK English Female")) ||
                voices.find(v => v.name.includes("Microsoft George")) ||
                voices.find(v => v.name.includes("Martha")) || // High-quality iOS
                voices.find(v => v.name.includes("Daniel")) || // High-quality iOS/Mac
                voices.find(v => v.name.includes("Arthur")) || // High-quality iOS
                voices.find(v => v.lang === "en-GB" || v.lang === "en_GB");

            if (preferred) utter.voice = preferred;
            utter.lang = 'en-GB';
            utter.rate = 1.0;

            utter.onend = () => {
                this.isSpeaking = false;
                this.currentUtterance = null;
                this.callbacks.onStatusChange?.('Ready');

                // Delay Ears Reconnection
                setTimeout(() => {
                    if (this.recognition && autoResume) {
                        try { this.recognition.start(); } catch (e) { }
                    }
                    resolve();
                }, 800);
            };

            utter.onerror = () => {
                this.isSpeaking = false;
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
