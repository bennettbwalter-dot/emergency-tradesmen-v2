import React, { useState, useEffect, useRef } from 'react';
import { X, Mic, AlertTriangle, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import intentsData from '../../voice-agent/intents.json';
import routesData from '../../voice-agent/routes.json';

const intentsConfig = intentsData || { intents: [] };
const routesConfig = routesData || { routes: {} };

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

// Minimal type definition for SpeechRecognition
interface SpeechRecognitionEvent {
    results: {
        [key: number]: {
            [key: number]: {
                transcript: string;
            };
        };
    };
}

interface SpeechRecognitionErrorEvent {
    error: string;
}

interface SpeechRecognition {
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    start: () => void;
    stop: () => void;
    onresult: (event: SpeechRecognitionEvent) => void;
    onerror: (event: SpeechRecognitionErrorEvent) => void;
    onend: () => void;
}

declare global {
    interface Window {
        SpeechRecognition: { new(): SpeechRecognition };
        webkitSpeechRecognition: { new(): SpeechRecognition };
    }
}

// Safety Configuration per Trade
const SAFETY_CONFIG: Record<string, { warning: string; question?: string }> = {
    'plumber': {
        warning: "Turn off the main water stopcock if safe. Avoid electrical sockets near water.",
        question: "Is water actively leaking right now?"
    },
    'electrician': {
        warning: "Do NOT touch exposed wires. Turn off power at the fuse box only if safe.",
        question: "Do you smell burning or see sparks?"
    },
    'locksmith': {
        warning: "Do not force the door as it may cause more damage.",
        question: "Are you locked out or is the lock damaged?"
    },
    'gas_engineer': {
        warning: "Gas issues are serious. If you smell gas or feel unwell, please leave the property immediately.",
        question: "Can you smell gas right now?"
    },
    'drain_specialist': {
        warning: "Avoid contact with waste water. Keep children and pets away.",
        question: "Is water backing up or overflowing?"
    },
    'glazier': {
        warning: "Do not touch broken glass. Keep the area clear.",
        question: "Is the broken glass a security risk right now?"
    },
    'breakdown_recovery': {
        warning: "Move to a safe place if possible. Turn on hazard lights.",
        question: "Are you in a safe location?"
    }
};

const VoiceAssistantModal: React.FC<Props> = ({ isOpen, onClose }) => {
    // Core State
    const [transcript, setTranscript] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');
    const [feedbackMessage, setFeedbackMessage] = useState('Initializing...');
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

    // Conversation State
    // Steps: initial -> asking_clarification -> asking_location -> navigating
    const [conversationStep, setConversationStep] = useState<'initial' | 'asking_clarification' | 'asking_location' | 'navigating'>('initial');
    const [selectedTrade, setSelectedTrade] = useState<{ id: string; name: string; routeKey: string } | null>(null);

    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const synthRef = useRef<SpeechSynthesis | null>(null);
    const navigate = useNavigate();
    const isNavigatingRef = useRef(false);

    // Reset state when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setConversationStep('initial');
            setSelectedTrade(null);
            setTranscript('');
            setStatus('idle');
            setFeedbackMessage('Tap Mic to Speak');
            isNavigatingRef.current = false;
            initializeSpeech();
        } else {
            stopListening();
            // Critical Change: Only stop speaking if we are NOT navigating
            // This allows the safety message to continue playing while the page changes
            if (!isNavigatingRef.current) {
                stopSpeaking();
            }
        }

        return () => {
            stopListening();
            if (!isNavigatingRef.current) {
                stopSpeaking();
            }
        };
    }, [isOpen]);

    const initializeSpeech = () => {
        // Initialize Speech Synthesis
        if ('speechSynthesis' in window) {
            synthRef.current = window.speechSynthesis;

            const loadVoices = () => {
                const available = window.speechSynthesis.getVoices();
                if (available.length > 0) {
                    setVoices(available);
                }
            };

            loadVoices();
            if (window.speechSynthesis.onvoiceschanged !== undefined) {
                window.speechSynthesis.onvoiceschanged = loadVoices;
            }
        }

        // Initialize Speech Recognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.lang = 'en-GB';
            recognition.continuous = false;
            recognition.interimResults = true;

            recognition.onresult = (event: SpeechRecognitionEvent) => {
                const result = event.results[0][0].transcript;
                setTranscript(result);
            };

            recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
                console.error('Speech recognition error', event.error);
                if (event.error === 'not-allowed') {
                    setFeedbackMessage('Microphone access denied. Please check settings.');
                } else {
                    setFeedbackMessage('Did not catch that. Please try again.');
                }
                setStatus('idle');
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current = recognition;

            // Start interaction (add slight delay for voices to load)
            setTimeout(startInteraction, 500);
        } else {
            setFeedbackMessage('Voice recognition not supported in this browser.');
        }
    }

    // Handle transcript completion logic
    useEffect(() => {
        if (!isListening && transcript && status === 'listening') {
            handleUserResponse(transcript);
        }
    }, [isListening, transcript]);


    const startInteraction = () => {
        // Ensure we stop any previous speech before starting new interaction
        // Unless we want to chain, but here we want a fresh start
        if (!isNavigatingRef.current) stopSpeaking();

        speak('Emergency Tradesmen Assistant. How can I help you?', () => {
            setTimeout(startListening, 300);
        });
    };

    const startListening = () => {
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
                setTranscript('');
                recognitionRef.current.start();
                setIsListening(true);
                setStatus('listening');
                setFeedbackMessage('Listening...');
            } catch (e) {
                console.error('Recognition start error', e);
            }
        }
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    };

    const getBritishVoice = () => {
        const available = voices.length > 0 ? voices : (window.speechSynthesis?.getVoices() || []);

        // 1. Google UK (Best for Android/Chrome)
        const google = available.find(v => v.name === 'Google UK English Female');
        if (google) return google;

        // 2. Microsoft Hazel (Good for Windows)
        const hazel = available.find(v => v.name.includes('Hazel'));
        if (hazel) return hazel;

        // 3. Daniel (Good for iOS)
        const daniel = available.find(v => v.name === 'Daniel');
        if (daniel) return daniel;

        // 4. Any GB Voice
        return available.find(v => v.lang.includes('GB') || v.lang.includes('en-GB')) || null;
    }

    const speak = (text: string, onEnd?: () => void) => {
        if (!synthRef.current) {
            if (onEnd) onEnd();
            return;
        }

        synthRef.current.cancel();
        setStatus('speaking');
        setFeedbackMessage(text);

        const utterance = new SpeechSynthesisUtterance(text);
        const voice = getBritishVoice();

        if (voice) {
            utterance.voice = voice;
            utterance.lang = voice.lang;
            // Slight speed boost for Google voice to sound more natural
            utterance.rate = voice.name.includes('Google') ? 1.1 : 1.0;
        } else {
            utterance.lang = 'en-GB';
        }

        utterance.pitch = 1.0;

        utterance.onend = () => {
            if (onEnd) onEnd();
        };

        utterance.onerror = (e) => {
            console.error("Speech error", e);
            if (onEnd) onEnd();
        };

        synthRef.current.speak(utterance);
    };

    // Helper for any components passing this down? (None in this file, but keeping clean)
    const stopSpeaking = () => {
        if (synthRef.current) {
            synthRef.current.cancel();
        }
    };

    const handleUserResponse = (text: string) => {
        setStatus('processing');

        if (conversationStep === 'initial') {
            processInitialIntent(text);
        } else if (conversationStep === 'asking_clarification') {
            // Whatever they say (Yes/No/Details), we move to location
            // We assume they've answered the safety question
            processClarification(text);
        } else if (conversationStep === 'asking_location') {
            processLocation(text);
        }
    };

    const processInitialIntent = (text: string) => {
        const lowerText = text.toLowerCase();

        // 1. Safety/Emergency Check 
        const safetyIntent = intentsConfig.intents.find(i =>
            i.id === 'safety_warning' && i.keywords.some(k => lowerText.includes(k))
        );

        if (safetyIntent) {
            if (lowerText.includes('gas')) {
                // Handled by trade detection ('gas_engineer') 
            } else if (lowerText.includes('fire') || lowerText.includes('explode')) {
                setFeedbackMessage('SAFETY WARNING DETECTED');
                speak('Danger. If this is a life threatening emergency involving fire, evacuate immediately and call 9 9 9.', () => {
                    setStatus('idle');
                });
                return;
            }
        }

        // 2. Direct Navigation & Action Check
        // We now check for 'action' based intents too
        const mixedIntent = intentsConfig.intents.find(i =>
            (i.id.startsWith('nav_') || i.id === 'guide_request' || i.action) && i.keywords.some(k => lowerText.includes(k))
        );

        if (mixedIntent) {
            // Handle Actions
            if (mixedIntent.action) {
                isNavigatingRef.current = true;
                setFeedbackMessage(`Processing ${mixedIntent.id}...`);

                if (mixedIntent.id === 'explain_pricing') {
                    speak('We offer three plans. Basic is free forever. Pro Monthly is £29.99 for priority ranking. and Pro Yearly is £99.99, saving you over 70%. Taking you to the pricing page now.', () => {
                        navigate('/tradesmen');
                        onClose();
                    });
                } else if (mixedIntent.id === 'explain_premium') {
                    speak('Joining our Premium Network boosts your business with priority ranking, trust signals, and 3x more leads. You get a Featured Badge and enhanced profile.', () => {
                        navigate('/tradesmen');
                        onClose();
                    });
                } else if (mixedIntent.id === 'signup_guide') {
                    speak('To join, simply scroll to the plan that suits you on the tradesmen page, click Get Started, and fill in your details. Taking you there now.', () => {
                        navigate('/tradesmen');
                        onClose();
                    });
                } else if (mixedIntent.id === 'newsletter_signup') {
                    // Navigate to home and scroll to bottom
                    speak('You can sign up for our newsletter at the bottom of the home page. Taking you there.', () => {
                        navigate('/');
                        // Scroll to bottom after navigation
                        setTimeout(() => {
                            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                        }, 500);
                        onClose();
                    });
                }
                return;
            }

            // Handle Standard Navigation
            const routeKey = mixedIntent.route_key as keyof typeof routesConfig.routes;
            const targetPath = routesConfig.routes[routeKey];

            if (targetPath) {
                setFeedbackMessage(`Navigating to ${mixedIntent.id.replace('nav_', '')}...`);
                isNavigatingRef.current = true;

                const confirmation = mixedIntent.id === 'guide_request'
                    ? 'Sending you to our emergency guides.'
                    : `Taking you to the ${mixedIntent.id.replace('nav_', '').replace('join', 'registration')} page.`;

                // Quick Navigation with persistent speech
                const triggerNavigation = () => {
                    navigate(targetPath);
                    onClose();
                };

                setTimeout(triggerNavigation, 1500);
                speak(confirmation, triggerNavigation);
                return;
            }
        }

        // 3. Trade Detection (Emergency Flows)
        const detectedTrade = intentsConfig.intents.find(i =>
            i.route_key && !i.id.startsWith('nav_') && !i.action && i.keywords.some(k => lowerText.includes(k))
        );

        if (detectedTrade && detectedTrade.route_key) {
            const tradeId = detectedTrade.id;
            const tradeName = tradeId.replace('_', ' ');

            setSelectedTrade({
                id: tradeId,
                name: tradeName,
                routeKey: detectedTrade.route_key
            });

            // Check for specific safety rules
            const safetyRule = SAFETY_CONFIG[tradeId];

            if (safetyRule) {
                // Speak Warning + Question
                const fullMessage = `${safetyRule.warning} ${safetyRule.question || ''}`;
                setConversationStep('asking_clarification');

                speak(fullMessage, () => {
                    setTimeout(startListening, 300);
                });
            } else {
                // No specific rule, just ask location
                setConversationStep('asking_location');
                speak(`I can help you find a ${tradeName}. Where are you located?`, () => {
                    setTimeout(startListening, 300);
                });
            }
            return;
        }

        // 4. Fallback
        setFeedbackMessage('Not understood. Redirecting to directory.');
        isNavigatingRef.current = true;
        speak('I did not catch the specific request. Sending you to the main directory.', () => {
            navigate(routesConfig.routes.tradesmen);
            onClose();
        });
    };

    const processClarification = (text: string) => {
        setConversationStep('asking_location');
        speak("Understood. Where are you located?", () => {
            setTimeout(startListening, 300);
        });
    }

    // ROBUST LOCATION PROCESSING (IMPROVED)
    const processLocation = (locationText: string) => {
        if (!selectedTrade) return;

        setConversationStep('navigating');
        isNavigatingRef.current = true; // Lock speech against unmount

        let cleanLocation = locationText.replace(/i am in|i'm in|in |near |please/gi, '').trim();
        cleanLocation = cleanLocation.replace(/[^\w\s-]/gi, '');

        if (cleanLocation.length < 2) cleanLocation = 'london';

        const routeKey = selectedTrade.routeKey as keyof typeof routesConfig.routes;
        let basePath = routesConfig.routes[routeKey];

        if (basePath && basePath.endsWith('/')) {
            basePath = basePath.slice(0, -1);
        }

        if (!basePath) basePath = '/tradesmen';

        // 1. SMART LOCATION MATCHING
        const validCities = [
            "Manchester", "Birmingham", "Leeds", "Sheffield", "Nottingham", "Leicester", "Derby", "Coventry",
            "Wolverhampton", "Stoke-on-Trent", "Liverpool", "Preston", "Bolton", "Oldham", "Rochdale", "Bradford",
            "Huddersfield", "York", "Hull", "Doncaster", "Northampton", "Milton Keynes", "Luton", "Bedford",
            "Peterborough", "Cambridge", "Norwich", "Ipswich", "Reading", "Oxford", "Swindon", "Cheltenham",
            "Gloucester", "Worcester", "Hereford", "Shrewsbury", "Telford", "Cannock", "Tamworth", "Nuneaton",
            "Rugby", "Bath", "Brighton & Hove", "Bristol", "Canterbury", "Carlisle", "Chelmsford", "Chester",
            "Chichester", "Colchester", "Durham", "Ely", "Exeter", "Lancaster", "Lichfield", "Lincoln", "London",
            "Newcastle-upon-Tyne", "Plymouth", "Portsmouth", "Ripon", "Salford", "Salisbury", "Southampton",
            "Southend-on-Sea", "St Albans", "Sunderland", "Truro", "Wakefield", "Wells", "Winchester", "Westminster",
            "Warrington", "Wigan", "Middlesbrough", "Blackpool", "Barnsley"
        ];

        // Map of common suburbs/areas to main cities
        const areaToCityMap: Record<string, string> = {
            // Manchester
            "salford": "Manchester", "stockport": "Manchester", "trafford": "Manchester", "bury": "Manchester",

            // Birmingham
            "solihull": "Birmingham", "sutton coldfield": "Birmingham", "edgbaston": "Birmingham",

            // Leeds
            "headingley": "Leeds", "morley": "Leeds", "pudsey": "Leeds",

            // Sheffield
            "rotherham": "Sheffield", "chesterfield": "Sheffield",

            // Liverpool
            "birkenhead": "Liverpool", "bootle": "Liverpool", "st helens": "Liverpool",

            // Nottingham
            "beeston": "Nottingham", "arnold": "Nottingham",

            // London Sub-Areas (Comprehensive)
            "camden": "London", "camden town": "London", "kentish town": "London", "hampstead": "London", "highgate": "London", "archway": "London", "islington": "London", "holloway": "London", "finchley": "London", "barnet": "London", "edgware": "London",
            "stratford": "London", "hackney": "London", "dalston": "London", "bow": "London", "bethnal green": "London", "whitechapel": "London", "stepney": "London", "walthamstow": "London", "leyton": "London", "ilford": "London",
            "croydon": "London", "brixton": "London", "clapham": "London", "peckham": "London", "lewisham": "London", "greenwich": "London", "woolwich": "London", "dulwich": "London", "streatham": "London", "tooting": "London",
            "hammersmith": "London", "fulham": "London", "kensington": "London", "chelsea": "London", "shepherd's bush": "London", "acton": "London", "ealing": "London", "chiswick": "London", "hounslow": "London", "brentford": "London",
            "westminster": "London", "soho": "London", "covent garden": "London", "bloomsbury": "London", "holborn": "London", "fitzrovia": "London", "mayfair": "London", "marylebone": "London", "paddington": "London", "victoria": "London",
            "enfield": "London", "romford": "London", "barking": "London", "dagenham": "London", "uxbridge": "London", "harrow": "London", "wembley": "London", "hayes": "London", "sidcup": "London", "bexleyheath": "London", "kingston": "London", "twickenham": "London"
        };

        // Postcode Area Mapping (Prefix -> City)
        const postcodeToCityMap: Record<string, string> = {
            "M": "Manchester", "B": "Birmingham", "L": "Liverpool", "S": "Sheffield", "NG": "Nottingham",
            "LE": "Leicester", "DE": "Derby", "CV": "Coventry", "WV": "Wolverhampton", "ST": "Stoke-on-Trent",
            "PR": "Preston", "BL": "Bolton", "OL": "Oldham", "HD": "Huddersfield", "YO": "York", "HU": "Hull",
            "DN": "Doncaster", "NN": "Northampton", "MK": "Milton Keynes", "LU": "Luton", "PE": "Peterborough",
            "CB": "Cambridge", "NR": "Norwich", "IP": "Ipswich", "RG": "Reading", "OX": "Oxford", "SN": "Swindon",
            "GL": "Gloucester", "WR": "Worcester", "HR": "Hereford", "SY": "Shrewsbury", "TF": "Telford",
            "WS": "Cannock", "BA": "Bath", "BN": "Brighton & Hove", "BS": "Bristol", "CT": "Canterbury",
            "CA": "Carlisle", "CM": "Chelmsford", "CH": "Chester", "PO": "Portsmouth", "SO": "Southampton",
            "AL": "St Albans", "TR": "Truro", "WF": "Wakefield", "WA": "Warrington", "WN": "Wigan",
            "TS": "Middlesbrough", "FY": "Blackpool", "LS": "Leeds", "SW": "London", "SE": "London",
            "NW": "London", "N": "London", "E": "London", "EC": "London", "WC": "London", "W": "London",
            "UB": "London", "TW": "London", "KT": "London", "BR": "London", "CR": "London", "DA": "London",
            "EN": "London", "HA": "London", "IG": "London", "RM": "London", "SM": "London", "TN": "London"
        };

        // Simple Levenshtein implementation
        const levenshtein = (a: string, b: string): number => {
            const matrix = [];
            for (let i = 0; i <= b.length; i++) { matrix[i] = [i]; }
            for (let j = 0; j <= a.length; j++) { matrix[0][j] = j; }
            for (let i = 1; i <= b.length; i++) {
                for (let j = 1; j <= a.length; j++) {
                    if (b.charAt(i - 1) == a.charAt(j - 1)) {
                        matrix[i][j] = matrix[i - 1][j - 1];
                    } else {
                        matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1));
                    }
                }
            }
            return matrix[b.length][a.length];
        };

        const findClosestCity = (input: string): { city: string, isExactOrClose: boolean } => {
            const normalizedInput = input.toLowerCase().trim();

            // 1. Postcode Detection
            const postcodeMatch = normalizedInput.match(/^([a-z]{1,2})\d/);
            if (postcodeMatch) {
                const areaCode = postcodeMatch[1].toUpperCase();
                if (postcodeToCityMap[areaCode]) {
                    return { city: postcodeToCityMap[areaCode], isExactOrClose: true };
                }
            }

            // 2. Direct Area Mapping
            if (areaToCityMap[normalizedInput]) {
                return { city: areaToCityMap[normalizedInput], isExactOrClose: true };
            }

            // 3. Levenshtein Distance
            let bestMatch = "";
            let minDistance = Infinity;

            for (const city of validCities) {
                const cityLower = city.toLowerCase();

                if (cityLower === normalizedInput) {
                    return { city: city, isExactOrClose: true };
                }

                const dist = levenshtein(normalizedInput, cityLower);
                if (dist < minDistance) {
                    minDistance = dist;
                    bestMatch = city;
                }
            }

            // Allow small typos
            if (minDistance <= 3 || (normalizedInput.length > 4 && minDistance <= 4)) {
                return { city: bestMatch, isExactOrClose: true };
            }

            // 4. Fallback
            return { city: "London", isExactOrClose: false };
        };

        const result = findClosestCity(cleanLocation);
        const matchedCity = result.city;
        const isExactOrClose = result.isExactOrClose;

        const finalPath = `${basePath}/${matchedCity.toLowerCase().replace(/\s+/g, '-')}`;

        // Dynamic Reassurance
        let reassurance = "";

        if (isExactOrClose) {
            // Specific response for mapped areas
            reassurance = `That’s fine — I’ll use ${matchedCity} and get you the nearest available tradesperson.`;
        } else {
            // Fallback response for unknown areas
            reassurance = "I’ll use the nearest area to you so we can get help quickly.";
        }

        setFeedbackMessage(`Locating in ${matchedCity}...`);

        let navigated = false;
        const triggerNavigation = () => {
            if (!navigated) {
                navigated = true;
                navigate(finalPath);
                onClose();
            }
        };

        setTimeout(triggerNavigation, 3500);
        speak(reassurance, triggerNavigation);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div
                className="w-full max-w-md bg-transparent text-center flex flex-col items-center gap-8 relative"
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute -top-12 right-0 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Visualizer / Status Icon */}
                <div className="relative">
                    {status === 'listening' ? (
                        <div className="w-32 h-32 rounded-full bg-red-600 flex items-center justify-center animate-pulse">
                            <Mic className="w-16 h-16 text-white" />
                            <div className="absolute inset-0 rounded-full border-4 border-red-500 animate-ping opacity-50"></div>
                        </div>
                    ) : status === 'speaking' ? (
                        <div className="w-32 h-32 rounded-full bg-blue-600 flex items-center justify-center">
                            <Activity className="w-16 h-16 text-white animate-bounce" />
                        </div>
                    ) : status === 'processing' ? (
                        <div className="w-32 h-32 rounded-full bg-yellow-500 flex items-center justify-center animate-spin">
                            <div className="w-24 h-24 border-4 border-white border-t-transparent rounded-full"></div>
                        </div>
                    ) : (
                        <button
                            onClick={startListening}
                            className="w-32 h-32 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center transition"
                        >
                            <Mic className="w-12 h-12 text-slate-300" />
                        </button>
                    )}
                </div>

                {/* Text Feedback */}
                <div className="space-y-4 max-w-xs mx-auto">
                    <h3 className="text-2xl font-bold text-white">
                        {status === 'listening' ? 'Listening...' : status === 'speaking' ? 'Speaking...' : status === 'processing' ? 'Thinking...' : 'Tap Mic to Speak'}
                    </h3>

                    <p className="text-lg text-slate-300 min-h-[3rem] font-medium">
                        "{feedbackMessage}"
                    </p>
                </div>

                {/* Safety Warning Visual (Conditional) */}
                {feedbackMessage.includes('SAFETY') && (
                    <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-xl flex items-center gap-3 text-left">
                        <AlertTriangle className="w-8 h-8 shrink-0 animate-pulse" />
                        <p className="text-sm font-bold">Life Threatening Danger? Call 999 immediately.</p>
                    </div>
                )}
                {/* Debug / Version Info */}
                <div className="absolute bottom-2 text-xs text-slate-500 font-mono">
                    v2.0 Native | Voices: {voices.length} | {status}
                </div>
            </div>
        </div>
    );
};

export default VoiceAssistantModal;
