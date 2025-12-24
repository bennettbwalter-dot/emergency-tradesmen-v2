import { trades, cities } from "@/lib/trades";
import { searchKnowledgeBase, KNOWLEDGE_BASE_DATA } from "@/lib/knowledge-base";

export interface ChatState {
    step: 'INITIAL' | 'DANGER_CHECK' | 'LOCATION_CHECK' | 'TRADE_CHECK' | 'ROUTING';
    detectedTrade: string | null;
    detectedCity: string | null;
    history: ChatMessage[];
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    action?: 'call' | 'navigate';
    target?: string;
}

// HIGHEST PRIORITY: Gas Emergency Keywords (override everything)
const GAS_EMERGENCY_KEYWORDS = [
    'gas', // Standalone - any mention of gas likely needs gas engineer
    'gas smell', 'smell of gas', 'gas leak', 'hissing sound',
    'carbon monoxide', 'co alarm', 'boiler gas', 'pilot light out',
    'gas boiler not working', 'gas meter', 'emergency gas', 'gas safety',
    'carbon monoxide alarm', 'fumes', 'dizziness', 'headache'
];

// Life-threatening danger keywords (999 override)
const DANGER_KEYWORDS = [
    'fire', 'flames', 'smoke', 'explosion', 'attack', 'break in',
    'unconscious', 'not breathing', 'severe injury'
];

// Comprehensive trade-specific keywords
const TRADE_KEYWORDS: Record<string, string[]> = {
    'gas-engineer': [
        ...GAS_EMERGENCY_KEYWORDS,
        'gas engineer', 'gas safe', 'gas certificate'
    ],
    'plumber': [
        'burst pipe', 'leaking pipe', 'water leak', 'flooding',
        'no hot water', 'low water pressure', 'radiator leak',
        'radiator not working', 'boiler leak', 'dripping tap',
        'toilet leaking', 'toilet not flushing', 'water shut off',
        'stopcock', 'pipe frozen', 'heating not working',
        'water', 'leak', 'pipe', 'burst', 'flood', 'drip',
        'tap', 'toilet', 'sink', 'shower', 'plumber', 'plumbing'
    ],
    'electrician': [
        'power cut', 'lights out', 'no electricity', 'fuse box',
        'consumer unit', 'tripped fuse', 'circuit breaker', 'sparks',
        'burning smell', 'socket not working', 'electric shock',
        'buzzing socket', 'flickering lights', 'blown fuse',
        'wiring issue', 'electrical fault', 'power', 'electricity',
        'spark', 'fuse', 'light', 'socket', 'wire', 'wiring',
        'blackout', 'electrician', 'electrical'
    ],
    'glazier': [
        'broken window', 'smashed glass', 'cracked glass',
        'shattered window', 'glass everywhere', 'boarded window',
        'emergency glazing', 'shop window broken', 'window smashed',
        'glass door broken', 'unsafe glass', 'broken pane',
        'glass', 'window', 'pane', 'glazier', 'board up'
    ],
    'locksmith': [
        'locked out', 'key snapped', 'key stuck', 'lost keys',
        'broken lock', 'door won\'t lock', 'door won\'t open',
        'lock jammed', 'burglary repair', 'lock replacement',
        'emergency locksmith', 'can\'t get in', 'locked inside',
        'lock damage', 'key', 'lock', 'door', 'burglar', 'locksmith'
    ],
    'drain-specialist': [
        'blocked drain', 'blocked toilet', 'toilet overflowing',
        'sewage smell', 'drain backing up', 'slow draining',
        'waste pipe blocked', 'sink blocked', 'gurgling drain',
        'water backing up', 'manhole overflow', 'foul smell drains',
        'drainage emergency', 'flooded drain', 'blocked', 'drain',
        'sewage', 'overflow', 'gutter'
    ],
    'breakdown': [
        'car won\'t start', 'breakdown', 'broken down',
        'roadside assistance', 'recovery truck', 'flat battery',
        'engine cut out', 'stuck on roadside', 'vehicle won\'t move',
        'jump start', 'emergency recovery', 'mobile mechanic',
        'breakdown service', 'car stalled', 'recovery vehicle',
        'car', 'accident', 'start', 'battery', 'tyre', 'flat',
        'tow', 'recovery', 'roadside', 'mechanic', 'clutch',
        'brakes', 'engine'
    ]
};

export function processUserMessage(message: string, currentState: ChatState): { newState: ChatState, response: ChatMessage } {
    const lowerMsg = message.toLowerCase();
    const newState = { ...currentState };

    // 1. DANGER CHECK (999 Emergency Override)
    if (DANGER_KEYWORDS.some(k => lowerMsg.includes(k))) {
        return {
            newState,
            response: {
                id: Date.now().toString(),
                role: 'assistant',
                content: "⚠️ IMMEDIATE DANGER DETECTED\n\nIf there is immediate danger to life or property (fire, explosion, crime in progress), please call 999 immediately.\n\nEmergency Tradesmen follows strict UK safety rules. If you are safe and need a tradesperson, please confirm: 'I am safe'."
            }
        };
    }

    // 2. GAS EMERGENCY CHECK (HIGHEST PRIORITY - overrides all other trades)
    // Exception: "fishy smell" is electrical, not gas
    const hasFishySmell = lowerMsg.includes('fishy smell') || lowerMsg.includes('fishy');
    const hasGasKeyword = !hasFishySmell && GAS_EMERGENCY_KEYWORDS.some(k => lowerMsg.includes(k));

    if (hasGasKeyword) {
        newState.detectedTrade = 'gas-engineer';
    }

    // 3. DISAMBIGUATION RULES (only if gas not detected)
    if (!hasGasKeyword && !newState.detectedTrade) {
        const hasBurningSmell = lowerMsg.includes('burning smell');
        const hasPowerIssue = lowerMsg.includes('power') || lowerMsg.includes('electric');
        const hasWaterIssue = lowerMsg.includes('water') || lowerMsg.includes('leak');
        const hasBrokenWindow = lowerMsg.includes('broken window') || lowerMsg.includes('smashed glass');
        const hasDoorLock = lowerMsg.includes('lock') || lowerMsg.includes('door');

        // Disambiguation: burning smell + power = Electrician
        if (hasBurningSmell && hasPowerIssue) {
            newState.detectedTrade = 'electrician';
        }
        // Disambiguation: broken window + can't lock = Glazier first
        else if (hasBrokenWindow && hasDoorLock) {
            newState.detectedTrade = 'glazier';
        }
        // Disambiguation: water + electrics = Plumber first
        else if (hasWaterIssue && hasPowerIssue) {
            newState.detectedTrade = 'plumber';
        }
    }

    // 4. STANDARD TRADE DETECTION (if not already set by disambiguation or gas)
    if (!newState.detectedTrade) {
        // Check trades in priority order: gas-engineer first, then others
        const tradeOrder = ['gas-engineer', 'electrician', 'plumber', 'drain-specialist', 'glazier', 'locksmith', 'breakdown'];

        for (const slug of tradeOrder) {
            const keywords = TRADE_KEYWORDS[slug];
            if (keywords && keywords.some(k => lowerMsg.includes(k))) {
                newState.detectedTrade = slug;
                break;
            }
        }
    }

    // 5. DETECT CITY
    if (!newState.detectedCity) {
        const foundCity = cities.find(c => lowerMsg.includes(c.toLowerCase()));
        if (foundCity) {
            newState.detectedCity = foundCity;
        }
    }

    // 6. LOGIC FLOW
    let responseText = "";
    let action: 'navigate' | undefined;
    let target: string | undefined;

    // Search Knowledge Base for safety advice ONLY if not a gas emergency
    let safetyAdvice = "";

    if (newState.detectedTrade !== 'gas-engineer') {
        safetyAdvice = searchKnowledgeBase(lowerMsg);

        // Fallback: If no keyword match but we detected a trade, get generic advice
        if (!safetyAdvice && newState.detectedTrade) {
            const tradeToKbMap: Record<string, keyof typeof KNOWLEDGE_BASE_DATA> = {
                'plumber': 'PLUMBING',
                'electrician': 'ELECTRICAL',
                'locksmith': 'LOCKSMITH',
                'gas-engineer': 'PLUMBING',
                'drain-specialist': 'DRAINAGE',
                'glazier': 'GLAZING',
                'breakdown': 'VEHICLE'
            };
            const kbKey = tradeToKbMap[newState.detectedTrade];
            if (kbKey && KNOWLEDGE_BASE_DATA[kbKey]) {
                safetyAdvice = KNOWLEDGE_BASE_DATA[kbKey].safety_tips.join('\n');
            }
        }
    }

    // 7. RESPONSE GENERATION
    if (newState.detectedTrade && newState.detectedCity) {
        const city = newState.detectedCity;
        const trade = trades.find(t => t.slug === newState.detectedTrade)?.name || newState.detectedTrade;

        let advicePrefix = "";

        // Special handling for gas emergencies
        if (newState.detectedTrade === 'gas-engineer') {
            advicePrefix = "🚨 GAS EMERGENCY DETECTED\n\n⚠️ SAFETY FIRST:\n• Open windows and doors immediately\n• DO NOT use electrical switches or flames\n• Turn off gas at the meter if safe to do so\n• Evacuate if you smell gas\n• Call National Gas Emergency: 0800 111 999\n\n";
        } else if (safetyAdvice) {
            advicePrefix = `Safety-first guidance:\n${safetyAdvice}\n\n`;
        }

        responseText = `${advicePrefix}I've found verified ${trade} services in ${city}. Connecting you now...`;
        action = 'navigate';
        target = `/emergency-${newState.detectedTrade}/${city.toLowerCase()}`;
        newState.step = 'ROUTING';
    } else if (newState.detectedTrade && !newState.detectedCity) {
        // Add gas warning if applicable
        let gasPrefix = "";
        if (newState.detectedTrade === 'gas-engineer') {
            gasPrefix = "🚨 GAS EMERGENCY\n\n⚠️ SAFETY FIRST:\n• Open windows and doors\n• DO NOT use switches or flames\n• Evacuate if you smell gas\n• Call National Gas Emergency: 0800 111 999\n\n";
        }

        responseText = safetyAdvice
            ? `${gasPrefix}${safetyAdvice}\n\nWhich city or area are you in? (You can also press the Locate Me button to detect your location automatically)`
            : `${gasPrefix}I can help with that. Which city or area are you in? (You can also press the Locate Me button to detect your location automatically)`;
        newState.step = 'LOCATION_CHECK';
    } else if (!newState.detectedTrade && newState.detectedCity) {
        responseText = `Okay, I see you're in ${newState.detectedCity}. Briefly describe your emergency so I can direct you to the right help.`;
        newState.step = 'TRADE_CHECK';
    } else {
        // Nothing detected - ask for clarification
        if (safetyAdvice) {
            responseText = `Safety-first guidance:\n${safetyAdvice}\n\nTo find a tradesperson, please tell me your location and the nature of the emergency. You can also press the flashing Locate Me button to detect your location automatically.`;
        } else {
            responseText = "I'm here to help. I'll guide you to the right local trade while prioritizing your safety. Could you tell me what the emergency is and where you are located? (Tip: Press the flashing Locate Me button to detect your location)";
        }
        newState.step = 'INITIAL';
    }

    return {
        newState,
        response: {
            id: Date.now().toString(),
            role: 'assistant',
            content: responseText,
            action,
            target
        }
    };
}

