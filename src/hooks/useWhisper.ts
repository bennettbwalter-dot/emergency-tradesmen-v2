import { useState, useEffect, useRef, useCallback } from 'react';

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

// Check if Web Speech API is available
const hasWebSpeechAPI = (): boolean => {
    return typeof window !== 'undefined' &&
        ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
};

// ============================================================================
// MOBILE PATH: Web Speech API (zero download, instant, native)
// ============================================================================
function useMobileSpeech(): WhisperResult {
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [transcription, setTranscription] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState('Ready (Native)');

    const recognitionRef = useRef<any>(null);
    const isRecordingRef = useRef(false);

    // Audio level monitoring
    const analyserRef = useRef<AnalyserNode | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const startRecording = useCallback(async () => {
        try {
            setError(null);
            setTranscription('');

            console.log('[useMobileSpeech] Starting native speech recognition...');

            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (!SpeechRecognition) {
                setError('Speech recognition not supported on this browser.');
                return;
            }

            const recognition = new SpeechRecognition();
            recognition.continuous = false; // Single utterance mode (best for short answers)
            recognition.interimResults = false; // Only final results
            recognition.lang = 'en-GB'; // Default; could be made configurable

            recognition.onstart = () => {
                console.log('[useMobileSpeech] Recognition started');
                setStatus('Listening...');
            };

            recognition.onresult = (event: any) => {
                const result = event.results[event.results.length - 1];
                const text = result[0].transcript;
                const confidence = result[0].confidence;
                console.log(`[useMobileSpeech] Result: "${text}" (confidence: ${(confidence * 100).toFixed(1)}%)`);
                setTranscription(text);
                setIsProcessing(false);
                setStatus('Ready (Native)');
            };

            recognition.onerror = (event: any) => {
                console.error('[useMobileSpeech] Error:', event.error);
                if (event.error === 'no-speech') {
                    setError("No speech detected. Please try again.");
                } else if (event.error === 'not-allowed') {
                    setError("Microphone access denied.");
                } else if (event.error === 'network') {
                    setError("Network error. Check your connection.");
                } else {
                    setError(`Speech error: ${event.error}`);
                }
                setIsRecording(false);
                isRecordingRef.current = false;
                setIsProcessing(false);
                setStatus('Ready (Native)');
                cleanupAudio();
            };

            recognition.onend = () => {
                console.log('[useMobileSpeech] Recognition ended');
                setIsRecording(false);
                isRecordingRef.current = false;
                setIsProcessing(false);
                cleanupAudio();
            };

            recognitionRef.current = recognition;

            // Also set up audio context for waveform visualization
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                streamRef.current = stream;
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
                console.warn('[useMobileSpeech] Audio visualization setup failed:', audioErr);
                // Non-fatal — recognition can proceed without visualization
            }

            recognition.start();
            setIsRecording(true);
            isRecordingRef.current = true;
            console.log('[useMobileSpeech] Recording started');

        } catch (err) {
            console.error('[useMobileSpeech] Failed to start:', err);
            setError('Microphone access denied or failed.');
        }
    }, []);

    const cleanupAudio = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
        if (audioContextRef.current) {
            try { audioContextRef.current.close(); } catch (e) { }
            audioContextRef.current = null;
        }
        analyserRef.current = null;
    }, []);

    const stopRecording = useCallback(() => {
        console.log('[useMobileSpeech] stopRecording called');
        if (recognitionRef.current && isRecordingRef.current) {
            setIsProcessing(true);
            setStatus('Processing...');
            recognitionRef.current.stop();
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

    useEffect(() => {
        // Initialize worker
        workerRef.current = new Worker(new URL('../workers/whisper.worker.ts', import.meta.url), {
            type: 'module'
        });

        workerRef.current.onmessage = (event) => {
            const { type, text, error: workerError, data } = event.data;
            if (type !== 'PROGRESS') {
                console.log(`[useWhisper] Received message from worker: ${type}`, { text, workerError });
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
                    setStatus(`Loading model: ${data.progress.toFixed(1)}%`);
                } else if (data.status === 'ready') {
                    setStatus('Model Ready');
                }
            }
        };

        return () => {
            workerRef.current?.terminate();
        };
    }, []);

    const startRecording = useCallback(async () => {
        try {
            setError(null);
            setTranscription('');
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            console.log('[useWhisper] Microphone stream acquired');
            streamRef.current = stream;

            // Re-sample to 16kHz as required by Whisper
            const audioContext = new AudioContext({ sampleRate: 16000 });
            audioContextRef.current = audioContext;

            // CRITICAL: Explicitly resume context for mobile browsers
            if (audioContext.state === 'suspended') {
                await audioContext.resume();
            }

            const source = audioContext.createMediaStreamSource(stream);

            // Create analyser for real-time audio levels
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            analyser.smoothingTimeConstant = 0.3;
            source.connect(analyser);
            analyserRef.current = analyser;

            const destination = audioContext.createMediaStreamDestination();
            source.connect(destination);

            // MIME type detection for broader compatibility
            const getSupportedMimeType = () => {
                const types = [
                    'audio/webm;codecs=opus',
                    'audio/ogg;codecs=opus',
                    'audio/wav',
                    'audio/mp4',
                    'audio/aac'
                ];
                for (const type of types) {
                    if (MediaRecorder.isTypeSupported(type)) {
                        console.log(`[useWhisper] Using supported MIME type: ${type}`);
                        return type;
                    }
                }
                console.warn('[useWhisper] No preferred MIME types supported, using default');
                return '';
            };

            const options = { mimeType: getSupportedMimeType() };
            const mediaRecorder = options.mimeType
                ? new MediaRecorder(destination.stream, options)
                : new MediaRecorder(destination.stream);

            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onerror = (event: any) => {
                console.error('[useWhisper] MediaRecorder error:', event.error);
                setError(`Recording error: ${event.error?.name || 'Unknown'}`);
            };

            mediaRecorder.onstop = async () => {
                console.log('[useWhisper] Recording stopped. Total chunks:', audioChunksRef.current.length);

                // Clean up recording resources FIRST
                stream.getTracks().forEach(track => track.stop());
                streamRef.current = null;
                analyserRef.current = null;

                if (audioChunksRef.current.length === 0) {
                    console.warn('[useWhisper] No audio chunks captured');
                    setIsProcessing(false);
                    try { audioContext.close(); } catch (e) { }
                    audioContextRef.current = null;
                    return;
                }

                try {
                    const audioBlob = new Blob(audioChunksRef.current);
                    const arrayBuffer = await audioBlob.arrayBuffer();

                    console.log(`[useWhisper] Audio blob size: ${audioBlob.size} bytes`);

                    let float32Array: Float32Array;
                    try {
                        const audioData = await audioContext.decodeAudioData(arrayBuffer);
                        float32Array = audioData.getChannelData(0);
                    } catch (decodeError) {
                        console.warn('[useWhisper] Primary decode failed, trying offline context:', decodeError);
                        const offlineCtx = new OfflineAudioContext(1, 1, 16000);
                        const audioData = await offlineCtx.decodeAudioData(arrayBuffer);
                        float32Array = audioData.getChannelData(0);
                    }

                    console.log(`[useWhisper] Decoded audio: ${float32Array.length} samples (${(float32Array.length / 16000).toFixed(2)}s)`);

                    setIsProcessing(true);
                    setStatus('Transcribing...');
                    console.log('[useWhisper] Sending transcription request to worker');
                    workerRef.current?.postMessage({
                        type: 'TRANSCRIPTION_REQUEST',
                        audio: float32Array
                    });
                } catch (err) {
                    console.error('[useWhisper] Error processing audio:', err);
                    setError('Failed to process audio recording.');
                    setIsProcessing(false);
                }

                // Close recording context after we're done with it
                try { audioContext.close(); } catch (e) { /* already closed */ }
                audioContextRef.current = null;
            };

            mediaRecorder.start();
            setIsRecording(true);
            isRecordingRef.current = true;
            console.log('[useWhisper] Recording started');
        } catch (err) {
            console.error('Failed to start recording:', err);
            setError('Microphone access denied or failed.');
        }
    }, []);

    // Use a ref for isRecording to avoid stale closure in stopRecording
    const isRecordingRef = useRef(false);

    const stopRecording = useCallback(() => {
        console.log('[useWhisper] stopRecording called. isRecordingRef:', isRecordingRef.current);
        if (mediaRecorderRef.current && isRecordingRef.current) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            isRecordingRef.current = false;
        }
    }, []);

    // Get current audio level (0-1 range) with enhanced sensitivity for mobile
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
// MAIN HOOK: Auto-selects mobile vs desktop path
// ============================================================================
export function useWhisper(): WhisperResult {
    const useMobile = isMobileDevice() && hasWebSpeechAPI();

    console.log(`[useWhisper] Platform: ${useMobile ? 'MOBILE (Web Speech API)' : 'DESKTOP (Whisper WASM)'}`);

    // We must call both hooks unconditionally (React rules of hooks),
    // but only return the active one's results.
    // However, the desktop hook initializes a heavy worker, so we use a guard.
    if (useMobile) {
        return useMobileSpeech();
    }
    return useDesktopWhisper();
}
