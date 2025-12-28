
import { SYSTEM_INSTRUCTION } from './constants';
import { HybridCallbacks } from './types';
import { cities, trades as importedTrades } from '../../lib/trades';

declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

import { unlockAudioContext as unlockAzure, playNavigationVoice } from '../azureVoice';

export class HybridController {
    private apiKey: string;
    // Removed native recognition reference if we are purely relying on Azure for TTS, 
    // but the user said "Refactor TTS", not STT (Speech-to-Text). 
    // The previous instructions were "Delete... Google Vertex AI agent" audio functions.
    // If "Google Vertex AI" was the STT, then we might need to keep SpeechRecognition?
    // User said "Delete... window.speechSynthesis, SpeechSynthesisUtterance...". 
    // So STT (SpeechRecognition) likely stays.
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
    private isActiveFlag: boolean = false; // Session Lifecycle Flag
    private heartbeatTimer: any = null; // Recognition Heartbeat
    private watchdogTimer: any = null; // Synthesis Watchdog
    private keepAliveOsc: OscillatorNode | null = null;
    private isEngineInitialized: boolean = false;

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

    public unlockAudioContext() {
        // Unlock Azure Engine
        unlockAzure();

        const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
        if (AudioContextClass && !this.audioContext) {
            this.audioContext = new AudioContextClass();
        }
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume().then(() => {
                console.log('[Voice] AudioContext Unlocked/Resumed');
            });
        }
    }

    public async startSession(callbacks: HybridCallbacks) {
        this.isActiveFlag = true;
        this.callbacks = callbacks;
        this.chatHistory = [];

        if (!this.apiKey) {
            console.warn('[Voice] API_KEY missing. Cloud fallback disabled.');
            this.debugState.lastError = 'API_KEY missing (Cloud disabled)';
            this.broadcastDebug();
        }

        this.callbacks.onStatusChange?.('Initializing...');

        // CRITICAL FOR MOBILE: Fire recognition immediately (if possible) or minimize async gap
        this.startSpeechRecognition();

        try {
            const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
            if (AudioContextClass) {
                this.audioContext = new AudioContextClass();
                if (this.audioContext && this.audioContext.state === 'suspended') {
                    await this.audioContext.resume();
                }
            }

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.micStream = stream;

            const tracks = stream.getAudioTracks();
            if (tracks.length > 0) {
                this.debugState.micLabel = tracks[0].label || 'Default Microphone';
            }
            this.broadcastDebug();

            this.setupAudioVisualizer(stream);

            // MOBILE KEEPALIVE: Keep AudioContext warm to prevent mic sleep
            this.startKeepAlive();
        } catch (err: any) {
            console.warn('[Voice] Init error:', err);
            this.debugState.lastError = err.message;
            this.broadcastDebug();
        }
    }

    private startKeepAlive() {
        if (!this.audioContext || this.keepAliveOsc) return;
        try {
            this.keepAliveOsc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            gain.gain.value = 0.001; // Nearly silent
            this.keepAliveOsc.connect(gain);
            gain.connect(this.audioContext.destination);
            this.keepAliveOsc.start();
            console.log('[Voice] Audio Keep-Alive active');
        } catch (e) {
            console.warn('[Voice] Keep-Alive failed:', e);
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

    private startSpeechRecognition(forceFresh = false) {
        if (!this.isActiveFlag) return;

        // HALF-DUPLEX STRATEGY: 
        // We aggressively kill and recreate the engine on mobile to ensure Audio Context purity.

        if (this.recognition && !forceFresh) {
            try { this.recognition.start(); } catch (e) { }
            return;
        }

        if (this.recognition) {
            try {
                this.recognition.onend = null;
                this.recognition.stop();
            } catch (e) { }
            this.recognition = null;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            this.debugState.speechApiSupported = false;
            this.broadcastDebug();
            this.callbacks.onError?.(new Error("Speech Recognition not supported."));
            return;
        }

        console.log('[Voice] Initializing Fresh Engine (Half-Duplex)...');
        this.recognition = new SpeechRecognition();

        // STRICT HALF-DUPLEX: No continuous. One sentence at a time.
        // We rely on the Restart Loop to keep it going.
        this.recognition.continuous = false;

        this.recognition.interimResults = true;
        this.recognition.lang = 'en-GB';

        this.recognition.onresult = this.handleRecognitionResult.bind(this);

        this.recognition.onstart = () => {
            console.log('[Voice] Recognition started');
            this.debugState.recognitionStatus = 'started';
            this.isSpeaking = false;
            this.activeMuzzle = false;
            this.broadcastDebug();

            if (this.callbacks.onStatusChange) {
                this.callbacks.onStatusChange('Listening');
            }

            if (this.isActiveFlag && this.chatHistory.length === 0) {
                this.chatHistory.push({ role: 'assistant', parts: [{ text: "GREETING" }] });
                this.speak("Hello, you’re through to Emergency Tradesmen. Tell me what’s happened?");
            }
        };

        this.recognition.onend = () => {
            console.log('[Voice] Engine Ended. Status:', this.debugState.recognitionStatus);
            this.debugState.recognitionStatus = 'ended';
            this.broadcastDebug();

            this.activeMuzzle = false; // Safety Unmuzzle
            this.isSpeaking = false;

            // RESTART LOOP:
            // Since continuous=false, we MUST restart after every pause.
            // But if we are about to speak (or are speaking), DO NOT restart.
            if (this.isActiveFlag && !this.isSpeaking) {
                console.log('[Voice] Restarting listener (Half-Duplex)...');
                setTimeout(() => {
                    // Request a FRESH instance to clear iOS audio buffers
                    this.startSpeechRecognition(true);
                }, 200);
            }
        };

        this.recognition.onerror = (e: any) => {
            console.warn('[Voice] Engine Error:', e.error);
            this.debugState.lastError = `Recog: ${e.error}`;
            this.broadcastDebug();

            if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
                console.warn('[Voice] Mic blocked/busy. Waiting...');
            } else {
                // legitimate error
            }
        };

        try {
            this.recognition.start();
            this.startHeartbeat();
        } catch (e: any) {
            console.error('[Voice] Engine start fail:', e);
        }
    }

    private startHeartbeat() {
        if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
        this.heartbeatTimer = setInterval(() => {
            if (this.isActiveFlag && !this.isSpeaking && !this.activeMuzzle) {
                const status = this.debugState.recognitionStatus;
                if (status === 'ended' || status === 'inactive') {
                    console.log('[Voice] Heartbeat: Re-initializing fresh engine...');
                    this.startSpeechRecognition();
                }
            }
        }, 5000);
    }

    private handleRecognitionResult(event: any) {
        if (!this.isActiveFlag || this.isSpeaking || this.activeMuzzle) return;

        for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcript = event.results[i][0].transcript.trim();
            if (event.results[i].isFinal) {
                console.log(`[Voice] Final Transcript: "${transcript}"`);
                if (!transcript) continue;

                // --- ROBUST FUZZY ECHO FILTER (DISABLED FOR DEBUGGING) ---
                /*
                if (this.lastSpokeText) {
                    const cleanOld = this.lastSpokeText.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").split(/\s+/).filter(w => w.length > 2);
                    const cleanNew = transcript.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").split(/\s+/).filter(w => w.length > 2);

                    if (cleanOld.length > 0 && cleanNew.length > 0) {
                        const overlap = cleanNew.filter(word => cleanOld.includes(word));
                        const overlapRatio = overlap.length / Math.max(cleanNew.length, 1);

                        // If more than 50% of the words overlap, it's almost certainly an echo.
                        if (overlapRatio > 0.5 || (cleanNew.length > 5 && overlap.length >= 3)) {
                            console.log(`[Voice] Fuzzy Echo Filter: Dropped overlap (${Math.round(overlapRatio * 100)}%).`);
                            return;
                        }
                    }
                }
                */

                if (transcript) this.handleUserInput(transcript);
            }
        }
    }

    private async handleUserInput(text: string) {
        if (!this.isActiveFlag || !text.trim() || this.isSpeaking || this.activeMuzzle) return;

        // Ears Reset Gate: Don't allow input for 800ms after speech officially ends.
        if (Date.now() - this.lastSpokeTime < 800) return;

        this.callbacks.onMessage?.(text, 'user');
        const lower = text.toLowerCase();

        // --- STEP 1: ROBUST CITY DETECTION (FUZZY) ---
        const matchedCity = cities.find(c => lower.includes(c.toLowerCase()));

        // --- STEP 2: LOCATION IDENTIFIED (IF TRADE WAS PENDING) ---
        if (this.pendingTrade) {
            const trade = this.pendingTrade;

            // If they are asking for something else entirely, discard the pending trade
            const bypassKeywords = ['about', 'pricing', 'contact', 'blog', 'help', 'who are you', 'how much'];
            const isBypass = bypassKeywords.some(k => lower.includes(k));

            if (!isBypass) {
                if (matchedCity) {
                    this.pendingTrade = null; // Clear state
                    const targetPath = `${trade.route}/${matchedCity}`;
                    console.log(`[Voice] Navigating to: ${targetPath}`);

                    // NAVIGATION GUARD: Added small delay for mobile context switches
                    setTimeout(() => {
                        this.callbacks.onNavigate?.(targetPath);
                    }, 500);

                    const confirmation = `I’m showing you the nearest available emergency ${trade.name} services in ${matchedCity}. You're in the right place now. Help is just a few steps away.`;
                    this.callbacks.onMessage?.(confirmation, 'model');
                    await this.speak(confirmation);
                    this.callbacks.onStatusChange?.('Ready');
                    return;
                }
            }
        }

        // --- LOCAL BRAIN: OFFLINE APP KNOWLEDGE (100% RELIABILITY) ---
        const localKnowledge: Record<string, { route?: string, response: string }> = {
            'home': { route: '/', response: "I'll take you back to the main search hub now." },
            'about': { route: '/about', response: "We set the standard for emergency repairs, trusted by over 10,000 UK homes with a 60-minute response aim." },
            'who are you': { route: '/about', response: "I am the Emergency Tradesmen Concierge. I help you find verified tradespeople in your area." },
            'what is this': { route: '/about', response: "Emergency Tradesmen is a platform that connects you with verified experts for household emergencies 24 hours a day." },
            'blog': { route: '/blog', response: "I can show you our emergency guides and safety manuals on our blog." },
            'guide': { route: '/blog', response: "I can show you our emergency guides and safety manuals on our blog." },
            'manual': { route: '/blog', response: "I can show you our emergency guides and safety manuals on our blog." },
            'pricing': { route: '/tradesmen', response: "Basic listings are free. Pro Monthly is £29, and Pro Yearly is £99 for priority ranking." },
            'price': { route: '/tradesmen', response: "Basic listings are free. Pro Monthly is £29, and Pro Yearly is £99 for priority ranking." },
            'cost': { route: '/tradesmen', response: "Basic listings are free. Pro Monthly is £29, and Pro Yearly is £99 for priority ranking." },
            'how much': { route: '/tradesmen', response: "Basic listings are free. Pro Monthly is £29, and Pro Yearly is £99 for priority ranking." },
            'membership': { route: '/tradesmen', response: "We offer free basic listings and Pro memberships for priority ranking and instant leads." },
            'plans': { route: '/tradesmen', response: "We offer free basic listings and Pro memberships for priority ranking and instant leads." },
            'sign up': { route: '/tradesmen', response: "I'll take you to the tradesmen sign-up page now. Our Pro plans offer instant lead notifications." },
            'join': { route: '/tradesmen', response: "I'll take you to the tradesmen sign-up page now. Our Pro plans offer instant lead notifications." },
            'contact': { route: '/contact', response: "You can reach us at emergencytradesmen@outlook.com or through our support page. I'll move you there now." },
            'support': { route: '/contact', response: "You can reach us at emergencytradesmen@outlook.com or through our support page. I'll move you there now." },
            'help': { response: "I am here to help. Tell me what's happened, like a leak, power cut, or if you're locked out." },
            'hello': { response: "Hello, you're through to Emergency Tradesmen. Tell me what's happened and I'll find the right help for you." },
            'dashboard': { route: '/user/dashboard', response: "I'll take you to your dashboard where you can manage your profile." },
            'profile': { route: '/user/dashboard', response: "I'll take you to your dashboard where you can manage your profile." },
            'vetted': { response: "All tradesmen are vetted for certifications like Gas Safe or NICEIC before receiving priority ranking." },
            'insurance': { response: "Every professional on our platform is required to hold valid public liability insurance for your peace of mind." },
            'how it works': { route: '/about', response: "We connect you with emergency experts in minutes. Simply tell me your problem and location, and I'll do the rest." }
        };

        for (const [key, data] of Object.entries(localKnowledge)) {
            if (lower.includes(key)) {
                if (data.route) this.callbacks.onNavigate?.(data.route);
                this.callbacks.onMessage?.(data.response, 'model');
                await this.speak(data.response);
                return;
            }
        }

        // --- STEP 1: PROBLEM/TRADE IDENTIFIED (OFFLINE TRIAGE) ---
        // Dynamically build local knowledge from the definitive 'trades' list
        const SAFETY_TIPS: Record<string, string> = {
            plumber: "If water is spreading near electrics, avoid all switches. Turn off your main water stopcock immediately.",
            electrician: "Keep clear of exposed wires. If there is a burning smell or smoke, evacuate the area.",
            "gas-engineer": "Open all windows, do not use any switches or naked flames, and evacuate the property immediately.",
            locksmith: "Stay in a well-lit, populated area. Do not attempt to force the lock, as this may cause further damage.",
            "drain-specialist": "Avoid contact with any waste water. Keep children and pets away from the affected area.",
            glazier: "Keep clear of the area. Do not attempt to move large shards of glass yourself.",
            breakdown: "Stay behind the safety barrier or away from the road. Keep your hazard lights on."
        };

        const KEYWORD_MAP: Record<string, string[]> = {
            plumber: ['plumber', 'leak', 'water', 'pipe', 'flood', 'burst', 'toilet', 'tap', 'shower', 'sink', 'radiator'],
            electrician: ['electrician', 'power', 'spark', 'fuse', 'light', 'socket', 'tripped', 'electricity', 'blackout'],
            locksmith: ['locksmith', 'key', 'locked', 'door', 'lock', 'broken key', 'lost keys', 'gain entry'],
            "gas-engineer": ['gas', 'boiler', 'heating', 'radiator', 'smell gas', 'carbon monoxide'],
            "drain-specialist": ['drain', 'sewage', 'blocked', 'gutter', 'pipe', 'manhole', 'overflow'],
            glazier: ['glazier', 'glass', 'window', 'mirror', 'broken', 'smash', 'board up'],
            breakdown: ['breakdown', 'recovery', 'towing', 'tire', 'puncture', 'accident', 'roadside', 'stranded', 'engine']
        };

        // We use the imported 'trades' array to ensure 100% route accuracy
        for (const trade of importedTrades) { // Renamed locally or imported as 'tradesList'
            const keywords = KEYWORD_MAP[trade.slug] || [trade.name.toLowerCase()];

            if (keywords.some(k => lower.includes(k))) {
                // ONE-SHOT CHECK: Did they also mention a city?
                if (matchedCity) {
                    const targetPath = `/emergency-${trade.slug}/${matchedCity}`;
                    console.log(`[Voice] One-Shot Navigation to: ${targetPath}`);

                    setTimeout(() => {
                        this.callbacks.onNavigate?.(targetPath);
                    }, 500);

                    const tip = SAFETY_TIPS[trade.slug] || "Ensure you are in a safe location.";
                    const response = `I understand, I've found available emergency ${trade.name} services in ${matchedCity} for you. ${tip} Navigation is starting now.`;
                    this.callbacks.onMessage?.(response, 'model');
                    await this.speak(response);
                    return;
                }

                this.pendingTrade = { route: `/emergency-${trade.slug}`, name: trade.name };
                const tip = SAFETY_TIPS[trade.slug] || "Ensure you are in a safe location.";
                const response = `I understand, I can help find a ${trade.name} for you. ${tip} Where are you located?`;
                this.callbacks.onMessage?.(response, 'model');
                await this.speak(response);
                return;
            }
        }

        // --- FALLBACK: ONLINE ---
        await this.generateResponse(text);
    }

    private async generateResponse(userText: string) {
        if (!this.isActiveFlag) return;

        if (!this.apiKey) {
            console.error('[Voice] Cannot use cloud fallback: API_KEY missing.');
            this.callbacks.onStatusChange?.('Ready');
            await this.speak("I'm sorry, I encountered a configuration issue with my cloud service. Please try manual navigation or check back later.");
            return;
        }

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
                    const target = navMatch[1].trim();
                    setTimeout(() => {
                        this.callbacks.onNavigate?.(target);
                    }, 500);
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
            this.callbacks.onStatusChange?.('Ready');
            await this.speak("I'm sorry, I'm having a brief connection issue. However, I can still help you find a tradesman manually if you look at the trade sections on the page.");
            this.callbacks.onStatusChange?.('Ready');
        }
    }

    private async speak(text: string, autoResume = true) {
        if (!this.isActiveFlag) return;
        this.isSpeaking = true;
        this.activeMuzzle = true;
        this.lastSpokeTime = Date.now();
        this.lastSpokeText = text;

        // HALF-DUPLEX OVERRIDE:
        // KILL the microphone immediately. We do NOT want it fighting with TTS.
        if (this.recognition) {
            this.recognition.onend = null; // Prevent restart loop from firing during speech
            try { this.recognition.stop(); } catch (e) { }
            this.recognition = null; // Destroy instance
            console.log('[Voice] Setup Half-Duplex: Mic KILLED for speech.');
        }

        // CRITICAL VOLUME FIX: Stop KeepAlive/AudioContext during speech logic
        if (this.keepAliveOsc) {
            try { this.keepAliveOsc.stop(); } catch (e) { }
            this.keepAliveOsc = null;
        }

        this.callbacks.onStatusChange?.('Speaking...');

        // AZURE TTS REPLACEMENT (STRICT AWAIT)
        try {
            await playNavigationVoice(text);
        } catch (e) {
            console.error('[Voice] TTS Error:', e);
        }

        // Post-Speech Cleanup
        if (this.watchdogTimer) clearTimeout(this.watchdogTimer);
        this.isSpeaking = false;

        // Return to Listening immediately UI-wise, but technically we need a sec to boot
        this.callbacks.onStatusChange?.('Listening');

        setTimeout(() => {
            if (!this.isActiveFlag) return;
            this.activeMuzzle = false;
            this.lastSpokeTime = Date.now();
            this.startKeepAlive();

            // CLEAN RESTART: New Instance
            if (autoResume) this.startSpeechRecognition(true);
        }, 200);
    }

    public async stopSession() {
        this.isActiveFlag = false;
        this.isEngineInitialized = false;
        if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
        if (this.watchdogTimer) clearTimeout(this.watchdogTimer);
        if (this.keepAliveOsc) {
            try { this.keepAliveOsc.stop(); } catch (e) { }
            this.keepAliveOsc = null;
        }
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
