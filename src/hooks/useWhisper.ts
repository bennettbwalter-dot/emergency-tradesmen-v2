import { useState, useEffect, useRef, useCallback } from 'react';

export interface WhisperResult {
    transcription: string;
    isProcessing: boolean;
    isRecording: boolean;
    error: string | null;
    startRecording: () => void;
    stopRecording: () => void;
    getAudioLevel: () => number;
}

export function useWhisper(): WhisperResult {
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [transcription, setTranscription] = useState('');
    const [error, setError] = useState<string | null>(null);

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
            const { type, text, error: workerError } = event.data;

            if (type === 'TRANSCRIPTION_RESULT') {
                setTranscription(text);
                setIsProcessing(false);
            } else if (type === 'TRANSCRIPTION_ERROR') {
                setError(workerError);
                setIsProcessing(false);
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
            streamRef.current = stream;

            // Re-sample to 16kHz as required by Whisper
            const audioContext = new AudioContext({ sampleRate: 16000 });
            audioContextRef.current = audioContext;
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
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                const arrayBuffer = await audioBlob.arrayBuffer();
                const audioData = await audioContext.decodeAudioData(arrayBuffer);

                // Get mono channel data
                const float32Array = audioData.getChannelData(0);

                setIsProcessing(true);
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

    // Get current audio level (0-1 range) with enhanced sensitivity
    const getAudioLevel = useCallback(() => {
        if (!analyserRef.current) return 0;

        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);

        // Use peak detection for more dramatic response
        let peak = 0;
        for (let i = 0; i < dataArray.length; i++) {
            if (dataArray[i] > peak) peak = dataArray[i];
        }

        // Noise gate: ignore values below threshold (mic hiss/ambient noise)
        const raw = peak / 255;
        if (raw < 0.02) return 0;

        // Amplify and normalize (boost sensitivity)
        const amplified = Math.min(1, raw * 2.5);

        return amplified;
    }, []);

    return {
        transcription,
        isProcessing,
        isRecording,
        error,
        startRecording,
        stopRecording,
        getAudioLevel
    };
}
