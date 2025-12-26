
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
    const [status, setStatus] = useState<'idle' | 'listening' | 'speaking' | 'processing'>('idle');

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
            startGeminiSession();
        } else if (!isOpen && isActive) {
            stopGeminiSession();
        }

        return () => {
            if (isActive) stopGeminiSession();
        };
    }, [isOpen]);

    const startGeminiSession = async () => {
        setIsActive(true);
        setStatus('idle');
        setError(null);
        setMessages([]);

        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

        if (!apiKey) {
            setError("VITE_GEMINI_API_KEY is missing in Cloudflare/Env. Please add it and rebuild.");
            setIsActive(false);
            return;
        }

        controllerRef.current = new GeminiLiveController();

        try {
            await controllerRef.current.startSession({
                onMessage: (text, role) => {
                    setMessages(prev => [...prev, { text, role, timestamp: new Date() }]);
                    if (role === 'model') setStatus('speaking');
                    else if (role === 'user') setStatus('processing');
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
                onInterrupted: () => setStatus('listening'),
                onError: (err: any) => {
                    console.error("[Voice] Session Error:", err);
                    setError(err?.message || "Connection Failed (Check API Key Access)");
                    setStatus('idle');
                }
            });
            setStatus('listening');
        } catch (e: any) {
            console.error("[Voice] Initialization Crash:", e);
            setError(e?.message || "Internal AI Error");
            setIsActive(false);
        }
    };

    const stopGeminiSession = async () => {
        if (controllerRef.current) {
            await controllerRef.current.stopSession();
            controllerRef.current = null;
        }
        setIsActive(false);
        setStatus('idle');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[600px]">

                {/* Header */}
                <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full bg-white animate-pulse`}></div>
                        <span className="font-black text-white text-xs uppercase tracking-widest">
                            Emergency Assistant
                        </span>
                    </div>
                    <button onClick={onClose} className="p-1 bg-white/20 hover:bg-white/40 rounded-full text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Chat Area */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950">
                    {messages.length === 0 && !error && (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                            <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center border border-slate-700">
                                <Mic className="w-8 h-8 text-slate-500" />
                            </div>
                            <p className="text-slate-400 text-sm font-medium">Connecting to Secure Server...</p>
                        </div>
                    )}

                    {error && (
                        <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-4 animate-in fade-in zoom-in duration-300">
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm w-full font-bold">
                                {error}
                            </div>
                            <button
                                onClick={startGeminiSession}
                                className="w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Force Restart
                            </button>
                        </div>
                    )}

                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${msg.role === 'user'
                                ? 'bg-amber-500 text-slate-900 font-bold rounded-tr-none'
                                : 'bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700'
                                }`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Visualizer Footer */}
                <div className="p-8 bg-slate-900 border-t border-slate-800 flex justify-center items-center h-28">
                    <div className="flex items-center gap-2 h-12">
                        {[...Array(5)].map((_, i) => (
                            <div
                                key={i}
                                className={`w-2.5 rounded-full transition-all duration-300 ${status === 'speaking' ? 'bg-amber-500 h-12 animate-bounce shadow-[0_0_20px_rgba(245,158,11,0.6)]' :
                                    status === 'listening' ? 'bg-green-500 h-6 animate-pulse' :
                                        'bg-slate-800 h-2.5'
                                    }`}
                                style={{ animationDelay: `${i * 0.15}s` }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VoiceAssistantModal;
