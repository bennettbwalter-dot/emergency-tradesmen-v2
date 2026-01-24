import { useState, useRef, useEffect } from "react";
import { Send, MapPin, Zap, Phone, Car, RotateCcw, Shield, Search, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { processUserMessage, ChatState, ChatMessage } from "@/lib/chat-logic";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useGeolocation } from "@/hooks/useGeolocation";
import { TypewriterMessage } from "./TypewriterMessage";
import { useChatbot } from "@/contexts/ChatbotContext";
import { trades, cities, usCities } from "@/lib/trades";
import { useLocalization } from "@/contexts/LocalizationContext";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    SelectGroup,
    SelectLabel,
} from "@/components/ui/select";
import { UK_CITY_GROUPS } from "@/lib/uk-city-grouping";

import { UKCityCombobox } from "@/components/UKCityCombobox";
import { HierarchicalLocationSelector } from "@/components/HierarchicalLocationSelector";
import { Terminal, TypingAnimation, AnimatedSpan } from "@/registry/magicui/terminal";
import { BorderBeam } from "@/components/magicui/BorderBeam";

export function EmergencyChatInterface() {
    const navigate = useNavigate();
    const { settings } = useLocalization();
    const { detectedTrade, detectedCity, setDetectedTrade, setDetectedCity, isRequestingLocation, setIsRequestingLocation } = useChatbot();
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [locationRecord, setLocationRecord] = useState<any>(null);
    const [chatState, setChatState] = useState<ChatState>({
        step: 'INITIAL',
        detectedTrade: null,
        history: []
    });

    const chatContainerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
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

        // Fixed: Ensure processUserMessage is awaited properly
        setTimeout(async () => {
            try {
                const { newState, response } = await processUserMessage(msgText, {
                    ...chatState,
                    detectedTrade: detectedTrade || chatState.detectedTrade,
                    detectedCity: detectedCity || chatState.detectedCity,
                }, settings.countryCode);

                setChatState(prev => ({
                    ...newState,
                    history: [...prev.history, response]
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
            } catch (error) {
                console.error("Error processing message:", error);
                setIsTyping(false);
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
        const typingSpeed = isDeleting ? 10 : 35; // Much faster typing (35ms) and deletion (10ms)
        const pauseAtEnd = 1500;

        const timer = setTimeout(() => {
            if (!isDeleting && charIndex < currentSentence.length) {
                setPlaceholderText(currentSentence.substring(0, charIndex + 1));
                setCharIndex(charIndex + 1);
            } else if (!isDeleting && charIndex === currentSentence.length) {
                setTimeout(() => setIsDeleting(true), pauseAtEnd);
            } else if (isDeleting) {
                // "Disappear" effect: Clear text immediately instead of backspacing character by character?
                // User said "disappear and start with a new sentence". 
                // Let's clear immediately.
                setPlaceholderText("");
                setCharIndex(0);
                setIsDeleting(false);
                setSentenceIndex((sentenceIndex + 1) % helperSentences.length);
            }
        }, typingSpeed);

        return () => clearTimeout(timer);
    }, [charIndex, isDeleting, sentenceIndex, input]);

    const handleActionClick = () => {
        if (isRequestingLocation) {
            getLocation();
            setIsRequestingLocation(false);
        } else if (detectedTrade && (detectedCity || locationRecord) && !input.trim()) {
            const countryPrefix = settings.countryCode === 'US' ? '/us' : '';

            if (locationRecord && locationRecord.path_slugs) {
                const { state, metro, city, suburb } = locationRecord.path_slugs;
                const hasSuburb = suburb && suburb.trim().length > 0;
                const newPath = hasSuburb
                    ? `/us/${state}/${metro}/${city}/${suburb}/emergency-${detectedTrade}`
                    : `/us/${state}/${metro}/${city}/emergency-${detectedTrade}`;
                navigate(newPath);
            } else {
                navigate(`${countryPrefix}/emergency-${detectedTrade}/${(detectedCity || '').toLowerCase()}`);
            }
        } else {
            handleUserMessage(input);
        }
    };

    const isActionDisabled = (!input.trim() && !isRequestingLocation && !(detectedTrade && detectedCity)) || (isTyping && !isRequestingLocation);

    const tradeSelector = (
        <Select value={detectedTrade || ""} onValueChange={setDetectedTrade}>
            <SelectTrigger
                className={`h-11 px-4 min-w-[100px] flex-1 w-full rounded-full border border-gold/50 transition-all flex items-center justify-between gap-2 shadow-sm focus:ring-0 ${detectedTrade ? 'bg-white/80 text-black dark:bg-black/40 dark:text-white hover:bg-gold/10 hover:border-gold' : 'bg-white/80 text-foreground dark:bg-black/40 dark:text-white/70 hover:bg-gold/10 hover:border-gold'}`}
            >
                <div className="flex items-center gap-2 truncate">
                    <Wrench className="w-4 h-4 shrink-0 text-gold" />
                    <SelectValue placeholder="Trade">
                        <span className="text-sm font-medium truncate block">
                            {detectedTrade ? (settings.countryCode === 'US' ? (trades.find(t => t.slug === detectedTrade) as any)?.usName : trades.find(t => t.slug === detectedTrade)?.name) : "Trade"}
                        </span>
                    </SelectValue>
                </div>
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-200">
                {trades.map((t) => (
                    <SelectItem
                        key={t.slug}
                        value={t.slug}
                        className="cursor-pointer hover:bg-gray-100 text-black"
                    >
                        {settings.countryCode === 'US' ? (t as any).usName : t.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );

    const locationSelector = settings.countryCode === 'US' ? (
        <HierarchicalLocationSelector
            className="flex-1"
            placeholder="City, State"
            onLocationSelect={(record) => {
                console.log("Loc Selected", record);
                setDetectedCity(record.name);
            }}
        />
    ) : (
        <UKCityCombobox
            className="flex-1 h-11"
            placeholder="Select City"
            value={detectedCity || ""}
            onValueChange={setDetectedCity}
        />
    );

    const actionButton = (
        <Button
            onClick={handleActionClick}
            disabled={isActionDisabled}
            size="icon"
            className={`h-11 w-11 shrink-0 rounded-full transition-all shadow-lg ${(detectedTrade && detectedCity && !input.trim())
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
    );

    const mobileActionButton = (
        <Button
            onClick={handleActionClick}
            disabled={isActionDisabled}
            className={`h-11 w-full flex-1 rounded-full transition-all shadow-lg font-bold uppercase tracking-wider text-[10px] px-1 ${(detectedTrade && detectedCity && !input.trim())
                ? 'bg-gold text-white animate-pulse ring-2 ring-gold/50 shadow-[0_0_15px_rgba(255,183,0,0.6)]'
                : 'bg-gold text-white hover:bg-gold/90'}`}
        >
            {isRequestingLocation ? (
                <MapPin className="w-4 h-4" />
            ) : (detectedTrade && detectedCity && !input.trim()) ? (
                <Search className="w-4 h-4" />
            ) : (
                <Send className="w-4 h-4" />
            )}
        </Button>
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

                            if (msg.role === 'assistant') {
                                return (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="w-full flex justify-start my-4"
                                    >
                                        <Terminal className="w-full max-w-2xl mx-auto shadow-2xl border-gold/20">
                                            <AnimatedSpan className="text-green-500 mb-2">
                                                <span>✔ System initialized.</span>
                                            </AnimatedSpan>

                                            <div className="text-muted-foreground">
                                                <span className="mr-2 text-gold">➜</span>
                                                <span className="text-foreground">
                                                    {isLastMessage ? (
                                                        <TypingAnimation
                                                            duration={15}
                                                            className="text-base md:text-lg font-mono"
                                                        >
                                                            {msg.content}
                                                        </TypingAnimation>
                                                    ) : (
                                                        <span className="text-base md:text-lg font-mono">
                                                            {msg.content}
                                                        </span>
                                                    )}
                                                </span>
                                            </div>

                                            {isLastMessage && (
                                                <AnimatedSpan delay={msg.content.length * 15 + 500} className="text-blue-500 mt-4">
                                                    <span>ℹ Waiting for user action...</span>
                                                </AnimatedSpan>
                                            )}
                                        </Terminal>
                                    </motion.div>
                                );
                            }

                            return (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex justify-end"
                                >
                                    <div className="max-w-[90%] md:max-w-[70%] p-3 rounded-xl text-base md:text-lg leading-relaxed shadow-sm bg-secondary text-secondary-foreground rounded-tr-sm">
                                        {msg.content}
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

                {/* MODIFIED: Flex Column Layout for Input Area */}
                <div className="p-4 bg-transparent">
                    <div className="relative flex flex-col w-full bg-white dark:bg-gradient-to-r dark:from-gray-900 dark:via-[#1a1a1a] dark:to-gray-900 rounded-xl border border-gold/50 shadow-[0_0_15px_rgba(215,160,66,0.15)] overflow-hidden transition-all duration-300 hover:shadow-[0_0_20px_rgba(215,160,66,0.25)] hover:border-gold/70 group">
                        <textarea
                            ref={inputRef}
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
                            className="w-full bg-transparent border-none outline-none focus:outline-none focus:border-none min-h-[180px] md:min-h-[100px] px-4 md:px-8 py-4 md:py-6 text-base md:text-lg focus:ring-0 focus-visible:ring-0 text-black dark:text-white placeholder:text-black dark:placeholder:text-white/50 resize-y"
                        />

                        <div className="hidden md:grid grid-cols-[1fr_1fr_auto] items-center gap-2 px-8 pb-4 bg-transparent w-full">
                            {tradeSelector}
                            {locationSelector}
                            {actionButton}
                        </div>
                        <BorderBeam duration={8} size={100} />
                    </div>
                </div>
            </div>

            {/* Mobile Controls - Below chat - Optimized Layout */}
            <div className="flex flex-col md:hidden w-full gap-3 mt-4 mb-4">
                {/* Row 1: Trade and City - Side by Side, Perfectly Centered, Equal Widths */}
                <div className="flex flex-row w-full px-4 flex-nowrap items-center justify-center gap-3">
                    <div className="flex-1 min-w-0">
                        {tradeSelector}
                    </div>
                    <div className="flex-1 min-w-0">
                        {locationSelector}
                    </div>
                </div>

                {/* Row 2: Button - Centered below, aligned with message box */}
                <div className="flex w-full px-4 items-center justify-center">
                    <div className="w-full">
                        {mobileActionButton}
                    </div>
                </div>
            </div>
        </div>
    );
}
        </div >
    );
}
