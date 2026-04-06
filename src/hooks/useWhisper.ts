import { useState, useEffect, useRef, useCallback } from 'react';
import { devLog, devWarn } from "@/lib/devLog";

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
// OPENAI PATH: Direct Browser Inference (Whisper API)
// ============================================================================
export function useWhisper(): WhisperResult {
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [transcription, setTranscription] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState('Ready');

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const isRecordingRef = useRef(false);

    const startRecording = useCallback(async () => {
        try {
            setError(null);
            setTranscription('');
            setStatus('Requesting Mic...');

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                }
            });
            streamRef.current = stream;

            // iOS Safari requires the webkit prefix on older versions
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            const audioContext = new AudioContextClass();
            audioContextRef.current = audioContext;
            if (audioContext.state === 'suspended') await audioContext.resume();

            const source = audioContext.createMediaStreamSource(stream);
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            analyser.smoothingTimeConstant = 0.3;
            source.connect(analyser);
            analyserRef.current = analyser;

            // Prepare MediaRecorder
            const getSupportedMimeType = () => {
                // iOS Safari only supports audio/mp4 (AAC). webm/ogg are not supported.
                // Priority order: mp4 first for broadest compatibility, then webm for Chrome/Android.
                const types = [
                    'audio/mp4',
                    'audio/aac',
                    'audio/webm;codecs=opus',
                    'audio/mpeg',
                    'audio/webm',
                    'audio/ogg;codecs=opus',
                    'audio/wav'
                ];
                for (const type of types) {
                    if (MediaRecorder.isTypeSupported(type)) {
                        devLog(`[useWhisper] Using supported MIME type: ${type}`);
                        return type;
                    }
                }
                return '';
            };

            const mimeType = getSupportedMimeType();
            const mediaRecorder = new MediaRecorder(stream, { mimeType });
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) audioChunksRef.current.push(event.data);
            };

            mediaRecorder.onstop = async () => {
                setStatus('Transcribing...');
                setIsProcessing(true);

                if (audioChunksRef.current.length === 0) {
                    setIsProcessing(false);
                    setStatus('Ready');
                    return;
                }

                try {
                    const audioBlob = new Blob(audioChunksRef.current, { type: mimeType || 'audio/mp4' });
                    // Determine extension: prefer mp4/aac for iOS, webm for Chrome.
                    // If mimeType is empty (no supported type found), default to mp4 as the safer fallback.
                    const fileExtension = (mimeType.includes('mp4') || mimeType.includes('aac') || mimeType === '') ? 'mp4' : 'webm';

                    const formData = new FormData();
                    formData.append('audio', audioBlob, `recording.${fileExtension}`);

                    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
                    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
                    if (!supabaseUrl || !supabaseKey) {
                        throw new Error('Supabase configuration missing from frontend environment variables');
                    }

                    devLog(`[useWhisper] Sending audio to Supabase Edge Function (${fileExtension})...`);
                    const response = await fetch(`${supabaseUrl}/functions/v1/process-voice`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${supabaseKey}`
                        },
                        body: formData,
                    });

                    if (!response.ok) {
                        let errText = '';
                        try {
                            errText = await response.text();
                        } catch (e) { }
                        console.error('[useWhisper] Edge Function Error Response:', errText || response.statusText);
                        throw new Error(`Edge Function error: ${response.status} ${response.statusText}`);
                    }

                    const data = await response.json();
                    if (data.transcript) {
                        devLog(`[useWhisper] Transcription result: "${data.transcript}" | Extracted Location: ${data.location} | High Urgency: ${data.high_urgency}`);
                        setTranscription(data.transcript);
                    } else if (data.transcript === "") {
                        // Empty transcript means backend heard nothing
                        devLog(`[useWhisper] Empty transcription returned from backend.`);
                        setTranscription("");
                    } else {
                        throw new Error('Invalid response from backend API');
                    }
                } catch (err: any) {
                    console.error('[useWhisper] Transcription failed:', err);
                    setError(`Transcription error: ${err.message || 'Unknown'}`);
                } finally {
                    setIsProcessing(false);
                    setStatus('Ready');
                    // Cleanup tracks immediately
                    stream.getTracks().forEach(track => track.stop());
                    streamRef.current = null;
                    if (audioContextRef.current) {
                        try { audioContextRef.current.close(); } catch (e) { }
                        audioContextRef.current = null;
                    }
                }
            };

            mediaRecorder.start();
            setIsRecording(true);
            isRecordingRef.current = true;
            setStatus('Listening...');
        } catch (err: any) {
            console.error('[useWhisper] Failed to start recording:', err);
            setError(err.name === 'NotAllowedError' ? 'Microphone access denied.' : 'Mic initialization failed.');
            setStatus('Error');
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
