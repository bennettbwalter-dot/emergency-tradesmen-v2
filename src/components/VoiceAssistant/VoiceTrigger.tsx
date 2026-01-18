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
    const volumeInterval = useRef<any>(null);

    useEffect(() => {
        // CLEANUP
        return () => {
            if (volumeInterval.current) clearInterval(volumeInterval.current);
            stopSession();
        };
    }, []);

    const monitorVolume = (stream: MediaStream) => {
        try {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            const audioContext = new AudioContextClass();
            const source = audioContext.createMediaStreamSource(stream);
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            source.connect(analyser);

            volumeInterval.current = setInterval(() => {
                if (!isActiveRef.current) {
                    clearInterval(volumeInterval.current);
                    audioContext.close();
                    return;
                }
                analyser.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
                const average = sum / bufferLength;
                setVolume(average);
            }, 100);
        } catch (e) {
            console.error("Volume monitoring failed", e);
        }
    };

    const startSession = async () => {
        try {
            console.log("[Voice] starting session...");

            let stream: MediaStream;
            // Explicit Permission Check & Volume Monitor
            try {
                stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                monitorVolume(stream);
            } catch (permError) {
                console.error("[Voice] Microphone access failed:", permError);
                setStatus("Microphone Denied");
                return;
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
            console.log("[Voice] Initializing Azure STT...");
            await voiceService.startRecognition(
                (text, isFinal) => {
                    if (!isActiveRef.current) return;
                    setTranscript(text);

                    if (isFinal && text.trim().length > 0) {
                        processInput(text);
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
                stream // Pass the stream here!
            );

            setStatus('Listening');
            await speakResponse("Hello Emergency Tradesmen here how can I help?", countryCode);

        } catch (e) {
            console.error("Voice Init Failed:", e);
            setStatus(`Setup Error: ${String(e)}`);
        }
    };

    const stopSession = () => {
        console.log("[Voice] Stopping session.");
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

            // Barge-in check: If user started talking AGAIN during processing, maybe we should skip speaking?
            // For now, let's just speak the response.

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
        if (!isActiveRef.current) return;

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

            {/* LIVE TRANSCRIPT FEEDBACK */}
            {isActive && (status === 'Listening' || status === 'Speaking' || status === 'Processing') && (
                <div className={`
                    absolute bottom-24 whitespace-nowrap bg-black/90 text-white text-[13px] px-4 py-2.5 rounded-2xl backdrop-blur-xl shadow-2xl transition-all duration-500 border border-white/10
                    ${isActive ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95 pointer-events-none'}
                `}>
                    <div className="flex items-center gap-2">
                        {status === 'Processing' ? (
                            <Loader2 className="w-3 h-3 animate-spin text-blue-400" />
                        ) : (
                            <div className={`w-2 h-2 rounded-full ${status === 'Listening' ? 'bg-green-400 animate-pulse' : 'bg-blue-400'}`} />
                        )}
                        <span className="font-medium">
                            {transcript ? (
                                transcript.startsWith('(') ? (
                                    <span className="opacity-50 italic">{transcript}</span>
                                ) : `"${transcript}"`
                            ) :
                                status === 'Listening' ? 'I\'m listening... speak now' :
                                    status === 'Processing' ? 'Thinking...' :
                                        'Starting up...'}
                        </span>
                    </div>
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
