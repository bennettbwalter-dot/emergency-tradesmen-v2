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

            const mediaRecorder = new MediaRecorder(destination.stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                console.log('[useWhisper] Recording stopped, processing audio. Chunks:', audioChunksRef.current.length);
                if (audioChunksRef.current.length === 0) {
                    console.warn('[useWhisper] No audio chunks captured');
                    setIsProcessing(false);
                    return;
                }
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                const arrayBuffer = await audioBlob.arrayBuffer();
                const audioData = await audioContext.decodeAudioData(arrayBuffer);

                // Get mono channel data
                const float32Array = audioData.getChannelData(0);

                setIsProcessing(true);
                console.log('[useWhisper] Sending transcription request to worker');
                workerRef.current?.postMessage({
                    type: 'TRANSCRIPTION_REQUEST',
                    audio: float32Array
                });

                stream.getTracks().forEach(track => track.stop());
                streamRef.current = null;
                analyserRef.current = null;
                audioContext.close();
                audioContextRef.current = null;
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error('Failed to start recording:', err);
            setError('Microphone access denied or failed.');
        }
    }, []);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    }, [isRecording]);

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
