import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, Loader2, AlertTriangle, CheckCircle2, X, Send, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { useLocalization } from '@/contexts/LocalizationContext';
import { HierarchicalLocationSelector } from '@/components/HierarchicalLocationSelector';
import { UKCityCombobox } from '@/components/UKCityCombobox';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type RecorderState =
    | 'idle'
    | 'requesting'
    | 'denied'
    | 'ready'
    | 'recording'
    | 'processing'
    | 'result'
    | 'location'
    | 'error';

interface TranscriptionResult {
    transcript: string;
    high_urgency: boolean;
    likely_trade_needed: string;
    error?: string;
    note?: string;
}

// ---------------------------------------------------------------------------
// Trade display names (matches trades.ts)
// ---------------------------------------------------------------------------

const TRADE_DISPLAY: Record<string, { name: string; icon: string; slug: string }> = {
    'plumber': { name: 'Plumber', icon: '💧', slug: 'plumber' },
    'electrician': { name: 'Electrician', icon: '⚡', slug: 'electrician' },
    'locksmith': { name: 'Locksmith', icon: '🔐', slug: 'locksmith' },
    'gas-engineer': { name: 'Gas Engineer', icon: '🔥', slug: 'gas-engineer' },
    'drain-specialist': { name: 'Drain Specialist', icon: '🚿', slug: 'drain-specialist' },
    'glazier': { name: 'Glazier / Glass Repair', icon: '🪟', slug: 'glazier' },
    'roofer': { name: 'Roofer', icon: '🏠', slug: 'roofer' },
    'builder': { name: 'Builder / Construction', icon: '🧱', slug: 'builder' },
    'water-restoration': { name: 'Water Damage & Restoration', icon: '🌊', slug: 'water-restoration' },
    'breakdown': { name: 'Tow Truck / Breakdown', icon: '🚗', slug: 'breakdown' },
    'air-conditioning': { name: 'Air Conditioning / HVAC', icon: '❄️', slug: 'air-conditioning' },
};

// ---------------------------------------------------------------------------
// Codec detection
// ---------------------------------------------------------------------------

function getPreferredMimeType(): string {
    if (typeof MediaRecorder === 'undefined') return 'audio/webm';

    // Prefer webm (Chrome, Firefox, Android)
    if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        return 'audio/webm;codecs=opus';
    }
    if (MediaRecorder.isTypeSupported('audio/webm')) {
        return 'audio/webm';
    }
    // Fallback for iOS Safari
    if (MediaRecorder.isTypeSupported('audio/mp4')) {
        return 'audio/mp4';
    }
    // Last resort
    return 'audio/webm';
}

function getMimeBase(mime: string): string {
    return mime.split(';')[0]; // e.g. "audio/webm"
}

// ---------------------------------------------------------------------------
// Backend URL
// ---------------------------------------------------------------------------

const API_BASE = import.meta.env.VITE_STT_API_URL || 'http://localhost:3001';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function VoiceReporter() {
    const navigate = useNavigate();
    const { settings } = useLocalization();

    const [state, setState] = useState<RecorderState>('idle');
    const [result, setResult] = useState<TranscriptionResult | null>(null);
    const [elapsed, setElapsed] = useState(0);
    const [errorMsg, setErrorMsg] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [locationRecord, setLocationRecord] = useState<any>(null);
    const [geoLoading, setGeoLoading] = useState(false);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const streamRef = useRef<MediaStream | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const mimeTypeRef = useRef(getPreferredMimeType());

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopTimer();
            releaseStream();
        };
    }, []);

    // ---------------------------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------------------------

    const releaseStream = () => {
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
    };

    const startTimer = () => {
        setElapsed(0);
        timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    };

    const stopTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    const formatTime = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m}:${sec.toString().padStart(2, '0')}`;
    };

    // ---------------------------------------------------------------------------
    // Recording logic
    // ---------------------------------------------------------------------------

    const requestMicrophone = useCallback(async () => {
        setState('requesting');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            setState('ready');
        } catch (err: any) {
            console.error('[VoiceReporter] Mic permission denied:', err);
            setState('denied');
            setErrorMsg(
                err.name === 'NotAllowedError'
                    ? 'Microphone access was denied. Please allow microphone access in your browser settings.'
                    : `Microphone error: ${err.message}`
            );
        }
    }, []);

    const startRecording = useCallback(() => {
        if (!streamRef.current) return;

        chunksRef.current = [];
        const mime = mimeTypeRef.current;

        const recorder = new MediaRecorder(streamRef.current, { mimeType: mime });

        recorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunksRef.current.push(e.data);
        };

        recorder.onstop = () => {
            stopTimer();
            uploadAudio();
        };

        recorder.start(250); // collect chunks every 250ms for responsiveness
        mediaRecorderRef.current = recorder;
        setState('recording');
        startTimer();

        console.log(`[VoiceReporter] Recording started (${mime})`);
    }, []);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
        setState('processing');
    }, []);

    const cancelRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.ondataavailable = null;
            mediaRecorderRef.current.onstop = null;
            mediaRecorderRef.current.stop();
        }
        stopTimer();
        chunksRef.current = [];
        setState('ready');
    }, []);

    // ---------------------------------------------------------------------------
    // Upload + transcribe
    // ---------------------------------------------------------------------------

    const uploadAudio = useCallback(async () => {
        setState('processing');
        const blob = new Blob(chunksRef.current, { type: getMimeBase(mimeTypeRef.current) });

        if (blob.size < 1000) {
            toast.warning('Recording too short. Try again.');
            setState('ready');
            return;
        }

        console.log(`[VoiceReporter] Uploading ${blob.size} bytes (${blob.type})`);

        const formData = new FormData();
        const ext = blob.type.includes('mp4') ? '.mp4' : '.webm';
        formData.append('audio', blob, `emergency${ext}`);

        try {
            const res = await fetch(`${API_BASE}/api/upload-audio`, {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                const errBody = await res.json().catch(() => ({}));
                throw new Error(errBody.error || `Server error: ${res.status}`);
            }

            const data: TranscriptionResult = await res.json();
            console.log('[VoiceReporter] Result:', data);

            if (data.error) {
                setErrorMsg(data.error);
                setState('error');
            } else {
                setResult(data);
                setState('result');
            }
        } catch (err: any) {
            console.error('[VoiceReporter] Upload error:', err);
            setErrorMsg(err.message || 'Failed to connect to transcription server.');
            setState('error');
        }
    }, []);

    // ---------------------------------------------------------------------------
    // Location detection
    // ---------------------------------------------------------------------------

    const handleUseMyLocation = useCallback(async () => {
        setGeoLoading(true);
        try {
            const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
                navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000 })
            );
            // Use reverse geocoding or just proceed with coords
            // For now, let the user still pick from the selector
            toast.info('Location detected — please confirm your city below.');
        } catch {
            toast.error('Could not detect location. Please select your city manually.');
        } finally {
            setGeoLoading(false);
        }
    }, []);

    // ---------------------------------------------------------------------------
    // Navigation
    // ---------------------------------------------------------------------------

    const handleContinueToLocation = () => {
        setState('location');
    };

    const handleFindTradesman = () => {
        if (!result) return;
        const trade = TRADE_DISPLAY[result.likely_trade_needed];
        const countryPrefix = '';

        if (trade) {
            // If we have a US hierarchical location record, use its path
            if (locationRecord?.path_slugs) {
                const { state: st, metro, city, suburb } = locationRecord.path_slugs;
                const hasSuburb = suburb && suburb.trim().length > 0;
                const path = hasSuburb
                    ? `/${st}/${metro}/${city}/${suburb}/emergency-${trade.slug}`
                    : `/${st}/${metro}/${city}/emergency-${trade.slug}`;
                navigate(path);
            } else if (selectedCity) {
                navigate(`${countryPrefix}/emergency-${trade.slug}/${selectedCity.toLowerCase()}`);
            } else {
                navigate(`${countryPrefix}/${trade.slug}`);
            }
        } else {
            navigate('/');
        }
    };

    const reset = () => {
        setResult(null);
        setErrorMsg('');
        setSelectedCity('');
        setLocationRecord(null);
        setState(streamRef.current ? 'ready' : 'idle');
    };

    // ---------------------------------------------------------------------------
    // Render
    // ---------------------------------------------------------------------------

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="rounded-2xl border border-gold/20 bg-black/60 backdrop-blur-xl p-6 shadow-2xl">

                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Mic className="w-5 h-5 text-gold" />
                        Voice Emergency Report
                    </h3>
                    {state !== 'idle' && state !== 'requesting' && (
                        <button onClick={reset} className="text-gray-400 hover:text-white transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>

                <p className="text-sm text-gray-400 mb-6">
                    Describe your emergency and we'll connect you with the right tradesman.
                </p>

                {/* ---- IDLE ---- */}
                {state === 'idle' && (
                    <button
                        onClick={requestMicrophone}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-gold to-amber-500 text-black font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-gold/25"
                    >
                        <Mic className="w-5 h-5 inline-block mr-2 -mt-0.5" />
                        Tap to Report Emergency
                    </button>
                )}

                {/* ---- REQUESTING ---- */}
                {state === 'requesting' && (
                    <div className="text-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin text-gold mx-auto mb-3" />
                        <p className="text-gray-300">Requesting microphone access…</p>
                    </div>
                )}

                {/* ---- DENIED ---- */}
                {state === 'denied' && (
                    <div className="text-center py-6">
                        <MicOff className="w-10 h-10 text-red-400 mx-auto mb-3" />
                        <p className="text-red-300 text-sm mb-4">{errorMsg}</p>
                        <button
                            onClick={() => { setState('idle'); setErrorMsg(''); }}
                            className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* ---- READY ---- */}
                {state === 'ready' && (
                    <div className="text-center">
                        <button
                            onClick={startRecording}
                            className="w-24 h-24 rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30 hover:scale-105 active:scale-95 transition-all mx-auto flex items-center justify-center"
                        >
                            <Mic className="w-10 h-10" />
                        </button>
                        <p className="text-gray-400 text-sm mt-4">Tap to start recording</p>
                    </div>
                )}

                {/* ---- RECORDING ---- */}
                {state === 'recording' && (
                    <div className="text-center">
                        {/* Pulsing animation */}
                        <div className="relative w-24 h-24 mx-auto mb-4">
                            <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" />
                            <div className="absolute inset-2 rounded-full bg-red-500/30 animate-pulse" />
                            <button
                                onClick={stopRecording}
                                className="relative w-24 h-24 rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg shadow-red-500/50 flex items-center justify-center z-10"
                            >
                                <div className="w-8 h-8 rounded-sm bg-white" />
                            </button>
                        </div>

                        <p className="text-red-400 font-mono text-xl mb-1">{formatTime(elapsed)}</p>
                        <p className="text-gray-400 text-sm mb-4">Recording… Tap to stop</p>

                        <button
                            onClick={cancelRecording}
                            className="text-gray-500 text-sm hover:text-gray-300 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                )}

                {/* ---- PROCESSING ---- */}
                {state === 'processing' && (
                    <div className="text-center py-8">
                        <Loader2 className="w-10 h-10 animate-spin text-gold mx-auto mb-4" />
                        <p className="text-gray-300 font-medium">Transcribing your emergency…</p>
                        <p className="text-gray-500 text-sm mt-1">This may take a few seconds</p>
                    </div>
                )}

                {/* ---- RESULT ---- */}
                {state === 'result' && result && (
                    <div className="space-y-4">
                        {/* Urgency badge */}
                        {result.high_urgency && (
                            <div className="flex items-center gap-2 bg-red-500/20 border border-red-500/40 rounded-lg px-3 py-2">
                                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                                <span className="text-red-300 text-sm font-medium">
                                    High Urgency Emergency Detected
                                </span>
                            </div>
                        )}

                        {/* Transcript */}
                        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Transcript</p>
                            <p className="text-white text-sm leading-relaxed">
                                "{result.transcript}"
                            </p>
                        </div>

                        {/* Detected trade */}
                        {result.likely_trade_needed !== 'unknown' && (
                            <div className="bg-gold/10 border border-gold/30 rounded-lg p-4">
                                <p className="text-xs text-gold/70 uppercase tracking-wider mb-2">
                                    Recommended Trade
                                </p>
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl">
                                        {TRADE_DISPLAY[result.likely_trade_needed]?.icon || '🔧'}
                                    </span>
                                    <div>
                                        <p className="text-white font-semibold">
                                            {TRADE_DISPLAY[result.likely_trade_needed]?.name || result.likely_trade_needed}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleContinueToLocation}
                                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-gold to-amber-500 text-black font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-gold/25 flex items-center justify-center gap-2"
                            >
                                <MapPin className="w-4 h-4" />
                                Continue — Set Location
                            </button>
                            <button
                                onClick={reset}
                                className="px-4 py-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                )}

                {/* ---- LOCATION ---- */}
                {state === 'location' && result && (
                    <div className="space-y-4">
                        {/* Summary of detected trade */}
                        <div className="bg-gold/10 border border-gold/30 rounded-lg p-3 flex items-center gap-3">
                            <span className="text-2xl">
                                {TRADE_DISPLAY[result.likely_trade_needed]?.icon || '🔧'}
                            </span>
                            <div>
                                <p className="text-white font-semibold text-sm">
                                    {TRADE_DISPLAY[result.likely_trade_needed]?.name || result.likely_trade_needed}
                                </p>
                                <p className="text-gray-400 text-xs truncate max-w-[250px]">
                                    "{result.transcript}"
                                </p>
                            </div>
                        </div>

                        {result.high_urgency && (
                            <div className="flex items-center gap-2 bg-red-500/20 border border-red-500/40 rounded-lg px-3 py-2">
                                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                                <span className="text-red-300 text-xs font-medium">High Urgency</span>
                            </div>
                        )}

                        {/* Location prompt */}
                        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                <MapPin className="w-3 h-3" />
                                Where are you located?
                            </p>

                            {settings.countryCode === 'US' ? (
                                <HierarchicalLocationSelector
                                    className="w-full"
                                    placeholder="Select your city / area"
                                    onLocationSelect={(record: any) => {
                                        setSelectedCity(record.name);
                                        setLocationRecord(record);
                                    }}
                                />
                            ) : (
                                <UKCityCombobox
                                    className="w-full h-11"
                                    placeholder="Select your city"
                                    value={selectedCity}
                                    onValueChange={setSelectedCity}
                                />
                            )}
                        </div>

                        {/* Find tradesmen — only enabled when city is set */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleFindTradesman}
                                disabled={!selectedCity}
                                className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${selectedCity
                                    ? 'bg-gradient-to-r from-gold to-amber-500 text-black hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-gold/25'
                                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                <Send className="w-4 h-4" />
                                Find Tradesmen
                            </button>
                            <button
                                onClick={() => setState('result')}
                                className="px-4 py-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
                            >
                                Back
                            </button>
                        </div>
                    </div>
                )}

                {/* ---- ERROR ---- */}
                {state === 'error' && (
                    <div className="text-center py-6">
                        <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
                        <p className="text-red-300 text-sm mb-4">{errorMsg}</p>
                        <button
                            onClick={reset}
                            className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* Footer info */}
                <div className="mt-6 pt-4 border-t border-white/10">
                    <p className="text-xs text-gray-600 text-center">
                        🔒 Audio is processed locally and not stored.
                        {state === 'ready' || state === 'recording'
                            ? ` Format: ${getMimeBase(mimeTypeRef.current)}`
                            : ''}
                    </p>
                </div>
            </div>
        </div>
    );
}
