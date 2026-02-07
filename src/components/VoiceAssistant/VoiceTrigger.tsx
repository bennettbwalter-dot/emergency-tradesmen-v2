import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader2, Volume2, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AzureVoiceService } from '@/services/azureVoiceService';
import { processUserMessage, ChatState } from '@/lib/chat-logic';
import WhisperWaveform from './WhisperWaveform';

const VoiceTrigger = () => {
    const navigate = useNavigate();

    // UI State (for rendering)
    const [status, setStatusState] = useState('Silent');
    const [isActive, setIsActiveState] = useState(false);
    const [transcript, setTranscript] = useState(''); // NEW: Live Transcript

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
    const isStartingRef = useRef(false);
    const lastFallbackTimeRef = useRef<number>(0); // Cooldown for fallback messages
    const MIN_TRANSCRIPT_LENGTH = 3; // Minimum characters to consider valid input
    const FALLBACK_COOLDOWN_MS = 5000; // 5 seconds between "I didn't catch that" messages

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

    const [volume, setVolume] = useState(0);
    const [audioData, setAudioData] = useState<number[]>(new Array(50).fill(0));
    const volumeInterval = useRef<any>(null);

    useEffect(() => {
        // CLEANUP
        return () => {
            if (volumeInterval.current) clearInterval(volumeInterval.current);
            stopSession();
        };
    }, []);

    // Volume monitoring now uses the service's getVolume() to avoid AudioContext conflicts
    const startVolumeMonitor = () => {
        volumeInterval.current = setInterval(() => {
            if (!isActiveRef.current) {
                clearInterval(volumeInterval.current);
                return;
            }
            // Get volume from the Azure service's audio pipeline (same AudioContext)
            const vol = voiceService.getVolume();
            setVolume(vol * 2.55); // Scale to 0-255 range for UI

            // Update audio data for waveform visualization
            setAudioData(prev => {
                const newData = [...prev.slice(1), vol]; // Shift left, add new value
                return newData;
            });
        }, 100);
    };

    const startSession = async () => {
        if (isStartingRef.current) return;
        isStartingRef.current = true;

        try {
            console.log("[Voice] starting session...");

            // Mobile Check (Simple agent sniff, robust enough for this split)
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
            console.log(`[Voice] Device check: isMobile=${isMobile}`);

            let stream: MediaStream | undefined;

            if (!isMobile) {
                // DESKTOP: Use Custom Bridge (Fixes desktop silence/noise-gate issues)
                try {
                    stream = await navigator.mediaDevices.getUserMedia({
                        audio: {
                            echoCancellation: false,
                            noiseSuppression: false,
                            autoGainControl: true
                        }
                    });
                    console.log('[Voice] Desktop: Microphone acquired with echoCancellation DISABLED');
                } catch (permError) {
                    console.error("[Voice] Microphone access failed:", permError);
                    setStatus("Microphone Denied");
                    return;
                }
            } else {
                // MOBILE: Use Native SDK Handling (Fixes mobile loop/silence issues)
                // Mobile OS handles echo cancellation better at system level.
                // We actively want to avoid the ScriptProcessorNode on mobile.
                console.log('[Voice] Mobile: Letting Azure SDK handle mic input natively');
            }

            voiceService.unlockAudioContext();
            setIsActive(true);

            // Reset Logic State for NEW Session
            updateChatState({
                step: 'INITIAL',
                detectedTrade: null,
                detectedCity: null,
                history: []
            });

            const countryCode = window.location.pathname.startsWith('/us') ? 'US' : 'GB';
            const locale = countryCode === 'US' ? 'en-US' : 'en-GB';

            // 1. Start Azure Recognition (Continuous)
            console.log(`[Voice] Initializing Azure STT (${isMobile ? 'Native Mobile' : 'Custom Desktop Bridge'})...`);

            await voiceService.startRecognition(
                (text, isFinal) => {
                    if (!isActiveRef.current) return;
                    setTranscript(text);

                    if (isFinal && text.trim().length >= MIN_TRANSCRIPT_LENGTH) {
                        console.log(`[Voice] Final transcript accepted (length ${text.trim().length}): "${text}"`);
                        processInput(text);
                    } else if (isFinal && text.trim().length > 0 && text.trim().length < MIN_TRANSCRIPT_LENGTH) {
                        console.log(`[Voice] Ignored short transcript (length ${text.trim().length}): "${text}"`);
                        // Don't process very short utterances like "uh", "um"
                    } else if (text.trim().length > 2 && statusRef.current === 'Speaking') {
                        console.log("[Voice] Barge-in! Stopping TTS.");
                        voiceService.stop();
                    }
                },
                (err) => {
                    console.error("[Voice] STT Error:", err);
                    setStatus(`Error: ${err}`);
                },
                locale,
                stream // Undefined on Mobile -> Triggers SDK default mic. Defined on Desktop -> Triggers custom bridge.
            );

            // CRITICAL: Wait for SDK to fully initialize before speaking
            await new Promise(resolve => setTimeout(resolve, 500));

            setStatus('Listening');
            await speakResponse("Hello Emergency Tradesmen here how can I help?", countryCode);

        } catch (e) {
            console.error("Voice Init Failed:", e);
            setStatus(`Setup Error: ${String(e)}`);
            stopSession();
        } finally {
            isStartingRef.current = false;
        }
    };

    const stopSession = () => {
        console.log("[Voice] stopSession() CALLED - Trace below:");
        console.trace("[Voice] stopSession trace");
        setIsActive(false);
        setStatus('Silent');
        setTranscript('');

        updateChatState({
            step: 'INITIAL',
            detectedTrade: null,
            detectedCity: null,
            history: []
        });

        voiceService.stopRecognition();
        voiceService.stop();
    };

    const isProcessingRef = useRef(false);

    const processInput = async (text: string) => {
        if (isProcessingRef.current) {
            console.log("[Voice] Already processing, ignoring input:", text);
            return;
        }

        try {
            isProcessingRef.current = true;
            setStatus('Processing');
            const currentTranscript = text; // Keep for logging
            setTranscript('');

            const countryCode = window.location.pathname.startsWith('/us') ? 'US' : 'GB';

            console.log(`[Voice] Processing input: "${currentTranscript}"`);

            // LOGIC SAFETY: Race against 10s timeout (increased for reliability)
            const logicPromise = processUserMessage(currentTranscript, chatStateRef.current, countryCode);
            const timeoutPromise = new Promise<{ newState: ChatState, response: any }>((_, reject) =>
                setTimeout(() => reject(new Error("Logic Timeout")), 10000)
            );

            const { newState, response } = await Promise.race([logicPromise, timeoutPromise]);
            updateChatState(newState);

            console.log("[Voice] Response from logic:", response.content);

            // FALLBACK LOOP PROTECTION: Detect and throttle fallback responses
            const isFallbackResponse = response.content.includes("I didn't catch that") || response.content.includes("Could you briefly describe");
            const now = Date.now();
            const timeSinceLastFallback = now - lastFallbackTimeRef.current;

            if (isFallbackResponse) {
                if (timeSinceLastFallback < FALLBACK_COOLDOWN_MS) {
                    console.log(`[Voice] Suppressing repeated fallback (${timeSinceLastFallback}ms < ${FALLBACK_COOLDOWN_MS}ms cooldown)`);
                    setStatus('Listening');
                    return; // Skip speaking, just go back to listening
                }
                lastFallbackTimeRef.current = now; // Record this fallback
            }

            await speakResponse(response.content, countryCode);

            if (response.action === 'navigate' && response.target) {
                console.log("[Voice] Navigating to:", response.target);
                navigate(response.target);
                stopSession();
            } else {
                if (isActiveRef.current) {
                    setStatus('Listening');
                }
            }
        } catch (error) {
            console.error("[Voice] processInput failure", error);
            setStatus(`Error: ${String(error)}`);

            await speakResponse("I'm sorry, I encountered a technical issue. Please try again.", window.location.pathname.startsWith('/us') ? 'US' : 'GB');

            setTimeout(() => {
                if (isActiveRef.current) {
                    setStatus('Listening');
                }
            }, 3000);
        } finally {
            isProcessingRef.current = false;
        }
    };

    const speakResponse = async (text: string, countryCode: string = 'GB') => {
        if (!isActiveRef.current || isStartingRef.current === false && !statusRef.current.includes('Speaking')) {
            // Safety: Don't speak if session was closed while we were preparing the message
            if (!isActiveRef.current) return;
        }

        const originalStatus = statusRef.current;
        setStatus('Speaking');

        const cleanText = text.replace(/[*#]/g, '');
        const ssmlText = cleanText;

        console.log("[Voice] Assistant Speaking:", cleanText);

        // We don't MUTE recognition here anymore, to allow Barge-in.
        // Instead, we just race against a timeout and a 'stop' signal.
        const speechPromise = voiceService.speak(ssmlText, countryCode);
        const timeoutPromise = new Promise<void>(resolve => setTimeout(resolve, 15000));

        try {
            await Promise.race([speechPromise, timeoutPromise]);
        } catch (e) {
            console.error("[Voice] Speech synthesis/playback failed:", e);
        } finally {
            if (isActiveRef.current && statusRef.current === 'Speaking') {
                setStatus('Listening');
            }
        }
    };

    const toggleVoice = () => {
        if (isStartingRef.current) {
            console.log("[Voice] Still starting up, ignoring toggle click.");
            return;
        }
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
                            status.includes('Error') || status.includes('Azure') || status.includes('Denied') ? 'bg-red-500/90 text-white border-red-500 animate-pulse' :
                                'bg-black/80 text-white border-white/20'}
                `}>
                    {status}
                </div>
            )}

            {/* WAVEFORM VISUALIZATION */}
            {isActive && (status === 'Listening' || status === 'Speaking' || status === 'Processing') && (
                <div className="absolute bottom-24 right-0">
                    <WhisperWaveform
                        audioData={audioData}
                        isRecording={status === 'Listening'}
                        isProcessing={status === 'Processing'}
                        transcript={transcript}
                        onConfirm={() => {
                            if (transcript && transcript.trim().length >= 3) {
                                processInput(transcript);
                            }
                        }}
                        onCancel={stopSession}
                    />
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
                {/* Dynamic Volume Visualizer Ring */}
                {isActive && (
                    <div
                        className="absolute inset-0 rounded-full bg-blue-400/20 transition-transform duration-75"
                        style={{
                            transform: `scale(${1 + (volume / 255) * 0.8})`,
                            opacity: 0.1 + (volume / 255) * 0.4
                        }}
                    />
                )}

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

                {/* Pulsing rings for Listening state */}
                {isActive && status === 'Listening' && (
                    <>
                        <div className="absolute inset-0 rounded-full border-2 border-green-400/40 animate-[ping_2s_infinite]" />
                        <div className="absolute inset-2 rounded-full border border-green-400/20 animate-[ping_3s_infinite]" />
                        <div className="absolute inset-0 rounded-full bg-green-400/5 animate-pulse" />
                    </>
                )}
            </button>
        </div >
    );
};

export default VoiceTrigger;
