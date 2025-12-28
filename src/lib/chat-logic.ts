import { trades, cities } from "@/lib/trades";
import { SAFETY_TIPS } from "@/services/gemini/constants";

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

    // 1. DANGER CHECK (Keep existing safeguard but ensure it doesn't break flow if not critical)
    if (DANGER_KEYWORDS.some(k => lowerMsg.includes(k))) {
        return {
            newState,
            response: {
                id: Date.now().toString(),
                role: 'assistant',
                content: "⚠️ IMMEDIATE DANGER DETECTED\n\nIf there is immediate danger to life or property (fire, explosion, crime in progress), please call 999 immediately.\n\nIf you are safe and need a tradesperson, please confirm: 'I am safe'."
            }
        };
    }

    // 2. GENERAL PAGE NAVIGATION (Section 9 Override)
    if (lowerMsg.includes('blog')) return { newState, response: { id: Date.now().toString(), role: 'assistant', content: "Opening the Blog.", action: 'navigate', target: '/blog' } };
    if (lowerMsg.includes('about')) return { newState, response: { id: Date.now().toString(), role: 'assistant', content: "Opening About Us.", action: 'navigate', target: '/about' } };
    if (lowerMsg.includes('contact')) return { newState, response: { id: Date.now().toString(), role: 'assistant', content: "Opening Contact page.", action: 'navigate', target: '/contact' } };
    if (lowerMsg.includes('sign up') || lowerMsg.includes('join')) return { newState, response: { id: Date.now().toString(), role: 'assistant', content: "Opening Tradesmen Sign Up.", action: 'navigate', target: '/tradesmen' } };
    if (lowerMsg.includes('home')) return { newState, response: { id: Date.now().toString(), role: 'assistant', content: "Taking you Home.", action: 'navigate', target: '/' } };

    // STATE MACHINE IMPLEMENTATION

    // 3. DETECT TRADE (if not already known)
    if (!newState.detectedTrade) {
        // GAS Override (Highest Priority)
        if (!lowerMsg.includes('fishy') && GAS_EMERGENCY_KEYWORDS.some(k => lowerMsg.includes(k))) {
            newState.detectedTrade = 'gas-engineer';
        } else {
            // Check other trades
            const tradeOrder = ['electrician', 'plumber', 'drain-specialist', 'glazier', 'locksmith', 'breakdown'];
            // Simple keyword matching from existing maps
            for (const slug of tradeOrder) {
                if (TRADE_KEYWORDS[slug]?.some(k => lowerMsg.includes(k))) {
                    newState.detectedTrade = slug;
                    break;
                }
            }
            // Disambiguation helpers (simplify to direct assignments if trade still null)
            if (!newState.detectedTrade) {
                if (lowerMsg.includes('burning') && (lowerMsg.includes('power') || lowerMsg.includes('smell'))) newState.detectedTrade = 'electrician';
                else if (lowerMsg.includes('water') && lowerMsg.includes('electric')) newState.detectedTrade = 'plumber';
                else if (lowerMsg.includes('broken window')) newState.detectedTrade = 'glazier';
            }
        }
    }

    // 4. DETECT CITY (Always check if we don't have it, or if user might be updating it)
    if (!newState.detectedCity) {
        const foundCity = cities.find(c => lowerMsg.includes(c.toLowerCase()));
        if (foundCity) {
            newState.detectedCity = foundCity;
        }
    }

    // 5. GENERATE RESPONSE BASED ON STATE
    let responseText = "";
    let action: 'navigate' | undefined;
    let target: string | undefined;

    const tip = newState.detectedTrade ? (SAFETY_TIPS[newState.detectedTrade] || "") : "";

    // CASE A: TRADE & CITY KNOWN -> NAVIGATE
    if (newState.detectedTrade && newState.detectedCity) {
        const city = newState.detectedCity;

        // Logic: Should we say the tip?
        // If we just asked for location (Step == LOCATION_CHECK), user already heard the tip. Don't repeat.
        // If this is the first turn (Step == INITIAL/TRADE_CHECK), user hasn't heard it. Say it.
        const shouldSayTip = currentState.step !== 'LOCATION_CHECK';
        const advicePart = (shouldSayTip && tip) ? `${tip} ` : "";

        // Navigation Phrase
        const transition = "I’m taking you to the right Emergency Tradesmen page now.";

        // NO Post-Nav Instruction per user request

        responseText = `${advicePart}${transition}`;
        action = 'navigate';
        target = `/emergency-${newState.detectedTrade}/${city.toLowerCase()}`;
        newState.step = 'ROUTING';
    }
    // CASE B: TRADE KNOWN, CITY UNKNOWN -> ASK LOCATION
    else if (newState.detectedTrade && !newState.detectedCity) {
        // Check if we already gave the tip and are just looping for location?
        if (currentState.step === 'LOCATION_CHECK') {
            // We already asked, and they didn't give a valid city.
            // Fallback logic as per Master Manual: use nearest area.

            const fallbackText = "That’s fine — I’ll use the nearest area so we can get help quickly.";
            const transition = "I’m taking you to the right Emergency Tradesmen page now.";

            responseText = `${fallbackText} ${transition}`;
            action = 'navigate';
            target = `/emergency-${newState.detectedTrade}`;
            newState.step = 'ROUTING';
        } else {
            // First time asking for location: GIVE TIP FIRST
            responseText = `${tip} What town, area, or postcode are you in?`;
            newState.step = 'LOCATION_CHECK';
        }
    }
    // CASE C: TRADE UNKNOWN -> CLARIFY
    else {
        // Specific check: Did user ask for a list?
        if (lowerMsg.includes('trade') || lowerMsg.includes('service') || lowerMsg.includes('list') || lowerMsg.includes('cover')) {
            responseText = "We cover plumbing, electrical, gas, locks, drains, glazing, and vehicle breakdown. Which one do you need?";
        } else {
            // Default gentle prompt (User request: Do not list trades unless asked)
            responseText = "I didn't catch that. Could you briefly describe the issue?";
        }
        newState.step = 'TRADE_CHECK';
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
