import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader2, Volume2, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AzureVoiceService } from '@/services/azureVoiceService';
import { processUserMessage, ChatState } from '@/lib/chat-logic';

const VoiceTrigger = () => {
    const navigate = useNavigate();

    // UI State (for rendering)
    const [status, setStatusState] = useState('Silent');
    const [isActive, setIsActiveState] = useState(false);

    // Refs (for logic/event handlers to avoid stale closures)
    const statusRef = useRef('Silent');
    const isActiveRef = useRef(false);

    // CHAT STATE - Used to be just state, now needs Ref for event access
    const chatStateRef = useRef<ChatState>({
        step: 'INITIAL',
        detectedTrade: null,
        detectedCity: null,
        history: []
    });

    const [voiceService] = useState(() => new AzureVoiceService());
    const recognitionRef = useRef<any>(null);
    const silenceTimer = useRef<any>(null);

    // Helper to update both Ref and State
    const setStatus = (newStatus: string) => {
        statusRef.current = newStatus;
        setStatusState(newStatus);
    };

    const setIsActive = (active: boolean) => {
        isActiveRef.current = active;
        setIsActiveState(active);
    };

    const updateChatState = (newState: ChatState) => {
        chatStateRef.current = newState;
        // We don't strictly need to trigger a re-render for chat state logic, 
        // as it's invisible logic state, but if we visualized it we would need useState.
        // For now, Ref is enough for the logic to work.
    };

    useEffect(() => {
        return () => {
            stopSession();
        };
    }, []);

    const startSession = async () => {
        try {
            voiceService.unlockAudioContext();

            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (!SpeechRecognition) {
                alert("Voice not supported in this browser.");
                return;
            }

            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            const countryCode = window.location.pathname.startsWith('/us') ? 'US' : 'GB';
            recognitionRef.current.lang = countryCode === 'US' ? 'en-US' : 'en-GB';

            recognitionRef.current.onstart = () => setStatus('Listening');

            // CRITICAL FIX: Use Refs to access current state inside closure
            recognitionRef.current.onend = () => {
                if (isActiveRef.current && statusRef.current === 'Listening') {
                    console.log('[Voice] onend: Auto-restarting (Status is Listening)');
                    try { recognitionRef.current?.start(); } catch (e) { }
                }
            };

            recognitionRef.current.onresult = handleSpeechResult;

            setIsActive(true);

            // 3. Greeting First, Then Listen
            await speakResponse("Hello Emergency Tradesmen here how can I help?");

            // 4. Start Listening (Sequential)
            if (isActiveRef.current && recognitionRef.current) {
                try {
                    // console.log("Starting mic after greeting...");
                    recognitionRef.current.start();
                    setStatus('Listening');
                } catch (e) {
                    console.warn("Recog start failed (already running?)", e);
                }
            }

        } catch (e) {
            console.error("Voice Init Failed:", e);
            setStatus('Error');
        }
    };

    const stopSession = () => {
        setIsActive(false);
        setStatus('Silent');

        // Reset Logic State on Stop? Or keep it?
        // Usually better to reset for next session
        updateChatState({
            step: 'INITIAL',
            detectedTrade: null,
            detectedCity: null,
            history: []
        });

        if (recognitionRef.current) {
            recognitionRef.current.onend = null;
            recognitionRef.current.stop();
            recognitionRef.current = null;
        }
        voiceService.stop();
    };

    const handleSpeechResult = (event: any) => {
        // STRICT TURN-TAKING: Ignore inputs while speaking/processing
        if (statusRef.current === 'Speaking' || statusRef.current === 'Processing') return;

        let interim = "";
        let final = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                final += event.results[i][0].transcript;
            } else {
                interim += event.results[i][0].transcript;
            }
        }

        if (silenceTimer.current) clearTimeout(silenceTimer.current);

        if (final || interim.length > 0) {
            silenceTimer.current = setTimeout(() => {
                const text = (final + " " + interim).trim();
                if (text.length > 1) {
                    processInput(text);
                }
            }, 400); // 400ms: Much snappier response (was 800ms)
        }
    };

    const processInput = async (text: string) => {
        setStatus('Processing');

        // STRICT TURN-TAKING: Stop mic immediately
        if (recognitionRef.current) recognitionRef.current.stop();

        // Detect country code from URL path
        const countryCode = window.location.pathname.startsWith('/us') ? 'US' : 'GB';

        const { newState, response } = await processUserMessage(text, chatStateRef.current, countryCode);
        updateChatState(newState);

        await speakResponse(response.content, countryCode);

        if (response.action === 'navigate' && response.target) {
            navigate(response.target);
            stopSession();
        } else {
            if (isActiveRef.current) {
                // MOBILE FIX: 400ms buffer allows safe context switch
                setTimeout(() => {
                    if (!isActiveRef.current) return;
                    try {
                        recognitionRef.current?.start();
                        setStatus('Listening');
                    } catch (e) {
                        console.warn("Restart failed, trying forced re-init implied by onend?");
                        setStatus('Listening');
                    }
                }, 400);
            }
        }
    };

    const speakResponse = async (text: string, countryCode: string = 'GB') => {
        setStatus('Speaking');

        const cleanText = text.replace(/[*#]/g, '');
        // const ssmlText = cleanText.replace(/(\.|\?|!)\s/g, '$1 <break time="400ms"/> ');
        const ssmlText = cleanText;

        // CRITICAL UPDATE: This now awaits the ACTUAL 'onended' event from AudioContext
        // We do NOT use manual timeouts anymore. The service resolves ONLY when audio stops.
        await voiceService.speak(ssmlText, countryCode);
    };

    const toggleVoice = () => {
        if (isActiveRef.current) stopSession();
        else startSession();
    };

    return (
        <div className="fixed bottom-24 md:bottom-8 right-8 z-[100] flex flex-col items-center gap-3">
            {isActive && (
                <div className={`
                    text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border shadow-2xl animate-in fade-in zoom-in duration-300
                    ${status === 'Listening' ? 'bg-green-500/80 text-white border-green-400' :
                        status === 'Speaking' ? 'bg-[#00A3FF]/80 text-white border-[#00A3FF]/40' :
                            'bg-black/80 text-white border-white/20'}
                `}>
                    {status}
                </div>
            )}

            <button
                onClick={toggleVoice}
                className={`
                    relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 group
                    ${isActive
                        ? 'bg-gradient-to-br from-[#E2E8F0] via-[#F8FAFC] to-[#CBD5E1] shadow-[0_0_20px_rgba(255,255,255,0.4),inset_0_2px_4px_rgba(255,255,255,0.8),0_10px_20px_rgba(0,0,0,0.3)]'
                        : 'bg-gradient-to-br from-[#E2E8F0] via-[#F8FAFC] to-[#CBD5E1] shadow-[0_4px_12px_rgba(0,0,0,0.15),inset_0_2px_4px_rgba(255,255,255,0.8)] border border-[#94A3B8]/20'
                    }
                    before:absolute before:inset-1 before:rounded-full before:bg-gradient-to-br before:from-[#CBD5E1] before:via-[#F1F5F9] before:to-[#94A3B8] before:shadow-inner
                    after:absolute after:inset-[6px] after:rounded-full after:bg-white after:shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)]
                `}
            >
                {/* Metallic Accent Grooves */}
                <div className="absolute inset-0 rounded-full border-[1.5px] border-[#64748B]/10 pointer-events-none" />
                <div className="absolute top-1/2 -left-1 w-2 h-4 -translate-y-1/2 bg-black/10 rounded-full blur-[1px] pointer-events-none opacity-40" />
                <div className="absolute top-1/2 -right-1 w-2 h-4 -translate-y-1/2 bg-black/10 rounded-full blur-[1px] pointer-events-none opacity-40" />

                <div className="relative z-10 flex items-center justify-center">
                    {status === 'Processing' ? (
                        <Loader2 className="w-8 h-8 animate-spin text-[#00A3FF] drop-shadow-[0_0_8px_rgba(0,163,255,0.4)]" />
                    ) : status === 'Speaking' ? (
                        <Volume2 className="w-8 h-8 animate-pulse text-[#00A3FF] drop-shadow-[0_0_8px_rgba(0,163,255,0.4)]" />
                    ) : (
                        <Mic className={`w-8 h-8 transition-all duration-300 ${isActive ? 'text-[#00A3FF] drop-shadow-[0_0_8px_rgba(0,163,255,0.4)] scale-110' : 'text-[#00A3FF] opacity-80 group-hover:opacity-100'}`} />
                    )}
                </div>

                {/* Status Glow */}
                {status === 'Listening' && (
                    <div className="absolute inset-0 rounded-full animate-pulse bg-green-400/10 pointer-events-none" />
                )}
            </button>
        </div>
    );
};

export default VoiceTrigger;
