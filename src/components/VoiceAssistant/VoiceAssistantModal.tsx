import React, { useState, useEffect, useRef } from 'react';
import { X, Mic, AlertTriangle, ArrowRight, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import intentsData from '../../voice-agent/intents.json';
import routesData from '../../voice-agent/routes.json';

const intentsConfig = intentsData || { intents: [] };
const routesConfig = routesData || { routes: {} };

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

// Minimal type definition for SpeechRecognition
interface SpeechRecognitionEvent {
    results: {
        [key: number]: {
            [key: number]: {
                transcript: string;
            };
        };
    };
}

interface SpeechRecognitionErrorEvent {
    error: string;
}

interface SpeechRecognition {
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    start: () => void;
    stop: () => void;
    onresult: (event: SpeechRecognitionEvent) => void;
    onerror: (event: SpeechRecognitionErrorEvent) => void;
    onend: () => void;
}

declare global {
    interface Window {
        SpeechRecognition: { new(): SpeechRecognition };
        webkitSpeechRecognition: { new(): SpeechRecognition };
    }
}

const VoiceAssistantModal: React.FC<Props> = ({ isOpen, onClose }) => {
    const [transcript, setTranscript] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');
    const [feedbackMessage, setFeedbackMessage] = useState('Listening for your emergency...');

    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const synthRef = useRef<SpeechSynthesis | null>(null);
    const navigate = useNavigate();

    // Initialize Speech APIs
    useEffect(() => {
        if (!isOpen) {
            stopListening();
            stopSpeaking();
            setTranscript('');
            setStatus('idle');
            return;
        }

        // Initialize Speech Synthesis
        if ('speechSynthesis' in window) {
            synthRef.current = window.speechSynthesis;
        }

        // Initialize Speech Recognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.lang = 'en-GB';
            recognition.continuous = false;
            recognition.interimResults = true;

            recognition.onresult = (event: SpeechRecognitionEvent) => {
                const result = event.results[0][0].transcript;
                setTranscript(result);
            };

            recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
                console.error('Speech recognition error', event.error);
                if (event.error === 'not-allowed') {
                    setFeedbackMessage('Microphone access denied. Please check settings.');
                } else {
                    setFeedbackMessage('Did not catch that. Please try again.');
                }
                setStatus('idle');
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current = recognition;

            // Start interaction immediately
            startInteraction();

        } else {
            setFeedbackMessage('Voice recognition not supported in this browser.');
        }

        return () => {
            stopListening();
            stopSpeaking();
        };
    }, [isOpen]);

    // Handle transcript updates (finalize when silence/done)
    useEffect(() => {
        if (transcript && !isListening) {
            processIntent(transcript);
        }
    }, [isListening, transcript]);

    const startInteraction = () => {
        stopSpeaking();
        speak('Hello. Describe your emergency now.', () => {
            startListening();
        });
    };

    const startListening = () => {
        if (recognitionRef.current) {
            try {
                if (isListening) return; // Prevent double start
                recognitionRef.current.start();
                setIsListening(true);
                setStatus('listening');
                setFeedbackMessage('Listening...');
            } catch (e) {
                // Ignore "already started" errors
            }
        }
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    };

    const speak = (text: string, onEnd?: () => void) => {
        if (synthRef.current) {
            setStatus('speaking');
            const utterance = new SpeechSynthesisUtterance(text);

            // Standard Voice Selection Logic
            let voices = synthRef.current.getVoices();

            const setVoiceAndSpeak = () => {
                // Find a British voice (en-GB)
                const britishVoice = voices.find(v => v.lang === 'en-GB' || v.lang === 'en_GB');
                if (britishVoice) {
                    utterance.voice = britishVoice;
                }

                // Always set lang attribute as fallback
                utterance.lang = 'en-GB';

                utterance.onend = () => {
                    if (onEnd) onEnd();
                };

                synthRef.current?.speak(utterance);
            };

            if (voices.length > 0) {
                setVoiceAndSpeak();
            } else {
                // If voices aren't loaded, wait for the event
                synthRef.current.onvoiceschanged = () => {
                    voices = synthRef.current?.getVoices() || [];
                    setVoiceAndSpeak();
                    // Cleanup listener to prevent leaks/double calls is tricky here without refs, 
                    // but for this MVP modal context, overwriting onvoiceschanged is acceptable.
                    if (synthRef.current) synthRef.current.onvoiceschanged = null;
                };
            }
        } else {
            // Fallback if no TTS
            if (onEnd) onEnd();
        }
    };

    const stopSpeaking = () => {
        if (synthRef.current) {
            synthRef.current.cancel();
        }
    };

    const processIntent = (text: string) => {
        setStatus('processing');
        const lowerText = text.toLowerCase();

        // 1. Safety Check
        const safetyIntent = intentsConfig.intents.find(i =>
            i.id === 'safety_warning' && i.keywords.some(k => lowerText.includes(k))
        );

        if (safetyIntent) {
            setFeedbackMessage('SAFETY WARNING DETECTED');
            speak('Danger detected. If this is a life threatening emergency involving fire or gas, evacuate immediately and call 9 9 9.', () => {
                setStatus('idle');
            });
            return;
        }

        // 2. Guide/Advice Check
        const guideIntent = intentsConfig.intents.find(i =>
            i.id === 'guide_request' && i.keywords.some(k => lowerText.includes(k))
        );

        if (guideIntent) {
            setFeedbackMessage('Offering guides...');
            speak('I can help with that. Sending you to our emergency guides.', () => {
                navigate(routesConfig.routes.blog);
                onClose();
            });
            return;
        }

        // 3. Trade Detection
        const detectedTrade = intentsConfig.intents.find(i =>
            i.route_key && i.keywords.some(k => lowerText.includes(k))
        );

        if (detectedTrade && detectedTrade.route_key) {
            const routeKey = detectedTrade.route_key as keyof typeof routesConfig.routes;
            const targetPath = routesConfig.routes[routeKey];
            const tradeName = detectedTrade.id.replace('_', ' ');

            setFeedbackMessage(`Found: ${tradeName}`);
            speak(`Connecting you to ${tradeName} services now.`, () => {
                navigate(targetPath);
                onClose();
            });
            return;
        }

        // 4. Fallback
        setFeedbackMessage('Not understood. Redirecting to directory.');
        speak('I did not catch the specific service. Sending you to the main directory.', () => {
            navigate(routesConfig.routes.tradesmen);
            onClose();
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div
                className="w-full max-w-md bg-transparent text-center flex flex-col items-center gap-8 relative"
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute -top-12 right-0 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Visualizer / Status Icon */}
                <div className="relative">
                    {status === 'listening' ? (
                        <div className="w-32 h-32 rounded-full bg-red-600 flex items-center justify-center animate-pulse">
                            <Mic className="w-16 h-16 text-white" />
                            <div className="absolute inset-0 rounded-full border-4 border-red-500 animate-ping opacity-50"></div>
                        </div>
                    ) : status === 'speaking' ? (
                        <div className="w-32 h-32 rounded-full bg-blue-600 flex items-center justify-center">
                            <Activity className="w-16 h-16 text-white animate-bounce" />
                        </div>
                    ) : status === 'processing' ? (
                        <div className="w-32 h-32 rounded-full bg-yellow-500 flex items-center justify-center animate-spin">
                            <div className="w-24 h-24 border-4 border-white border-t-transparent rounded-full"></div>
                        </div>
                    ) : (
                        <button
                            onClick={startInteraction}
                            className="w-32 h-32 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center transition"
                        >
                            <Mic className="w-12 h-12 text-slate-300" />
                        </button>
                    )}
                </div>

                {/* Text Feedback */}
                <div className="space-y-4 max-w-xs mx-auto">
                    <h3 className="text-2xl font-bold text-white">
                        {status === 'listening' ? 'Listening...' : status === 'speaking' ? 'Speaking...' : status === 'processing' ? 'Thinking...' : 'Tap Mic to Speak'}
                    </h3>

                    <p className="text-lg text-slate-300 min-h-[3rem] font-medium">
                        "{transcript || feedbackMessage}"
                    </p>
                </div>

                {/* Safety Warning Visual (Conditional) */}
                {feedbackMessage.includes('SAFETY') && (
                    <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-xl flex items-center gap-3 text-left">
                        <AlertTriangle className="w-8 h-8 shrink-0 animate-pulse" />
                        <p className="text-sm font-bold">Life Threatening Danger? Call 999 immediately.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VoiceAssistantModal;
