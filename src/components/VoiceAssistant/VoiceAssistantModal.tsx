
import React, { useState, useEffect, useRef } from 'react';
import { X, Mic, AlertTriangle } from 'lucide-react';
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

    // Status visualizer state
    const [status, setStatus] = useState<'idle' | 'listening' | 'speaking' | 'processing'>('idle');

    const controllerRef = useRef<GeminiLiveController | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // Auto-scroll to bottom of chat
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    // Handle Modal Open/Close for session management
    useEffect(() => {
        let mounted = true;

        if (isOpen && !isActive) {
            startGeminiSession();
        } else if (!isOpen && isActive) {
            stopGeminiSession();
        }

        return () => {
            mounted = false;
            // Cleanup on unmount if taking too long
            if (isActive) stopGeminiSession();
        };
    }, [isOpen]);

    const startGeminiSession = async () => {
        setIsActive(true);
        setStatus('idle');
        setError(null);
        setMessages([]);

        controllerRef.current = new GeminiLiveController();

        try {
            await controllerRef.current.startSession({
                onMessage: (text, role) => {
                    setMessages(prev => [...prev, { text, role, timestamp: new Date() }]);

                    if (role === 'model') {
                        setStatus('speaking');
                    } else if (role === 'user') {
                        setStatus('processing');
                    }
                },
                onNavigate: (view) => {
                    const routeMap: Record<string, string> = {
                        'dashboard': '/',
                        'services': '/services',
                        'blog': '/blog',
                        'premium': '/premium',
                        'contact': '/contact',
                        'analytics': '/analytics',
                        'settings': '/profile',
                        'profile': '/profile'
                    };

                    const target = routeMap[view.toLowerCase()] || '/';
                    setMessages(prev => [...prev, {
                        text: `Navigating to ${view}...`,
                        role: 'model',
                        timestamp: new Date()
                    }]);
                    navigate(target);
                },
                onInterrupted: () => {
                    setStatus('listening');
                },
                onError: (err) => {
                    console.error("Gemini Error:", err);
                    setError("Connection Failed. Checking API Key...");
                    setStatus('idle');
                }
            });
            // Initial State after connection
            setStatus('listening');
        } catch (e) {
            console.error(e);
            setError("Failed to initialize AI. Please check your network.");
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[600px]">

                {/* Header */}
                <div className="p-4 bg-slate-800/50 flex items-center justify-between border-b border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${status === 'listening' ? 'bg-green-500 animate-pulse' : status === 'speaking' ? 'bg-amber-500' : 'bg-slate-500'}`}></div>
                        <span className="font-bold text-white text-sm tracking-wide">
                            {status === 'listening' ? 'Listening...' : status === 'speaking' ? 'Agent Speaking' : 'Standby'}
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-700 rounded-full transition-colors text-slate-400 hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Chat Area */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-900 to-slate-950">
                    {messages.length === 0 && !error && (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-50">
                            <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center">
                                <Mic className="w-10 h-10 text-slate-400" />
                            </div>
                            <p className="text-slate-400 text-sm">Listening for emergency...</p>
                        </div>
                    )}

                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-center text-sm">
                            <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-80" />
                            {error}
                        </div>
                    )}

                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${msg.role === 'user'
                                    ? 'bg-amber-500 text-slate-900 font-medium rounded-tr-none'
                                    : 'bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700'
                                }`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Visualizer */}
                <div className="p-6 bg-slate-900 border-t border-slate-800 flex justify-center items-center h-24">
                    {/* Dynamic Bars based on status */}
                    <div className="flex items-center gap-1 h-8">
                        {[...Array(5)].map((_, i) => (
                            <div
                                key={i}
                                className={`w-1.5 rounded-full transition-all duration-300 ${status === 'speaking' ? 'bg-amber-500 h-8 animate-bounce' :
                                        status === 'listening' ? 'bg-green-500 h-4 animate-pulse' :
                                            'bg-slate-700 h-2'
                                    }`}
                                style={{
                                    animationDelay: `${i * 0.1}s`
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VoiceAssistantModal;
