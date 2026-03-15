import { trades, cities, usCities } from "@/lib/trades";
import { geocodeLocation, findNearestSupportedCity, POSTCODE_REGEX } from "@/lib/location-utils";
import { cityPostcodes } from "@/lib/cityPostcodes";
import { searchVectorKnowledgeBase } from "@/lib/knowledge-base";

// FUZZY TRADE MATCHING — catches common STT mishearings from Whisper-tiny on mobile
const FUZZY_TRADE_MATCHES: Record<string, string> = {
    'election': 'electrician', 'electrition': 'electrician', 'electrishin': 'electrician',
    'electron': 'electrician', 'electriction': 'electrician', 'electrian': 'electrician',
    'elektrician': 'electrician', 'electrishian': 'electrician', 'lectric': 'electrician',
    'lectrician': 'electrician', 'elec': 'electrician',
    'plumb': 'plumber', 'plumba': 'plumber', 'plummer': 'plumber', 'plumer': 'plumber',
    'plumbing': 'plumber', 'plomber': 'plumber', 'plam': 'plumber',
    'lock smith': 'locksmith', 'loxmith': 'locksmith', 'locksmif': 'locksmith',
    'locks mith': 'locksmith', 'lock me out': 'locksmith', 'locked me out': 'locksmith',
    'glazer': 'glazier', 'glacier': 'glazier', 'glasier': 'glazier', 'glaser': 'glazier',
    'glass man': 'glazier', 'glass repair': 'glazier', 'window man': 'glazier',
    'gas man': 'gas-engineer', 'gasman': 'gas-engineer', 'gas person': 'gas-engineer',
    'gas fitter': 'gas-engineer', 'gas engineer': 'gas-engineer',
    'roof': 'roofer', 'roofing': 'roofer', 'roofa': 'roofer', 'rufar': 'roofer',
    'roofa man': 'roofer', 'roof man': 'roofer', 'roof repair': 'roofer',
    'build': 'builder', 'builded': 'builder', 'building': 'builder', 'bilda': 'builder',
    'drane': 'drain-specialist', 'drains': 'drain-specialist', 'drainage': 'drain-specialist',
    'drain man': 'drain-specialist', 'blocked drain': 'drain-specialist',
    'break down': 'breakdown', 'brake down': 'breakdown', 'car help': 'breakdown',
    'car trouble': 'breakdown', 'car problem': 'breakdown',
    'air con': 'air-conditioning', 'aircon': 'air-conditioning', 'a c': 'air-conditioning',
    'air conditioner': 'air-conditioning', 'cooling': 'air-conditioning',
    'water damage': 'water-restoration', 'flood damage': 'water-restoration',
    'water cleanup': 'water-restoration',
};

function fuzzyTradeDetect(msg: string): string | null {
    const lower = msg.toLowerCase();
    const sortedKeys = Object.keys(FUZZY_TRADE_MATCHES).sort((a, b) => b.length - a.length);
    for (const fuzzyKey of sortedKeys) {
        if (lower.includes(fuzzyKey)) {
            return FUZZY_TRADE_MATCHES[fuzzyKey];
        }
    }
    return null;
}

const SAFETY_TIPS: Record<string, string> = {
    'gas-engineer': "Extinguish all flames, open all windows, and turn off the gas meter lever. Do not touch any electrical switches and leave the property immediately.",
    'electrician': "Turn off the main power at your fuse box if safe. If you smell burning plastic, avoid all switches and outlets.",
    'plumber': "Turn off your main stopcock immediately (usually under the sink) and open all taps to drain the pipes.",
    'water-restoration': "Identify and isolate the leak source. Move furniture and electronics to a dry area immediately.",
    'locksmith': "Stay in a safe, well-lit area. Have proof of residence ready for the locksmith's arrival.",
    'glazier': "Do not attempt to clear broken glass yourself. Avoid the area and keep children and pets away.",
    'drain-specialist': "Stop using all taps and toilets immediately until the blockage is cleared to prevent sewage overflow.",
    'roofer': "Stay clear of falling debris. Place buckets under leaks if safe, but do not attempt to go onto the roof.",
    'builder': "Evacuate any area with structural cracks or bulging walls. Do not attempt to move debris yourself.",
    'breakdown': "Stay in a safe place away from traffic. Keep your hazard lights on and wear a high-vis vest if available.",
    'air-conditioning': "Turn off the unit immediately at the breaker to prevent electrical damage or refrigerant leaks."
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

const GAS_EMERGENCY_KEYWORDS = [
    'gas', 'gas smell', 'smell of gas', 'gas leak', 'hissing sound',
    'carbon monoxide', 'co alarm', 'boiler gas', 'pilot light out',
    'gas boiler not working', 'gas meter', 'emergency gas', 'gas safety',
    'carbon monoxide alarm', 'fumes', 'dizziness', 'headache'
];

const DANGER_KEYWORDS = [
    'fire', 'flames', 'smoke', 'explosion', 'attack', 'break in',
    'unconscious', 'not breathing', 'severe injury'
];

const TRADE_KEYWORDS: Record<string, string[]> = {
    'gas-engineer': [...GAS_EMERGENCY_KEYWORDS, 'gas engineer', 'gas safe', 'gas certificate'],
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
        'wall', 'timber', 'stud wall', 'partition', 'structural', 'beam', 'joist',
        'cracked wall', 'wall cracking', 'internal wall crack', 'external wall crack',
        'ceiling crack', 'ceiling collapsed', 'wall collapsed', 'structural damage',
        'building damage', 'house damage', 'property damage', 'subsidence',
        'sinking floor', 'uneven floor', 'foundation issue', 'support beam',
        'carpenter', 'carpentry work', 'woodwork', 'timber repair',
        'wooden frame repair', 'door frame broken', 'door frame loose',
        'window frame damaged', 'skirting board loose', 'skirting board fallen',
        'architrave loose', 'bannister loose', 'handrail broken', 'stairs damaged',
        'cupboard fallen', 'cupboard hanging off wall', 'kitchen unit fallen',
        'wall cabinet fallen', 'shelf fallen', 'shelving repair',
        'fitted wardrobe broken', 'wardrobe collapsed', 'door not closing properly',
        'door off hinges', 'internal door repair',
        'builder', 'general builder', 'building work', 'maintenance work',
        'property maintenance', 'home maintenance', 'house repair',
        'general repair', 'emergency repair', 'damage repair',
        'brickwork repair', 'bricks loose', 'bricks fallen', 'brick wall repair',
        'damaged brickwork', 'repointing', 'pointing repair', 'masonry repair',
        'floor damaged', 'floor collapsed', 'floor repair', 'ceiling repair',
        'plaster cracked', 'plaster fallen', 'hole in wall', 'hole in ceiling',
        'wall repair'
    ],
    'air-conditioning': [
        'air conditioning', 'air con', 'ac', 'air con repair', 'air con installation',
        'air conditioning not working', 'air con not blowing cold air', 'air conditioner broken',
        'air con leaking water inside', 'air conditioning repair near me', 'emergency air conditioning repair',
        'same day air con repair', 'air conditioning service company', 'air con servicing near me',
        'ac not cooling properly', 'air conditioner making noise', 'air con stopped working suddenly',
        'commercial air conditioning repair',
        'my air con is not working', 'no cold air coming out', 'air conditioning has stopped',
        'air con leaking water', 'air conditioner broken', 'the air con won\'t turn on'
    ],
    'water-restoration': [
        'water restoration', 'water damage', 'flood damage', 'flooded house', 'water cleanup', 'water extraction',
        'emergency water restoration near me', 'flooded house emergency help', 'water damage cleanup company',
        'burst pipe water damage repair', 'ceiling collapsed from water leak', 'storm water damage repair',
        'sewage flood cleanup service', 'water damage restoration company near me', '24 hour emergency water damage service',
        'water extraction after flood', 'wet carpets after flooding', 'structural drying after flood',
        'dehumidifier service after water leak', 'insurance water damage cleanup',
        'my house is flooded', 'water is everywhere', 'ceiling is leaking badly',
        'pipe burst and flooded my home', 'toilet overflowed everywhere', 'rain flooded my house',
        'water coming through the ceiling'
    ]
};

export async function processUserMessage(message: string, currentState: ChatState, countryCode: string = 'GB'): Promise<{ newState: ChatState, response: ChatMessage }> {
    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
    const port = typeof window !== 'undefined' ? window.location.port : '';
    const isUSDomain = hostname.includes('emergencycontractors.net') || (hostname === 'localhost' && port === '3001') || (hostname === '127.0.0.1' && port === '3001');

    const lowerMsg = message.toLowerCase();
    const newState = { ...currentState };
    newState.step = currentState.step;

    const activeCities = countryCode === 'US' ? usCities : cities;
    const sortedCities = [...activeCities].sort((a, b) => b.length - a.length);

    const isAwaitingResponse = currentState.step === 'LOCATION_CHECK' || currentState.step === 'CONFIRM_LOCATION' || currentState.step === 'TRADE_CHECK';

    // 1. DANGER CHECK
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

    // 2. RAG PRIORITY CHECK
    const isQuestion = lowerMsg.includes('?') || 
                     (lowerMsg.includes('can i') || lowerMsg.includes('should i') || lowerMsg.includes('how to') || lowerMsg.includes('tell me about'));
    const isDescriptive = lowerMsg.split(' ').length > 8;

    if (!isAwaitingResponse && (isQuestion || isDescriptive || lowerMsg.includes('is this dangerous') || lowerMsg.includes('stay safe'))) {
        const region = isUSDomain ? 'US' : 'UK';
        const matchedRule = await searchVectorKnowledgeBase(message, region);

        if (matchedRule) {
            const isUK = region === 'UK';
            const termMain = isUK ? 'mains' : 'main breaker';
            
            // 1. Direct Answer (Persona Step 1)
            // If the user asked "right?" or similar, and we have a "DO NOT" that contradicts it, be firm.
            let directAnswer = "";
            const lowerPlan = matchedRule.action_plan.toLowerCase();
            const containsDoNot = matchedRule.action_plan.includes("DO NOT:");
            const doNotSection = containsDoNot ? matchedRule.action_plan.split("DO NOT:")[1].split(".")[0].trim() : "";
            
            if (lowerMsg.includes("right?") || lowerMsg.includes("correct?") || lowerMsg.includes("don't i")) {
                if (doNotSection && (doNotSection.toLowerCase().includes("assume") || doNotSection.toLowerCase().includes("ignore"))) {
                    directAnswer = `Actually, that is not correct or safe to assume. `;
                }
            }
            
            let expertResponse = `I understand you're asking about ${matchedRule.scenario}. ${directAnswer}I can certainly help you with the correct safety procedures.\n\n`;
            expertResponse += `🚨 **Risk Level:** This is a **${matchedRule.risk_level}**.\n\n`;
            expertResponse += `🛡️ **Safety Instructions:**\n${matchedRule.action_plan}\n\n`;
            expertResponse += `🔧 **Professional Fix:** You need a qualified **${matchedRule.trade} ${isUK ? 'Tradesman' : 'Contractor'}** to resolve this safely. Do not attempt to fix this yourself if it involves ${termMain} or structural issues.\n\n`;
            expertResponse += `📚 **Official Guidance:** This advice is based on standards from the **${matchedRule.authority_name}**. For more details, see their official documentation: [${matchedRule.authority_url}](${matchedRule.authority_url})`;

            newState.detectedTrade = matchedRule.trade;
            // If we don't have a city, we MUST ask for it now instead of just giving advice and stopping.
            // FOR US: strictly enforce location check to avoid routing to London default.
            if (!newState.detectedCity) {
                newState.step = 'LOCATION_CHECK';
                const locationPrompt = countryCode === 'US' ? "What city or zip code are you in?" : "Which city or postcode are you in?";
                expertResponse += `\n\nTo find the nearest emergency **${matchedRule.trade}** for you, ${locationPrompt}`;
            }

            return {
                newState,
                response: {
                    id: Date.now().toString(),
                    role: 'assistant',
                    content: expertResponse
                }
            };
        }
    }

    // 3. KEYWORD DETECTION (Word Boundaries)
    const ALL_TRADE_KEYWORDS = Object.values(TRADE_KEYWORDS).flat();
    const hasTradeKeywords = ALL_TRADE_KEYWORDS.some(k => {
        const regex = new RegExp(`\\b${k.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}\\b`, 'i');
        return regex.test(lowerMsg);
    }) || GAS_EMERGENCY_KEYWORDS.some(k => lowerMsg.includes(k));

    // 4. NAVIGATION
    if (!hasTradeKeywords && !isAwaitingResponse) {
        if (lowerMsg.includes('blog') || lowerMsg.includes('news')) return { newState, response: { id: Date.now().toString(), role: 'assistant', content: "Opening the Blog.", action: 'navigate', target: '/blog' } };
        if (lowerMsg.includes('about')) return { newState, response: { id: Date.now().toString(), role: 'assistant', content: "Opening About Us.", action: 'navigate', target: '/about' } };
        if (lowerMsg.includes('contact') || lowerMsg.includes('email') || lowerMsg.includes('phone')) return { newState, response: { id: Date.now().toString(), role: 'assistant', content: "Opening Contact page.", action: 'navigate', target: '/contact' } };
        if (lowerMsg.includes('sign up') || lowerMsg.includes('join') || lowerMsg.includes('register')) return { newState, response: { id: Date.now().toString(), role: 'assistant', content: "Opening Tradesmen Sign Up.", action: 'navigate', target: '/tradesmen' } };
        if (lowerMsg.includes('home') || lowerMsg.includes('start')) return { newState, response: { id: Date.now().toString(), role: 'assistant', content: "Taking you Home.", action: 'navigate', target: '/' } };

        if (lowerMsg.includes('what should i do') || lowerMsg.includes('stay safe') || lowerMsg.includes('emergency guide')) {
            return {
                newState,
                response: {
                    id: Date.now().toString(),
                    role: 'assistant',
                    content: "Your safety is priority. I'm searching my knowledge base... If you need immediate help, I can show you our emergency guides.",
                    action: 'navigate',
                    target: '/blog'
                }
            };
        }

        if (lowerMsg.includes('price') || lowerMsg.includes('cost') || lowerMsg.includes('rates')) return { newState, response: { id: Date.now().toString(), role: 'assistant', content: "Opening Pricing information.", action: 'navigate', target: '/pricing' } };
        if (lowerMsg.includes('privacy')) return { newState, response: { id: Date.now().toString(), role: 'assistant', content: "Opening Privacy Policy.", action: 'navigate', target: '/privacy' } };
        if (lowerMsg.includes('term') || lowerMsg.includes('condition')) return { newState, response: { id: Date.now().toString(), role: 'assistant', content: "Opening Terms & Conditions.", action: 'navigate', target: '/terms' } };
        if (lowerMsg.includes('login') || lowerMsg.includes('log in') || lowerMsg.includes('sign in')) return { newState, response: { id: Date.now().toString(), role: 'assistant', content: "Opening Login page.", action: 'navigate', target: '/login' } };
        if (lowerMsg.includes('dashboard') || lowerMsg.includes('account')) return { newState, response: { id: Date.now().toString(), role: 'assistant', content: "Opening your Dashboard.", action: 'navigate', target: '/user/dashboard' } };
        if (lowerMsg.includes('service') || lowerMsg.includes('trades')) return { newState, response: { id: Date.now().toString(), role: 'assistant', content: "Showing all our Services.", action: 'navigate', target: '/#services' } };

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

    // 5. STATE MACHINE (Trade Detection)
    if (!newState.detectedTrade) {
        if (!lowerMsg.includes('fishy') && GAS_EMERGENCY_KEYWORDS.some(k => lowerMsg.includes(k))) {
            newState.detectedTrade = 'gas-engineer';
        } else {
            const detectedTrades: string[] = [];
            const tradeOrder = ['water-restoration', 'electrician', 'plumber', 'drain-specialist', 'glazier', 'locksmith', 'breakdown', 'roofer', 'gas-engineer', 'air-conditioning'];

            for (const slug of tradeOrder) {
                if (TRADE_KEYWORDS[slug]?.some(k => {
                    const regex = new RegExp(`\\b${k.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}\\b`, 'i');
                    return regex.test(lowerMsg);
                })) {
                    detectedTrades.push(slug);
                }
            }

            const isBuilder = TRADE_KEYWORDS['builder'].some(k => {
                const regex = new RegExp(`\\b${k.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}\\b`, 'i');
                return regex.test(lowerMsg);
            });

            if (isBuilder && detectedTrades.length > 0) {
                if (lowerMsg.includes('structure') || lowerMsg.includes('fitting') || lowerMsg.includes('general')) {
                    newState.detectedTrade = 'builder';
                } else if (lowerMsg.includes('electric') || lowerMsg.includes('plumb') || lowerMsg.includes('gas')) {
                    if (lowerMsg.includes('electric')) newState.detectedTrade = 'electrician';
                    else if (lowerMsg.includes('plumb')) newState.detectedTrade = 'plumber';
                    else if (lowerMsg.includes('gas')) newState.detectedTrade = 'gas-engineer';
                } else {
                    return {
                        newState,
                        response: { id: Date.now().toString(), role: 'assistant', content: "Is the issue with electrics, plumbing, gas, or the structure or fittings of the property?" }
                    };
                }
            }

            if (!newState.detectedTrade) {
                const negativeKeywords = ['boiler', 'gas', 'radiator', 'central heating', 'gas engineer'];
                const hasNegativeKeyword = negativeKeywords.some(k => lowerMsg.includes(k));

                if (detectedTrades.length > 0) {
                    const hasWaterRestoration = detectedTrades.includes('water-restoration');
                    const hasAirConditioning = detectedTrades.includes('air-conditioning');
                    const hasPlumber = detectedTrades.includes('plumber');

                    if (hasWaterRestoration && hasAirConditioning) {
                        newState.detectedTrade = 'water-restoration';
                    } else if (hasWaterRestoration && hasPlumber && !hasNegativeKeyword) {
                        if (lowerMsg.includes('damage') || lowerMsg.includes('drying') || lowerMsg.includes('soaked') || lowerMsg.includes('cleanup') || lowerMsg.includes('restoration')) {
                            newState.detectedTrade = 'water-restoration';
                        } else if (lowerMsg.includes('pipe') || lowerMsg.includes('tap') || lowerMsg.includes('toilet') || lowerMsg.includes('fix') || lowerMsg.includes('repair')) {
                            newState.detectedTrade = 'plumber';
                        } else {
                            newState.step = 'TRADE_CHECK';
                            return {
                                newState,
                                response: { id: Date.now().toString(), role: 'assistant', content: "Is the main issue water damage that needs drying and restoration, or is it a plumbing problem like a leak that needs fixing?" }
                            };
                        }
                    } else if (!newState.detectedTrade) {
                        newState.detectedTrade = detectedTrades[0];
                    }
                } else if (isBuilder) {
                    newState.detectedTrade = 'builder';
                } else {
                    if (lowerMsg.includes('burning') && (lowerMsg.includes('power') || lowerMsg.includes('smell'))) newState.detectedTrade = 'electrician';
                    else if (lowerMsg.includes('buzzing')) newState.detectedTrade = 'electrician';
                    else if (lowerMsg.includes('water') && lowerMsg.includes('electric')) newState.detectedTrade = 'plumber';
                    else if (lowerMsg.includes('broken window')) newState.detectedTrade = 'glazier';
                    else {
                        const fuzzyTrade = fuzzyTradeDetect(message);
                        if (fuzzyTrade) newState.detectedTrade = fuzzyTrade;
                    }
                }
            }
        }
    }

    // CITY DETECTION
    let cityFallbackUsed = false;
    let originalCity = "";

    if (!newState.detectedCity) {
        const foundCity = sortedCities.find(c => {
            const cityLower = c.toLowerCase();
            const regex = new RegExp(`(?:^|\\s|,|\\.)${cityLower.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}(?:$|\\s|,|\\.)`, 'i');
            return regex.test(lowerMsg);
        });
        if (foundCity) {
            newState.detectedCity = foundCity;
        } else {
            let handled = false;
            if (countryCode === 'US') {
                const US_ZIP_REGEX = /\b\d{5}\b/;
                const zipMatch = message.match(US_ZIP_REGEX);
                if (zipMatch) {
                    const cleanZip = zipMatch[0];
                    const coords = await geocodeLocation(cleanZip, 'US');
                    if (coords) {
                        const detectedPlace = coords.displayName.split(',')[0].trim();
                        if (detectedPlace) {
                            newState.detectedCity = detectedPlace;
                            cityFallbackUsed = true;
                            originalCity = cleanZip;
                            handled = true;
                        } else {
                            const match = findNearestSupportedCity(coords.lat, coords.lon, 'US');
                            if (match) {
                                newState.detectedCity = match.city;
                                cityFallbackUsed = true;
                                originalCity = cleanZip;
                                handled = true;
                            }
                        }
                    }
                }
                if (!handled) {
                    const foundArea = activeCities.find(area => {
                        const areaLower = area.toLowerCase();
                        const regex = new RegExp(`(?:^|\\s|,|\\.)${areaLower.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}(?:$|\\s|,|\\.)`, 'i');
                        return regex.test(lowerMsg);
                    });
                    if (foundArea) {
                        newState.detectedCity = foundArea;
                        cityFallbackUsed = true;
                        originalCity = foundArea;
                        handled = true;
                    }
                }
            } else {
                const pMatch = message.match(POSTCODE_REGEX);
                if (pMatch) {
                    const cleanPostcode = pMatch[0].toUpperCase();
                    const coords = await geocodeLocation(cleanPostcode, countryCode);
                    if (coords) {
                        const detectedPlace = coords.displayName.split(',')[0].trim();
                        if (detectedPlace) {
                            newState.detectedCity = detectedPlace;
                            cityFallbackUsed = true;
                            originalCity = cleanPostcode;
                            handled = true;
                        } else {
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
                if (!handled) {
                    const sortedAreas = Object.keys(cityPostcodes).sort((a, b) => b.length - a.length);
                    const foundArea = sortedAreas.find(area => {
                        const areaLower = area.toLowerCase();
                        const regex = new RegExp(`(?:^|\\s|,|\\.)${areaLower.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}(?:$|\\s|,|\\.)`, 'i');
                        return regex.test(lowerMsg);
                    });
                    if (foundArea) {
                        newState.detectedCity = foundArea;
                        cityFallbackUsed = true;
                        originalCity = foundArea;
                        handled = true;
                    }
                }
            }
        }

        if (!newState.detectedCity && newState.detectedTrade) {
            const isLocationStep = currentState.step === 'LOCATION_CHECK' || currentState.step === 'CONFIRM_LOCATION';
            if (isLocationStep || lowerMsg.length < 50) {
                const locationQuery = lowerMsg.replace(/i'm in|i am in|live in|located in/g, "").trim();
                if (locationQuery.length > 2) {
                    const coords = await geocodeLocation(locationQuery, countryCode);
                    if (coords) {
                        const directMatch = activeCities.find(city => coords.displayName.toLowerCase().includes(city.toLowerCase()));
                        if (directMatch) {
                            newState.detectedCity = directMatch;
                            cityFallbackUsed = true;
                            originalCity = coords.displayName.split(',')[0];
                        } else {
                            newState.detectedCity = coords.displayName.split(',')[0].trim();
                            cityFallbackUsed = true;
                            originalCity = newState.detectedCity;
                        }
                    } else if (isLocationStep && locationQuery.length > 2 && locationQuery.length <= 40) {
                        const formattedCity = locationQuery.split(/[\\s-]+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                        newState.detectedCity = formattedCity;
                        newState.locationConfirmed = true;
                        cityFallbackUsed = true;
                        originalCity = formattedCity;
                    }
                }
            }
        }
    }

    // GENERATE RESPONSE
    let responseText = "";
    let action: 'navigate' | undefined;
    let target: string | undefined;

    const getReadableTradeName = (slug: string) => {
        const trade = trades.find(t => t.slug === slug);
        if (!trade) return slug.replace(/-/g, ' ');
        return countryCode === 'US' ? (trade as any).usName || trade.name : trade.name;
    };

    const tip = (!currentState.detectedTrade && newState.detectedTrade) ? (SAFETY_TIPS[newState.detectedTrade] || "") : "";

    if (newState.step === 'CONFIRM_LOCATION' && newState.suggestedCity) {
        const isPositive = /yes|yep|yeah|correct|that is right|yes it is/i.test(lowerMsg);
        const repeatedCity = newState.detectedCity && newState.detectedCity.toLowerCase() === newState.suggestedCity.toLowerCase();
        if (isPositive || repeatedCity) {
            newState.detectedCity = newState.suggestedCity;
            newState.locationConfirmed = true;
            newState.step = 'ROUTING';
            newState.suggestedCity = null;
        } else if (newState.detectedCity && newState.detectedCity !== newState.suggestedCity) {
            newState.locationConfirmed = true;
            newState.step = 'ROUTING';
            newState.suggestedCity = null;
        } else if (lowerMsg.length > 2) {
            newState.detectedCity = null;
            newState.suggestedCity = null;
            newState.step = 'LOCATION_CHECK';
            return { newState, response: { id: Date.now().toString(), role: 'assistant', content: "No problem. Please tell me exactly which town or city you are in." } };
        }
    }

    if (newState.detectedTrade && newState.detectedCity && (newState.locationConfirmed || newState.step === 'ROUTING')) {
        const city = newState.detectedCity;
        responseText = cityFallbackUsed ? `I can't see a specific page for ${originalCity}, but our ${city} team covers that area. I'm taking you there now.` : "Great. I'm taking you to the right Emergency Tradesmen page now.";
        action = 'navigate';
        // US Redirection Fix: Never use /us prefix on US domain. Root level only.
        const countryPrefix = (countryCode === 'US' || isUSDomain) ? '' : ''; 
        // Logic check: if isUSDomain is true, we are on emergencycontractors.net, so prefix is empty.
        // If countryCode is US but we are not on the US domain (unlikely in production but possible in dev), we still want root level if target is the new domain.
        // User said "never ever use (/us)".
        
        target = `/emergency-${newState.detectedTrade}/${encodeURIComponent(city.toLowerCase())}`;
        newState.step = 'ROUTING';
    } else if (newState.detectedTrade && newState.detectedCity && !newState.locationConfirmed) {
        const city = newState.detectedCity;
        if (currentState.step === 'LOCATION_CHECK') {
            newState.locationConfirmed = true;
            newState.step = 'ROUTING';
            target = `/emergency-${newState.detectedTrade}/${encodeURIComponent(city.toLowerCase())}`;
            action = 'navigate';
            responseText = `${tip ? tip + ' ' : ''}Taking you to ${getReadableTradeName(newState.detectedTrade)} in ${city} now.`;
        } else {
            newState.suggestedCity = city;
            newState.detectedCity = null;
            newState.step = 'CONFIRM_LOCATION';
            responseText = `${!currentState.detectedTrade ? `I've identified that as a ${getReadableTradeName(newState.detectedTrade)} emergency. ` : ""}${tip ? `${tip} ` : ""}We detected you may be in ${city}. Is this correct?`;
        }
    } else if (newState.detectedTrade && !newState.detectedCity) {
        responseText = `${!currentState.detectedTrade ? `I've identified that as a ${getReadableTradeName(newState.detectedTrade)} emergency. ` : ""}${tip ? `${tip} ` : ""}What town, area, or postcode are you in?`;
        newState.step = 'LOCATION_CHECK';
    } else {
        responseText = /trade|service|list|cover/i.test(lowerMsg) ? "We cover plumbing, electrical, gas, locks, drains, glazing, roofing, building, air conditioning, and vehicle breakdown. Which one do you need?" : "I'm not sure I understood that. Could you try saying one of these: plumber, electrician, locksmith, gas engineer, roofer, glazier, drain specialist, or breakdown?";
        newState.step = 'TRADE_CHECK';
    }

    return { newState, response: { id: Date.now().toString(), role: 'assistant', content: responseText, action, target } };
}
