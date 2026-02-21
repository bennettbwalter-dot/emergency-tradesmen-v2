import { useState, useEffect, useRef, useCallback } from 'react';
import { AzureVoiceService } from '@/services/azureVoiceService';

export interface WhisperResult {
    transcription: string;
    isProcessing: boolean;
    isRecording: boolean;
    error: string | null;
    startRecording: () => void;
    stopRecording: () => void;
    getAudioLevel: () => number;
    resetTranscription: () => void;
    status: string;
}

// Detect if running on a mobile device
const isMobileDevice = (): boolean => {
    if (typeof navigator === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        || (navigator.maxTouchPoints > 0 && /MacIntel/.test(navigator.platform)); // iPad detection
};

// ============================================================================
// MOBILE PATH: Azure Cloud STT (works on ALL mobile browsers, no downloads)
// ============================================================================
function useMobileAzureSTT(): WhisperResult {
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [transcription, setTranscription] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState('Ready (Cloud)');

    const voiceServiceRef = useRef<AzureVoiceService | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const isRecordingRef = useRef(false);
    const finalTextRef = useRef('');

    // Audio level monitoring
    const analyserRef = useRef<AnalyserNode | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);

    // Initialize voice service once
    useEffect(() => {
        voiceServiceRef.current = new AzureVoiceService();
        return () => {
            // Cleanup on unmount
            if (mediaStreamRef.current) {
                mediaStreamRef.current.getTracks().forEach(t => t.stop());
            }
        };
    }, []);

    const startRecording = useCallback(async () => {
        try {
            setError(null);
            setTranscription('');
            finalTextRef.current = '';

            console.log('[useMobileSTT] Requesting microphone...');

            // Get microphone access
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                }
            });
            mediaStreamRef.current = stream;
            console.log('[useMobileSTT] Microphone access granted');

            // Set up audio context for waveform visualization
            try {
                const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
                const ctx = new AudioCtx();
                audioContextRef.current = ctx;

                if (ctx.state === 'suspended') await ctx.resume();

                const source = ctx.createMediaStreamSource(stream);
                const analyser = ctx.createAnalyser();
                analyser.fftSize = 256;
                analyser.smoothingTimeConstant = 0.3;
                source.connect(analyser);
                analyserRef.current = analyser;
            } catch (audioErr) {
                console.warn('[useMobileSTT] Audio visualization setup failed:', audioErr);
            }

            // Start Azure STT with the media stream
            const voiceService = voiceServiceRef.current;
            if (!voiceService) {
                setError('Voice service not initialized');
                return;
            }

            await voiceService.startRecognition(
                // onResult callback
                (text: string, isFinal: boolean) => {
                    console.log(`[useMobileSTT] Azure result: "${text}" (final: ${isFinal})`);
                    if (isFinal && text && text.trim().length > 0) {
                        // Filter out status messages like "(Silence)" or "(Too much noise)"
                        if (!text.startsWith('(')) {
                            finalTextRef.current = text;
                            console.log(`[useMobileSTT] Final transcription: "${text}"`);
                        }
                    }
                },
                // onError callback
                (errorMsg: string) => {
                    console.error('[useMobileSTT] Azure STT error:', errorMsg);
                    setError(errorMsg);
                    setIsRecording(false);
                    isRecordingRef.current = false;
                    setIsProcessing(false);
                    setStatus('Ready (Cloud)');
                    cleanupAudio();
                },
                'en-GB', // locale
                stream   // pass the media stream directly to Azure
            );

            setIsRecording(true);
            isRecordingRef.current = true;
            setStatus('Listening...');
            console.log('[useMobileSTT] Azure STT started');

        } catch (err: any) {
            console.error('[useMobileSTT] Failed to start:', err);
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                setError('Microphone access denied. Please allow microphone access in your browser settings.');
            } else {
                setError(`Microphone error: ${err.message || 'Unknown'}`);
            }
        }
    }, []);

    const cleanupAudio = useCallback(() => {
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(t => t.stop());
            mediaStreamRef.current = null;
        }
        if (audioContextRef.current) {
            try { audioContextRef.current.close(); } catch (e) { }
            audioContextRef.current = null;
        }
        analyserRef.current = null;
    }, []);

    const stopRecording = useCallback(async () => {
        console.log('[useMobileSTT] stopRecording called');
        if (!isRecordingRef.current) return;

        setIsProcessing(true);
        setStatus('Processing...');

        // Stop Azure recognition
        const voiceService = voiceServiceRef.current;
        if (voiceService) {
            try {
                await voiceService.stopRecognition();
                console.log('[useMobileSTT] Azure recognition stopped');
            } catch (err) {
                console.warn('[useMobileSTT] Error stopping recognition:', err);
            }
        }

        setIsRecording(false);
        isRecordingRef.current = false;

        // Small delay to allow final results to arrive
        setTimeout(() => {
            const finalText = finalTextRef.current;
            if (finalText && finalText.trim().length > 0) {
                console.log(`[useMobileSTT] Setting transcription: "${finalText}"`);
                setTranscription(finalText);
            } else {
                console.warn('[useMobileSTT] No transcription received');
                setError('No speech detected. Please try again.');
            }
            setIsProcessing(false);
            setStatus('Ready (Cloud)');
            cleanupAudio();
        }, 500);
    }, [cleanupAudio]);

    const getAudioLevel = useCallback(() => {
        if (!analyserRef.current) return 0;
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteTimeDomainData(dataArray);
        let peak = 0;
        for (let i = 0; i < dataArray.length; i++) {
            const amplitude = Math.abs(dataArray[i] - 128);
            if (amplitude > peak) peak = amplitude;
        }
        const raw = peak / 128;
        if (raw < 0.01) return 0;
        return Math.min(1, raw * 3.5);
    }, []);

    const resetTranscription = useCallback(() => {
        setTranscription('');
        setError(null);
        finalTextRef.current = '';
    }, []);

    return {
        transcription, isProcessing, isRecording, error,
        startRecording, stopRecording, getAudioLevel, resetTranscription, status
    };
}

// ============================================================================
// DESKTOP PATH: Whisper WASM worker (high accuracy, ~40MB model download)
// ============================================================================
function useDesktopWhisper(): WhisperResult {
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [transcription, setTranscription] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState('Ready');

    const workerRef = useRef<Worker | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const isRecordingRef = useRef(false);

    useEffect(() => {
        workerRef.current = new Worker(new URL('../workers/whisper.worker.ts', import.meta.url), {
            type: 'module'
        });

        workerRef.current.onmessage = (event) => {
            const { type, text, error: workerError, data } = event.data;
            if (type !== 'PROGRESS') {
                console.log(`[useWhisper] Worker message: ${type}`, { text, workerError });
            }

            if (type === 'TRANSCRIPTION_RESULT') {
                setTranscription(text);
                setIsProcessing(false);
                setStatus('Ready');
            } else if (type === 'TRANSCRIPTION_ERROR') {
                setError(workerError);
                setIsProcessing(false);
                setStatus('Error');
            } else if (type === 'PROGRESS') {
                if (data.status === 'progress') {
                    setStatus(`Loading: ${data.progress.toFixed(1)}%`);
                } else if (data.status === 'ready') {
                    setStatus('Model Ready');
                }
            }
        };

        return () => { workerRef.current?.terminate(); };
    }, []);

    const startRecording = useCallback(async () => {
        try {
            setError(null);
            setTranscription('');
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const audioContext = new AudioContext({ sampleRate: 16000 });
            audioContextRef.current = audioContext;
            if (audioContext.state === 'suspended') await audioContext.resume();

            const source = audioContext.createMediaStreamSource(stream);
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            analyser.smoothingTimeConstant = 0.3;
            source.connect(analyser);
            analyserRef.current = analyser;

            const destination = audioContext.createMediaStreamDestination();
            source.connect(destination);

            const getSupportedMimeType = () => {
                const types = ['audio/webm;codecs=opus', 'audio/ogg;codecs=opus', 'audio/wav', 'audio/mp4', 'audio/aac'];
                for (const type of types) {
                    if (MediaRecorder.isTypeSupported(type)) return type;
                }
                return '';
            };

            const mimeType = getSupportedMimeType();
            const mediaRecorder = mimeType
                ? new MediaRecorder(destination.stream, { mimeType })
                : new MediaRecorder(destination.stream);

            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) audioChunksRef.current.push(event.data);
            };

            mediaRecorder.onerror = (event: any) => {
                console.error('[useWhisper] MediaRecorder error:', event.error);
                setError(`Recording error: ${event.error?.name || 'Unknown'}`);
            };

            mediaRecorder.onstop = async () => {
                stream.getTracks().forEach(track => track.stop());
                streamRef.current = null;
                analyserRef.current = null;

                if (audioChunksRef.current.length === 0) {
                    setIsProcessing(false);
                    try { audioContext.close(); } catch (e) { }
                    audioContextRef.current = null;
                    return;
                }

                try {
                    const audioBlob = new Blob(audioChunksRef.current);
                    const arrayBuffer = await audioBlob.arrayBuffer();
                    let float32Array: Float32Array;
                    try {
                        const audioData = await audioContext.decodeAudioData(arrayBuffer);
                        float32Array = audioData.getChannelData(0);
                    } catch {
                        const offlineCtx = new OfflineAudioContext(1, 1, 16000);
                        const audioData = await offlineCtx.decodeAudioData(arrayBuffer);
                        float32Array = audioData.getChannelData(0);
                    }

                    setIsProcessing(true);
                    setStatus('Transcribing...');
                    workerRef.current?.postMessage({ type: 'TRANSCRIPTION_REQUEST', audio: float32Array });
                } catch (err) {
                    console.error('[useWhisper] Error processing audio:', err);
                    setError('Failed to process audio recording.');
                    setIsProcessing(false);
                }

                try { audioContext.close(); } catch (e) { }
                audioContextRef.current = null;
            };

            mediaRecorder.start();
            setIsRecording(true);
            isRecordingRef.current = true;
        } catch (err) {
            console.error('Failed to start recording:', err);
            setError('Microphone access denied or failed.');
        }
    }, []);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && isRecordingRef.current) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            isRecordingRef.current = false;
        }
    }, []);

    const getAudioLevel = useCallback(() => {
        if (!analyserRef.current) return 0;
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteTimeDomainData(dataArray);
        let peak = 0;
        for (let i = 0; i < dataArray.length; i++) {
            const amplitude = Math.abs(dataArray[i] - 128);
            if (amplitude > peak) peak = amplitude;
        }
        const raw = peak / 128;
        if (raw < 0.01) return 0;
        return Math.min(1, raw * 3.5);
    }, []);

    const resetTranscription = useCallback(() => {
        setTranscription('');
        setError(null);
    }, []);

    return {
        transcription, isProcessing, isRecording, error,
        startRecording, stopRecording, getAudioLevel, resetTranscription, status
    };
}

// ============================================================================
// MAIN HOOK: Auto-selects mobile (Azure Cloud) vs desktop (Whisper WASM)
// ============================================================================
export function useWhisper(): WhisperResult {
    const mobile = isMobileDevice();
    console.log(`[useWhisper] Platform: ${mobile ? 'MOBILE (Azure Cloud STT)' : 'DESKTOP (Whisper WASM)'}`);

    if (mobile) {
        return useMobileAzureSTT();
    }
    return useDesktopWhisper();
}
