import { trades, cities, usCities } from "@/lib/trades";
import { geocodeLocation, findNearestSupportedCity, POSTCODE_REGEX } from "@/lib/location-utils";
import { cityPostcodes } from "@/lib/cityPostcodes";
import { isUSDomain } from "@/lib/siteConfig";

// FUZZY TRADE MATCHING  -  catches common STT mishearings from Whisper-tiny on mobile
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

const SAFETY_TIPS: Record<string, { uk: string; us: string }> = {
    'gas-engineer': {
        uk: "Extinguish all flames, open all windows, and turn off the gas meter lever (90 degrees). Do not touch any electrical switches and leave the property immediately. Call 0800 111 999.",
        us: "Extinguish all flames, open all windows, and shut off the main gas valve (quarter turn). Do not touch any electrical switches and leave the property immediately. Call 911."
    },
    'electrician': {
        uk: "Turn off the main power at your consumer unit if safe. If you smell burning plastic (like fish), avoid all switches and outlets.",
        us: "Shut off the main breaker in your electrical panel if safe. If you smell burning or 'fishy' odors, avoid all switches and outlets."
    },
    'plumber': {
        uk: "Turn off your main stopcock immediately (usually under the kitchen sink) and open all taps to drain the system.",
        us: "Shut off your main water valve immediately (usually in the basement or garage) and open all faucets to drain the pipes."
    },
    'water-restoration': {
        uk: "Identify and isolate the leak source. Move furniture and electronics to a dry area immediately. Check your escape of water insurance cover.",
        us: "Identify and isolate the leak source. Move furniture and electronics to a dry area immediately. Document damage for your homeowner insurance claim."
    },
    'locksmith': {
        uk: "Stay in a safe, well-lit area. Have proof of residency ready for the MLA-authorized locksmith's arrival.",
        us: "Stay in a safe, well-lit area. Have photo ID and proof of residency ready for the ALOA-certified locksmith's arrival."
    },
    'glazier': {
        uk: "Do not attempt to clear broken glass yourself. Avoid the area and keep children and pets away. Board up to BS 5357 if needed.",
        us: "Do not attempt to clear broken glass yourself. Keep everyone away from the area. Board up securely according to local safety codes."
    },
    'drain-specialist': {
        uk: "Stop using all taps and toilets immediately to prevent sewage overflow. Check if the blockage is in the public sewer run.",
        us: "Stop using all plumbing fixtures immediately to prevent sewer backup. Locate your sewer cleanout for the technician."
    },
    'roofer': {
        uk: "Stay clear of falling tiles or debris. Place buckets under leaks if safe, but do not attempt to go onto the roof or use ladders.",
        us: "Stay clear of falling shingles or debris. Place buckets under active leaks if safe, but do not attempt to go onto the roof yourself."
    },
    'builder': {
        uk: "Evacuate any area with structural cracks or bulging walls. Do not attempt to move heavy debris. Call 999 if there is a collapse risk.",
        us: "Evacuate any area with structural cracks or sagging ceilings. Do not attempt to move heavy debris. Call 911 if structural collapse is imminent."
    },
    'breakdown': {
        uk: "Stay well away from traffic, ideally behind a barrier. Keep hazard lights on. On motorways, exit on the passenger side and call Highways England.",
        us: "Stay away from moving traffic, ideally behind highway barriers. Keep hazard lights on. On highways, exit on the right side and call 911 or highway patrol."
    },
    'air-conditioning': {
        uk: "Turn off the AC unit immediately at the fuse spur or breaker to prevent electrical damage. Open windows if you smell gas or refrigerant.",
        us: "Shut down the HVAC system at the breaker to prevent further damage. Open windows for ventilation if you detect a refrigerant leak."
    }
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
        'water', 'leak', 'leaks', 'pipe', 'pipes', 'burst', 'bursts', 'flood', 'floods',
        'drip', 'drips', 'tap', 'taps', 'toilet', 'toilets', 'sink', 'sinks',
        'shower', 'showers', 'radiator', 'radiators', 'boiler', 'boilers',
        'plumber', 'plumbing'
    ],
    'electrician': [
        'power cut', 'lights out', 'no electricity', 'fuse box',
        'consumer unit', 'tripped fuse', 'circuit breaker', 'sparks',
        'burning smell', 'socket not working', 'electric shock',
        'buzzing socket', 'flickering lights', 'blown fuse',
        'wiring issue', 'electrical fault', 'power', 'electricity',
        'spark', 'sparks', 'fuse', 'fuses', 'light', 'lights', 'socket', 'sockets',
        'plug', 'plugs', 'wire', 'wiring', 'switch', 'switches', 'breaker', 'breakers',
        'blackout', 'electrician', 'electrical', "lights won't turn on",
        "lights won't come on", "lights will not come on", "lights not working"
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
        'sewage', 'overflow', 'gutter', 'toilet', 'toilets', 'backing up'
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
    'hvac': [
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

const getReadableTradeName = (slug: string, countryCode: string) => {
    const trade = trades.find(t => t.slug === slug);
    if (!trade) return slug.replace(/-/g, ' ');
    return countryCode === 'US' ? (trade as any).usName || trade.name : trade.name;
};

export async function processUserMessage(message: string, currentState: ChatState, countryCode: string = 'GB'): Promise<{ newState: ChatState, response: ChatMessage }> {
    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
    const port = typeof window !== 'undefined' ? window.location.port : '';
    const lowerMsg = message.toLowerCase();
    const newState = { ...currentState };
    newState.step = currentState.step;

    const isUSDomain = hostname.includes('emergencycontractors.net') || (hostname === 'localhost' && port === '3001') || (hostname === '127.0.0.1' && port === '3001');
    const regionKey: 'uk' | 'us' = isUSDomain ? 'us' : 'uk';
    const regionParam: 'uk' | 'usa' = isUSDomain ? 'usa' : 'uk';

    const activeCities = countryCode === 'US' ? usCities : cities;
    const sortedCities = [...activeCities].sort((a, b) => b.length - a.length);

    const isAwaitingResponse = currentState.step === 'LOCATION_CHECK' || currentState.step === 'CONFIRM_LOCATION' || currentState.step === 'TRADE_CHECK';

    // Upfront Keyword-based Trade Detection to restrict RAG Vector search context
    let detectedTrade = currentState.detectedTrade;

    if (!detectedTrade && !isAwaitingResponse) {
        if (!lowerMsg.includes('fishy') && GAS_EMERGENCY_KEYWORDS.some(k => lowerMsg.includes(k))) {
            detectedTrade = 'gas-engineer';
        } else {
            const scores: Record<string, number> = {};
            const tradeOrder = ['breakdown', 'gas-engineer', 'water-restoration', 'electrician', 'plumber', 'drain-specialist', 'glazier', 'locksmith', 'roofer', 'air-conditioning', 'builder'];

            for (const slug of tradeOrder) {
                let score = 0;
                if (TRADE_KEYWORDS[slug]) {
                    for (const k of TRADE_KEYWORDS[slug]) {
                        const regex = new RegExp(`\\b${k.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}\\b`, 'i');
                        if (regex.test(lowerMsg)) {
                            score += k.split(' ').length;
                        }
                    }
                }
                if (score > 0) {
                    scores[slug] = score;
                }
            }

            const detectedTrades = Object.keys(scores).sort((a, b) => scores[b] - scores[a]);
            const isBuilder = (scores['builder'] || 0) > 0;

            if (isBuilder && detectedTrades.length > 1) {
                if (lowerMsg.includes('structure') || lowerMsg.includes('fitting') || lowerMsg.includes('general')) {
                    detectedTrade = 'builder';
                } else if (lowerMsg.includes('electric') || lowerMsg.includes('plumb') || lowerMsg.includes('gas')) {
                    if (lowerMsg.includes('electric')) detectedTrade = 'electrician';
                    else if (lowerMsg.includes('plumb')) detectedTrade = 'plumber';
                    else if (lowerMsg.includes('gas')) detectedTrade = 'gas-engineer';
                }
            }

            if (!detectedTrade) {
                const negativeKeywords = ['boiler', 'gas', 'radiator', 'central heating', 'gas engineer'];
                const hasNegativeKeyword = negativeKeywords.some(k => lowerMsg.includes(k));

                if (detectedTrades.length > 0) {
                    const hasWaterRestoration = detectedTrades.includes('water-restoration');
                    const hasAirConditioning = detectedTrades.includes('air-conditioning');
                    const hasPlumber = detectedTrades.includes('plumber');

                    if (hasWaterRestoration && hasAirConditioning) {
                        detectedTrade = 'water-restoration';
                    } else if (hasWaterRestoration && hasPlumber && !hasNegativeKeyword) {
                        if (lowerMsg.includes('damage') || lowerMsg.includes('drying') || lowerMsg.includes('soaked') || lowerMsg.includes('cleanup') || lowerMsg.includes('restoration')) {
                            detectedTrade = 'water-restoration';
                        } else if (lowerMsg.includes('pipe') || lowerMsg.includes('tap') || lowerMsg.includes('toilet') || lowerMsg.includes('fix') || lowerMsg.includes('repair')) {
                            detectedTrade = 'plumber';
                        }
                    } else if (detectedTrades.includes('breakdown') && (lowerMsg.includes('car') || lowerMsg.includes('vehicle') || lowerMsg.includes('motorway') || lowerMsg.includes('roadside') || lowerMsg.includes('driving'))) {
                        detectedTrade = 'breakdown';
                    } else {
                        detectedTrade = detectedTrades[0];
                    }
                } else {
                    if (lowerMsg.includes('burning') && (lowerMsg.includes('power') || lowerMsg.includes('smell'))) detectedTrade = 'electrician';
                    else if (lowerMsg.includes('buzzing')) detectedTrade = 'electrician';
                    else if (lowerMsg.includes('water') && lowerMsg.includes('electric')) detectedTrade = 'plumber';
                    else if (lowerMsg.includes('broken window')) detectedTrade = 'glazier';
                    else {
                        const fuzzyTrade = fuzzyTradeDetect(message);
                        if (fuzzyTrade) detectedTrade = fuzzyTrade;
                    }
                }
            }
        }
        if (detectedTrade) {
            newState.detectedTrade = detectedTrade;
        }
    }

    // 1. DANGER CHECK
    if (DANGER_KEYWORDS.some(k => lowerMsg.includes(k))) {
        const emergencyNumber = isUSDomain ? '911' : '999';
        return {
            newState,
            response: {
                id: Date.now().toString(),
                role: 'assistant',
                content: `### ⚠️ Danger Detected\n\nIf there is **immediate danger** (fire, explosion, crime), call **${emergencyNumber}** now.\n\nIf you are safe and need a tradesperson, reply: **'I am safe'**.`
            }
        };
    }

    // 2. RAG PRIORITY CHECK
    const isQuestion = lowerMsg.includes('?') || 
                     (lowerMsg.includes('can i') || lowerMsg.includes('should i') || lowerMsg.includes('how to') || lowerMsg.includes('tell me about'));
    const isDescriptive = lowerMsg.split(' ').length > 8;

    if (!isAwaitingResponse && (isQuestion || isDescriptive || lowerMsg.includes('is this dangerous') || lowerMsg.includes('stay safe'))) {
        const region = isUSDomain ? 'US' : 'UK';
        const { searchVectorKnowledgeBase } = await import("@/lib/knowledge-base");
        const matchedRule = await searchVectorKnowledgeBase(message, region, detectedTrade || undefined);

        if (matchedRule) {
            const isUK = region === 'UK';
            
            const planParts = matchedRule.action_plan.split('DO NOT:');
            const doSection = planParts[0].replace('DO:', '').trim();
            const doNotSection = planParts.length > 1 ? planParts[1].trim() : "";

            let response = `### ⚠️ ${matchedRule.scenario}\nRisk level: **${matchedRule.risk_level}**\n\n`;

            // Safety steps
            response += `### ✅ Do This Now\n`;
            const doBullets = doSection.split(/[;.]\s/).map(s => s.trim()).filter(Boolean);
            doBullets.slice(0, 4).forEach(bullet => {
                response += `- ${bullet}\n`;
            });
            response += `\n`;

            // What NOT to do
            if (doNotSection) {
                response += `### ❌ Avoid\n`;
                const doNotBullets = doNotSection.split(/[;.]\s/).map(s => s.trim()).filter(Boolean);
                doNotBullets.slice(0, 3).forEach(bullet => {
                    response += `- ${bullet}\n`;
                });
                response += `\n`;
            }

            // Trade required
            const tradeName = getReadableTradeName(matchedRule.trade, countryCode);
            response += `### 👷 You Need a ${tradeName}\nContact a qualified **${tradeName.toLowerCase()}** to resolve this safely.`;

            // Source
            if (matchedRule.authority_name) {
                response += `\n\n*Source: [${matchedRule.authority_name}](${matchedRule.authority_url})*`;
            }

            newState.detectedTrade = matchedRule.trade;
            
            if (!newState.detectedCity) {
                newState.step = 'LOCATION_CHECK';
                const locationPrompt = isUSDomain ? "Share your city or zip code." : "Share your city or postcode.";
                response += `\n\n${locationPrompt}`;
            }

            return {
                newState,
                response: {
                    id: Date.now().toString(),
                    role: 'assistant',
                    content: response
                }
            };
        }
    }

    // 2b. EMERGENCY BRAIN  -  offline knowledge base response
    // Fires when: not in a waiting state AND there are trade-related keywords.
    // Provides rich expert advice (safety, diagnostics, faults, standards) while
    // still advancing through the location state machine.
    if (!isAwaitingResponse) {
        const { getOfflineResponse, classifyEmergency, detectTradeFromBrain } = await import("@/lib/emergency-brain");
        const brainClassification = classifyEmergency(message);
        const brainTrade = detectTradeFromBrain(message);

        if (brainTrade || brainClassification.level === 'EMERGENCY') {
            const brainRegion = isUSDomain ? 'usa' : 'uk';
            const brainResponse = getOfflineResponse(message, brainRegion);

            if (brainResponse.type !== 'NO_MATCH') {
                // Set detected trade on the state so location flow continues
                if (brainResponse.trade && !newState.detectedTrade) {
                    newState.detectedTrade = brainResponse.trade;
                }

                let content = brainResponse.message;

                // Ask for location if we don't have it yet
                if (!newState.detectedCity) {
                    newState.step = 'LOCATION_CHECK';
                    const locationPrompt = isUSDomain
                        ? '\n\nShare your city or zip code so I can find an emergency professional.'
                        : '\n\nShare your town, city, or postcode so I can connect you with an emergency tradesperson.';
                    content += locationPrompt;
                }

                return {
                    newState,
                    response: {
                        id: Date.now().toString(),
                        role: 'assistant',
                        content,
                    }
                };
            }
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
                    content: "### Emergency Help\n\nI can connect you with an **emergency contractor** for:\n\n- Plumbing & Heating\n- Electrical\n- Gas Engineering\n- Locksmith\n- Drains\n- Glazing\n- Roofing & Building\n- Vehicle Breakdown\n- Air Conditioning\n\nDescribe the problem and I will find the right professional."
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
            // Priority: Breakdown and Dangerous trades first
            const tradeOrder = ['breakdown', 'gas-engineer', 'water-restoration', 'electrician', 'plumber', 'drain-specialist', 'glazier', 'locksmith', 'roofer', 'air-conditioning'];

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
                                response: { id: Date.now().toString(), role: 'assistant', content: "Choose the closest match: water damage needing drying/restoration, or a plumbing problem like a leak." }
                            };
                        }
                    } else if (detectedTrades.includes('breakdown') && (lowerMsg.includes('car') || lowerMsg.includes('vehicle') || lowerMsg.includes('motorway') || lowerMsg.includes('roadside') || lowerMsg.includes('driving'))) {
                        // High confidence breakdown (prevents 'power' match collision)
                        newState.detectedTrade = 'breakdown';
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

    const tip = (!currentState.detectedTrade && newState.detectedTrade) ? (SAFETY_TIPS[newState.detectedTrade]?.[regionKey] || "") : "";

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
            return { newState, response: { id: Date.now().toString(), role: 'assistant', content: "Share your town or city and I'll find your local professional." } };
        }
    }

    if (newState.detectedTrade && newState.detectedCity && (newState.locationConfirmed || newState.step === 'ROUTING')) {
        const city = newState.detectedCity;
        const tradeName = getReadableTradeName(newState.detectedTrade, countryCode);
        // UK stays in the chat and waits for the user to tap "Find nearby tradesmen". The
        // EmergencyChatInterface gates the navigation behind a button instead of auto-redirecting,
        // so the copy must not claim we're moving them now. US keeps the instant-redirect wording.
        responseText = countryCode === 'US'
            ? (cityFallbackUsed
                ? `Our **${tradeName}** team in **${city}** covers your area. Taking you there now.`
                : `Taking you to your local **Emergency ${tradeName}** in **${city}** now.`)
            : (cityFallbackUsed
                ? `Our **${tradeName}** team covers **${city}**. Tap **Find nearby tradesmen** below to see who's available.`
                : `I found local **emergency ${tradeName.toLowerCase()}s** in **${city}**. Tap **Find nearby tradesmen** below to view them.`);
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
            const tradeNameConfirmed = getReadableTradeName(newState.detectedTrade, countryCode);
            responseText = countryCode === 'US'
                ? `${tip ? tip + ' ' : ''}Confirmed. I'm directing you to our emergency ${tradeNameConfirmed} team in ${city} for immediate assistance.`
                : `${tip ? tip + ' ' : ''}I found emergency **${tradeNameConfirmed.toLowerCase()}** help in **${city}**. Tap **Find nearby tradesmen** below to view them.`;
        } else {
            newState.suggestedCity = city;
            newState.detectedCity = null;
            newState.step = 'CONFIRM_LOCATION';
            const tradeName2 = getReadableTradeName(newState.detectedTrade, countryCode);
            responseText = `${!currentState.detectedTrade ? `**${tradeName2}** issue detected. ` : ""}${tip ? `${tip} ` : ""}I found **${city}** as your area. Confirm if that is right.`;
        }
    } else if (newState.detectedTrade && !newState.detectedCity) {
        const tradeName3 = getReadableTradeName(newState.detectedTrade, countryCode);
        const locationTerm = isUSDomain ? 'zip code' : 'postcode';
        responseText = `${!currentState.detectedTrade ? `**${tradeName3}** issue detected. ` : ""}${tip ? `${tip} ` : ""}Share your town or ${locationTerm} and I'll find your nearest **${tradeName3.toLowerCase()}**.`;
        newState.step = 'LOCATION_CHECK';
    } else {
        responseText = /trade|service|list|cover/i.test(lowerMsg)
            ? "### Emergency Contractors\n\nWe provide professional help for these trades:\n\n- Plumbing & Heating\n- Electrical\n- Gas Engineering\n- Locksmith\n- Drains\n- Glazing\n- Roofing\n- Building & Structural\n- Air Conditioning / HVAC\n- Vehicle Breakdown\n\nTell me which trade you need."
            : "### More Details Needed\n\nDescribe the issue so I can give the right safety advice.\n\nFor example:\n- *'My boiler is leaking'*\n- *'I've been locked out'*\n- *'There's water coming through the ceiling'*\n- *'My power has gone out'*";
        newState.step = 'TRADE_CHECK';
    }

    return { newState, response: { id: Date.now().toString(), role: 'assistant', content: responseText, action, target } };
}
