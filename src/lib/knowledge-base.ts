import masterKnowledgeBase from "../../data/master_knowledge_base.json";
import { devLog, devWarn } from "@/lib/devLog";

export interface TradeRuleMatch {
    id?: string;
    trade: string;
    region?: string;
    scenario: string;
    risk_level: string;
    action_plan: string;
    authority_name?: string;
    authority_url?: string;
    similarity?: number;
    retrieval_source?: 'supabase-vector' | 'local-knowledge';
}

// Structure for knowledge data
interface TradeKnowledge {
    safety_tips: string[];
    qa: { q: string; a: string }[];
}

interface MasterKnowledgeItem {
    trade: string;
    scenario: string;
    risk_level: string;
    action_plan: string;
    region_data: {
        region: 'UK' | 'US';
        authority_name: string;
        authority_url: string;
        search_query_to_scrape?: string;
    }[];
}

const TRADE_ALIASES: Record<string, string> = {
    plumbing: 'plumber',
    plumber: 'plumber',
    electrical: 'electrician',
    electrician: 'electrician',
    locksmith: 'locksmith',
    'gas engineer': 'gas-engineer',
    'gas-engineer': 'gas-engineer',
    hvac: 'hvac',
    'air conditioning': 'hvac',
    'air-conditioning': 'hvac',
    'drain specialist': 'drain-specialist',
    'drain-specialist': 'drain-specialist',
    glazier: 'glazier',
    glazing: 'glazier',
    roofer: 'roofer',
    roofing: 'roofer',
    builder: 'builder',
    construction: 'builder',
    'water restoration': 'water-restoration',
    'water-restoration': 'water-restoration',
    breakdown: 'breakdown',
    'breakdown recovery': 'breakdown',
    'tow truck': 'breakdown',
};

const STOP_WORDS = new Set([
    'about', 'after', 'again', 'because', 'before', 'being', 'could', 'does', 'doing',
    'from', 'have', 'help', 'into', 'just', 'like', 'need', 'should', 'that', 'there',
    'this', 'what', 'when', 'where', 'with', 'would', 'your',
]);

const TRADE_QUERY_HINTS: Record<string, string[]> = {
    plumber: ['pipe', 'burst', 'leak', 'tap', 'faucet', 'toilet', 'water heater', 'stopcock', 'shutoff', 'radiator'],
    electrician: ['electric', 'power', 'breaker', 'consumer unit', 'socket', 'outlet', 'wire', 'rcd', 'gfci', 'spark', 'burning', 'light', 'lights'],
    locksmith: ['lock', 'key', 'locked out', 'door', 'burglary', 'snapped'],
    'gas-engineer': ['gas', 'boiler', 'furnace', 'carbon monoxide', 'co alarm', 'yellow flame', 'pilot', 'heating'],
    'drain-specialist': ['drain', 'sewer', 'sewage', 'blocked', 'gurgling', 'manhole', 'sinkhole'],
    glazier: ['glass', 'window', 'pane', 'glazing', 'board up', 'shattered'],
    roofer: ['roof', 'tile', 'shingle', 'storm', 'chimney', 'flashing', 'ceiling leak'],
    builder: ['crack', 'wall', 'ceiling', 'structural', 'foundation', 'subsidence', 'load bearing', 'joist'],
    'water-restoration': ['water damage', 'flood', 'mold', 'mould', 'drying', 'dehumidifier', 'extraction', 'sewage cleanup'],
    breakdown: ['car', 'vehicle', 'tow', 'roadside', 'motorway', 'highway', 'battery', 'engine', 'tyre', 'tire'],
    hvac: ['air conditioning', 'air con', 'ac', 'hvac', 'cooling', 'refrigerant', 'heat pump', 'furnace', 'thermostat'],
};

const SUPPLEMENTAL_TRADE_RULES: MasterKnowledgeItem[] = [
    {
        trade: 'plumber',
        scenario: 'General plumbing leak, burst pipe, hot water, or fixture fault',
        risk_level: 'Moderate to high water damage risk',
        action_plan: 'DO: Turn off the stopcock or main water valve if water is escaping; move valuables away from the leak; avoid electrics near water; note whether the issue affects a pipe, toilet, tap, radiator, boiler, or water heater. DO NOT: Cut pipes, open sealed boiler or water heater parts, use flames on frozen pipes, or keep using fixtures that are making the leak worse.',
        region_data: [
            { region: 'UK', authority_name: 'WRAS Water Regulations', authority_url: 'https://www.wrasapprovals.co.uk/resources/water-regulations/' },
            { region: 'US', authority_name: 'International Plumbing Code', authority_url: 'https://codes.iccsafe.org/content/IPC2024P1' },
        ],
    },
    {
        trade: 'electrician',
        scenario: 'General electrical fault, power loss, tripping, burning smell, or unsafe fitting',
        risk_level: 'High fire or shock risk',
        action_plan: 'DO: Stop using the affected socket, outlet, light, appliance, or circuit; switch power off at the consumer unit or breaker if it is safe and dry to reach; keep people away from exposed wiring or hot fittings. DO NOT: Touch wet electrics, remove covers, reset a breaker repeatedly, use water on an electrical fire, or work inside a consumer unit or panel.',
        region_data: [
            { region: 'UK', authority_name: 'HSE Electricity Safety', authority_url: 'https://www.hse.gov.uk/electricity/' },
            { region: 'US', authority_name: 'NFPA Electrical Safety', authority_url: 'https://www.nfpa.org/education-and-research/electrical/electrical-safety-in-the-home' },
        ],
    },
    {
        trade: 'locksmith',
        scenario: 'General lockout, broken key, lost keys, failed lock, or security concern',
        risk_level: 'Security and access risk',
        action_plan: 'DO: Stay somewhere safe and well-lit; keep ID or proof of occupancy ready; explain the lock type, door type, and whether keys are lost, snapped, or stolen. DO NOT: Force entry, drill locks yourself, share bypass instructions, or enter after a suspected break-in until police say it is safe.',
        region_data: [
            { region: 'UK', authority_name: 'Master Locksmiths Association', authority_url: 'https://www.locksmiths.co.uk/' },
            { region: 'US', authority_name: 'ALOA Security Professionals', authority_url: 'https://www.aloa.org/' },
        ],
    },
    {
        trade: 'gas-engineer',
        scenario: 'General gas appliance, boiler, furnace, carbon monoxide, pilot light, or gas smell concern',
        risk_level: 'Critical gas, fire, or carbon monoxide risk',
        action_plan: 'DO: Leave the property if you smell gas or suspect carbon monoxide; ventilate only if safe; use the emergency gas or utility number; have gas appliances checked by a qualified professional. DO NOT: Use flames, switches, appliances, or phones near a leak; relight appliances; repair gas pipework, boilers, furnaces, or flues yourself.',
        region_data: [
            { region: 'UK', authority_name: 'Gas Safe Register', authority_url: 'https://www.gassaferegister.co.uk/gas-safety/home-gas-safety/gas-emergencies/' },
            { region: 'US', authority_name: 'NFPA 54 National Fuel Gas Code', authority_url: 'https://www.nfpa.org/codes-and-standards/nfpa-54-standard-development/54' },
        ],
    },
    {
        trade: 'drain-specialist',
        scenario: 'General blocked drain, sewer smell, sewage backup, gurgling, or slow drainage',
        risk_level: 'Health and flooding risk',
        action_plan: 'DO: Stop using taps, toilets, and appliances if sewage is backing up; keep children and pets away; ventilate the area if safe; note whether one fixture or the whole property is affected. DO NOT: Mix drain chemicals, open sewage covers without protection, keep flushing into a blockage, or use pressure equipment indoors.',
        region_data: [
            { region: 'UK', authority_name: 'Building Regulations Approved Document H', authority_url: 'https://www.gov.uk/government/publications/drainage-and-waste-disposal-approved-document-h' },
            { region: 'US', authority_name: 'EPA Septic Systems Guidance', authority_url: 'https://www.epa.gov/septic' },
        ],
    },
    {
        trade: 'glazier',
        scenario: 'General broken glass, cracked window, failed glazing, board-up, or security glazing issue',
        risk_level: 'Cut injury, weather, and security risk',
        action_plan: 'DO: Keep people and pets away from broken glass; close internal doors if there is wind or rain; photograph the damage for insurance; ask for boarding or safe replacement glass. DO NOT: Handle shards with bare hands, lean on cracked glass, tape overhead glass as a repair, or leave an insecure opening overnight.',
        region_data: [
            { region: 'UK', authority_name: 'British Standards Institution', authority_url: 'https://www.bsigroup.com/' },
            { region: 'US', authority_name: 'National Glass Association', authority_url: 'https://www.glass.org/' },
        ],
    },
    {
        trade: 'roofer',
        scenario: 'General roof leak, missing tiles or shingles, storm damage, flashing, gutter, or chimney issue',
        risk_level: 'Fall, weather, and water damage risk',
        action_plan: 'DO: Stay away from falling debris; place buckets under leaks if it is safe indoors; move belongings away from the leak; note where water appears inside and outside. DO NOT: Climb onto a roof, use ladders in bad weather, lift tiles or shingles, or attempt temporary roof repairs near cables.',
        region_data: [
            { region: 'UK', authority_name: 'HSE Work at Height', authority_url: 'https://www.hse.gov.uk/work-at-height/' },
            { region: 'US', authority_name: 'OSHA Fall Protection', authority_url: 'https://www.osha.gov/fall-protection' },
        ],
    },
    {
        trade: 'builder',
        scenario: 'General structural crack, sagging ceiling, wall movement, unsafe opening, or construction damage',
        risk_level: 'Structural safety risk',
        action_plan: 'DO: Leave any area with bulging walls, sagging ceilings, falling masonry, or widening cracks; take photos from a safe distance; keep load and vibration away from the damaged area. DO NOT: Prop, drill, knock through, remove supports or debris, or stay underneath damaged structural elements.',
        region_data: [
            { region: 'UK', authority_name: 'Building Regulations Approved Document A', authority_url: 'https://www.gov.uk/government/publications/structure-approved-document-a' },
            { region: 'US', authority_name: 'International Building Code', authority_url: 'https://codes.iccsafe.org/content/IBC2024P1' },
        ],
    },
    {
        trade: 'water-restoration',
        scenario: 'General flooding, water damage, damp, mould, sewage water, or drying concern',
        risk_level: 'Electrical, contamination, and mould risk',
        action_plan: 'DO: Stop the water source if safe; avoid rooms where water may contact electrics; separate clean water from sewage or floodwater concerns; start ventilation only if it is safe. DO NOT: Walk through contaminated water, use a household vacuum on water, ignore damp materials, or disturb mould without proper controls.',
        region_data: [
            { region: 'UK', authority_name: 'British Damage Management Association', authority_url: 'https://bdma.org.uk/' },
            { region: 'US', authority_name: 'IICRC Standards', authority_url: 'https://iicrc.org/standards/' },
        ],
    },
    {
        trade: 'breakdown',
        scenario: 'General vehicle breakdown, motorway or highway stop, flat battery, tyre, warning light, accident, or tow concern',
        risk_level: 'Roadside traffic risk',
        action_plan: 'DO: Move away from traffic if possible; use hazard lights; exit on the side away from traffic when safe; wait behind a barrier; call emergency services first if exposed to live traffic. DO NOT: Stand in the road, attempt repairs in a live lane, stay in a vehicle in a dangerous position, or tow without proper equipment.',
        region_data: [
            { region: 'UK', authority_name: 'Highway Code Breakdowns and Incidents', authority_url: 'https://www.gov.uk/guidance/the-highway-code/breakdowns-and-incidents-274-to-287' },
            { region: 'US', authority_name: 'NHTSA Emergency Kit and Road Safety', authority_url: 'https://www.nhtsa.gov/vehicle-safety/emergency-kit' },
        ],
    },
    {
        trade: 'hvac',
        scenario: 'General air conditioning, HVAC, heat pump, refrigerant, furnace, thermostat, or ventilation issue',
        risk_level: 'Electrical, refrigerant, gas, or indoor air risk',
        action_plan: 'DO: Turn the unit off if it smells burnt, hisses, leaks, trips power, or produces fumes; ventilate if safe; note whether the issue is cooling, heating, airflow, water, noise, or controls. DO NOT: Handle refrigerant, bypass safety controls, open sealed electrical or gas parts, or keep running a unit that may be leaking or overheating.',
        region_data: [
            { region: 'UK', authority_name: 'REFCOM F-Gas Certification', authority_url: 'https://www.refcom.org.uk/' },
            { region: 'US', authority_name: 'EPA Section 608 Technician Certification', authority_url: 'https://www.epa.gov/section608' },
        ],
    },
];

function normalizeTradeSlug(trade: string): string {
    const key = String(trade || '').trim().toLowerCase();
    return TRADE_ALIASES[key] || key.replace(/\s+/g, '-');
}

function tokenize(text: string): string[] {
    return String(text || '')
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, ' ')
        .split(/\s+/)
        .filter((term) => term.length > 2 && !STOP_WORDS.has(term));
}

function searchLocalTradeRules(query: string, region: 'UK' | 'US', filterTrade?: string): TradeRuleMatch | null {
    const queryTerms = tokenize(query);
    const queryText = query.toLowerCase();
    if (queryTerms.length === 0) return null;

    const rules = [...(masterKnowledgeBase as MasterKnowledgeItem[]), ...SUPPLEMENTAL_TRADE_RULES];

    const scored = rules
        .map((item, index) => {
            const trade = normalizeTradeSlug(item.trade);
            if (filterTrade && trade !== normalizeTradeSlug(filterTrade)) return null;
            const regionData = item.region_data.find((data) => data.region === region);
            if (!regionData) return null;

            const documentText = [
                trade,
                item.trade,
                item.scenario,
                item.risk_level,
                item.action_plan,
                regionData.authority_name,
                regionData.search_query_to_scrape,
                ...(TRADE_QUERY_HINTS[trade] || []),
            ].join(' ').toLowerCase();

            let score = 0;
            for (const term of queryTerms) {
                if (documentText.includes(term)) score += term.length > 5 ? 2 : 1;
            }

            for (const hint of TRADE_QUERY_HINTS[trade] || []) {
                if (queryText.includes(hint)) score += hint.includes(' ') ? 5 : 2;
            }

            if (queryText.includes(trade.replace(/-/g, ' ')) || queryText.includes(trade)) score += 6;
            if (/danger|safe|emergency|urgent|now|asap|should i|can i/.test(queryText)) score += 1;
            if (/how often|service|maintain|maintenance|prevent|prevention|general|what should i not do/.test(queryText) && /^general/i.test(item.scenario)) score += 4;
            if (/critical|major/i.test(item.risk_level)) score += 0.5;

            return {
                id: `local-${region.toLowerCase()}-${index}`,
                trade,
                region,
                scenario: item.scenario,
                risk_level: item.risk_level,
                action_plan: item.action_plan,
                authority_name: regionData.authority_name,
                authority_url: regionData.authority_url,
                similarity: Math.min(score / Math.max(queryTerms.length + 8, 1), 0.99),
                retrieval_source: 'local-knowledge' as const,
                score,
            };
        })
        .filter(Boolean)
        .sort((a: any, b: any) => b.score - a.score);

    const best = scored[0] as (TradeRuleMatch & { score: number }) | undefined;
    if (!best || best.score < 3) return null;

    const { score, ...match } = best;
    return match;
}

export const KNOWLEDGE_BASE_DATA: Record<string, TradeKnowledge> = {
    "CORE_PROTOCOL": {
        safety_tips: [
            "Always prioritise human safety.",
            "If there is immediate danger to life (fire, gas leak), call 999.",
            "Do not attempt dangerous repairs yourself."
        ],
        qa: []
    },

    "ELECTRICAL": {
        safety_tips: [
            "⚠️ Buzzing Fuse Box? Turn off main switch immediately.",
            "⚠️ Fishy Smell? Indicates overheating. Isolate circuit.",
            "⚠️ Water & Electricity? Never touch switches with wet hands.",
            "⚠️ HSE Warning: Assume all equipment is live until safe isolation is proven."
        ],
        qa: [
            { q: "What are the safe isolation procedures?", a: "Safe isolation involves locking off the circuit and using a voltage tester to verify it is dead. This is mandated by the Electricity at Work Regulations 1989." }
        ]
    },

    "PLUMBING": {
        safety_tips: [
            "⚠️ Burst Pipe? Turn off main stopcock (usually under sink).",
            "⚠️ Frozen Pipe? Thaw slowly. NEVER use naked flame.",
            "⚠️ Gas Smell? Open windows, evacuate, call 0800 111999.",
            "⚠️ Building Regs: Follow Approved Document G for hot water safety."
        ],
        qa: [
            { q: "Where is my stopcock usually located?", a: "Usually under the kitchen sink, downstairs cloakroom, or under the stairs." }
        ]
    },

    "GAS": {
        safety_tips: [
            "⚠️ Gas Smell? Turn off supply at meter control, ventilate, and vacate.",
            "⚠️ NFPA 54 / IGEM: Direct all gas leak and pressure testing to certified engineers.",
            "⚠️ Yellow Flame? Indicates carbon monoxide risk. Stop using appliance immediately."
        ],
        qa: [
            { q: "What is NFPA 54?", a: "It is the National Fuel Gas Code (US) which provides safety rules for the installation and operation of fuel gas piping and appliances." }
        ]
    },

    "DRAINAGE": {
        safety_tips: [
            "⚠️ Sewage Backup? Health hazard. Keep away.",
            "⚠️ Strong Sewer Smell? Check traps/u-bends."
        ],
        qa: [
            { q: "Is a blocked drain an emergency?", a: "If sewage causes backup into the home/garden (Category 3 water), yes. It's a health hazard." },
            { q: "Who is responsible for the drain?", a: "You own drains inside your boundary serving only your home. Water companies own shared/lateral drains." },
            { q: "Signs of collapsed drain?", a: "Frequent blockages, ground sinking (subsidence), cracks in walls, or persistent sewage smell." },
            { q: "Can I pour cooking fat down the sink?", a: "No! It causes 'Fatbergs'. Dispose in the bin." },
            { q: "My toilet bubbles when sink drains.", a: "Indicates partial blockage or venting issue (trapped air escaping)." },
            { q: "Do I have rats in my drains?", a: "Noises in walls or droppings near manholes suggest rats entering via broken pipes." },
            { q: "What is High Pressure Water Jetting?", a: "Using 3000+ PSI water to cut through grease/roots/debris." },
            { q: "Why is my patio flooding?", a: "Blocked surface drain/gully or saturated soakaway." }
        ]
    },

    "LOCKSMITH": {
        safety_tips: [
            "⚠️ Locked Out? Verify ID of locksmith.",
            "⚠️ Lost Keys? Change locks to ensure security.",
            "⚠️ Burglary? Board up immediately and upgrade to BS 3621 or SS 312 standards.",
            "⚠️ Fire Safety: Ensure locks do not compromise your ability to escape quickly."
        ],
        qa: [
            { q: "What lock do I need for a timber door?", a: "The Master Locksmiths Association (MLA) recommends BS 3621 certified locks for timber doors to meet insurance and security standards." },
            { q: "What is an anti-snap cylinder?", a: "For uPVC doors, an SS 312 Diamond rated cylinder is the highest standard to prevent lock snapping attacks." }
        ]
    },

    "GLAZING": {
        safety_tips: [
            "⚠️ Smashed Glass? Dont touch shards. Cordon area.",
            "⚠️ Security Risk? Board up immediately."
        ],
        qa: [
            { q: "Shop window smashed?", a: "Call for 'Boarding Up' to secure site while glass is ordered." },
            { q: "Mist between panes?", a: "Blown unit/seal failure. Replace the glass unit, not the frame." },
            { q: "Is boarding up secure?", a: "Yes, if bolted through the frame correctly." },
            { q: "How long does replacement take?", a: "Float glass: same day. Toughened: 3-5 days (needs ordering)." },
            { q: "Glass cracked on its own?", a: "Thermal stress or nickel sulphide inclusion." },
            { q: "Cat flap in glass?", a: "Cannot cut existing toughened glass. New pane with pre-cut hole is required." }
        ]
    },

    "VEHICLE": {
        safety_tips: [
            "⚠️ Motorway Breakdown? Get out LEFT side. Wait behind barrier.",
            "⚠️ Red Warning Light? Stop immediately.",
            "⚠️ Wrong Fuel? Do NOT start engine."
        ],
        qa: [
            { q: "Put wrong fuel in car.", a: "Don't start engine! Call for Fuel Drain service." },
            { q: "Breakdown on motorway?", a: "Hard shoulder. Exit passenger side. Behind barrier. Call 999 if in danger." },
            { q: "Flat battery?", a: "We can jump start. (EVs: 12v only, not HV)." },
            { q: "Roadside vs Recovery?", a: "Roadside = fix there. Recovery = tow to garage." },
            { q: "Engine light is red.", a: "Stop. Serious fault (e.g. oil pressure)." },
            { q: "Wheel change on slope?", a: "Dangerous. We use winches/jacks to move to safety first." },
            { q: "Stuck in mud/snow?", a: "We use heavy duty winches to pull you out." }
        ]
    }
};

export const KNOWLEDGE_KEYWORDS: Record<string, string[]> = {
    "ELECTRICAL": ["electric", "spark", "shock", "wire", "power", "fuse", "blackout", "tripping", "rcd", "flicker", "eicr", "light", "lights", "fishy"],
    "PLUMBING": ["water", "leak", "pipe", "burst", "frozen", "thaw", "tap", "drip", "boiler", "radiator", "pressure", "hot water", "cold"],
    "DRAINAGE": ["drain", "blocked", "blockage", "sewage", "sink", "toilet", "overflow", "flooding", "gully", "fatberg", "jetting"],
    "LOCKSMITH": ["lock", "key", "door", "stuck", "entry", "burglar", "break in", "handle", "upvc", "snapped", "safe"],
    "GLAZING": ["glass", "window", "smash", "broken", "board up", "crack", "mist", "double glazing"],
    "VEHICLE": ["car", "breakdown", "tow", "accident", "start", "battery", "tyre", "ev", "fuel", "engine", "warning light", "dashboard", "recovery", "motorway"],
    "CORE_PROTOCOL": ["help", "safety", "emergency", "999"]
};

// Helper: Calculate relevance score based on word overlap
function getScore(text: string, queryTerms: string[]): number {
    const lowerText = text.toLowerCase();
    let score = 0;
    for (const term of queryTerms) {
        if (lowerText.includes(term)) score += 1;
    }
    return score;
}

export function searchKnowledgeBase(query: string): string | null {
    const lowerQuery = query.toLowerCase();
    const queryTerms = lowerQuery.split(/\s+/).filter(w => w.length > 3); // Ignore short words

    // 1. Identify Category
    let bestMatchKey: string | null = null;
    let maxMatches = 0;

    for (const [key, keywords] of Object.entries(KNOWLEDGE_KEYWORDS)) {
        const matches = keywords.filter(k => lowerQuery.includes(k)).length;
        if (matches > maxMatches) {
            maxMatches = matches;
            bestMatchKey = key;
        }
    }

    if (!bestMatchKey) return null;

    const data = KNOWLEDGE_BASE_DATA[bestMatchKey];
    if (!data) return null;

    // 2. Formatting Output
    let output = "";

    // Add Safety Tips first (concise)
    if (data.safety_tips.length > 0) {
        output += `${data.safety_tips.join('\n')}\n\n`;
    }

    // 3. Find Top 3 Relevant Q&As
    // If query is very generic, maybe just show tips. But if keywords match Qs, show those.
    // If no query terms (just category match), show top 2 general ones?
    // Let's score Q&As.

    const scoredQA = data.qa.map(item => ({
        item,
        score: getScore(item.q + " " + item.a, queryTerms)
    })).sort((a, b) => b.score - a.score);

    // Filter to those with at least some relevance if query has terms
    // or just take top 3 if query is broad
    const topQA = scoredQA
        .filter(entry => entry.score > 0) // Strict relevance: must match at least one word
        .slice(0, 2); // Limit to top 2

    if (topQA.length > 0) {
        output += `💬 **Related Q&A:**\n`;
        topQA.forEach(entry => {
            output += `**Q:** ${entry.item.q}\n**A:** ${entry.item.a}\n\n`;
        });
    }

    return output.trim();
}

// Local embedder instance for browser-side RAG
let embedder: any = null;

/**
 * Generates an embedding for a query locally in the browser (Free!)
 */
async function getQueryEmbedding(text: string): Promise<number[]> {
    if (!embedder) {
        devLog('[KnowledgeBase] Loading local embedding model (all-MiniLM-L6-v2)...');
        const { pipeline } = await import('@huggingface/transformers');
        embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    }
    const output = await embedder(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data);
}

/**
 * Searches the Supabase vector database using local embeddings.
 * @param query The user's question
 * @param region 'UK' or 'US'
 * @param filterTrade Optional trade slug to filter results
 */
export async function searchVectorKnowledgeBase(query: string, region: 'UK' | 'US', filterTrade?: string): Promise<TradeRuleMatch | null> {
    const localMatch = searchLocalTradeRules(query, region, filterTrade);
    if (localMatch) {
        devLog(`[KnowledgeBase] Using local trade knowledge for: ${localMatch.trade} / ${localMatch.scenario}`);
        return localMatch;
    }

    const localFallback = () => {
        devWarn('[KnowledgeBase] No vector or local trade knowledge matched the query.');
        return null;
    };

    try {
        devLog(`[KnowledgeBase] Searching vector DB for: "${query}" in region: ${region} (filtered trade: ${filterTrade || 'none'})`);
        
        // 1. Generate embedding locally
        const embedding = await Promise.race([
            getQueryEmbedding(query),
            new Promise<null>((resolve) => setTimeout(() => resolve(null), 3500)),
        ]);

        if (!embedding) {
            devWarn('[KnowledgeBase] Vector embedding timed out; falling back to local knowledge.');
            return localFallback();
        }

        // 2. Call the Supabase RPC function
        const { supabase } = await import('./supabase');
        const { data, error } = await supabase.rpc('match_trade_rules', {
            query_embedding: embedding,
            match_threshold: 0.5, // 50% similarity threshold
            match_count: 3,       // Return top 3 matches
            filter_region: region
        });

        if (error) {
            console.error('[KnowledgeBase] Vector search error:', error);
            return localFallback();
        }

        if (!data || data.length === 0) {
            devLog('[KnowledgeBase] No relevant vector matches found.');
            return localFallback();
        }

        const filteredData = filterTrade
            ? data.filter((row: any) => normalizeTradeSlug(row.trade) === normalizeTradeSlug(filterTrade))
            : data;

        if (filteredData.length === 0) {
            devLog(`[KnowledgeBase] No relevant vector matches found for trade: ${filterTrade}`);
            return localFallback();
        }

        // 3. Return the raw best match
        return {
            ...filteredData[0],
            trade: normalizeTradeSlug(filteredData[0].trade),
            retrieval_source: 'supabase-vector',
        };
    } catch (err) {
        console.error('[KnowledgeBase] searchVectorKnowledgeBase failed:', err);
        return localFallback();
    }
}
