
import React, { useState, useEffect, useRef } from 'react';
import { X, Mic, AlertTriangle, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GeminiLiveController } from '../../services/gemini/geminiLiveService';
import { Message } from '../../services/gemini/types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

const VoiceAssistantModal: React.FC<Props> = ({ isOpen, onClose }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isActive, setIsActive] = useState(false);
    const [isListening, setIsListening] = useState(false);

    const controllerRef = useRef<GeminiLiveController | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        if (isOpen && !isActive) {
            startSession();
        } else if (!isOpen && isActive) {
            stopSession();
        }

        return () => {
            if (isActive) stopSession();
        };
    }, [isOpen]);

    const startSession = async () => {
        setIsActive(true);
        setIsListening(false);
        setError(null);
        setMessages([]);

        controllerRef.current = new GeminiLiveController();

        try {
            await controllerRef.current.startSession({
                onMessage: (text, role) => {
                    setMessages(prev => [...prev, { text, role, timestamp: new Date() }]);
                    if (role === 'model') setIsListening(false);
                    if (role === 'user') setIsListening(true);
                },
                onNavigate: (view) => {
                    const routeMap: Record<string, string> = {
                        'dashboard': '/', 'services': '/services', 'blog': '/blog',
                        'premium': '/premium', 'contact': '/contact', 'analytics': '/',
                        'settings': '/profile', 'profile': '/profile'
                    };
                    const target = routeMap[view.toLowerCase()] || '/';
                    navigate(target);
                },
                onInterrupted: () => setIsListening(false),
                onError: (err: any) => {
                    console.error("[Voice] Assistant error:", err);
                    if (err?.message === "MISSING_API_KEY") {
                        setError("Configuration Error: API Key is missing. Please check your environment variables.");
                    } else {
                        setError("Connection Error: The AI service is currently unavailable. Please try again.");
                    }
                    setIsListening(false);
                }
            });
            setIsListening(true);
        } catch (e: any) {
            console.error("[Voice] Failed to start:", e);
            setError("Failed to initialize the assistant. Please check your internet connection.");
            setIsActive(false);
        }
    };

    const stopSession = async () => {
        if (controllerRef.current) {
            await controllerRef.current.stopSession();
            controllerRef.current = null;
        }
        setIsActive(false);
        setIsListening(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="relative w-full max-w-md bg-slate-900 border border-amber-500/20 rounded-[2.5rem] shadow-2xl shadow-amber-500/10 overflow-hidden flex flex-col h-[600px] ring-1 ring-white/5">

                {/* Header */}
                <div className="p-6 bg-amber-500/5 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-2.5 h-2.5 rounded-full ${error ? 'bg-red-500' : 'bg-amber-500 animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.5)]'}`}></div>
                        <span className="font-black text-amber-500 text-[10px] uppercase tracking-[0.25em]">
                            Emergency Assistant
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-2xl text-slate-500 hover:text-white transition-all active:scale-90"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Chat Area */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-slate-900 to-slate-950">
                    {messages.length === 0 && !error && (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-6 animate-pulse">
                            <div className="w-20 h-20 rounded-[2rem] bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                                <Mic className="w-10 h-10 text-amber-500/50" />
                            </div>
                            <div className="space-y-2">
                                <p className="text-amber-500/80 text-xs font-black uppercase tracking-widest">Initialising AI...</p>
                                <p className="text-slate-500 text-[10px] uppercase tracking-wider">Connecting to Dispatch Center</p>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-6 animate-in zoom-in duration-500">
                            <div className="w-20 h-20 rounded-[2rem] bg-red-500/10 flex items-center justify-center border border-red-500/20">
                                <AlertTriangle className="w-10 h-10 text-red-500" />
                            </div>
                            <div className="space-y-2">
                                <p className="text-white text-sm font-bold px-4 leading-relaxed">{error}</p>
                                <p className="text-slate-500 text-[10px] uppercase tracking-wider italic">Error Code: SV-101</p>
                            </div>
                            <button
                                onClick={startSession}
                                className="group relative px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl transition-all active:scale-95 flex items-center gap-3"
                            >
                                <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                                Reconnect Dispatch
                            </button>
                        </div>
                    )}

                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                            <div className={`max-w-[85%] rounded-3xl px-5 py-3.5 text-sm shadow-lg ${msg.role === 'user'
                                    ? 'bg-amber-500 text-slate-900 font-bold rounded-tr-none'
                                    : 'bg-slate-800/80 text-slate-100 rounded-tl-none border border-white/5 backdrop-blur-sm'
                                }`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Visualizer Footer */}
                {!error && (
                    <div className="p-8 bg-slate-950 border-t border-white/5 flex flex-col items-center gap-4">
                        <div className="flex items-end justify-center gap-1.5 h-10">
                            {[...Array(isListening ? 12 : 6)].map((_, i) => (
                                <div
                                    key={i}
                                    className={`w-1 rounded-full transition-all duration-300 ${isListening ? 'bg-amber-500 animate-bounce h-10 shadow-[0_0_15px_rgba(245,158,11,0.4)]' : 'bg-amber-500/20 h-2'
                                        }`}
                                    style={{ animationDelay: `${i * 0.08}s`, animationDuration: isListening ? '0.6s' : '1.5s' }}
                                />
                            ))}
                        </div>
                        <p className="text-[10px] text-amber-500/40 font-black uppercase tracking-[0.4em] translate-x-1">
                            {isListening ? 'Listening' : 'Dispatching'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VoiceAssistantModal;
