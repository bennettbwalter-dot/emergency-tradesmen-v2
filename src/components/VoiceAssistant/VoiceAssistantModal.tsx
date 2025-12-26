import React, { useState, useEffect, useRef } from 'react';
import { X, Mic, Send, AlertTriangle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import intentsData from '../../voice-agent/intents.json';
import routesData from '../../voice-agent/routes.json';

const intentsConfig = intentsData || { intents: [] };
const routesConfig = routesData || { routes: {} };

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

interface Message {
    role: 'assistant' | 'user';
    content: React.ReactNode;
    type?: 'text' | 'warning' | 'action';
}

const VoiceAssistantModal: React.FC<Props> = ({ isOpen, onClose }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setMessages([
                {
                    role: 'assistant',
                    content: 'Hello. I am the Emergency Assistant. Please describe your emergency briefly (e.g., "I smell gas" or "My power is out") so I can direct you to the right help.',
                    type: 'text'
                }
            ]);
            // Small timeout to focus input after animation
            setTimeout(() => inputRef.current?.focus(), 300);
        } else {
            // Reset state on close
            setTimeout(() => {
                setMessages([]);
                setInputText('');
            }, 300);
        }
    }, [isOpen]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSend = () => {
        if (!inputText.trim()) return;

        const userText = inputText.trim();
        setMessages(prev => [...prev, { role: 'user', content: userText, type: 'text' }]);
        setInputText('');
        setIsProcessing(true);

        // Simulate processing delay for "AI" feel
        setTimeout(() => {
            processIntent(userText);
            setIsProcessing(false);
        }, 800);
    };

    const processIntent = (text: string) => {
        const lowerText = text.toLowerCase();

        // 1. Safety Check (High Priority)
        const safetyIntent = intentsConfig.intents.find(i =>
            i.id === 'safety_warning' && i.keywords.some(k => lowerText.includes(k))
        );

        if (safetyIntent) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: (
                    <div className="flex flex-col gap-3">
                        <div className="flex items-start gap-2 text-red-600 font-bold">
                            <AlertTriangle className="w-6 h-6 shrink-0" />
                            <span>SAFETY WARNING</span>
                        </div>
                        <p>If you suspect immediate danger (fire, gas leak, etc.), please evacuate immediately and call emergency services (999/112).</p>
                        <p>If it is not life-threatening, we can help find a tradesman.</p>
                    </div>
                ),
                type: 'warning'
            }]);
            return;
        }

        // 2. Guide/Advice Check
        const guideIntent = intentsConfig.intents.find(i =>
            i.id === 'guide_request' && i.keywords.some(k => lowerText.includes(k))
        );

        if (guideIntent) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: (
                    <div className="flex flex-col gap-2">
                        <p>Would you like to see our emergency guides?</p>
                        <button
                            onClick={() => {
                                navigate(routesConfig.routes.blog);
                                onClose();
                            }}
                            className="bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center justify-between hover:bg-blue-700 transition"
                        >
                            <span>View Emergency Guides</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                ),
                type: 'action'
            }]);
            return;
        }

        // 3. Trade Detection
        const detectedTrade = intentsConfig.intents.find(i =>
            i.route_key && i.keywords.some(k => lowerText.includes(k))
        );

        if (detectedTrade && detectedTrade.route_key) {
            const routeKey = detectedTrade.route_key as keyof typeof routesConfig.routes;
            const targetPath = routesConfig.routes[routeKey];

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: (
                    <div className="flex flex-col gap-2">
                        <p>I understand. Connecting you to our <strong>{detectedTrade.id.replace('_', ' ')}</strong> services.</p>
                        <p className="text-sm text-gray-500">Redirecting...</p>
                    </div>
                ),
                type: 'text'
            }]);

            setTimeout(() => {
                navigate(targetPath);
                onClose();
            }, 1500);
            return;
        }

        // 4. Fallback / One-click to Directory
        setMessages(prev => [...prev, {
            role: 'assistant',
            content: (
                <div className="flex flex-col gap-3">
                    <p>I'm not exactly sure which service you need based on that description. You can try describing it differently, or browse our full directory.</p>
                    <button
                        onClick={() => {
                            navigate(routesConfig.routes.tradesmen);
                            onClose();
                        }}
                        className="bg-gray-800 text-white py-2 px-4 rounded-lg flex items-center justify-between hover:bg-gray-900 transition"
                    >
                        <span>Go to Tradesmen Directory</span>
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            ),
            type: 'action'
        }]);

    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSend();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 p-4 flex items-center justify-between border-b border-slate-300 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="bg-red-600 p-2 rounded-full text-white">
                            <Mic className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white">Emergency Assistant</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">AI-Powered Help</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition">
                        <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    </button>
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950/50">
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[85%] rounded-2xl p-3.5 text-sm md:text-base shadow-sm ${msg.role === 'user'
                                    ? 'bg-red-600 text-white rounded-br-none'
                                    : msg.type === 'warning'
                                        ? 'bg-red-50 dark:bg-red-900/20 text-slate-800 dark:text-slate-100 border border-red-200 dark:border-red-800 rounded-bl-none'
                                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-bl-none'
                                    }`}
                            >
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    {isProcessing && (
                        <div className="flex justify-start">
                            <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl rounded-bl-none border border-slate-200 dark:border-slate-700 flex gap-1.5 items-center">
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Describe your emergency..."
                        className="flex-1 bg-slate-100 dark:bg-slate-800 border-0 rounded-full px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 placeholder-slate-500 dark:placeholder-slate-400"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!inputText.trim() || isProcessing}
                        className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-full transition-colors shadow-sm"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VoiceAssistantModal;
