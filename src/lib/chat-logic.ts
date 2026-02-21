import { trades, cities, usCities } from "@/lib/trades";
import { geocodeLocation, findNearestSupportedCity, POSTCODE_REGEX } from "@/lib/location-utils";
import { cityPostcodes } from "@/lib/cityPostcodes";

// OPTIMIZED FOR MOBILE TTS: Short, punchy tips.
const SAFETY_TIPS: Record<string, string> = {
    'gas-engineer': "Gas emergencies are dangerous. If you smell gas, leave immediately and call the National Grid.",
    'electrician': "If there are sparks or smoke, turn off the main power if safe to do so.",
    'plumber': "Turn off your main stopcock to prevent further flooding.",
    'water-restoration': "Avoid the water if there are live electrics nearby and stay in a dry area.",
    'locksmith': "If you are locked out, stay in a safe, well-lit area while you wait.",
    'glazier': "Be careful of broken glass; do not try to remove it yourself or walk near it.",
    'drain-specialist': "Avoid using any taps or toilets until the blockage is cleared to prevent overflow.",
    'roofer': "Stay clear of falling debris and avoid going near any damaged or leaking areas.",
    'builder': "Stay away from any structural damage or unstable walls for your safety.",
    'breakdown': "Stay in a safe place away from traffic and keep your hazard lights on.",
    'air-conditioning': "Turn off the unit and avoid touching any leaking fluids or electrical parts."
};

export interface ChatState {
    step: 'INITIAL' | 'DANGER_CHECK' | 'LOCATION_CHECK' | 'TRADE_CHECK' | 'CONFIRM_LOCATION' | 'ROUTING';
    detectedTrade: string | null;
    detectedCity: string | null;
    suggestedCity: string | null;
    locationConfirmed: boolean;
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
    ],
    'air-conditioning': [
        // Primary keywords
        'air conditioning', 'air con', 'ac', 'air con repair', 'air con installation',
        // Long-tail
        'air conditioning not working', 'air con not blowing cold air', 'air conditioner broken',
        'air con leaking water inside', 'air conditioning repair near me', 'emergency air conditioning repair',
        'same day air con repair', 'air conditioning service company', 'air con servicing near me',
        'ac not cooling properly', 'air conditioner making noise', 'air con stopped working suddenly',
        'commercial air conditioning repair',
        // Conversational
        'my air con is not working', 'no cold air coming out', 'air conditioning has stopped',
        'air con leaking water', 'air conditioner broken', 'the air con won\'t turn on'
    ],
    'water-restoration': [
        // Primary keywords
        'water restoration', 'water damage', 'flood damage', 'flooded house', 'water cleanup', 'water extraction',
        // Long-tail
        'emergency water restoration near me', 'flooded house emergency help', 'water damage cleanup company',
        'burst pipe water damage repair', 'ceiling collapsed from water leak', 'storm water damage repair',
        'sewage flood cleanup service', 'water damage restoration company near me', '24 hour emergency water damage service',
        'water extraction after flood', 'wet carpets after flooding', 'structural drying after flood',
        'dehumidifier service after water leak', 'insurance water damage cleanup',
        // Conversational
        'my house is flooded', 'water is everywhere', 'ceiling is leaking badly',
        'pipe burst and flooded my home', 'toilet overflowed everywhere', 'rain flooded my house',
        'water coming through the ceiling'
    ]
};

// ASYNC UPDATE: Returns Promise<{ newState, response }>
export async function processUserMessage(message: string, currentState: ChatState, countryCode: string = 'GB'): Promise<{ newState: ChatState, response: ChatMessage }> {
    const lowerMsg = message.toLowerCase();
    const newState = { ...currentState };

    // Reset navigation signals for new message processing
    newState.step = currentState.step; // Preserve step by default

    // Use appropriate city list based on country
    const activeCities = countryCode === 'US' ? usCities : cities;
    // Sort by length (longest first) to prioritize more specific matches like "Newcastle upon Tyne" over "Newcastle"
    const sortedCities = [...activeCities].sort((a, b) => b.length - a.length);

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

    // TRADE KEYWORD PRESENCE CHECK
    // If the message contains ANY trade-related keywords, skip navigation/help handlers
    // and go straight to trade detection. This prevents "I need help, my gas is leaking"
    // from triggering the help handler instead of detecting gas-engineer.
    const ALL_TRADE_KEYWORDS = Object.values(TRADE_KEYWORDS).flat();
    const hasTradeKeywords = ALL_TRADE_KEYWORDS.some(k => lowerMsg.includes(k)) ||
        GAS_EMERGENCY_KEYWORDS.some(k => lowerMsg.includes(k));

    // 2. GENERAL PAGE NAVIGATION — only when NOT describing an emergency
    if (!hasTradeKeywords) {
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

        // Help / Capabilities Handler — only when user is asking for help, not describing an emergency
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
            const tradeOrder = ['water-restoration', 'electrician', 'plumber', 'drain-specialist', 'glazier', 'locksmith', 'breakdown', 'roofer', 'gas-engineer', 'air-conditioning'];

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
                // NEGATIVE KEYWORD GUARD: If user clearly mentions gas/boiler/radiator, don't route to water-restoration or air-conditioning
                const negativeKeywords = ['boiler', 'gas', 'radiator', 'central heating', 'gas engineer'];
                const hasNegativeKeyword = negativeKeywords.some(k => lowerMsg.includes(k));

                // 1. If strict specialized trade found, use it
                if (detectedTrades.length > 0) {
                    const hasWaterRestoration = detectedTrades.includes('water-restoration');
                    const hasAirConditioning = detectedTrades.includes('air-conditioning');
                    const hasPlumber = detectedTrades.includes('plumber');

                    // CONFLICT RULE: Water Restoration vs Air Conditioning
                    // User Rule: If BOTH match, Water Restoration wins (Higher Urgency)
                    if (hasWaterRestoration && hasAirConditioning) {
                        // Auto-resolve to Water Restoration
                        newState.detectedTrade = 'water-restoration';
                    }
                    // SMART CLARIFICATION: Water Restoration vs Plumber overlap
                    else if (hasWaterRestoration && hasPlumber && !hasNegativeKeyword) {
                        if (lowerMsg.includes('damage') || lowerMsg.includes('drying') || lowerMsg.includes('soaked') || lowerMsg.includes('cleanup') || lowerMsg.includes('restoration')) {
                            newState.detectedTrade = 'water-restoration';
                        } else if (lowerMsg.includes('pipe') || lowerMsg.includes('tap') || lowerMsg.includes('toilet') || lowerMsg.includes('fix') || lowerMsg.includes('repair')) {
                            newState.detectedTrade = 'plumber';
                        } else {
                            // ASK CLARIFICATION
                            newState.step = 'TRADE_CHECK';
                            return {
                                newState,
                                response: {
                                    id: Date.now().toString(),
                                    role: 'assistant',
                                    content: "Is the main issue water damage that needs drying and restoration, or is it a plumbing problem like a leak that needs fixing?"
                                }
                            };
                        }
                    }
                    // SMART CLARIFICATION: AC leaking water (very common) [Deprecated by Conflict Rule above, but kept if AC ONLY + leak]
                    else if (hasAirConditioning && lowerMsg.includes('leaking') && lowerMsg.includes('water') && !hasNegativeKeyword) {
                        // If we are here, hasWaterRestoration MUST be false (handled by first if)
                        // This usually means user said "AC leaking water" which didn't trigger water-restoration kw?
                        // Actually 'water' matches 'water restoration' implies checking keywords.
                        // 'leaking water' -> hasWaterRestoration might be false if 'water' keyword is weak?
                        // 'water' is in plumber keywords line 57.
                        // 'water restoration' primary keywords: 'water restoration', 'water damage'...
                        // If I added 'water' to water-restoration keywords it would trigger conflict rule.
                        // User list: 'water' NOT in primary (only phrases).
                        // So "AC leaking water" -> hasAirConditioning=True. hasWaterRestoration=False.
                        // So we still need this check?
                        // User said: "If BOTH ... keywords match".
                        // So if keywords don't match, normal flow.

                        if (lowerMsg.includes('damage') || lowerMsg.includes('cleanup') || lowerMsg.includes('flooded')) {
                            newState.detectedTrade = 'water-restoration';
                        } else if (lowerMsg.includes('not working') || lowerMsg.includes('broken') || lowerMsg.includes('repair')) {
                            newState.detectedTrade = 'air-conditioning';
                        } else {
                            // ASK CLARIFICATION
                            newState.step = 'TRADE_CHECK';
                            return {
                                newState,
                                response: {
                                    id: Date.now().toString(),
                                    role: 'assistant',
                                    content: "Is the air conditioning leaking and not working properly, or has the water already caused damage that needs cleanup?"
                                }
                            };
                        }
                    }
                    // No overlap or already resolved - use first detected trade
                    else if (!newState.detectedTrade) {
                        newState.detectedTrade = detectedTrades[0];
                    }
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
        // A. Strict Match First (Fast) - Check for city names with word boundaries
        // Sort by length to prioritize longer matches (e.g., "Newcastle upon Tyne" before "Newcastle")
        const foundCity = sortedCities.find(c => {
            const cityLower = c.toLowerCase();
            // Word boundary check: city name should be preceded by start of string, space, or punctuation
            // and followed by end of string, space, or punctuation
            const regex = new RegExp(`(?:^|\\s|,|\\.)${cityLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:$|\\s|,|\\.)`, 'i');
            return regex.test(lowerMsg);
        });
        if (foundCity) {
            console.log(`[Voice] City detected (strict match): ${foundCity}`);
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
                    // TRUST GEOCODER NAME (e.g. "Dunstable" from "LU6...")
                    const detectedPlace = coords.displayName.split(',')[0].trim();
                    if (detectedPlace) {
                        newState.detectedCity = detectedPlace;
                        cityFallbackUsed = true;
                        originalCity = cleanPostcode;
                        handled = true;
                    } else {
                        // Fallback: Snap if no name returned (unlikely)
                        const match = findNearestSupportedCity(coords.lat, coords.lon, countryCode);
                        if (match) {
                            newState.detectedCity = match.city;
                            cityFallbackUsed = true;
                            originalCity = cleanPostcode;
                            handled = true;
                        }
                    }
                }
            }

            // 2. Area Name Match (e.g. "Brixton", "Dunstable")
            if (!handled) {
                // Check if the user mentioned a known area from our database
                // Sort by length (longest first) to prioritize specific matches
                const sortedAreas = Object.keys(cityPostcodes).sort((a, b) => b.length - a.length);
                const foundArea = sortedAreas.find(area => {
                    const areaLower = area.toLowerCase();
                    // Word boundary check for more accurate matching
                    const regex = new RegExp(`(?:^|\\s|,|\\.)${areaLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:$|\\s|,|\\.)`, 'i');
                    return regex.test(lowerMsg);
                });

                if (foundArea) {
                    console.log(`[Voice] Area detected and trusted: ${foundArea}`);
                    // DIRECT USE: Do not snap to nearest city (e.g. London). Use "Dunstable" directly.
                    newState.detectedCity = foundArea;
                    cityFallbackUsed = true;
                    originalCity = foundArea;
                    handled = true;
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
                        // 1. DIRECT MATCH CHECK (Case-insensitive)
                        // Does the geocoded name match one of our main cities?
                        const directMatch = activeCities.find(city =>
                            coords.displayName.toLowerCase().includes(city.toLowerCase())
                        );

                        if (directMatch) {
                            newState.detectedCity = directMatch;
                            cityFallbackUsed = true;
                            originalCity = coords.displayName.split(',')[0];
                            console.log(`[Location Direct Match] Found '${directMatch}' in '${coords.displayName}'`);
                        }
                        // 2. TRUST THE GEOCODER (Enhanced Coverage)
                        // If no main city match, use the returned place name directly (e.g. "Dunstable")
                        // This ensures we cover EVERY town/village, not just our main list.
                        else {
                            const detectedPlace = coords.displayName.split(',')[0].trim();
                            if (detectedPlace) {
                                newState.detectedCity = detectedPlace;
                                cityFallbackUsed = true; // Still flag as fallback to trigger the "I'm taking you to X" message
                                originalCity = detectedPlace;
                                console.log(`[Location Extended] Accepted '${detectedPlace}' directly from Geocoder`);
                            }
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

    const getReadableTradeName = (slug: string) => {
        const trade = trades.find(t => t.slug === slug);
        if (!trade) return slug.replace(/-/g, ' ');
        return countryCode === 'US' ? (trade as any).usName || trade.name : trade.name;
    };

    const tip = newState.detectedTrade ? (SAFETY_TIPS[newState.detectedTrade] || "") : "";

    // STATE MACHINE TRANSITIONS

    // STEP: CONFIRM_LOCATION
    if (newState.step === 'CONFIRM_LOCATION' && newState.suggestedCity) {
        const isPositive = lowerMsg === 'yes' || lowerMsg === 'yep' || lowerMsg === 'yeah' || lowerMsg === 'correct' || lowerMsg.includes('that is right') || lowerMsg.includes('yes it is');

        // Fix: If they repeat the city name (e.g. "london"), it should count as confirmation
        const repeatedCity = newState.detectedCity && newState.detectedCity.toLowerCase() === newState.suggestedCity.toLowerCase();

        if (isPositive || repeatedCity) {
            newState.detectedCity = newState.suggestedCity;
            newState.locationConfirmed = true;
            newState.step = 'ROUTING';
            // Clear suggested so it doesn't trigger this block again
            newState.suggestedCity = null;
        } else {
            // Check if they provided a NEW location in this message
            if (newState.detectedCity && newState.detectedCity !== newState.suggestedCity) {
                // They gave a different location, accept it as confirmed manual entry
                newState.locationConfirmed = true;
                newState.step = 'ROUTING';
                newState.suggestedCity = null;
            } else if (lowerMsg.length > 2) {
                // If it's not a positive confirmation and not a different recognized city, 
                // Reset and ask for manual entry to be safe.
                newState.detectedCity = null;
                newState.suggestedCity = null;
                newState.step = 'LOCATION_CHECK';
                responseText = "No problem. Please tell me exactly which town or city you are in.";
                return { newState, response: { id: Date.now().toString(), role: 'assistant', content: responseText } };
            }
        }
    }

    // CASE A: TRADE & CITY KNOWN/CONFIRMED -> NAVIGATE
    if (newState.detectedTrade && newState.detectedCity && (newState.locationConfirmed || newState.step === 'ROUTING')) {
        const city = newState.detectedCity;
        const tradeName = getReadableTradeName(newState.detectedTrade);

        // If we just came from CONFIRM_LOCATION or manual entry, provide final transition
        let transition = "Great. I'm taking you to the right Emergency Tradesmen page now.";

        if (cityFallbackUsed) {
            transition = `I can't see a specific page for ${originalCity}, but our ${city} team covers that area. I'm taking you there now.`;
        }

        responseText = transition;
        action = 'navigate';
        const countryPrefix = countryCode === 'US' ? '/us' : '';
        target = `${countryPrefix}/emergency-${newState.detectedTrade}/${encodeURIComponent(city.toLowerCase())}`;
        newState.step = 'ROUTING';
    }
    // CASE B: TRADE KNOWN, CITY DETECTED BUT NOT CONFIRMED
    else if (newState.detectedTrade && newState.detectedCity && !newState.locationConfirmed) {
        const city = newState.detectedCity;
        const tradeName = getReadableTradeName(newState.detectedTrade);

        // KEY FIX: If the user explicitly typed the city in this same message
        // (i.e. both trade AND city were detected from the user's text),
        // treat it as confirmed and navigate immediately — don't ask "Is this correct?"
        // The confirmation step is only needed for GPS/IP auto-detected locations.
        const userExplicitlyStatedCity = sortedCities.some(c => {
            const cityLower = c.toLowerCase();
            const regex = new RegExp(`(?:^|\\s|,|\\.)${cityLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:$|\\s|,|\\.)`, 'i');
            return regex.test(lowerMsg);
        }) || Object.keys(cityPostcodes).some(area => {
            const areaLower = area.toLowerCase();
            const regex = new RegExp(`(?:^|\\s|,|\\.)${areaLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:$|\\s|,|\\.)`, 'i');
            return regex.test(lowerMsg);
        });

        if (userExplicitlyStatedCity) {
            // User stated the city themselves — skip confirmation, go straight to navigation
            newState.locationConfirmed = true;
            newState.step = 'ROUTING';

            const countryPrefix = countryCode === 'US' ? '/us' : '';
            target = `${countryPrefix}/emergency-${newState.detectedTrade}/${encodeURIComponent(city.toLowerCase())}`;
            action = 'navigate';
            responseText = `${tip ? tip + ' ' : ''}Taking you to ${tradeName} in ${city} now.`;
        } else {
            // City was auto-detected (GPS/IP) — ask for confirmation
            const identification = `I've identified that as a ${tradeName} emergency.`;
            newState.suggestedCity = city;
            newState.detectedCity = null;
            newState.step = 'CONFIRM_LOCATION';
            responseText = `${identification} ${tip} We detected you may be in ${city}. Is this correct? (Or please tell me your location manually).`;
        }
    }
    // CASE C: TRADE KNOWN, CITY UNKNOWN -> ASK LOCATION
    else if (newState.detectedTrade && !newState.detectedCity) {
        const tradeName = getReadableTradeName(newState.detectedTrade);
        const identification = `I've identified that as a ${tradeName} emergency.`;

        responseText = `${identification} ${tip} What town, area, or postcode are you in?`;
        newState.step = 'LOCATION_CHECK';
    }
    // CASE D: TRADE UNKNOWN -> CLARIFY
    else {
        if (lowerMsg.includes('trade') || lowerMsg.includes('service') || lowerMsg.includes('list') || lowerMsg.includes('cover')) {
            responseText = "We cover plumbing, electrical, gas, locks, drains, glazing, and vehicle breakdown. Which one do you need?";
        } else {
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
