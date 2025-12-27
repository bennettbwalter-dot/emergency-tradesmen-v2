
import React, { useEffect, useState, useRef } from 'react';
import { X, Mic, Volume2, Globe, Cpu, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { HybridController } from '@/services/gemini/geminiLiveService';

interface VoiceAssistantModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const [controller] = useState(() => new HybridController());

    const [status, setStatus] = useState('Initializing...');
    const [messages, setMessages] = useState<any[]>([]);
    const [micVolume, setMicVolume] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [debugInfo, setDebugInfo] = useState<any>(null);

    const hasStarted = useRef(false);

    useEffect(() => {
        if (isOpen && !hasStarted.current) {
            hasStarted.current = true;
            handleStart();
        }
        if (!isOpen) {
            hasStarted.current = false;
            controller.stopSession();
            setMessages([]);
            setError(null);
        }
    }, [isOpen]);

    const handleStart = async () => {
        setError(null);
        setMessages([]);

        await controller.startSession({
            onStatusChange: setStatus,
            onVolume: (vol) => setMicVolume(Math.min(vol * 5, 1)), // Amplify for visuals
            onNavigate: (route) => {
                console.log('[Voice] Navigating to:', route);
                navigate(route);
            },
            onMessage: (text, role) => {
                setMessages(prev => [...prev, { text, role, timestamp: new Date() }]);
            },
            onError: (err) => {
                console.error('[Voice] Error:', err);
                setError(err.message);
                setStatus('Error ❌');
            },
            onDebug: (info) => setDebugInfo(info)
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[80vh]">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${status.includes('Listening') ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`} />
                        <span className="font-semibold text-slate-700 dark:text-slate-200">Emergency Assistant</span>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px]">
                    {messages.length === 0 && !error && (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-70">
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                                <Mic className="w-8 h-8 text-primary animate-pulse" />
                            </div>
                            <p className="text-sm text-slate-500">Listening...</p>
                        </div>
                    )}

                    {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.role === 'user'
                                    ? 'bg-primary text-primary-foreground rounded-tr-sm'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-sm'
                                }`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}

                    {error && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-xl text-center border border-red-100 dark:border-red-900/50">
                            <p className="font-semibold mb-1">Passcode Required</p>
                            <p>{error.includes('Key') ? 'Missing API Key in Cloud Env.' : error}</p>
                            <button
                                onClick={() => { setError(null); handleStart(); }}
                                className="mt-3 px-4 py-2 bg-white dark:bg-slate-800 shadow-sm border rounded-lg text-xs font-medium hover:bg-slate-50"
                            >
                                Retry Connection
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer / Status */}
                <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-mono mb-2">
                        <span>{status.toUpperCase()}</span>
                        {debugInfo && (
                            <div className="flex gap-2">
                                <span className={debugInfo.audioContextState === 'running' ? 'text-green-600' : 'text-amber-600'}>
                                    CTX:{debugInfo.audioContextState === 'running' ? 'OK' : 'WAIT'}
                                </span>
                                <span className={debugInfo.recognitionStatus === 'started' ? 'text-green-600' : 'text-red-600'}>
                                    RECOG:{debugInfo.recognitionStatus === 'started' ? 'ON' : 'OFF'}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Visualizer */}
                    <div className="h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-75 ease-out"
                            style={{ width: `${Math.min(micVolume * 100, 100)}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
