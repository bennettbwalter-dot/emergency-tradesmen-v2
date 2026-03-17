import { useState, useRef, useEffect } from "react";
import { Send, MapPin, Zap, Phone, Car, RotateCcw, Shield, Search, Wrench, Mic, MicOff, Loader2, ChevronsUpDown, Navigation, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { processUserMessage, ChatState, ChatMessage } from "@/lib/chat-logic";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { MarkdownTypewriter } from "./MarkdownTypewriter";
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
import { useWhisper } from "@/hooks/useWhisper";
import { toast } from "sonner";
import WhisperWaveform from "@/components/VoiceAssistant/WhisperWaveform";
import { AzureVoiceService } from "@/services/azureVoiceService";
import { SVGButton } from "./VoiceAssistant/SVGButton";
import { RedSVGButton } from "./VoiceAssistant/RedSVGButton";
import { GreenSVGButton } from "./VoiceAssistant/GreenSVGButton";
import { YellowSVGButton } from "./VoiceAssistant/YellowSVGButton";
import { PurpleSVGButton } from "./VoiceAssistant/PurpleSVGButton";


export function EmergencyChatInterface() {
    const navigate = useNavigate();
    const { city: urlCity } = useParams();
    const { settings } = useLocalization();
    const { detectedTrade, detectedCity, setDetectedTrade, setDetectedCity, isRequestingLocation, setIsRequestingLocation } = useChatbot();
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [locationRecord, setLocationRecord] = useState<any>(null);
    const [chatState, setChatState] = useState<ChatState>({
        step: 'INITIAL',
        detectedTrade: null,
        detectedCity: null,
        suggestedCity: null,
        locationConfirmed: false,
        history: []
    });

    const chatContainerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const chatStateRef = useRef<ChatState>(chatState);
    const [isAtBottom, setIsAtBottom] = useState(true);
    const handleUserMessageRef = useRef<(msg: string, isVoice?: boolean) => void>(() => { });

    // Track whether we're in a voice conversation so follow-ups auto-record
    const isVoiceSessionRef = useRef(false);

    // Refs for values used inside handleUserMessage's setTimeout
    // This ensures voice follow-ups always read fresh state, not stale closures
    const detectedTradeRef = useRef(detectedTrade);
    const detectedCityRef = useRef(detectedCity);
    const settingsRef = useRef(settings);

    // Keep ALL refs in sync - updated both synchronously in handlers AND via useEffect for safety
    useEffect(() => { chatStateRef.current = chatState; }, [chatState]);
    useEffect(() => { detectedTradeRef.current = detectedTrade; }, [detectedTrade]);
    useEffect(() => { detectedCityRef.current = detectedCity; }, [detectedCity]);
    useEffect(() => { settingsRef.current = settings; }, [settings]);

    const {
        detectUserLocation,
        userCoords,
        detectedCity: geoCity,
        isLocating: geoLoading,
        geoError
    } = useLocalization();

    const {
        isRecording,
        isProcessing: isTranscriptionProcessing,
        transcription,
        error: whisperError,
        startRecording,
        stopRecording,
        getAudioLevel,
        resetTranscription,
        status: whisperStatus
    } = useWhisper();

    const [voiceService] = useState(() => new AzureVoiceService());

    // Toast whisper errors
    useEffect(() => {
        if (whisperError) {
            console.error('[EmergencyChatInterface] Whisper Error:', whisperError);
            toast.error(`Voice error: ${whisperError}`);
        }
    }, [whisperError]);

    // Audio data for waveform visualization
    const [audioData, setAudioData] = useState<number[]>(new Array(120).fill(0));
    const audioIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const startVolumeMonitor = () => {
        if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
        audioIntervalRef.current = setInterval(() => {
            const vol = getAudioLevel();
            setAudioData(prev => [...prev.slice(1), vol]);
        }, 80);
    };

    const stopVolumeMonitor = () => {
        if (audioIntervalRef.current) {
            clearInterval(audioIntervalRef.current);
            audioIntervalRef.current = null;
        }
    };

    // Auto-restart recording for voice follow-ups
    const restartRecordingForVoice = async () => {
        if (!isVoiceSessionRef.current) return;
        try {
            console.log('[Voice] Auto-restarting mic for follow-up question...');
            await startRecording();
            startVolumeMonitor();
            toast.success("Listening — speak your answer.", { id: 'stt-status', duration: 3000 });
        } catch (err) {
            console.error('[Voice] Failed to auto-restart recording:', err);
            isVoiceSessionRef.current = false;
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopVolumeMonitor();
            isVoiceSessionRef.current = false;
        };
    }, []);

    // Handle transcription from Whisper
    // CRITICAL: Use ref to avoid stale closure — without this, follow-up voice
    // responses (e.g. stating location after trade was detected) would use the
    // old handleUserMessage with stale chatState/detectedTrade/detectedCity.
    useEffect(() => {
        if (transcription) {
            console.log(`[STT] New transcription received: "${transcription}"`);
            console.log(`[STT] Current chatState step: ${chatStateRef.current.step}, trade: ${chatStateRef.current.detectedTrade}, city: ${chatStateRef.current.detectedCity}`);
            console.log(`[STT] Context trade: ${detectedTradeRef.current}, city: ${detectedCityRef.current}`);
            // Mark this as a voice session so we auto-restart after TTS
            isVoiceSessionRef.current = true;
            handleUserMessageRef.current(transcription, true);
            resetTranscription();
            // Don't stop volume monitor here — it'll be stopped when recording stops
            // and restarted after TTS finishes
        }
    }, [transcription]);

    // Handle Whisper errors
    useEffect(() => {
        if (whisperError) {
            toast.error(whisperError);
        }
    }, [whisperError]);

    // Real-time audio visualization when recording
    useEffect(() => {
        if (isRecording) {
            audioIntervalRef.current = setInterval(() => {
                const level = getAudioLevel();
                setAudioData(prev => {
                    const newData = [...prev.slice(1)];
                    newData.push(level);
                    return newData;
                });
            }, 50); // 50ms for smoother updates
        } else {
            if (audioIntervalRef.current) {
                clearInterval(audioIntervalRef.current);
            }
            // Reset audio data when not recording
            setAudioData(new Array(50).fill(0));
        }
        return () => {
            if (audioIntervalRef.current) {
                clearInterval(audioIntervalRef.current);
            }
        };
    }, [isRecording, getAudioLevel]);

    const handleScroll = () => {
        if (chatContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
            // threshold of 50px from the bottom for better momentum support
            const atBottom = scrollHeight - scrollTop - clientHeight < 50;
            setIsAtBottom(atBottom);
        }
    };

    const scrollToBottom = (behavior: ScrollBehavior = 'smooth', force: boolean = false) => {
        if (chatContainerRef.current && (isAtBottom || force)) {
            const { scrollHeight, clientHeight } = chatContainerRef.current;
            chatContainerRef.current.scrollTo({
                top: scrollHeight - clientHeight,
                behavior
            });
        }
    };

    useEffect(() => {
        scrollToBottom('smooth', true);
        // Extra scroll after a small delay to ensure rendering is complete
        const timer = setTimeout(() => scrollToBottom('smooth', true), 100);
        return () => clearTimeout(timer);
    }, [chatState.history]);

    // Removed aggressive setInterval to allow user to scroll up while typing
    // We rely on MarkdownTypewriter's onTick and history updates now.

    // Removed silent sync to prevent premature button flashing.
    // The city will now only be "detected" in the UI if the user selects it or clicks Locate Me.

    const [wasLocating, setWasLocating] = useState(false);

    // Sync with URL City if on TradeCityPage
    useEffect(() => {
        if (urlCity) {
            const formattedCity = urlCity.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            if (formattedCity !== detectedCity) {
                setDetectedCity(formattedCity);
                console.log(`[EmergencyChatInterface] Syncing detectedCity from URL: ${formattedCity}`);
            }
        }
    }, [urlCity]);

    // Sync isRequestingLocation based on selection state
    useEffect(() => {
        // If we have a trade but no city, offer "Locate Me"
        if (detectedTrade && !detectedCity) {
            setIsRequestingLocation(true);
        } else {
            setIsRequestingLocation(false);
        }
    }, [detectedTrade, detectedCity, setIsRequestingLocation]);

    // Sync geo location ONLY when manually requested via the Pin button
    useEffect(() => {
        if (wasLocating && !geoLoading && geoCity && !detectedCity) {
            setDetectedCity(geoCity);
        }
        setWasLocating(geoLoading);
    }, [geoLoading, geoCity, detectedCity, wasLocating, setDetectedCity]);

    const handleUserMessage = async (msgText: string, isVoice: boolean = false) => {
        if (!msgText.trim()) {
            console.warn('[EmergencyChatInterface] handleUserMessage called with empty text');
            return;
        }

        console.log(`[EmergencyChatInterface] handleUserMessage: "${msgText}" (isVoice: ${isVoice})`);

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: msgText
        };

        // Update state and ref IMMEDIATELY to avoid race conditions
        const stagedState: ChatState = {
            ...chatStateRef.current,
            history: [...chatStateRef.current.history, userMsg]
        };
        setChatState(stagedState);
        chatStateRef.current = stagedState;

        setInput("");
        setIsTyping(true);

        // Voice is snappier, Text has a slight "typing" feel
        const processingDelay = isVoice ? 50 : 800;

        // Diagnostic: Show what was heard via voice
        if (isVoice) {
            isVoiceSessionRef.current = true;
            toast.info(`Voice: "${msgText}"`, { duration: 2500 });
        }

        // Safety timeout to ensure mic is never stuck disabled
        const safetyRef = setTimeout(() => {
            setIsTyping(false);
        }, 12000);

        setTimeout(async () => {
            try {
                // Read absolute freshest values
                const currentFreshState = chatStateRef.current;
                const freshTrade = detectedTradeRef.current;
                const freshCity = detectedCityRef.current;
                const freshCountryCode = settingsRef.current.countryCode;

                console.log(`[handleUserMessage] Processing "${msgText}" with state:`, {
                    step: currentFreshState.step,
                    stateTrade: currentFreshState.detectedTrade,
                    contextTrade: freshTrade,
                    countryCode: freshCountryCode
                });

                const { newState, response } = await processUserMessage(msgText, {
                    ...currentFreshState,
                    detectedTrade: freshTrade || currentFreshState.detectedTrade,
                    detectedCity: freshCity || currentFreshState.detectedCity,
                }, freshCountryCode);

                const finalState = {
                    ...newState,
                    history: [...chatStateRef.current.history, response]
                };

                // Update ALL states and refs synchronously
                setChatState(finalState);
                chatStateRef.current = finalState;

                if (newState.detectedTrade !== undefined) {
                    setDetectedTrade(newState.detectedTrade);
                    detectedTradeRef.current = newState.detectedTrade;
                }
                if (newState.detectedCity !== undefined) {
                    setDetectedCity(newState.detectedCity);
                    detectedCityRef.current = newState.detectedCity;
                }

                // Speak back if it's a voice interaction
                if (isVoice) {
                    try {
                        voiceService.unlockAudioContext();
                        await voiceService.speak(response.content, freshCountryCode);
                    } catch (speakError) {
                        console.error("[EmergencyChatInterface] Voice playback failed (likely browser policy), continuing flow.", speakError);
                    }
                }

                setIsRequestingLocation(newState.step === 'LOCATION_CHECK' && !newState.detectedCity && !newState.suggestedCity);
                clearTimeout(safetyRef);
                setIsTyping(false);

                if (response.action === 'navigate' && response.target) {
                    // Navigating away — end voice session
                    isVoiceSessionRef.current = false;
                    const navDelay = isVoice ? 1000 : (1000 + (response.content.length * 10));
                    console.log(`[handleUserMessage] Navigating in ${navDelay}ms to: ${response.target}`);
                    setTimeout(() => {
                        navigate(response.target!);
                    }, navDelay);
                } else if (isVoice) {
                    // Not navigating — auto-restart mic for voice follow-up
                    // Small delay to let TTS audio finish cleanly
                    setTimeout(() => {
                        restartRecordingForVoice();
                    }, 500);
                }
            } catch (error) {
                console.error("Error processing message:", error);
                clearTimeout(safetyRef);
                setIsTyping(false);
            }
        }, processingDelay);
    };

    // Keep the ref in sync so the transcription useEffect always calls the latest version
    handleUserMessageRef.current = handleUserMessage;

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
            detectUserLocation();
            setIsRequestingLocation(false);
        } else if (detectedTrade && (detectedCity || locationRecord) && !input.trim()) {
            if (locationRecord && locationRecord.path_slugs) {
                const { state, metro, city, suburb } = locationRecord.path_slugs;
                const hasSuburb = suburb && suburb.trim().length > 0;
                // US Redirection Fix: Never use /us prefix.
                const newPath = hasSuburb
                    ? `/${state}/${metro}/${city}/${suburb}/emergency-${detectedTrade}`
                    : `/${state}/${metro}/${city}/emergency-${detectedTrade}`;
                navigate(newPath);
            } else {
                navigate(`/emergency-${detectedTrade}/${(detectedCity || '').toLowerCase()}`);
            }
        } else {
            handleUserMessage(input);
        }
    };

    const isActionDisabled = (!input.trim() && !isRequestingLocation && !(detectedTrade && (detectedCity || locationRecord))) || (isTyping && !isRequestingLocation);
    const tradeSelectorContent = (
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
    );

    const [hasStateSelected, setHasStateSelected] = useState(false);

    const tradeSelector = (
        <Select 
            value={detectedTrade || ""} 
            onValueChange={setDetectedTrade}
        >
            <SelectTrigger
                data-tour="tour-trade-button"
                className={`h-12 md:h-11 w-full md:max-w-none md:w-full rounded-full border border-orange-200 dark:border-gold/20 md:border-orange-300 dark:md:border-gold/50 transition-all flex items-center justify-center md:justify-between px-0 md:px-3 shadow-[0_0_30px_rgba(255,165,0,0.1)] md:shadow-sm focus:ring-0 overflow-visible [&>*:last-child]:hidden md:[&>*:last-child]:flex ${detectedTrade ? 'bg-orange-50 dark:bg-white text-orange-700 dark:text-[#9B7D4F] hover:bg-orange-100 dark:hover:bg-gold/5' : 'bg-white text-[#9B7D4F]/70 hover:bg-gold/5'}`}
            >
                <div className="flex items-center justify-center md:justify-start md:gap-2 w-full md:w-auto">
                    <User className="w-5 h-5 md:w-4 md:h-4 shrink-0 text-orange-600 dark:text-[#9B7D4F]" />
                    <div className="hidden md:block min-w-0 overflow-hidden">
                        <SelectValue placeholder="Trade">
                            <span className="text-sm font-medium truncate block max-w-[180px]">
                                {detectedTrade ? (settings.countryCode === 'US' ? (trades.find(t => t.slug === detectedTrade) as any)?.usName : trades.find(t => t.slug === detectedTrade)?.name) : "Trade"}
                            </span>
                        </SelectValue>
                    </div>
                </div>
                <div className="hidden md:block shrink-0">
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </div>
            </SelectTrigger>
            {tradeSelectorContent}
        </Select>
    );

    const locationSelector = (
        <div data-tour="tour-location-button" className="w-full min-w-0 overflow-visible">
            {settings.countryCode === 'US' ? (
                (isVoiceSessionRef.current && detectedCity) ? (
                    <div className="w-full h-12 md:h-12 flex items-center justify-center rounded-full border border-emerald-200 dark:border-gold/20 md:border-emerald-300 dark:md:border-gold/50 bg-white shadow-[0_0_30px_rgba(16,185,129,0.15)] md:shadow-sm overflow-visible">
                        <MapPin className="w-5 h-5 md:w-5 md:h-5 shrink-0 text-emerald-600 dark:text-[#9B7D4F]" />
                        <span className="hidden md:block text-sm font-medium text-foreground dark:text-white truncate block min-w-0">
                            {detectedCity}
                        </span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="ml-auto w-6 h-6 shrink-0 hover:bg-red-500/20 text-red-500 rounded-full"
                            onClick={(e) => {
                                e.stopPropagation();
                                setDetectedCity(null);
                                setLocationRecord(null);
                                setHasStateSelected(false);
                                isVoiceSessionRef.current = false;
                            }}
                        >
                            <span className="sr-only">Clear area</span>
                            &times;
                        </Button>
                    </div>
                ) : (
                    <HierarchicalLocationSelector
                        className="w-full md:max-w-none md:w-full h-12 md:h-11 shadow-[0_0_30px_rgba(16,185,129,0.15)] md:shadow-none bg-white border-emerald-200 md:border-emerald-300 rounded-full"
                        placeholder="City, State"
                        onStateSelected={(state) => setHasStateSelected(!!state)}
                        onLocationSelect={(record) => {
                            console.log("Loc Selected", record);
                            setDetectedCity(record.name);
                            setLocationRecord(record);
                        }}
                    />
                )
            ) : (
                <UKCityCombobox
                    className="w-full md:max-w-none md:w-full h-12 md:h-11 shadow-[0_0_30px_rgba(16,185,129,0.15)] md:shadow-none bg-white border-emerald-200 md:border-emerald-300 rounded-full"
                    placeholder="Select City"
                    value={detectedCity || ""}
                    onValueChange={setDetectedCity}
                />
            )}
        </div>
    );

    const handleMicToggle = async () => {
        if (isRecording) {
            toast.info("Processing voice...", { id: 'stt-status', duration: 2000 });
            stopRecording();
            stopVolumeMonitor();
        } else {
            voiceService.unlockAudioContext();
            try {
                await startRecording();
                startVolumeMonitor();
                toast.success("Microphone active. Speak now.", { id: 'stt-status', duration: 3000 });
            } catch (err) {
                toast.error("Microphone access denied or failed.");
                console.error("[Mic] Error:", err);
            }
        }
    };

    const micButton = (
        <Button
            onClick={handleMicToggle}
            data-tour="tour-mic-button"
            disabled={isTranscriptionProcessing || isTyping}
            size="icon"
            className={`h-12 w-12 md:h-11 md:w-11 shrink-0 rounded-full transition-all shadow-md md:shadow-lg overflow-visible ${isRecording
                ? 'bg-red-500 hover:bg-red-600 animate-pulse ring-2 ring-red-400/50'
                : isTranscriptionProcessing
                    ? 'bg-gold/50 cursor-not-allowed'
                    : 'bg-[#E0F2FE] dark:bg-[#FDF5E6] hover:bg-[#BAE6FD] dark:hover:bg-[#F5ECD7] text-[#0284C7] dark:text-[#9B7D4F] border border-blue-200 dark:border-gold/10'}`}
            title={isRecording ? "Stop Recording" : (isTranscriptionProcessing ? `Processing... (${whisperStatus})` : `Record Message (${whisperStatus})`)}
        >
            {isTranscriptionProcessing ? (
                <Loader2 className="w-5 h-5 md:w-4 md:h-4 animate-spin" />
            ) : isRecording ? (
                <MicOff className="w-5 h-5 md:w-4 md:h-4" />
            ) : (
                <Mic className="w-5 h-5 md:w-4 md:h-4" />
            )}
        </Button>
    );

    const isFlowComplete = !!(detectedTrade && (detectedCity || locationRecord));
    const shouldFlash = isFlowComplete;

    const actionButton = (
        <Button
            onClick={handleActionClick}
            disabled={isActionDisabled}
            data-tour="tour-locate-button"
            size="icon"
            className={`h-11 w-11 shrink-0 rounded-full transition-all shadow-lg ${shouldFlash
                ? 'animate-glow-bottom ring-4 ring-yellow-400/80'
                : 'bg-gold text-white hover:bg-gold/90'}`}
            title={isRequestingLocation ? "Locate Me" : (isFlowComplete ? "Find Help Now" : "Send Message")}
        >
            {isRequestingLocation ? (
                geoLoading ? <Zap className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />
            ) : isFlowComplete ? (
                <Search className="w-4 h-4" />
            ) : (
                <Search className="w-4 h-4" />
            )}
        </Button>
    );

    const mobileActionButton = (
        <Button
            onClick={handleActionClick}
            disabled={isActionDisabled}
            data-tour="tour-locate-button"
            size="icon"
            className={`h-12 w-12 rounded-full transition-all shadow-md md:shadow-lg flex items-center justify-center shrink-0 ${shouldFlash
                ? 'animate-glow-bottom ring-4 ring-yellow-400/80'
                : 'bg-[#C2B280] text-white hover:bg-[#B5A574]'}`}
        >
            {isRequestingLocation ? (
                <MapPin className="w-5 h-5" />
            ) : isFlowComplete ? (
                <Search className="w-5 h-5" />
            ) : (
                <Search className="w-5 h-5" />
            )}
        </Button>
    );

    const resetChat = () => {
        setChatState({
            step: 'INITIAL',
            detectedTrade: null,
            detectedCity: null,
            suggestedCity: null,
            locationConfirmed: false,
            history: []
        });
        setInput("");
        isVoiceSessionRef.current = false;
        setDetectedTrade(null);
        setDetectedCity(null);
        setIsRequestingLocation(false);
    };

    return (
        <div className="w-full max-w-4xl mx-auto">

            <div className="relative rounded-3xl bg-transparent overflow-visible">
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

                <div className="flex-1 w-full flex flex-col justify-start">
                    <AnimatePresence mode='popLayout'>
                        {chatState.history.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, filter: 'blur(5px)' }}
                                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                                className="w-full my-2 md:my-4"
                            >
                                <Terminal 
                                    containerRef={chatContainerRef}
                                    onScroll={handleScroll}
                                    className="w-full max-w-2xl mx-auto shadow-[0_0_30px_rgba(215,160,66,0.15)] border-gold/30 bg-black/80 backdrop-blur-xl ring-1 ring-white/10 overflow-hidden h-[60vh] md:h-[80vh]"
                                    contentClassName="overscroll-contain pb-32"
                                >
                                    <AnimatedSpan className="text-emerald-400 mb-6 font-bold tracking-wider text-xs uppercase opacity-80">
                                        <span>✓ System initialized</span>
                                    </AnimatedSpan>

                                    <div className="space-y-4 md:space-y-6">
                                        {chatState.history.map((msg, idx) => {
                                            const isLastMessage = idx === chatState.history.length - 1;

                                            if (msg.role === 'assistant') {
                                                return (
                                                    <div key={msg.id} className="text-muted-foreground/80 flex gap-3 group">
                                                        <div className="shrink-0 pt-1">
                                                            <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center ring-1 ring-gold/30">
                                                                <Zap className="w-4 h-4 text-gold" />
                                                            </div>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            {isLastMessage ? (
                                                                <MarkdownTypewriter
                                                                    content={msg.content}
                                                                    speed={4}
                                                                    interval={12}
                                                                    onTick={() => {
                                                                        if (isAtBottom) scrollToBottom('auto');
                                                                    }}
                                                                    onComplete={() => {
                                                                        if (isAtBottom) scrollToBottom('smooth');
                                                                    }}
                                                                    className="prose prose-invert prose-emerald max-w-none prose-xs md:prose-sm lg:prose-base prose-p:leading-snug prose-p:mb-2 md:prose-p:mb-3 prose-headings:mb-1 prose-headings:mt-3 md:prose-headings:mt-5 first:prose-headings:mt-0 prose-li:my-0 prose-ul:my-1 prose-strong:text-white"
                                                                />
                                                            ) : (
                                                                <div className="prose prose-invert prose-emerald max-w-none prose-xs md:prose-sm lg:prose-base prose-p:leading-snug prose-p:mb-2 md:prose-p:mb-3 prose-headings:mb-1 prose-headings:mt-3 md:prose-headings:mt-5 first:prose-headings:mt-0 prose-li:my-0 prose-ul:my-1 prose-strong:text-white">
                                                                    <ReactMarkdown
                                                                        remarkPlugins={[remarkGfm]}
                                                                        rehypePlugins={[rehypeRaw]}
                                                                    >
                                                                        {msg.content}
                                                                    </ReactMarkdown>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            }

                                            return (
                                                <div
                                                    key={msg.id}
                                                    className="flex justify-end"
                                                >
                                                    <div className="max-w-[90%] p-2.5 md:p-3 rounded-2xl text-sm md:text-base leading-relaxed bg-white/10 border border-white/5 text-white/90 rounded-tr-sm">
                                                        {msg.content}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {chatState.history[chatState.history.length - 1].role === 'assistant' && (
                                        <AnimatedSpan delay={chatState.history[chatState.history.length - 1].content.length * 15 + 800} className="text-gold/80 mt-8 text-xs uppercase tracking-widest flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 bg-gold rounded-full animate-pulse" />
                                            <span>Waiting for user input...</span>
                                        </AnimatedSpan>
                                    )}
                                </Terminal>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    {isTyping && !chatState.history.length && (
                        <div className="flex gap-3 p-4">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold/80 to-gold/20 flex items-center justify-center shrink-0 animate-pulse ring-4 ring-gold/10">
                                <Zap className="w-4 h-4 text-white drop-shadow-md" />
                            </div>
                            <div className="flex gap-1.5 items-center pt-2">
                                <span className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce delay-0 shadow-[0_0_10px_orange]"></span>
                                <span className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce delay-150 shadow-[0_0_10px_orange]"></span>
                                <span className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce delay-300 shadow-[0_0_10px_orange]"></span>
                            </div>
                        </div>
                    )}
                </div>

                {/* INPUT CARD - Fixed structure: textarea slot + controls always at bottom */}
                <div className="w-full bg-transparent flex justify-center pt-2 pb-4">
                    <div className={`relative flex flex-col w-[95%] md:w-[90%] bg-white/5 dark:bg-[#0a0a0a]/90 backdrop-blur-2xl rounded-2xl border overflow-hidden group
                        ${isFocused
                            ? 'border-gold/80 shadow-[0_0_40px_rgba(215,160,66,0.3)] ring-1 ring-gold/30'
                            : 'border-gold/30 shadow-[0_0_20px_rgba(0,0,0,0.4)] hover:border-gold/50'}`}>

                        {/* TEXTAREA / WAVEFORM SLOT - Fixed height so controls never move */}
                        <div className="w-full" style={{ minHeight: '80px' }}>
                            {isRecording ? (
                                <div className="w-full h-full flex items-center justify-center px-3 py-3 bg-gradient-to-r from-red-500/5 via-transparent to-red-500/5" style={{ minHeight: '80px' }}>
                                    <WhisperWaveform
                                        audioData={audioData}
                                        isRecording={isRecording}
                                        isProcessing={isTranscriptionProcessing}
                                        transcript={transcription}
                                        onConfirm={() => {
                                            stopRecording();
                                            stopVolumeMonitor();
                                        }}
                                        onCancel={() => {
                                            stopRecording();
                                            stopVolumeMonitor();
                                            setAudioData(new Array(120).fill(0));
                                        }}
                                    />
                                </div>
                            ) : (
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
                                    data-tour="tour-chat-input"
                                    className="w-full bg-transparent border-none outline-none focus:outline-none focus:border-none px-4 md:px-8 py-4 md:py-6 text-base md:text-2xl focus:ring-0 focus-visible:ring-0 text-black dark:text-white placeholder:text-black dark:placeholder:text-white resize-none font-light tracking-wide"
                                    style={{ minHeight: '80px' }}
                                />
                            )}
                        </div>

                        {/* CONTROLS ROW - Always pinned at bottom, never moves */}
                        <div className="w-full flex-shrink-0 bg-transparent">
                            {/* Desktop Controls - STRICT GRID */}
                            <div className="hidden md:grid px-4 pb-4 pt-2 bg-transparent w-full items-center" style={{ gridTemplateColumns: '1fr 1fr 44px 44px', gap: '8px' }}>
                                <div className="min-w-0 overflow-hidden">
                                    {tradeSelector}
                                </div>
                                <div className="min-w-0 overflow-hidden">
                                    {locationSelector}
                                </div>
                                <div className="w-[44px] h-[44px] flex items-center justify-center flex-shrink-0">
                                    {micButton}
                                </div>
                                <div className="w-[44px] h-[44px] flex items-center justify-center flex-shrink-0">
                                    {actionButton}
                                </div>
                            </div>
                        </div>

                        <BorderBeam duration={8} size={100} />
                    </div>
                </div>
            </div>

            {/* Mobile Controls - SVG Buttons */}
            <div className="md:hidden w-full mt-2 mb-14 px-1 overflow-visible">
                <div className="flex flex-row items-center justify-center w-full overflow-visible gap-1 max-w-[420px] mx-auto">
                    <div className="flex flex-col items-center flex-shrink-0">
                        <div className="hidden">{micButton}</div>
                        <SVGButton 
                            index={0} 
                            onClick={handleMicToggle}
                            isRecording={isRecording}
                            isTranscriptionProcessing={isTranscriptionProcessing}
                            disabled={isTranscriptionProcessing || isTyping}
                            dataTour="tour-mic-button"
                        />
                    </div>
                    <div className="flex flex-col items-center flex-shrink-0">
                        <div className="hidden">{tradeSelector}</div>
                        <RedSVGButton 
                            index={1} 
                            onClick={() => {
                                const trigger = document.querySelector('[data-tour="tour-trade-button"]') as HTMLElement;
                                if (trigger) trigger.click();
                            }}
                            dataTour="tour-trade-button"
                        />
                    </div>
                    <div className="flex flex-col items-center flex-shrink-0">
                        <div className="hidden">{locationSelector}</div>
                            <GreenSVGButton 
                                index={2} 
                                onClick={() => {
                                    if (settings.countryCode === 'US') {
                                        // USA: Green is the "Location" side of the pill (State Select)
                                        const trigger = document.querySelector('[data-tour="tour-state-button"]') as HTMLElement;
                                        if (trigger) trigger.click();
                                    } else {
                                        // UK: Green is the manual City selection
                                        const trigger = document.querySelector('[data-tour="tour-uk-city-button"]') as HTMLElement;
                                        if (trigger) trigger.click();
                                    }
                                }}
                                dataTour={settings.countryCode === 'US' ? 'tour-state-button' : 'tour-location-button'}
                            />
                            {settings.countryCode === 'US' && (hasStateSelected || !!locationRecord) && (
                                <PurpleSVGButton 
                                    index={4}
                                    onClick={() => {
                                        // USA: Purple is the "City" side of the pill (City Select)
                                        const trigger = document.querySelector('[data-tour="tour-city-button"]') as HTMLElement;
                                        if (trigger) trigger.click();
                                    } }
                                    dataTour="tour-city-button"
                                />
                            )}
                    </div>
                    <div className="flex flex-col items-center flex-shrink-0">
                        <div className="hidden">{mobileActionButton || actionButton}</div>
                        <YellowSVGButton 
                            index={3} 
                            onClick={handleActionClick}
                            disabled={isActionDisabled}
                            isPulsing={shouldFlash}
                            dataTour="tour-locate-button"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

