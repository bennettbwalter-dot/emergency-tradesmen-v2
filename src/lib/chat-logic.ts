import { trades, cities, usCities } from "@/lib/trades";
import { SAFETY_TIPS } from "@/services/gemini/constants";
import { geocodeLocation, findNearestSupportedCity, POSTCODE_REGEX } from "@/lib/location-utils";
import { cityPostcodes } from "@/lib/cityPostcodes";

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
    ],
    roofer: [
        'roof leak', 'leaking roof', 'water coming through roof', 'rain coming in',
        'roof damaged', 'hole in roof', 'roof blown off', 'storm damage roof',
        'roof emergency', 'missing tiles', 'broken tiles', 'cracked tiles',
        'slipped tiles', 'roof tiles fallen', 'slate roof issue', 'flat roof leak',
        'felt roof damage', 'chimney leak', 'flashing damaged', 'lead flashing',
        'chimney stack problem', 'gutter leaking from roof', 'gutter pulled away',
        'gutter overflow from roof', 'roofer', 'emergency roofer', 'roofing repair',
        'roof repair', 'roof inspection', 'roof', 'tiles', 'chimney', 'leak from above'
    ],
    builder: [
        // Structural & Wall
        'cracked wall', 'wall cracking', 'internal wall crack', 'external wall crack',
        'ceiling crack', 'ceiling collapsed', 'wall collapsed', 'structural damage',
        'building damage', 'house damage', 'property damage', 'subsidence',
        'sinking floor', 'uneven floor', 'foundation issue', 'support beam',

        // Carpentry & Woodwork
        'carpenter', 'carpentry work', 'woodwork', 'timber repair',
        'wooden frame repair', 'door frame broken', 'door frame loose',
        'window frame damaged', 'skirting board loose', 'skirting board fallen',
        'architrave loose', 'bannister loose', 'handrail broken', 'stairs damaged',

        // Doors, Cupboards & Fittings
        'cupboard fallen', 'cupboard hanging off wall', 'kitchen unit fallen',
        'wall cabinet fallen', 'shelf fallen', 'shelving repair',
        'fitted wardrobe broken', 'wardrobe collapsed', 'door not closing properly',
        'door off hinges', 'internal door repair',

        // General Building & Maintenance
        'builder', 'general builder', 'building work', 'maintenance work',
        'property maintenance', 'home maintenance', 'house repair',
        'general repair', 'emergency repair', 'damage repair',

        // Brickwork & Masonry
        'brickwork repair', 'bricks loose', 'bricks fallen', 'brick wall repair',
        'damaged brickwork', 'repointing', 'pointing repair', 'masonry repair',

        // Floors, Ceilings & Plaster
        'floor damaged', 'floor collapsed', 'floor repair', 'ceiling repair',
        'plaster cracked', 'plaster fallen', 'hole in wall', 'hole in ceiling',
        'wall repair'
    ]
};

// ASYNC UPDATE: Returns Promise<{ newState, response }>
export async function processUserMessage(message: string, currentState: ChatState, countryCode: string = 'GB'): Promise<{ newState: ChatState, response: ChatMessage }> {
    const lowerMsg = message.toLowerCase();
    const newState = { ...currentState };

    // Use appropriate city list based on country
    const activeCities = countryCode === 'US' ? usCities : cities;

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
    // 2. GENERAL PAGE NAVIGATION (Expanded Knowledge)
    if (lowerMsg.includes('blog') || lowerMsg.includes('news')) return { newState, response: { id: Date.now().toString(), role: 'assistant', content: "Opening the Blog.", action: 'navigate', target: '/blog' } };
    if (lowerMsg.includes('about')) return { newState, response: { id: Date.now().toString(), role: 'assistant', content: "Opening About Us.", action: 'navigate', target: '/about' } };
    if (lowerMsg.includes('contact') || lowerMsg.includes('email') || lowerMsg.includes('phone')) return { newState, response: { id: Date.now().toString(), role: 'assistant', content: "Opening Contact page.", action: 'navigate', target: '/contact' } };
    if (lowerMsg.includes('sign up') || lowerMsg.includes('join') || lowerMsg.includes('register')) return { newState, response: { id: Date.now().toString(), role: 'assistant', content: "Opening Tradesmen Sign Up.", action: 'navigate', target: '/tradesmen' } };
    if (lowerMsg.includes('home') || lowerMsg.includes('start')) return { newState, response: { id: Date.now().toString(), role: 'assistant', content: "Taking you Home.", action: 'navigate', target: '/' } };

    // GUIDANCE / BLOG MODE (Specific Safety Qs)
    if (lowerMsg.includes('what should i do') || lowerMsg.includes('is this dangerous') || lowerMsg.includes('stay safe') || lowerMsg.includes('how to')) {
        return {
            newState,
            response: {
                id: Date.now().toString(),
                role: 'assistant',
                content: "Your safety is priority. I can show you step-by-step emergency guides.",
                action: 'navigate',
                target: '/blog'
            }
        };
    }

    // New Routes
    if (lowerMsg.includes('price') || lowerMsg.includes('cost') || lowerMsg.includes('rates')) return { newState, response: { id: Date.now().toString(), role: 'assistant', content: "Opening Pricing information.", action: 'navigate', target: '/pricing' } };
    if (lowerMsg.includes('privacy')) return { newState, response: { id: Date.now().toString(), role: 'assistant', content: "Opening Privacy Policy.", action: 'navigate', target: '/privacy' } };
    if (lowerMsg.includes('term') || lowerMsg.includes('condition')) return { newState, response: { id: Date.now().toString(), role: 'assistant', content: "Opening Terms & Conditions.", action: 'navigate', target: '/terms' } };
    if (lowerMsg.includes('how') && lowerMsg.includes('work')) return { newState, response: { id: Date.now().toString(), role: 'assistant', content: "Assuming you mean 'How it Works'. Opening that now.", action: 'navigate', target: '/how-it-works' } };
    if (lowerMsg.includes('login') || lowerMsg.includes('log in') || lowerMsg.includes('sign in')) return { newState, response: { id: Date.now().toString(), role: 'assistant', content: "Opening Login page.", action: 'navigate', target: '/login' } };
    if (lowerMsg.includes('dashboard') || lowerMsg.includes('account')) return { newState, response: { id: Date.now().toString(), role: 'assistant', content: "Opening your Dashboard.", action: 'navigate', target: '/user/dashboard' } };
    if (lowerMsg.includes('service') || lowerMsg.includes('trades')) return { newState, response: { id: Date.now().toString(), role: 'assistant', content: "Showing all our Services.", action: 'navigate', target: '/#services' } };

    // Help / Capabilities Handler
    if (lowerMsg.includes('help') || lowerMsg.includes('what can you do')) {
        return {
            newState,
            response: {
                id: Date.now().toString(),
                role: 'assistant',
                content: "I can help you find an emergency tradesperson immediately. I know about plumbing, electrical, gas, locks, drains, glazing, roofing, building, and breakdowns. Just tell me what's wrong."
            }
        };
    }

    // STATE MACHINE IMPLEMENTATION

    // 3. DETECT TRADE (if not already known)
    if (!newState.detectedTrade) {
        // GAS Override (Highest Priority)
        if (!lowerMsg.includes('fishy') && GAS_EMERGENCY_KEYWORDS.some(k => lowerMsg.includes(k))) {
            newState.detectedTrade = 'gas-engineer';
        } else {
            // Check for specific trade matches
            const detectedTrades: string[] = [];
            const tradeOrder = ['electrician', 'plumber', 'drain-specialist', 'glazier', 'locksmith', 'breakdown', 'roofer', 'gas-engineer'];

            for (const slug of tradeOrder) {
                if (TRADE_KEYWORDS[slug]?.some(k => lowerMsg.includes(k))) {
                    detectedTrades.push(slug);
                }
            }

            const isBuilder = TRADE_KEYWORDS['builder'].some(k => lowerMsg.includes(k));

            // OVERLAP LOGIC: Builder + Specialized Trade
            // If we have Builder keywords AND a specialized trade (e.g. Plumber), we clarify.
            if (isBuilder && detectedTrades.length > 0) {
                // If the user ALREADY answered the clarification question
                if (lowerMsg.includes('structure') || lowerMsg.includes('fitting') || lowerMsg.includes('general')) {
                    newState.detectedTrade = 'builder';
                } else if (lowerMsg.includes('electric') || lowerMsg.includes('plumb') || lowerMsg.includes('gas')) {
                    // Let the normal loop pick up the trade below, or stricter assignment here
                    // We'll rely on the detectedTrades loop unless we want to force it.
                    // For now, let's just return to the user to clarify if we are strictly in ambiguous state.
                    // But if they said "plumbing", detectedTrades has 'plumber', so we can just let it flow.
                    if (lowerMsg.includes('electric')) newState.detectedTrade = 'electrician';
                    else if (lowerMsg.includes('plumb')) newState.detectedTrade = 'plumber';
                    else if (lowerMsg.includes('gas')) newState.detectedTrade = 'gas-engineer';
                } else {
                    // AMBIGUOUS -> ASK CLARIFICATION
                    return {
                        newState,
                        response: {
                            id: Date.now().toString(),
                            role: 'assistant',
                            content: "Is the issue with electrics, plumbing, gas, or the structure or fittings of the property?"
                        }
                    };
                }
            }

            // If no trade identified yet
            if (!newState.detectedTrade) {
                // 1. If strict specialized trade found, use it
                if (detectedTrades.length > 0) {
                    newState.detectedTrade = detectedTrades[0];
                }
                // 2. If no specialized trade, but IS builder -> Use Builder (Catch-all)
                else if (isBuilder) {
                    newState.detectedTrade = 'builder';
                }
                // 3. Fallbacks
                else {
                    if (lowerMsg.includes('burning') && (lowerMsg.includes('power') || lowerMsg.includes('smell'))) newState.detectedTrade = 'electrician';
                    else if (lowerMsg.includes('buzzing')) newState.detectedTrade = 'electrician';
                    else if (lowerMsg.includes('water') && lowerMsg.includes('electric')) newState.detectedTrade = 'plumber';
                    else if (lowerMsg.includes('broken window')) newState.detectedTrade = 'glazier';
                }
            }
        }
    }

    // 4. DETECT CITY (Async Fallback Added)
    // We track fallback usage to modify response
    let cityFallbackUsed = false;
    let originalCity = "";

    if (!newState.detectedCity) {
        // A. Strict Match First (Fast)
        const foundCity = activeCities.find(c => lowerMsg.includes(c.toLowerCase()));
        if (foundCity) {
            newState.detectedCity = foundCity;
        }
        // A.5 Postcode Extraction (High Precision)
        else {
            let handled = false;

            // 1. Postcode Match
            const pMatch = message.match(POSTCODE_REGEX);
            if (pMatch) {
                const cleanPostcode = pMatch[0].toUpperCase();
                console.log(`[Voice] Postcode detected: ${cleanPostcode}`);
                const coords = await geocodeLocation(cleanPostcode, countryCode);
                if (coords) {
                    const match = findNearestSupportedCity(coords.lat, coords.lon, countryCode);
                    if (match) {
                        newState.detectedCity = match.city;
                        cityFallbackUsed = true;
                        originalCity = cleanPostcode;
                        handled = true;
                    }
                }
            }

            // 2. Area Name Match (e.g. "Brixton", "Camden")
            if (!handled) {
                const foundArea = Object.keys(cityPostcodes).find(area => lowerMsg.includes(area.toLowerCase()));
                if (foundArea) {
                    console.log(`[Voice] Area detected: ${foundArea}`);
                    const coords = await geocodeLocation(foundArea, countryCode);
                    if (coords) {
                        const match = findNearestSupportedCity(coords.lat, coords.lon, countryCode);
                        if (match) {
                            newState.detectedCity = match.city;
                            cityFallbackUsed = true;
                            originalCity = foundArea;
                        }
                    }
                }
            }
        }

        // B. Nominatim Fallback (Slower but covers entire UK)
        if (!newState.detectedCity && newState.detectedTrade) {
            const isLocationStep = currentState.step === 'LOCATION_CHECK';

            // Heuristic: If we are asking for location, or message is short enough to be a location statement
            if (isLocationStep || lowerMsg.length < 50) {
                const locationQuery = lowerMsg
                    .replace("i'm in", "")
                    .replace("i am in", "")
                    .replace("live in", "")
                    .replace("located in", "")
                    .trim();

                if (locationQuery.length > 2) {
                    const coords = await geocodeLocation(locationQuery, countryCode);
                    if (coords) {
                        const match = findNearestSupportedCity(coords.lat, coords.lon, countryCode);
                        if (match) {
                            // SUCCESS: We mapped "Brixton" -> "London"
                            newState.detectedCity = match.city;
                            cityFallbackUsed = true;
                            originalCity = coords.displayName.split(',')[0]; // "Brixton"
                            console.log(`[Location Fallback] Mapped '${originalCity}' -> '${match.city}' (${match.distance.toFixed(1)}km)`);
                        }
                    }
                }
            }
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

        let transition = "I'm taking you to the right Emergency Tradesmen page now.";

        // Intelligent Fallback Message
        if (cityFallbackUsed) {
            // Explain why we are sending them to X
            transition = `I can't see a specific page for ${originalCity}, but our ${city} team covers that area. I'm taking you there now.`;
        }

        // NO Post-Nav Instruction per user request

        responseText = `${advicePart}${transition}`;
        action = 'navigate';
        // Include /us prefix for US routes
        const countryPrefix = countryCode === 'US' ? '/us' : '';
        target = `${countryPrefix}/emergency-${newState.detectedTrade}/${encodeURIComponent(city.toLowerCase())}`;
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
            // Include /us prefix for US routes
            const countryPrefix = countryCode === 'US' ? '/us' : '';
            target = `${countryPrefix}/emergency-${newState.detectedTrade}`;
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
