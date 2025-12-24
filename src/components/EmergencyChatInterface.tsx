import { useState, useRef, useEffect } from "react";
import { Send, MapPin, Zap, Phone, Car, RotateCcw, Shield, Search, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { processUserMessage, ChatState, ChatMessage } from "@/lib/chat-logic";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useGeolocation } from "@/hooks/useGeolocation";
import { TypewriterMessage } from "./TypewriterMessage";
import { useChatbot } from "@/contexts/ChatbotContext";
import { trades, cities } from "@/lib/trades";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export function EmergencyChatInterface() {
    const navigate = useNavigate();
    const { detectedTrade, detectedCity, setDetectedTrade, setDetectedCity, isRequestingLocation, setIsRequestingLocation } = useChatbot();
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [chatState, setChatState] = useState<ChatState>({
        step: 'INITIAL',
        detectedTrade: null,
        history: []
    });

    const chatContainerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const { getLocation, loading: geoLoading, place } = useGeolocation();

    const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
        if (chatContainerRef.current) {
            const { scrollHeight, clientHeight } = chatContainerRef.current;
            if (scrollHeight > clientHeight) {
                chatContainerRef.current.scrollTo({
                    top: scrollHeight,
                    behavior
                });
            }
        }
    };

    useEffect(() => {
        scrollToBottom('smooth');
    }, [chatState.history, isTyping]);

    useEffect(() => {
        if (place?.city) {
            handleUserMessage(`I am in ${place.city}`);
        }
    }, [place]);

    useEffect(() => {
        // No automatic location request on mount - wait for user interaction or specific bot state
    }, []);

    const handleUserMessage = async (msgText: string) => {
        if (!msgText.trim()) return;

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: msgText
        };

        setChatState(prev => ({
            ...prev,
            history: [...prev.history, userMsg]
        }));
        setInput("");
        setIsTyping(true);

        setTimeout(() => {
            const { newState, response } = processUserMessage(msgText, {
                ...chatState,
                detectedTrade: detectedTrade || chatState.detectedTrade,
                detectedCity: detectedCity || chatState.detectedCity,
            });

            setChatState(prev => ({
                ...newState,
                history: [...prev.history, userMsg, response]
            }));

            setDetectedTrade(newState.detectedTrade);
            setDetectedCity(newState.detectedCity);

            // 1. Functional state: Should the button act as "Locate Me"?
            // Yes, if we don't have a city yet.
            setIsRequestingLocation(!newState.detectedCity && !detectedCity);

            setIsTyping(false);

            if (response.action === 'navigate' && response.target) {
                setTimeout(() => {
                    navigate(response.target!);
                }, 1500 + (response.content.length * 20));
            }
        }, 800);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleUserMessage(input);
        }
    };

    const [isFocused, setIsFocused] = useState(false);

    const helperSentences = [
        "We’re here to help you find trusted local emergency tradespeople.",
        "Take a moment to describe what’s happening, or search and call for immediate help.",
        "Get help fast",
        "Find the right trade",
        "Connect you locally",
        "One-tap to call",
        "No forms or sign-ups",
        "Built for emergencies",
        "Safety-first guidance",
        "Clear next steps",
        "Calm, helpful support",
        "Chat instead of searching",
        "Works on mobile",
        "24/7 availability",
        "Verified local trades",
        "Trusted professionals",
        "Faster response times",
        "No booking delays",
        "Direct contact only",
        "Knows what to do",
        "Knows what not to do",
        "Reduces stress",
        "Simple to use",
        "Easy navigation",
        "Local coverage",
        "Emergency focused",
        "Real people, real help",
        "Help when it matters",
        "Smart routing",
        "Clear, honest guidance",
        "Quick solutions",
        "Help in seconds"
    ];

    const [placeholderText, setPlaceholderText] = useState("");
    const [sentenceIndex, setSentenceIndex] = useState(0);
    const [charIndex, setCharIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (input.trim().length > 0) {
            return;
        }

        const currentSentence = helperSentences[sentenceIndex];
        const typingSpeed = isDeleting ? 30 : 80;
        const pauseAtEnd = 2000;

        const timer = setTimeout(() => {
            if (!isDeleting && charIndex < currentSentence.length) {
                setPlaceholderText(currentSentence.substring(0, charIndex + 1));
                setCharIndex(charIndex + 1);
            } else if (!isDeleting && charIndex === currentSentence.length) {
                setTimeout(() => setIsDeleting(true), pauseAtEnd);
            } else if (isDeleting && charIndex > 0) {
                setPlaceholderText(currentSentence.substring(0, charIndex - 1));
                setCharIndex(charIndex - 1);
            } else if (isDeleting && charIndex === 0) {
                setIsDeleting(false);
                setSentenceIndex((sentenceIndex + 1) % helperSentences.length);
            }
        }, typingSpeed);

        return () => clearTimeout(timer);
    }, [charIndex, isDeleting, sentenceIndex, input]);

    const controlsContent = (
        <>
            {/* Trade Selector */}
            <Select value={detectedTrade || ""} onValueChange={setDetectedTrade}>
                <SelectTrigger
                    className={`h-9 px-4 min-w-[140px] rounded-full border border-gold transition-all flex items-center justify-start gap-2 shadow-sm focus:ring-0 ${detectedTrade ? 'bg-gray-100 text-black dark:bg-white/10 dark:text-white hover:bg-gray-200 dark:hover:bg-white/20' : 'bg-gray-50 text-black dark:bg-white/5 dark:text-white/70 hover:bg-gray-100 dark:hover:bg-white/10'}`}
                >
                    <Wrench className="w-4 h-4 shrink-0 text-black dark:text-white" />
                    <SelectValue placeholder="Trade">
                        <span className="text-sm font-medium truncate">{detectedTrade ? trades.find(t => t.slug === detectedTrade)?.name : "Trade"}</span>
                    </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                    {trades.map((t) => (
                        <SelectItem
                            key={t.slug}
                            value={t.slug}
                            className="cursor-pointer hover:bg-gray-100 text-black"
                        >
                            {t.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* City Selector */}
            <Select value={detectedCity || ""} onValueChange={setDetectedCity}>
                <SelectTrigger
                    className={`h-9 px-4 min-w-[140px] rounded-full border border-gold transition-all flex items-center justify-start gap-2 shadow-sm focus:ring-0 ${detectedCity ? 'bg-gray-100 text-black dark:bg-white/10 dark:text-white hover:bg-gray-200 dark:hover:bg-white/20' : 'bg-gray-50 text-black dark:bg-white/5 dark:text-white/70 hover:bg-gray-100 dark:hover:bg-white/10'}`}
                >
                    <MapPin className="w-4 h-4 shrink-0 text-black dark:text-white" />
                    <SelectValue placeholder="City">
                        <span className="text-sm font-medium truncate">{detectedCity || "City"}</span>
                    </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                    {cities.map((c) => (
                        <SelectItem
                            key={c}
                            value={c}
                            className="cursor-pointer hover:bg-gray-100 text-black"
                        >
                            {c}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* Dynamic Action Button */}
            <Button
                onClick={() => {
                    if (isRequestingLocation) {
                        getLocation();
                        setIsRequestingLocation(false);
                    } else if (detectedTrade && detectedCity && !input.trim()) {
                        navigate(`/emergency-${detectedTrade}/${detectedCity.toLowerCase()}`);
                    } else {
                        handleUserMessage(input);
                    }
                }}
                disabled={(!input.trim() && !isRequestingLocation && !(detectedTrade && detectedCity)) || (isTyping && !isRequestingLocation)}
                size="icon"
                className={`h-9 w-9 shrink-0 rounded-full transition-all shadow-lg ${
                    // Pulse ONLY when we have everything and are ready to go (Final Step)
                    (detectedTrade && detectedCity && !input.trim())
                        ? 'bg-gold text-white animate-pulse ring-2 ring-gold/50 shadow-[0_0_15px_rgba(255,183,0,0.6)]'
                        : 'bg-gold text-white hover:bg-gold/90'}`}
                title={isRequestingLocation ? "Locate Me" : (detectedTrade && detectedCity && !input.trim() ? "Find Help Now" : "Send Message")}
            >
                {isRequestingLocation ? (
                    geoLoading ? <Zap className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />
                ) : (detectedTrade && detectedCity && !input.trim()) ? (
                    <Search className="w-4 h-4" />
                ) : (
                    <Send className="w-4 h-4" />
                )}
            </Button>
        </>
    );

    const resetChat = () => {
        setChatState({
            step: 'INITIAL',
            detectedTrade: null,
            detectedCity: null,
            history: []
        });
        setInput("");
        setDetectedTrade(null);
        setDetectedCity(null);
        setIsRequestingLocation(false);
    };

    return (
        <div className="w-full max-w-4xl mx-auto">
            {/* Mobile Controls - Above chat */}
            <div className="flex md:hidden flex-wrap justify-center gap-2 mb-4 px-2">
                {controlsContent}
            </div>

            <div className="relative rounded-3xl bg-transparent overflow-hidden">
                {chatState.history.length > 0 && (
                    <div className="absolute top-4 right-4 z-10">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={resetChat}
                            className="text-muted-foreground hover:text-foreground bg-background/50 backdrop-blur-sm hover:bg-background/80 rounded-full h-8 w-8 p-0"
                            title="Reset Chat"
                        >
                            <RotateCcw className="w-4 h-4" />
                        </Button>
                    </div>
                )}

                <div
                    ref={chatContainerRef}
                    className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[450px] scrollbar-hide pt-0"
                >
                    <AnimatePresence mode='popLayout'>
                        {chatState.history.map((msg, idx) => {
                            const isLastMessage = idx === chatState.history.length - 1;

                            return (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[85%] md:max-w-[70%] p-4 rounded-2xl text-lg leading-relaxed ${msg.role === 'user'
                                        ? 'bg-secondary text-secondary-foreground rounded-tr-sm'
                                        : 'text-foreground bg-transparent'
                                        }`}>
                                        {msg.role === 'assistant' && (
                                            <div className="flex gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold/80 to-gold/20 flex items-center justify-center shrink-0 shadow-lg">
                                                    <Zap className="w-4 h-4 text-white" />
                                                </div>
                                                <div className="pt-1 whitespace-pre-wrap">
                                                    {isLastMessage ? (
                                                        <TypewriterMessage
                                                            text={msg.content}
                                                            speed={15}
                                                            onType={() => scrollToBottom('auto')}
                                                        />
                                                    ) : (
                                                        msg.content
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                        {msg.role === 'user' && msg.content}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                    {isTyping && (
                        <div className="flex gap-3 p-4">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold/80 to-gold/20 flex items-center justify-center shrink-0 animate-pulse">
                                <Zap className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex gap-1 items-center pt-2">
                                <span className="w-2 h-2 bg-gold/50 rounded-full animate-bounce delay-0"></span>
                                <span className="w-2 h-2 bg-gold/50 rounded-full animate-bounce delay-150"></span>
                                <span className="w-2 h-2 bg-gold/50 rounded-full animate-bounce delay-300"></span>
                            </div>
                        </div>
                    )}
                    <div className="h-4" />
                </div>

                <div className="p-4 bg-transparent">
                    <div className="relative flex items-center w-full bg-white dark:bg-gradient-to-r dark:from-gray-900 dark:via-[#1a1a1a] dark:to-gray-900 rounded-xl border border-gold/50 shadow-[0_0_15px_rgba(215,160,66,0.15)] overflow-hidden transition-all duration-300 hover:shadow-[0_0_20px_rgba(215,160,66,0.25)] hover:border-gold/70 group">
                        <textarea
                            ref={inputRef as any}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleKeyDown(e);
                                }
                            }}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            placeholder={chatState.history.length === 0 ? (placeholderText || "Hi, how can we help?") : "Type your reply..."}
                            className="w-full bg-transparent border-none outline-none focus:outline-none focus:border-none h-40 px-8 py-6 text-lg focus:ring-0 focus-visible:ring-0 text-black dark:text-white placeholder:text-black dark:placeholder:text-white/50 resize-none"
                        />
                        <div className="absolute bottom-8 right-8 hidden md:flex items-center gap-2">
                            {controlsContent}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
