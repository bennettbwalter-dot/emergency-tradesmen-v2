import { useState, useRef, useEffect } from "react";
import { Send, MapPin, Zap, Phone, Car, RotateCcw, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { processUserMessage, ChatState, ChatMessage } from "@/lib/chat-logic";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useGeolocation } from "@/hooks/useGeolocation";
import { TypewriterMessage } from "./TypewriterMessage";
import { useChatbot } from "@/contexts/ChatbotContext";

export function EmergencyChatInterface() {
    const navigate = useNavigate();
    const { setDetectedTrade, setDetectedCity, setIsRequestingLocation } = useChatbot();
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [chatState, setChatState] = useState<ChatState>({
        step: 'INITIAL',
        detectedTrade: null,
        detectedCity: null,
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
            });

            setChatState(prev => ({
                ...newState,
                history: [...prev.history, userMsg, response]
            }));

            setDetectedTrade(newState.detectedTrade);
            setDetectedCity(newState.detectedCity);
            setIsRequestingLocation(newState.step === 'LOCATION_CHECK');

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

    const resetChat = () => {
        setChatState({
            step: 'INITIAL',
            detectedTrade: null,
            detectedCity: null,
            history: []
        });
        setInput("");
        setIsRequestingLocation(false);
    };

    return (
        <div className="w-full max-w-2xl mx-auto px-4">
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
                    <div className="relative group">

                        <div className="absolute -inset-0.5 bg-gradient-to-r from-gold/30 to-gold/10 rounded-full opacity-0 group-hover:opacity-100 transition duration-500 blur-md"></div>
                        <div className="relative flex items-center bg-secondary rounded-full transition-all shadow-lg overflow-hidden">
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                                placeholder={chatState.history.length === 0 ? (placeholderText || "Hi, how can we help?") : "Type your reply..."}
                                className="flex-1 bg-transparent border-none outline-none focus:outline-none focus:border-none h-12 px-5 text-base focus:ring-0 focus-visible:ring-0 placeholder:text-muted-foreground text-foreground"
                            />
                            <div className="pr-1.5">
                                <Button
                                    onClick={() => handleUserMessage(input)}
                                    disabled={!input.trim() || isTyping}
                                    size="icon"
                                    className="h-9 w-9 rounded-full bg-foreground text-background hover:bg-gold hover:text-white transition-all"
                                >
                                    <Send className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
