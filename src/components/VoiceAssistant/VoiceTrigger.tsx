import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { HybridController } from '@/services/gemini/geminiLiveService';

const VoiceTrigger = () => {
    const navigate = useNavigate();
    const [isActive, setIsActive] = useState(false);
    const [status, setStatus] = useState('Off');
    const [volume, setVolume] = useState(0);
    const [controller] = useState(() => new HybridController());
    const isStarting = useRef(false);

    // Stop session on unmount
    useEffect(() => {
        return () => {
            controller.stopSession();
        };
    }, [controller]);

    const toggleSession = async () => {
        if (isActive) {
            setIsActive(false);
            setStatus('Off');
            controller.stopSession();
        } else {
            if (isStarting.current) return;
            isStarting.current = true;
            setStatus('Connecting...');
            setIsActive(true);

            try {
                await controller.startSession({
                    onStatusChange: (s) => setStatus(s),
                    onVolume: (v) => setVolume(v),
                    onNavigate: (route) => {
                        console.log('[Voice] Navigating to:', route);
                        navigate(route);
                    },
                    onMessage: (text, role) => {
                        console.log(`[Voice] ${role}: ${text}`);
                    },
                    onError: (err) => {
                        console.error('[Voice] Error:', err);
                        setIsActive(false);
                        setStatus('Error');
                    }
                });
            } catch (err) {
                setIsActive(false);
                setStatus('Error');
            } finally {
                isStarting.current = false;
            }
        }
    };

    // Calculate pulse scale based on volume or status
    const isReady = status === 'Ready' || status === 'Listening' || status === 'Speaking...';
    const isSpeaking = status === 'Speaking...';

    // Scale for pulsing effect
    const pulseScale = isActive ? (1 + volume * 0.5) : 1;
    const glowIntensity = isActive ? (volume * 20) : 0;

    return (
        <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-center gap-3">
            {/* Subtle Status Tooltip */}
            {isActive && (
                <div className="bg-black/80 backdrop-blur-md text-gold text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-gold/30 shadow-2xl animate-in fade-in zoom-in duration-300">
                    {status}
                </div>
            )}

            {/* The Gold Mic */}
            <button
                onClick={toggleSession}
                style={{
                    transform: `scale(${pulseScale})`,
                    boxShadow: isActive ? `0 0 ${20 + glowIntensity}px rgba(212, 175, 55, 0.6)` : 'none'
                }}
                className={`
                    relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300
                    ${isActive
                        ? 'bg-gradient-to-br from-gold via-amber-400 to-gold text-black border-2 border-gold shadow-gold/50'
                        : 'bg-slate-900/40 backdrop-blur-xl border border-white/10 text-gold hover:border-gold/50 hover:bg-slate-900/60'
                    }
                    group
                `}
            >
                {/* Visualizer Rings (Active only) */}
                {isActive && (
                    <>
                        <div className={`absolute inset-0 rounded-full border-2 border-gold opacity-20 ${isReady ? 'animate-ping' : ''}`} style={{ animationDuration: isSpeaking ? '1.5s' : '3s' }} />
                        <div className="absolute inset-0 rounded-full bg-gold/10 animate-pulse" />
                    </>
                )}

                {status === 'Connecting...' ? (
                    <Loader2 className="w-7 h-7 animate-spin" />
                ) : isActive ? (
                    <Mic className="w-7 h-7" />
                ) : (
                    <Mic className="w-7 h-7 group-hover:scale-110 transition-transform" />
                )}

                {/* Status Indicator Dot */}
                <div className={`
                    absolute top-0 right-0 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900
                    ${isActive ? (isReady ? 'bg-green-500' : 'bg-gold animate-pulse') : 'bg-slate-500'}
                `} />
            </button>
        </div>
    );
};

export default VoiceTrigger;
