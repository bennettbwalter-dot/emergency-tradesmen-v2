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

export function useWhisper(): WhisperResult {
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

            // MOBILE COMPATIBILITY: Detect supported MIME types
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
                    console.log(`[useWhisper] Data available: ${event.data.size} bytes`);
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

                    // Use a SEPARATE offline context for decoding to avoid state conflicts
                    // The recording audioContext may be in a weird state after stopping
                    let float32Array: Float32Array;
                    try {
                        const audioData = await audioContext.decodeAudioData(arrayBuffer);
                        float32Array = audioData.getChannelData(0);
                    } catch (decodeError) {
                        console.warn('[useWhisper] Primary decode failed, trying offline context:', decodeError);
                        // Fallback: create a fresh offline context for decoding
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
        // Using Time Domain data for more reliable peak detection on mobile
        analyserRef.current.getByteTimeDomainData(dataArray);

        // Calculate peak amplitude from 128 (neutral point for time domain)
        let peak = 0;
        for (let i = 0; i < dataArray.length; i++) {
            const amplitude = Math.abs(dataArray[i] - 128);
            if (amplitude > peak) peak = amplitude;
        }

        // Noise gate: ultra-low for mobile (ambient floor is usually 1-2 units)
        const raw = peak / 128;
        if (raw < 0.01) return 0;

        // Amplify and normalize (boost sensitivity more for mobile)
        const amplified = Math.min(1, raw * 3.5);

        return amplified;
    }, []);

    const resetTranscription = useCallback(() => {
        setTranscription('');
        setError(null);
    }, []);

    return {
        transcription,
        isProcessing,
        isRecording,
        error,
        startRecording,
        stopRecording,
        getAudioLevel,
        resetTranscription,
        status
    };
}
