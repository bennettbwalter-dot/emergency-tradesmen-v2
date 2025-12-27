
import { Message, HybridCallbacks } from '../../services/gemini/types';
import { HybridController } from '../../services/gemini/geminiLiveService';
import React, { useState, useEffect, useRef } from 'react';
import { X, Mic, AlertTriangle, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}


const VoiceAssistantModal: React.FC<Props> = ({ isOpen, onClose }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isActive, setIsActive] = useState(false);
    const [status, setStatus] = useState<string>("Ready");
    const [micVolume, setMicVolume] = useState(0);
    const [hasStarted, setHasStarted] = useState(false);
    const [keyStatus, setKeyStatus] = useState<string>("Checking...");

    const controllerRef = useRef<HybridController | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        if (isOpen) {
            // Validate API Key Visibility
            const key = import.meta.env.VITE_GEMINI_API_KEY;
            if (key && key.length > 5) {
                setKeyStatus("API Key Detected ✅");
            } else {
                setKeyStatus("API Key Missing ❌");
                setError("CRITICAL: VITE_GEMINI_API_KEY is missing from Cloudflare.");
            }
        }

        if (!isOpen) {
            stopSession();
        }
        return () => { stopSession(); };
    }, [isOpen]);

    const handleStart = async () => {
        setHasStarted(true);
        setIsActive(true);
        setError(null);
        setMessages([]);
        setMicVolume(0);
        setStatus("Waiting for Mic...");

        controllerRef.current = new HybridController();

        try {
            await controllerRef.current.startSession({
                onMessage: (text, role) => {
                    setMessages(prev => [...prev, { text, role, timestamp: new Date() }]);
                },
                onStatusChange: (s) => setStatus(s),
                onNavigate: (view) => {
                    navigate(`/${view}`);
                },
                onVolume: (v) => setMicVolume(v),
                onError: (err: any) => {
                    console.error("[Voice] Assistant error:", err);
                    setError(err?.message || "Service unavailable.");
                }
            });
        } catch (e: any) {
            console.error("[Voice] Failed to start:", e);
            setError("Connection failed. Please refresh.");
            setIsActive(false);
            setHasStarted(false);
        }
    };

    const stopSession = async () => {
        if (controllerRef.current) {
            await controllerRef.current.stopSession();
            controllerRef.current = null;
        }
        setIsActive(false);
        setHasStarted(false);
        setMicVolume(0);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="relative w-full max-w-md bg-slate-900 border border-amber-500/20 rounded-[2.5rem] shadow-2xl flex flex-col h-[600px] overflow-hidden">

                <div className="p-6 bg-amber-500/5 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-2.5 h-2.5 rounded-full ${error ? 'bg-red-500' : 'bg-amber-500 animate-pulse'}`}></div>
                        <span className="font-black text-amber-500 text-[10px] uppercase tracking-[0.25em]">Concierge AI</span>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-2xl text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
                </div>

                {/* API Key Status Bar (Diagnostic) */}
                <div className="bg-slate-950 px-6 py-2 border-b border-white/5 flex justify-between items-center">
                    <span className="text-[10px] text-slate-500 font-mono">System Check:</span>
                    <span className={`text-[10px] font-bold ${keyStatus.includes('✅') ? 'text-green-500' : 'text-red-500'}`}>{keyStatus}</span>
                </div>

                <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 text-[13px]">

                    {!hasStarted && !error && (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-8">
                            <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center animate-pulse">
                                <Mic className="w-8 h-8 text-amber-500" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-white font-bold text-lg">Ready to Assist</h3>
                                <p className="text-slate-400 text-xs max-w-[200px] mx-auto">Click below to activate the microphone and start talking.</p>
                            </div>
                            <button
                                onClick={handleStart}
                                className="px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-2xl font-black uppercase text-xs tracking-wider transition-all transform active:scale-95 shadow-lg shadow-amber-500/20"
                            >
                                Start Conversation
                            </button>
                        </div>
                    )}

                    {hasStarted && !error && messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-40">
                            <Mic className="w-10 h-10 text-amber-500" />
                            <p className="text-[10px] text-amber-500 uppercase font-black tracking-[0.2em]">{status}</p>
                        </div>
                    )}

                    {error && (
                        <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-6">
                            <AlertTriangle className="w-10 h-10 text-red-500" />
                            <p className="text-white text-sm font-bold leading-relaxed">{error}</p>
                            <button onClick={handleStart} className="px-8 py-3 bg-amber-500 text-slate-900 rounded-xl font-black uppercase text-[10px] flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-transform">
                                <RefreshCw className="w-4 h-4" /> Rewrite
                            </button>
                        </div>
                    )}

                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${msg.role === 'user' ? 'bg-amber-500 text-slate-900 font-bold' : 'bg-slate-800 text-slate-100'}`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                </div>

                {!error && (
                    <div className="p-8 bg-slate-950 border-t border-white/5 flex flex-col items-center gap-4">
                        <div className="flex gap-1.5 h-8 items-center">
                            {[...Array(10)].map((_, i) => (
                                <div key={i} className={`w-1 rounded-full transition-all duration-100 ${micVolume * 15 > i ? 'bg-amber-500 h-8 shadow-[0_0_12px_rgba(245,158,11,0.6)]' : 'bg-slate-800 h-2'}`} />
                            ))}
                        </div>
                        <p className="text-[10px] text-amber-500/60 uppercase font-black tracking-widest">
                            {status}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VoiceAssistantModal;
