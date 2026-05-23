import { useState, useRef, useEffect } from "react";
import { devLog, devWarn } from "@/lib/devLog";
import { Send, MapPin, Zap, Phone, RotateCcw, Search, Mic, MicOff, Loader2, ChevronsUpDown, Navigation, User, Droplets, PlugZap, KeyRound, Flame, Home as HomeIcon, LocateFixed, BriefcaseBusiness } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
export const USE_SVG_BUTTONS_ON_DESKTOP = true;
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

import { SVGButton } from "./VoiceAssistant/SVGButton";
import { RedSVGButton } from "./VoiceAssistant/RedSVGButton";
import { GreenSVGButton } from "./VoiceAssistant/GreenSVGButton";
import { YellowSVGButton } from "./VoiceAssistant/YellowSVGButton";
import { PurpleSVGButton } from "./VoiceAssistant/PurpleSVGButton";

type EarthCompleteDetail = {
    location?: string;
    lat?: number;
    lng?: number;
    zoom?: number;
    pitch?: number;
    bearing?: number;
};

function targetWithEarthCamera(target: string, detail?: EarthCompleteDetail) {
    if (!detail?.lat || !detail?.lng) return target;

    const url = new URL(target, window.location.origin);
    url.searchParams.set("lat", detail.lat.toFixed(6));
    url.searchParams.set("lng", detail.lng.toFixed(6));
    if (Number.isFinite(detail.zoom)) url.searchParams.set("earthZoom", String(detail.zoom));
    if (Number.isFinite(detail.pitch)) url.searchParams.set("earthPitch", String(detail.pitch));
    if (Number.isFinite(detail.bearing)) url.searchParams.set("earthBearing", String(detail.bearing));
    if (detail.location) url.searchParams.set("earthLocation", detail.location);
    return `${url.pathname}${url.search}${url.hash}`;
}

function findTypedTrade(message: string) {
    const text = message.toLowerCase();
    return trades.find((trade) => {
        const names = [trade.slug, trade.name, trade.usName].filter(Boolean).map((value) => String(value).toLowerCase());
        return names.some((name) => text.includes(name) || text.includes(`${name}s`));
    })?.slug || null;
}

function findTypedCity(message: string, countryCode: string = 'GB') {
    const text = message.toLowerCase();
    const allCities = (countryCode === 'US' ? usCities : cities).sort((a, b) => b.length - a.length);
    return allCities.find((city) => text.includes(city.toLowerCase())) || null;
}

interface EmergencyChatInterfaceProps {
    launchMode?: 'earth' | 'direct';
    surface?: 'hero' | 'search';
}

export function EmergencyChatInterface({ launchMode = 'earth', surface = 'hero' }: EmergencyChatInterfaceProps) {
    const navigate = useNavigate();
    const { city: urlCity } = useParams();
    const { settings } = useLocalization();
    const { detectedTrade, detectedCity, setDetectedTrade, setDetectedCity, isRequestingLocation, setIsRequestingLocation } = useChatbot();
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [pendingNav, setPendingNav] = useState<string | null>(null);
    const [isEarthLaunching, setIsEarthLaunching] = useState(false);
    const [callbackPhone, setCallbackPhone] = useState("");
    const [locationRecord, setLocationRecord] = useState<{ name?: string; path_slugs?: { state: string; metro: string; city: string; suburb?: string } } | null>(null);
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
    const lastSyncedGeoCityRef = useRef<string | null>(null);

    // Keep ALL refs in sync - updated both synchronously in handlers AND via useEffect for safety
    useEffect(() => { chatStateRef.current = chatState; }, [chatState]);
    useEffect(() => { detectedTradeRef.current = detectedTrade; }, [detectedTrade]);
    useEffect(() => { detectedCityRef.current = detectedCity; }, [detectedCity]);
    useEffect(() => { settingsRef.current = settings; }, [settings]);

    useEffect(() => {
        const location = detectedCity || locationRecord?.name;
        if (!location) return;
        window.dispatchEvent(new CustomEvent('emergency-earth:sync-location', {
            detail: { location }
        }));
    }, [detectedCity, locationRecord?.name]);

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
        analyserRef: whisperAnalyserRef,
        resetTranscription,
        status: whisperStatus
    } = useWhisper();



    // Toast whisper errors
    useEffect(() => {
        if (whisperError) {
            console.error('[EmergencyChatInterface] Whisper Error:', whisperError);
            toast.error(`Voice error: ${whisperError}`);
        }
    }, [whisperError]);

    // Audio data for waveform visualization
    const WAVEFORM_SAMPLES = 120;
    const [audioData, setAudioData] = useState<number[]>(new Array(WAVEFORM_SAMPLES).fill(0));
    const rafRef = useRef<number | null>(null);
    const lastSampleTsRef = useRef<number>(0);

    const stopVolumeMonitor = () => {
        if (rafRef.current !== null) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }
    };

    // Auto-restart recording for voice follow-ups
    const restartRecordingForVoice = async () => {
        if (!isVoiceSessionRef.current) return;
        try {
            devLog('[Voice] Auto-restarting mic for follow-up question...');
            await startRecording();
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
            devLog(`[STT] New transcription received: "${transcription}"`);
            devLog(`[STT] Current chatState step: ${chatStateRef.current.step}, trade: ${chatStateRef.current.detectedTrade}, city: ${chatStateRef.current.detectedCity}`);
            devLog(`[STT] Context trade: ${detectedTradeRef.current}, city: ${detectedCityRef.current}`);
            // Mark this as a voice session so we auto-restart after TTS
            isVoiceSessionRef.current = true;
            handleUserMessageRef.current(transcription, true);
            resetTranscription();
            // Don't stop volume monitor here — it'll be stopped when recording stops
            // and restarted after TTS finishes
        }
    }, [transcription, resetTranscription]);

    // Handle Whisper errors
    useEffect(() => {
        if (whisperError) {
            toast.error(whisperError);
        }
    }, [whisperError]);

    // Real-time audio visualization when recording — single RAF loop
    // samples every ~50ms, so the waveform scrolls one slot per sample.
    useEffect(() => {
        if (!isRecording) {
            stopVolumeMonitor();
            setAudioData(new Array(WAVEFORM_SAMPLES).fill(0));
            return;
        }

        lastSampleTsRef.current = 0;
        const SAMPLE_INTERVAL_MS = 50;

        const tick = (ts: number) => {
            if (ts - lastSampleTsRef.current >= SAMPLE_INTERVAL_MS) {
                lastSampleTsRef.current = ts;
                const level = getAudioLevel();
                setAudioData(prev => {
                    const next = prev.length === WAVEFORM_SAMPLES ? prev.slice(1) : prev.slice(Math.max(0, prev.length - WAVEFORM_SAMPLES + 1));
                    next.push(level);
                    return next;
                });
            }
            rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);

        return () => stopVolumeMonitor();
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
                devLog(`[EmergencyChatInterface] Syncing detectedCity from URL: ${formattedCity}`);
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

    // Keep chat/listing intent aligned with the shared live GPS area.
    useEffect(() => {
        if (!geoCity || urlCity) return;

        const previousGeoCity = lastSyncedGeoCityRef.current;
        const shouldUseLiveCity = !detectedCity || detectedCity === previousGeoCity;
        if (!shouldUseLiveCity) return;

        lastSyncedGeoCityRef.current = geoCity;
        if (detectedCity !== geoCity) {
            setDetectedCity(geoCity);
            setLocationRecord(null);
        }
    }, [geoCity, detectedCity, urlCity, setDetectedCity]);

    // Manual location requests still resolve through the same shared GPS provider.
    useEffect(() => {
        if (wasLocating && !geoLoading && geoCity && !detectedCity) {
            setDetectedCity(geoCity);
        }
        setWasLocating(geoLoading);
    }, [geoLoading, geoCity, detectedCity, wasLocating, setDetectedCity]);

    const handleUserMessage = async (msgText: string, isVoice: boolean = false) => {
        if (!msgText.trim()) {
            devWarn('[EmergencyChatInterface] handleUserMessage called with empty text');
            return;
        }

        devLog(`[EmergencyChatInterface] handleUserMessage: "${msgText}" (isVoice: ${isVoice})`);

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

                devLog(`[handleUserMessage] Processing "${msgText}" with state:`, {
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

                // Voice TTS playback removed — AzureVoiceService is no longer in use.

                setIsRequestingLocation(newState.step === 'LOCATION_CHECK' && !newState.detectedCity && !newState.suggestedCity);
                clearTimeout(safetyRef);
                setIsTyping(false);

                const inferredTrade = newState.detectedTrade || freshTrade || findTypedTrade(msgText);
            const inferredCity = newState.detectedCity || freshCity || findTypedCity(msgText, freshCountryCode);

                if (inferredTrade && !newState.detectedTrade) {
                    setDetectedTrade(inferredTrade);
                    detectedTradeRef.current = inferredTrade;
                }
                if (inferredCity && !newState.detectedCity) {
                    setDetectedCity(inferredCity);
                    detectedCityRef.current = inferredCity;
                }

                if (response.action === 'navigate' && response.target) {
                    isVoiceSessionRef.current = false;
                    const navDelay = isVoice ? 1000 : (1000 + (response.content.length * 10));
                    devLog(`[handleUserMessage] Navigating in ${navDelay}ms to: ${response.target}`);
                    setTimeout(() => {
                        startEarthLaunch(response.target!, inferredCity || msgText);
                    }, navDelay);
                } else if (inferredTrade && inferredCity) {
                    isVoiceSessionRef.current = false;
                    const target = buildEmergencyTarget(inferredTrade, inferredCity);
                    const navDelay = isVoice ? 900 : 1200;
                    devLog(`[handleUserMessage] Complete request detected. Launching Earth sequence to: ${target}`);
                    setTimeout(() => {
                        startEarthLaunch(target, inferredCity);
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
        "Tell us what happened.",
        "Choose a trade and area.",
        "Use voice if typing is awkward.",
        "Search and call.",
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
        "Public business listings",
        "Local contacts",
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

    const buildEmergencyTarget = (trade: string, city: string) => {
        const citySlug = city.toLowerCase().trim().replace(/\s+/g, '-');
        return `/emergency-${trade}/${citySlug}`;
    };

    const startEarthLaunch = (target: string, locationLabel?: string | null) => {
        const location = locationLabel || detectedCity || locationRecord?.name || input;
        if (launchMode === 'direct') {
            navigate(target);
            return;
        }

        setIsEarthLaunching(true);
        let completed = false;

        const completeHandler = (event: Event) => {
            completed = true;
            const detail = (event as CustomEvent<EarthCompleteDetail>).detail;
            setIsEarthLaunching(false);
            navigate(targetWithEarthCamera(target, detail));
        };

        window.addEventListener('emergency-earth:complete', completeHandler, { once: true });
        window.dispatchEvent(new CustomEvent('emergency-earth:launch', {
            detail: { location, target }
        }));
        window.setTimeout(() => {
            if (completed) return;
            window.removeEventListener('emergency-earth:complete', completeHandler);
            setIsEarthLaunching(false);
            navigate(target);
        }, 14000);
    };

    const handleActionClick = () => {
        if (isRequestingLocation) {
            detectUserLocation();
            setIsRequestingLocation(false);
        } else if (detectedTrade && (detectedCity || locationRecord) && !input.trim()) {
            let newPath: string;
            if (locationRecord && locationRecord.path_slugs) {
                const { state, metro, city, suburb } = locationRecord.path_slugs;
                const hasSuburb = suburb && suburb.trim().length > 0;
                // US Redirection Fix: Never use /us prefix.
                newPath = hasSuburb
                    ? `/${state}/${metro}/${city}/${suburb}/emergency-${detectedTrade}`
                    : `/${state}/${metro}/${city}/emergency-${detectedTrade}`;
            } else {
                newPath = buildEmergencyTarget(detectedTrade, detectedCity || '');
            }
            startEarthLaunch(newPath, detectedCity || locationRecord?.name);
        } else {
            handleUserMessage(input);
        }
    };

    const isActionDisabled = isEarthLaunching || (!input.trim() && !isRequestingLocation && !(detectedTrade && (detectedCity || locationRecord))) || (isTyping && !isRequestingLocation);
    const tradeSelectorContent = (
        <SelectContent className="bg-white border-gray-200">
            {trades.map((t) => (
                <SelectItem
                    key={t.slug}
                    value={t.slug}
                    className="cursor-pointer hover:bg-gray-100 text-black"
                >
                    {settings.countryCode === 'US' ? t.usName : t.name}
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
                aria-label="Choose trade"
                className={`h-12 md:h-11 w-full md:max-w-none md:w-full rounded-full border border-orange-200 dark:border-gold/20 md:border-orange-300 dark:md:border-gold/50 transition-all flex items-center justify-center md:justify-between px-0 md:px-3 shadow-[0_0_30px_rgba(255,165,0,0.1)] md:shadow-sm focus:ring-0 overflow-visible [&>*:last-child]:hidden md:[&>*:last-child]:flex ${detectedTrade ? 'bg-orange-50 dark:bg-white text-orange-700 dark:text-[#9B7D4F] hover:bg-orange-100 dark:hover:bg-gold/5' : 'bg-white text-[#9B7D4F]/70 hover:bg-gold/5'}`}
            >
                <div className="flex items-center justify-center md:justify-start md:gap-2 w-full md:w-auto">
                    <User className="w-5 h-5 md:w-4 md:h-4 shrink-0 text-orange-600 dark:text-[#9B7D4F]" />
                    <div className="hidden md:block min-w-0 overflow-hidden">
                        <SelectValue placeholder="Trade">
                            <span className="text-sm font-medium truncate block max-w-[180px]">
                                {detectedTrade ? (settings.countryCode === 'US' ? trades.find(t => t.slug === detectedTrade)?.usName ?? "Trade" : trades.find(t => t.slug === detectedTrade)?.name ?? "Trade") : "Trade"}
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
                            devLog("Loc Selected", record);
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
            toast.info("Transcribing voice message...", { id: 'stt-status', duration: 2000 });
            stopRecording();
            stopVolumeMonitor();
        } else {
            try {
                await startRecording();
                toast.success("Listening... Please describe your emergency now.", {
                    id: 'stt-status', 
                    duration: 5000,
                    description: "Tap the checkmark when you're finished speaking."
                });
            } catch (err) {
                toast.error("Microphone access denied or failed.");
                console.error("[Mic] Error:", err);
            }
        }
    };

    const micButton = (
        <Button
            onClick={handleMicToggle}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleMicToggle(); }}
            data-tour="tour-mic-button"
            disabled={isTranscriptionProcessing || isTyping}
            size="icon"
            aria-label={isRecording ? 'Stop recording' : (isTranscriptionProcessing ? 'Processing voice input' : 'Record voice message')}
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

    const hasUserIntent = input.trim().length > 0 || !!detectedTrade;
    const actionButton = (
        <Button
            onClick={handleActionClick}
            disabled={isActionDisabled}
            data-tour="tour-locate-button"
            size="icon"
            aria-label={isEarthLaunching ? "Launching location view" : isRequestingLocation ? "Use my location" : (isFlowComplete ? "Find help now" : "Send message")}
            className={`h-11 w-11 shrink-0 rounded-full transition-all duration-300 shadow-lg ${shouldFlash
                ? 'animate-glow-bottom ring-4 ring-yellow-400/80'
                : hasUserIntent
                    ? 'bg-gold text-white hover:bg-gold/90 shadow-[0_0_16px_rgba(212,175,55,0.45)]'
                    : 'bg-stone-400/40 text-white/70 hover:bg-stone-400/60'}`}
            title={isEarthLaunching ? "Launching location view" : isRequestingLocation ? "Locate Me" : (isFlowComplete ? "Find Help Now" : "Send Message")}
        >
            {isEarthLaunching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : isRequestingLocation ? (
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
            {isEarthLaunching ? (
                <Loader2 className="w-5 h-5 animate-spin" />
            ) : isRequestingLocation ? (
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

    const compactTextButtonClass = "home-search-control-text !h-10 w-full justify-center rounded-xl border-0 px-3 text-[0.72rem] font-semibold leading-none transition sm:text-xs";
    const compactIconButtonClass = "home-search-control-icon h-9 w-9 rounded-xl border-0 p-0 transition";

    const compactTradeSelector = (
        <Select
            value={detectedTrade || ""}
            onValueChange={setDetectedTrade}
        >
            <SelectTrigger
                data-tour="tour-trade-button"
                aria-label="Choose trade"
                className={compactTextButtonClass}
            >
                <div className="flex min-w-0 items-center gap-2">
                    <BriefcaseBusiness className="h-4 w-4 shrink-0 text-gold" />
                    <span className="block truncate">Trade</span>
                </div>
            </SelectTrigger>
            {tradeSelectorContent}
        </Select>
    );

    const compactLocationSelector = (
        <div data-tour="tour-location-button" className="min-w-0">
            {settings.countryCode === 'US' ? (
                <HierarchicalLocationSelector
                    className="w-full"
                    buttonClassName={compactTextButtonClass}
                    placeholder="State"
                    cityPlaceholder="City / Area"
                    staticStateLabel="State"
                    staticCityLabel="City / Area"
                    showLabelOnMobile
                    showCityPlaceholder
                    onStateSelected={(state) => setHasStateSelected(!!state)}
                    onLocationSelect={(record) => {
                        devLog("Loc Selected", record);
                        setDetectedCity(record.name);
                        setLocationRecord(record);
                    }}
                />
            ) : (
                <UKCityCombobox
                    className={compactTextButtonClass}
                    placeholder="Area"
                    staticLabel="Area"
                    value={detectedCity || ""}
                    onValueChange={setDetectedCity}
                    showLabelOnMobile
                />
            )}
        </div>
    );

    if (pendingNav) {
        return (
            <div className="w-full max-w-4xl mx-auto">
                <div className="rounded-3xl border border-emerald-500/30 bg-emerald-950/40 backdrop-blur-sm p-8 text-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                        <Phone className="w-6 h-6 text-emerald-400" />
                    </div>
                    <h3 className="text-white font-bold text-lg mb-1">Want us to confirm a pro for you?</h3>
                    <p className="text-emerald-300/70 text-sm mb-6">Leave your number and we'll text you when a local expert is confirmed. Optional — skip to browse listings.</p>
                    <div className="flex gap-2 max-w-sm mx-auto mb-4">
                        <input
                            type="tel"
                            value={callbackPhone}
                            onChange={e => setCallbackPhone(e.target.value)}
                            placeholder="Your phone number"
                            className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder:text-white/40 text-sm focus:outline-none focus:border-emerald-400"
                        />
                        <button
                            type="button"
                            onClick={() => {
                                if (callbackPhone.trim()) {
                                    trackEvent('Chat', 'callback_requested', callbackPhone);
                                }
                                navigate(pendingNav);
                            }}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors shrink-0"
                        >
                            {callbackPhone.trim() ? 'Submit & Go' : 'Skip →'}
                        </button>
                    </div>
                    <button type="button" onClick={() => navigate(pendingNav)} className="text-xs text-white/30 hover:text-white/60 transition-colors">
                        No thanks, take me to the listings
                    </button>
                </div>
            </div>
        );
    }

    if (surface === 'search') {
        return (
            <div className="w-full">
                <div className="relative mx-auto w-full max-w-[60rem]">
                    <AnimatePresence mode="popLayout">
                        {chatState.history.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                                className="mb-4 max-h-[34svh] overflow-y-auto rounded-2xl bg-black/20 px-4 py-3 text-sm text-slate-100 ring-1 ring-white/8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                                ref={chatContainerRef}
                                onScroll={handleScroll}
                            >
                                <div className="space-y-3">
                                    {chatState.history.map((msg, idx) => {
                                        const isLastMessage = idx === chatState.history.length - 1;
                                        if (msg.role === 'assistant') {
                                            return (
                                                <div key={msg.id} className="flex gap-3">
                                                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold/12 ring-1 ring-gold/25">
                                                        <img src="/et-logo-v3.webp" alt="" className="h-4 w-4 object-contain" loading="lazy" />
                                                    </div>
                                                    <div className="min-w-0 flex-1 text-slate-100">
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
                                                                className="prose prose-invert max-w-none prose-sm prose-p:my-1 prose-strong:text-gold"
                                                            />
                                                        ) : (
                                                            <div className="prose prose-invert max-w-none prose-sm prose-p:my-1 prose-strong:text-gold">
                                                                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                                                                    {msg.content}
                                                                </ReactMarkdown>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        }

                                        return (
                                            <div key={msg.id} className="flex justify-end">
                                                <div className="max-w-[88%] rounded-2xl bg-gold/12 px-3 py-2 text-sm font-medium text-amber-50 ring-1 ring-gold/20">
                                                    {msg.content}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="home-search-chatbox group/searchbox relative overflow-hidden rounded-[1.45rem] backdrop-blur-2xl transition duration-300">
                        <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-slate-950/10 to-transparent dark:via-white/18" />
                        <div className="pointer-events-none absolute -right-16 -top-24 h-44 w-44 rounded-full bg-gold/10 blur-3xl dark:bg-gold/8" />
                        <div className="pointer-events-none absolute -left-20 bottom-0 h-36 w-44 rounded-full bg-sky-500/8 blur-3xl dark:bg-sky-500/5" />

                        {chatState.history.length > 0 && (
                            <button
                                type="button"
                                onClick={resetChat}
                                className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.055] text-slate-400 ring-1 ring-white/10 transition hover:bg-white/[0.09] hover:text-white"
                                title="Reset chat"
                            >
                                <RotateCcw className="h-3.5 w-3.5" />
                            </button>
                        )}

                        <div className="relative flex min-h-[9.5rem] flex-col px-4 pb-3 pt-4 sm:min-h-[10rem] sm:px-5 sm:pb-4">
                            <div className="min-h-[5.25rem] flex-1">
                                {isRecording ? (
                                    <div className="rounded-2xl bg-red-500/5 px-2 py-3">
                                        <WhisperWaveform
                                            audioData={audioData}
                                            analyserRef={whisperAnalyserRef}
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
                                        placeholder={chatState.history.length === 0 ? (placeholderText || "What emergency do you need help with?") : "Type your reply..."}
                                        data-tour="tour-chat-input"
                                        className="h-full min-h-[5rem] w-full resize-none bg-transparent text-[15px] font-light leading-relaxed text-slate-950 outline-none placeholder:text-slate-500 focus:ring-0 sm:text-base dark:text-slate-50 dark:placeholder:text-slate-400/88"
                                    />
                                )}
                            </div>

                            <div className="mt-2 border-t border-slate-950/[0.08] pt-3 dark:!border-white/[0.08]">
                                <div className="relative flex items-center justify-center">
                                    <Button
                                        type="button"
                                        onClick={handleMicToggle}
                                        disabled={isTranscriptionProcessing || isTyping}
                                        data-tour="tour-mic-button"
                                        className={cn(
                                            compactIconButtonClass,
                                            "absolute left-0 top-1/2 -translate-y-1/2",
                                            isRecording ? "bg-red-500/18 text-red-700 ring-red-400/40 dark:text-red-100" : ""
                                        )}
                                        title={isRecording ? "Stop Recording" : "Voice Search"}
                                        aria-label={isRecording ? "Stop recording" : "Voice search"}
                                    >
                                        {isTranscriptionProcessing ? <Loader2 className="h-4 w-4 animate-spin text-gold" /> : isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4 text-gold" />}
                                    </Button>

                                    <div className="grid w-[calc(100%-5.5rem)] max-w-[32rem] grid-cols-3 gap-2">
                                        <div className="min-w-0">
                                            {compactTradeSelector}
                                        </div>
                                        <div className="min-w-0">
                                            {compactLocationSelector}
                                        </div>
                                        <Button
                                            type="button"
                                            onClick={() => {
                                                detectUserLocation();
                                                setIsRequestingLocation(false);
                                            }}
                                            disabled={geoLoading}
                                            data-tour="tour-locate-button"
                                            className={compactTextButtonClass}
                                            title="Locate Me"
                                        >
                                            {geoLoading ? <Loader2 className="h-4 w-4 animate-spin text-gold" /> : <LocateFixed className="h-4 w-4 text-gold" />}
                                            <span className="ml-2 truncate">Locate</span>
                                        </Button>
                                    </div>

                                    <Button
                                        type="button"
                                        onClick={handleActionClick}
                                        disabled={isActionDisabled}
                                        className="home-search-send absolute right-0 top-1/2 h-9 w-9 -translate-y-1/2 rounded-xl border-0 bg-gold p-0 text-black shadow-[0_0_24px_rgba(212,175,55,0.2)] transition hover:bg-gold-light disabled:shadow-none"
                                        title={isFlowComplete ? "Find Help Now" : "Send Message"}
                                        aria-label={isFlowComplete ? "Find help now" : "Send message"}
                                    >
                                        {isEarthLaunching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {isTyping && !chatState.history.length && (
                        <div className="mt-3 flex justify-center gap-1.5" role="status" aria-live="polite">
                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gold" />
                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gold delay-150" />
                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gold delay-300" />
                        </div>
                    )}
                </div>
            </div>
        );
    }

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
                                    className="w-full max-w-2xl mx-auto shadow-[0_0_50px_rgba(0,0,0,0.1)] border-gray-200 bg-white ring-1 ring-black/5 overflow-hidden h-[60dvh] md:h-[80dvh]"
                                    contentClassName="overscroll-contain pb-32"
                                >
                                    <AnimatedSpan className="text-emerald-600 mb-6 font-bold tracking-wider text-xs uppercase opacity-80">
                                        <span>✓ System initialized</span>
                                    </AnimatedSpan>

                                    <div className="space-y-4 md:space-y-6">
                                        {chatState.history.map((msg, idx) => {
                                            const isLastMessage = idx === chatState.history.length - 1;

                                            if (msg.role === 'assistant') {
                                                return (
                                                    <div key={msg.id} className="text-black flex gap-3 group">
                                                        <div className="shrink-0 pt-1">
                                                            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center ring-1 ring-amber-200">
                                                                <Zap className="w-4 h-4 text-amber-600" />
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
                                                                    className="prose prose-emerald max-w-none prose-xs md:prose-sm lg:prose-base prose-p:leading-snug prose-p:mb-2 md:prose-p:mb-3 prose-headings:mb-1 prose-headings:mt-3 md:prose-headings:mt-5 first:prose-headings:mt-0 prose-li:my-0 prose-ul:my-1 prose-strong:text-black prose-strong:font-bold"
                                                                />
                                                            ) : (
                                                                <div className="prose prose-emerald max-w-none prose-xs md:prose-sm lg:prose-base prose-p:leading-snug prose-p:mb-2 md:prose-p:mb-3 prose-headings:mb-1 prose-headings:mt-3 md:prose-headings:mt-5 first:prose-headings:mt-0 prose-li:my-0 prose-ul:my-1 prose-strong:text-black prose-strong:font-bold">
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
                                                    <div className="max-w-[90%] p-2.5 md:p-3 rounded-2xl text-sm md:text-base leading-relaxed bg-amber-50 border border-amber-200/50 text-amber-900 rounded-tr-sm font-medium">
                                                        {msg.content}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {chatState.history[chatState.history.length - 1].role === 'assistant' && (
                                        <AnimatedSpan delay={chatState.history[chatState.history.length - 1].content.length * 15 + 800} className="text-amber-800/80 mt-8 text-xs uppercase tracking-widest flex items-center gap-2" role="status" aria-live="polite">
                                            <span className="w-1.5 h-1.5 bg-amber-600 rounded-full animate-pulse" />
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
                <div className="hero-chat-shell w-full bg-transparent flex justify-center pt-2 pb-4 relative z-30">
                    <div className={`hero-chat-card relative z-40 flex flex-col w-[95%] md:w-[90%] bg-[#08121d]/88 md:bg-white/5 dark:bg-[#0a0a0a]/90 backdrop-blur-2xl rounded-2xl border overflow-hidden group
                        ${isFocused
                            ? 'border-gold/80 shadow-[0_0_40px_rgba(215,160,66,0.3)] ring-1 ring-gold/30'
                            : 'border-gold/30 shadow-[0_0_20px_rgba(0,0,0,0.4)] hover:border-gold/50'}`}>

                        {/* Quick action chips — only shown before first message, disappears after user engages */}
                        {chatState.history.length === 0 && !isRecording && (
                            <div className="w-full px-3 md:px-6 pt-2 pb-0 flex flex-nowrap md:flex-wrap items-center justify-center md:justify-start gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                                {[
                                    { label: 'Burst pipe', message: 'I need a plumber — burst pipe' },
                                    { label: 'Power outage', message: 'I need an electrician — power outage' },
                                    { label: 'Locked out', message: 'I need a locksmith — locked out' },
                                ].map((chip) => (
                                    <button
                                        key={chip.label}
                                        type="button"
                                        onClick={() => {
                                            trackEvent('Chat', 'quick_action_chip', chip.label);
                                            handleUserMessage(chip.message);
                                        }}
                                        className="group inline-flex h-5 min-h-0 md:h-6 flex-shrink-0 items-center gap-1 rounded-md border border-gold/18 bg-black/[0.03] px-2 text-[9px] md:text-[10px] font-bold uppercase leading-none tracking-[0.12em] text-gold/72 backdrop-blur-sm transition-all duration-200 hover:border-gold/35 hover:bg-gold/[0.07] hover:text-gold whitespace-nowrap"
                                    >
                                        <span className="h-1 w-1 rounded-full bg-gold/45 transition-colors group-hover:bg-gold/80" />
                                        {chip.label}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* TEXTAREA / WAVEFORM SLOT - Fixed height so controls never move */}
                        <div className="w-full relative" style={{ minHeight: '80px' }}>
                            {isRecording ? (
                                <div className="w-full h-full flex items-center justify-center px-3 py-3 bg-gradient-to-r from-red-500/5 via-transparent to-red-500/5" style={{ minHeight: '80px' }}>
                                    <WhisperWaveform
                                        audioData={audioData}
                                        analyserRef={whisperAnalyserRef}
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
                                <>
                                    {/* AI avatar badge — nestled inside textarea left padding */}
                                    <div
                                        aria-hidden="true"
                                        className="pointer-events-none absolute left-3 md:left-5 top-3 md:top-4 z-10 w-8 h-8 md:w-11 md:h-11 rounded-full flex items-center justify-center bg-gradient-to-br from-gold/25 to-gold/5 border border-gold/40 shadow-[0_0_14px_rgba(212,175,55,0.35)] animate-glow-pulse"
                                    >
                                        <img
                                            src="/et-logo-v3.webp"
                                            alt=""
                                            width="28"
                                            height="28"
                                            loading="lazy"
                                            decoding="async"
                                            className="w-4 h-4 md:w-6 md:h-6 brightness-125 drop-shadow-[0_0_4px_rgba(212,175,55,0.6)]"
                                        />
                                    </div>
                                    {/* Blinking cursor hint — signals "you can type here" when idle */}
                                    {!input && !isFocused && chatState.history.length === 0 && (
                                        <span
                                            aria-hidden="true"
                                            className="pointer-events-none absolute left-12 md:left-20 top-4 md:top-6 z-10 w-[2px] h-5 md:h-7 bg-gold rounded-sm animate-pulse"
                                        />
                                    )}
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
                                        className="w-full bg-transparent border-none outline-none focus:outline-none focus:border-none pl-12 md:pl-20 pr-4 md:pr-8 py-4 md:py-6 text-sm md:text-2xl focus:ring-0 focus-visible:ring-0 text-white md:text-black dark:text-white placeholder:text-white/80 md:placeholder:text-black dark:placeholder:text-white resize-none font-light tracking-wide"
                                        style={{ minHeight: '80px' }}
                                    />
                                </>
                            )}
                        </div>

                        {/* CONTROLS ROW - Always pinned at bottom, never moves */}
                        <div className={cn("w-full flex-shrink-0 bg-transparent", USE_SVG_BUTTONS_ON_DESKTOP ? "block md:hidden" : "block")}>
                            <div className="grid px-3 md:px-4 pb-4 pt-2 bg-transparent w-full items-center" style={{ gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr) 44px 44px', gap: '8px' }}>
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

            {/* Mobile Controls - SVG Buttons / Desktop Optimized Toggle */}
            <div className={cn("hero-action-controls-reveal w-full mt-2 md:mt-3 mb-2 md:mb-4 px-1 overflow-visible relative", USE_SVG_BUTTONS_ON_DESKTOP ? "hidden md:block" : "hidden")}>
                <div className={cn("flex flex-row items-center justify-center w-full overflow-visible gap-1 mx-auto", USE_SVG_BUTTONS_ON_DESKTOP ? "md:gap-8 md:max-w-4xl" : "max-w-[420px]")}>
                    <div className="relative flex flex-col items-center flex-shrink-0">
                        <div className="hidden">{micButton}</div>
                        <SVGButton
                            index={0}
                            onClick={handleMicToggle}
                            isRecording={isRecording}
                            isTranscriptionProcessing={isTranscriptionProcessing}
                            disabled={isTranscriptionProcessing || isTyping}
                            dataTour="tour-mic-button"
                        />
                        <span className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-full text-[10px] md:text-[11px] font-semibold uppercase tracking-wider text-gold/70 select-none whitespace-nowrap">Voice</span>
                    </div>
                    <div className="relative flex flex-col items-center flex-shrink-0">
                        <div className="absolute inset-0 z-20 opacity-0">
                            {tradeSelector}
                        </div>
                        <RedSVGButton
                            index={1}
                            onClick={() => {
                                const trigger = document.querySelector('[data-tour="tour-trade-button"]') as HTMLElement;
                                if (trigger) trigger.click();
                            }}
                            dataTour="tour-trade-button"
                        />
                        <span className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-full text-[10px] md:text-[11px] font-semibold uppercase tracking-wider text-gold/70 select-none whitespace-nowrap">Trades</span>
                    </div>
                    <div className="relative flex flex-col items-center flex-shrink-0">
                        <div className="absolute inset-0 z-20 opacity-0">
                            {locationSelector}
                        </div>
                            <div className="relative flex flex-col items-center">
                                <GreenSVGButton
                                    index={2}
                                    onClick={() => {
                                        if (settings.countryCode === 'US') {
                                            const trigger = document.querySelector('[data-tour="tour-state-button"]') as HTMLElement;
                                            if (trigger) { trigger.click(); } else { detectUserLocation(); }
                                        } else {
                                            const trigger = document.querySelector('[data-tour="tour-uk-city-button"]') as HTMLElement;
                                            if (trigger) { trigger.click(); } else { detectUserLocation(); }
                                        }
                                    }}
                                    dataTour={settings.countryCode === 'US' ? 'tour-state-button' : 'tour-location-button'}
                                    ariaLabel={settings.countryCode === 'US' ? 'Choose state' : 'Choose location'}
                                />
                                <span className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-full text-[10px] md:text-[11px] font-semibold uppercase tracking-wider text-gold/70 select-none whitespace-nowrap">
                                    {settings.countryCode === 'US' ? 'State' : 'Location'}
                                </span>
                            </div>
                            {settings.countryCode === 'US' && (hasStateSelected || !!locationRecord) && (
                                <div className="relative flex flex-col items-center">
                                    <PurpleSVGButton
                                        index={4}
                                        onClick={() => {
                                            // USA: Purple is the "City" side of the pill (City Select)
                                            const trigger = document.querySelector('[data-tour="tour-city-button"]') as HTMLElement;
                                            if (trigger) trigger.click();
                                        } }
                                        dataTour="tour-city-button"
                                    />
                                    <span className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-full text-[10px] md:text-[11px] font-semibold uppercase tracking-wider text-gold/70 select-none whitespace-nowrap">City</span>
                                </div>
                            )}
                    </div>
                    <div className="relative flex flex-col items-center flex-shrink-0">
                        <div className="hidden">{mobileActionButton || actionButton}</div>
                        <YellowSVGButton
                            index={3}
                            onClick={handleActionClick}
                            disabled={isActionDisabled}
                            isPulsing={shouldFlash}
                            dataTour="tour-locate-button"
                            ariaLabel={isEarthLaunching ? "Launching location view" : isRequestingLocation ? "Use my location" : (isFlowComplete ? "Find help now" : "Send message")}
                        />
                        <span className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-full text-[10px] md:text-[11px] font-semibold uppercase tracking-wider text-gold/70 select-none whitespace-nowrap">Send</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

