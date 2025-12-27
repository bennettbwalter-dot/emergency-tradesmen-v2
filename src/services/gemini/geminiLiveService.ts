
import { SYSTEM_INSTRUCTION } from './constants';
import { HybridCallbacks } from './types';
import { cities } from '../../lib/trades';

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
    private pendingTrade: { route: string, name: string } | null = null;
    private lastSpokeText: string = ""; // Echo Filter
    private activeMuzzle: boolean = false; // Hard Muzzle State

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
                        if (this.chatHistory.length === 0) {
                            this.chatHistory.push({ role: 'assistant', parts: [{ text: "GREETING" }] });
                            this.speak("Hello, you’re through to Emergency Tradesmen. Tell me what’s happened?");
                        }
                        window.speechSynthesis.onvoiceschanged = null;
                    };
                } else {
                    this.chatHistory.push({ role: 'assistant', parts: [{ text: "GREETING" }] });
                    this.speak("Hello, you’re through to Emergency Tradesmen. Tell me what’s happened?");
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
        if (this.isSpeaking || this.activeMuzzle) return; // Dual Muzzle

        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                let transcript = event.results[i][0].transcript.trim();
                if (!transcript) continue;

                // --- AGGRESSIVE ECHO FILTER ---
                if (this.lastSpokeText) {
                    const cleanOld = this.lastSpokeText.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").trim();
                    const cleanNew = transcript.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").trim();

                    // If the transcript contains a major chunk of the AI's last words, it's an echo.
                    if (cleanNew.includes(cleanOld.substring(0, 20)) || cleanOld.includes(cleanNew.substring(0, 20))) {
                        console.log('[Voice] Aggressive Echo Filter: Dropped overlap.');
                        return;
                    }
                }

                if (transcript) this.handleUserInput(transcript);
            }
        }
    }

    private async handleUserInput(text: string) {
        if (!text.trim() || this.isSpeaking || this.activeMuzzle) return;

        // Ears Reset Gate: Don't allow input for 1 second after speech officially ends.
        if (Date.now() - this.lastSpokeTime < 1000) return;

        this.callbacks.onMessage?.(text, 'user');
        const lower = text.toLowerCase();

        // --- STEP 2: LOCATION IDENTIFIED ---
        if (this.pendingTrade) {
            const trade = this.pendingTrade;
            this.pendingTrade = null; // Clear state early

            // Clean and Match Location (Check cities list for correct spacing/spelling)
            const cleanText = text.toLowerCase()
                .replace(/^(in|at|i am in|i'm in|located in|i'm located in)\s+/i, '')
                .trim();

            const matchedCity = cities.find(c => c.toLowerCase() === cleanText);
            const cityParam = matchedCity || cleanText; // use matched city if found, else transcript

            const targetPath = `${trade.route}/${cityParam}`;

            console.log(`[Voice] Navigating to: ${targetPath}`);
            this.callbacks.onNavigate?.(targetPath);

            const confirmation = `I’m showing you the nearest available emergency ${trade.name} services in ${cityParam}. You're in the right place now. Help is just a few steps away.`;
            this.callbacks.onMessage?.(confirmation, 'model');
            await this.speak(confirmation);

            this.callbacks.onStatusChange?.('Ready');
            return;
        }

        // --- STEP 1: PROBLEM/TRADE IDENTIFIED ---
        // Keyword Triage (Offline)
        const trades: Record<string, { route: string, name: string, tip: string }> = {
            'plumber': { route: '/emergency-plumber', name: 'plumber', tip: "If water is spreading near electrics, avoid switches and sockets." },
            'leak': { route: '/emergency-plumber', name: 'plumber', tip: "If water is spreading near electrics, avoid switches and sockets." },
            'water': { route: '/emergency-plumber', name: 'plumber', tip: "If water is spreading near electrics, avoid switches and sockets." },
            'pipe': { route: '/emergency-plumber', name: 'plumber', tip: "If water is spreading near electrics, avoid switches and sockets." },
            'flood': { route: '/emergency-plumber', name: 'plumber', tip: "If water is spreading near electrics, avoid switches and sockets." },
            'burst': { route: '/emergency-plumber', name: 'plumber', tip: "If water is spreading near electrics, avoid switches and sockets." },

            'electrician': { route: '/emergency-electrician', name: 'electrician', tip: "If there’s water near sockets or a burning smell, keep clear of electrics." },
            'power': { route: '/emergency-electrician', name: 'electrician', tip: "If there’s water near sockets or a burning smell, keep clear of electrics." },
            'spark': { route: '/emergency-electrician', name: 'electrician', tip: "If there’s water near sockets or a burning smell, keep clear of electrics." },
            'fuse': { route: '/emergency-electrician', name: 'electrician', tip: "If there’s water near sockets or a burning smell, keep clear of electrics." },
            'light': { route: '/emergency-electrician', name: 'electrician', tip: "If there’s water near sockets or a burning smell, keep clear of electrics." },

            'locksmith': { route: '/emergency-locksmith', name: 'locksmith', tip: "Please stay in a well-lit, safe area while you wait." },
            'key': { route: '/emergency-locksmith', name: 'locksmith', tip: "Please stay in a well-lit, safe area while you wait." },
            'locked': { route: '/emergency-locksmith', name: 'locksmith', tip: "Please stay in a well-lit, safe area while you wait." },
            'door': { route: '/emergency-locksmith', name: 'locksmith', tip: "Please stay in a well-lit, safe area while you wait." },

            'gas': { route: '/emergency-gas-engineer', name: 'gas engineer', tip: "If you smell gas or feel unwell, leave the property and get fresh air immediately." },
            'boiler': { route: '/emergency-gas-engineer', name: 'gas engineer', tip: "If you smell gas or feel unwell, leave the property and get fresh air immediately." },
            'heating': { route: '/emergency-gas-engineer', name: 'gas engineer', tip: "If you smell gas or feel unwell, leave the property and get fresh air immediately." },

            'drain': { route: '/drain-specialist', name: 'drain specialist', tip: "Avoid contact with waste water and keep children and pets away." },
            'sewage': { route: '/drain-specialist', name: 'drain specialist', tip: "Avoid contact with waste water and keep children and pets away." },
            'blocked': { route: '/drain-specialist', name: 'drain specialist', tip: "Avoid contact with waste water and keep children and pets away." },

            'glazier': { route: '/emergency-glazier', name: 'glazier', tip: "Keep clear of broken glass and don’t touch sharp edges." },
            'glass': { route: '/emergency-glazier', name: 'glazier', tip: "Keep clear of broken glass and don’t touch sharp edges." },
            'window': { route: '/emergency-glazier', name: 'glazier', tip: "Keep clear of broken glass and don’t touch sharp edges." }
        };

        for (const [key, data] of Object.entries(trades)) {
            if (lower.includes(key)) {
                this.pendingTrade = data;
                const response = `I understand, I can help find a ${data.name} for you. ${data.tip} Where are you located?`;
                this.callbacks.onMessage?.(response, 'model');
                await this.speak(response);
                return;
            }
        }

        // --- FALLBACK: ONLINE ---
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
        this.activeMuzzle = true; // Hardware Muzzle ON
        this.lastSpokeTime = Date.now();
        this.lastSpokeText = text; // Save for echo filtering

        // Kill Recognition immediately
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
                    this.activeMuzzle = false; // Muzzle OFF
                    this.lastSpokeTime = Date.now(); // Reset gate start
                    if (this.recognition && autoResume) {
                        try { this.recognition.start(); } catch (e) { }
                    }
                    resolve();
                }, 1000); // Wait 1 full second for buffers to clear
            };

            utter.onerror = () => {
                this.isSpeaking = false;
                this.activeMuzzle = false;
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
