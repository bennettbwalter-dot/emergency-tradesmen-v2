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

            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SpeechRecognition) {
                alert("Voice not supported in this browser.");
                return;
            }

            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'en-GB';

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
            }, 600); // 600ms: Ultra-snappy silence detection
        }
    };

    const processInput = async (text: string) => {
        setStatus('Processing');

        // STRICT TURN-TAKING: Stop mic immediately
        if (recognitionRef.current) recognitionRef.current.stop();

        // FIX: Use Ref to get the LATEST state
        const { newState, response } = processUserMessage(text, chatStateRef.current);
        updateChatState(newState);

        await speakResponse(response.content);

        if (response.action === 'navigate' && response.target) {
            navigate(response.target);
            stopSession();
        } else {
            if (isActiveRef.current) {
                // MOBILE FIX: 250ms buffer is the "Goldilocks" zone for Modern Android/iOS
                setTimeout(() => {
                    if (!isActiveRef.current) return;
                    try {
                        recognitionRef.current?.start();
                        setStatus('Listening');
                    } catch (e) {
                        console.warn("Restart failed, trying forced re-init implied by onend?");
                        setStatus('Listening');
                    }
                }, 250);
            }
        }
    };

    const speakResponse = async (text: string) => {
        setStatus('Speaking');

        const cleanText = text.replace(/[*#]/g, '');
        // const ssmlText = cleanText.replace(/(\.|\?|!)\s/g, '$1 <break time="400ms"/> ');
        // Keep it simple for flow
        const ssmlText = cleanText;

        await voiceService.speak(ssmlText);

        // Calculate simplified duration to keep mic closed while speaking
        // 50ms per char is a much tighter fit for natural speech (~2.5 words/sec)
        const approximateDuration = Math.max(1000, cleanText.length * 50);
        await new Promise(resolve => setTimeout(resolve, approximateDuration));
    };

    const toggleVoice = () => {
        if (isActiveRef.current) stopSession();
        else startSession();
    };

    return (
        <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-center gap-3">
            {isActive && (
                <div className={`
                    text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border shadow-2xl animate-in fade-in zoom-in duration-300
                    ${status === 'Listening' ? 'bg-green-500/80 text-white border-green-400' :
                        status === 'Speaking' ? 'bg-amber-500/80 text-white border-amber-400' :
                            'bg-black/80 text-gold border-gold/30'}
                `}>
                    {status}
                </div>
            )}

            <button
                onClick={toggleVoice}
                className={`
                    relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300
                    ${isActive
                        ? 'bg-gradient-to-br from-gold via-amber-400 to-gold text-black border-2 border-gold shadow-gold/50'
                        : 'bg-slate-900/40 backdrop-blur-xl border border-white/10 text-gold hover:border-gold/50 hover:bg-slate-900/60'
                    }
                `}
            >
                {status === 'Processing' ? (
                    <Loader2 className="w-7 h-7 animate-spin" />
                ) : status === 'Speaking' ? (
                    <Volume2 className="w-7 h-7 animate-pulse" />
                ) : isActive ? (
                    <Mic className="w-7 h-7" />
                ) : (
                    <Mic className="w-7 h-7" />
                )}
            </button>
        </div>
    );
};

export default VoiceTrigger;
