import { supabase } from './supabase';
import { pipeline } from '@huggingface/transformers';
import { devLog, devWarn } from "@/lib/devLog";

// Structure for knowledge data
interface TradeKnowledge {
    safety_tips: string[];
    qa: { q: string; a: string }[];
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
        embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    }
    const output = await embedder(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data);
}

/**
 * Searches the Supabase vector database using local embeddings.
 * @param query The user's question
 * @param region 'UK' or 'US'
 */
export async function searchVectorKnowledgeBase(query: string, region: 'UK' | 'US'): Promise<any | null> {
    try {
        devLog(`[KnowledgeBase] Searching vector DB for: "${query}" in region: ${region}`);
        
        // 1. Generate embedding locally
        const embedding = await getQueryEmbedding(query);

        // 2. Call the Supabase RPC function
        const { data, error } = await supabase.rpc('match_trade_rules', {
            query_embedding: embedding,
            match_threshold: 0.5, // 50% similarity threshold
            match_count: 3,       // Return top 3 matches
            filter_region: region
        });

        if (error) {
            console.error('[KnowledgeBase] Vector search error:', error);
            return null;
        }

        if (!data || data.length === 0) {
            devLog('[KnowledgeBase] No relevant vector matches found.');
            return null;
        }

        // 3. Return the raw best match
        return data[0];
    } catch (err) {
        console.error('[KnowledgeBase] searchVectorKnowledgeBase failed:', err);
        return null;
    }
}
