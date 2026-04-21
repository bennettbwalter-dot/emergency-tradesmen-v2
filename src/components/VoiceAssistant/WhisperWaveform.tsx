import React, { useMemo, useEffect, useState, useRef } from 'react';
import { Check, X, MoreHorizontal, Loader2 } from 'lucide-react';

interface WhisperWaveformProps {
    audioData?: number[]; // legacy prop (unused when analyserRef is provided)
    analyserRef?: React.MutableRefObject<AnalyserNode | null>;
    isRecording: boolean;
    isProcessing?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    transcript?: string;
}

// Global threshold for silence detection (matches hook)
const SILENCE_THRESHOLD = 0.01;

/**
 * Premium WhisperWaveform - Exact Pixel-Perfect Match to Mockup
 * 
 * Design Details:
 * - Continuous, glowing white line waveform
 * - Symmetrical mirrored vertical bars (110 density)
 * - Hard noise gate: Perfectly still/flat during silence
 * - Deep navy glassmorphism panel
 */
const WhisperWaveform: React.FC<WhisperWaveformProps> = ({
    audioData: audioDataProp,
    analyserRef,
    isRecording,
    isProcessing = false,
    onConfirm,
    onCancel,
    transcript
}) => {
    const [time, setTime] = useState(0);
    const [liveAudio, setLiveAudio] = useState<number[]>(() => new Array(120).fill(0));
    const liveBufferRef = useRef<number[]>(new Array(120).fill(0));
    const lastSampleTsRef = useRef<number>(0);

    // Single RAF loop: drives `time` every frame AND samples the analyser
    // directly every ~50ms. Bypasses parent React state to avoid sync issues.
    useEffect(() => {
        let animationFrame: number;
        const SAMPLE_INTERVAL_MS = 50;

        const update = (ts: number) => {
            setTime(t => t + 0.05);

            // Sample the analyser directly, if we have one and are recording
            if (analyserRef?.current && isRecording && ts - lastSampleTsRef.current >= SAMPLE_INTERVAL_MS) {
                lastSampleTsRef.current = ts;
                const analyser = analyserRef.current;
                const dataArray = new Uint8Array(analyser.frequencyBinCount);
                analyser.getByteTimeDomainData(dataArray);
                let peak = 0;
                for (let i = 0; i < dataArray.length; i++) {
                    const amp = Math.abs(dataArray[i] - 128);
                    if (amp > peak) peak = amp;
                }
                const raw = peak / 128;
                const level = raw < 0.01 ? 0 : Math.min(1, raw * 3.5);

                const buf = liveBufferRef.current;
                buf.shift();
                buf.push(level);
                setLiveAudio([...buf]);
            }

            animationFrame = requestAnimationFrame(update);
        };
        animationFrame = requestAnimationFrame(update);
        return () => cancelAnimationFrame(animationFrame);
    }, [analyserRef, isRecording]);

    // Prefer live-sampled data when we have a direct analyser, else fall back to prop
    const audioData = analyserRef ? liveAudio : (audioDataProp ?? new Array(120).fill(0));

    // Process all waveform data in one centralized memo
    const memoData = useMemo(() => {
        // Use responsive width: Max 340, but scale down for smaller viewports
        // We account for padding and control icons (~160px for safety on small screens)
        const availableWidth = typeof window !== 'undefined' ? Math.min(340, window.innerWidth - 180) : 340;
        const width = Math.max(100, availableWidth); // Never too small
        const height = 40;
        const centerY = height / 2;
        const points = 100;
        const step = width / points;

        // 1. GLOBAL SILENCE CHECK
        // If the entire visible window is below threshold, force absolute zero
        const maxCurrentLevel = Math.max(...audioData, 0);
        const isVoiceActive = maxCurrentLevel > SILENCE_THRESHOLD;

        let pt = `M 0 ${centerY}`;
        let pb = `M 0 ${centerY}`;
        const bars: { h: number; opacity: number; x: number }[] = [];

        // 2. SVG PATHS (Silhouette)
        for (let i = 0; i <= points; i++) {
            const x = i * step;
            const xNorm = i / points;
            const envelope = Math.sin(xNorm * Math.PI);
            const dataIdx = Math.floor(xNorm * audioData.length);
            const level = audioData[dataIdx] || 0;

            // Apply gate
            const gatedLevel = (isVoiceActive && level > SILENCE_THRESHOLD) ? level : 0;
            const voiceAmplify = gatedLevel * 2.5;

            // Only add kinetic "peaks and valleys" if we are actually talking
            const noise = gatedLevel > 0
                ? (Math.sin(i * 0.3 + time * 0.8) * 4 + Math.cos(i * 0.15 - time * 1.2) * 6) * envelope
                : 0;

            const amplitude = gatedLevel > 0 ? Math.max(1, (noise + voiceAmplify * height)) : 0;
            pt += ` L ${x} ${centerY - amplitude / 2}`;
            pb += ` L ${x} ${centerY + amplitude / 2}`;
        }

        // 3. VERTICAL BARS (Mirrored)
        const barCount = Math.floor(width / 3); // Dynamic density
        for (let i = 0; i < barCount; i++) {
            const xNorm = i / barCount;
            const envelope = Math.sin(xNorm * Math.PI);
            const dataIdx = Math.floor(xNorm * audioData.length);
            const level = audioData[dataIdx] || 0;

            // Apply gate
            const gatedLevel = (isVoiceActive && level > SILENCE_THRESHOLD) ? level : 0;
            const voiceAmplify = gatedLevel * 2.5;

            // Movement oscillation
            const oscillation = (gatedLevel > 0 && isRecording)
                ? (Math.sin(i * 0.4 + time) * 3 + Math.cos(i * 0.2 - time) * 4)
                : 0;

            // Height: If silent, use a flat 1.5px baseline. Otherwise scale up.
            const h = gatedLevel > 0
                ? Math.max(1.5, (voiceAmplify * 20 + voiceAmplify * oscillation) * envelope)
                : 1.5;

            bars.push({ h, opacity: gatedLevel > 0 ? 0.9 : 0.4, x: xNorm * width });
        }

        return { pathTop: pt, pathBottom: pb, barData: bars, isVoiceActive, width };
    }, [audioData, time, isRecording]);

    const { pathTop, pathBottom, barData, isVoiceActive, width } = memoData;

    return (
        <div className="relative isolate">
            {/* Outer Glow */}
            <div className="absolute -inset-4 bg-blue-500/5 blur-2xl rounded-[32px] -z-10" />

            {/* Panel Background & Border */}
            <div
                className="flex items-center gap-2 md:gap-6 px-3 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden backdrop-blur-2xl bg-slate-900/60"
                style={{
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.1)'
                }}
            >
                {/* Visual Glass Surface Noise */}
                <div
                    className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-overlay"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`
                    }}
                />

                {/* Waveform Visualization Container */}
                <div
                    className="relative h-[40px] flex items-center overflow-hidden"
                    style={{ width: `${width}px` }}
                >
                    {/* Glowing SVG Paths */}
                    <svg width={width} height="40" className="drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
                        <defs>
                            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#3b82f6" />
                                <stop offset="50%" stopColor="#22d3ee" />
                                <stop offset="100%" stopColor="#3b82f6" />
                            </linearGradient>
                        </defs>

                        <path
                            d={pathTop}
                            fill="none"
                            stroke={isVoiceActive ? "url(#waveGradient)" : "white"}
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="transition-all duration-300"
                        />
                        <path
                            d={pathBottom}
                            fill="none"
                            stroke={isVoiceActive ? "url(#waveGradient)" : "white"}
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="transition-all duration-300"
                        />

                        {/* Mirrored Vertical Bars */}
                        {barData.map((bar, i) => (
                            <line
                                key={i}
                                x1={bar.x} y1={20 - bar.h / 2}
                                x2={bar.x} y2={20 + bar.h / 2}
                                stroke={isVoiceActive ? "url(#waveGradient)" : "white"}
                                strokeWidth="1.2"
                                strokeOpacity={bar.opacity}
                                className="transition-all duration-300"
                            />
                        ))}
                    </svg>

                    {/* Centered Blue Cursor */}
                    <div className="absolute left-1/2 -translate-x-1/2 h-full w-[2px] bg-blue-400 shadow-[0_0_10px_#60a5fa] z-20" />
                </div>

                {/* Control Icons Group (Right) */}
                <div className="flex items-center gap-2 md:gap-3 ml-auto">
                    {isProcessing ? (
                        <div className="w-10 h-10 flex items-center justify-center">
                            <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                        </div>
                    ) : (
                        <>
                            {/* 1. CONFIRM: Blue Circle with 'End' text */}
                            <button
                                onClick={onConfirm}
                                className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] flex items-center justify-center transition-all hover:scale-110 active:scale-95 text-white"
                                aria-label="Confirm speech"
                            >
                                <span className="text-xs md:text-sm font-bold">End</span>
                            </button>

                            {/* Mobile-optimized spacing for cancel/options */}
                            <div className="flex items-center gap-0.5 md:gap-2">
                                {/* 2. CANCEL: Subtle Gray X */}
                                <button
                                    onClick={onCancel}
                                    className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-full text-white/40 hover:text-white/80 transition-colors"
                                    aria-label="Cancel recording"
                                >
                                    <X size={18} className="md:size-20" />
                                </button>

                                {/* 3. OPTIONS: Subtle Gray Dots */}
                                <button
                                    className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-full text-white/40 hover:text-white/80 transition-colors"
                                    aria-label="More options"
                                >
                                    <MoreHorizontal size={18} className="md:size-20" />
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Floating Transcript Preview */}
            {transcript && (
                <div className="absolute -top-16 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl bg-slate-900/80 backdrop-blur-md border border-white/10 text-white text-sm shadow-2xl transition-all animate-in fade-in slide-in-from-bottom-2 duration-300 pointer-events-none">
                    "{transcript}"
                </div>
            )}
        </div>
    );
};

export default WhisperWaveform;
