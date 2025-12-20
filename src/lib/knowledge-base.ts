
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
            "⚠️ Water & Electricity? Never touch switches with wet hands."
        ],
        qa: [
            { q: "My fuse box is making a buzzing noise, is this dangerous?", a: "Yes. A buzzing consumer unit often indicates a loose connection or arcing. This is a fire hazard. Turn off the main switch immediately and call an emergency electrician." },
            { q: "There is a fishy smell near my sockets, what is it?", a: "A fishy smell is a classic sign of overheating electrical components (burning plastic/bakelite). Isolate the circuit immediately and call an electrician." },
            { q: "What should I do if my RCD keeps tripping?", a: "Unplug all appliances. Reset the RCD. If it stays on, plug items back in one by one. If it trips with nothing connected, it's a wiring fault." },
            { q: "I drilled through a wall and hit a wire, what now?", a: "Do not touch the drill or the wall. Go to your consumer unit and turn off the main switch immediately." },
            { q: "Why are my lights flickering?", a: "Could be a loose connection or external grid issue. If sparking/smoking, turn off power. If general, call an electrician." },
            { q: "My plug socket feels hot to the touch.", a: "Stop using it immediately. Indicates loose wiring/high resistance. Fire risk." },
            { q: "What do I do if I see sparks coming from an outlet?", a: "Turn off power at the main consumer unit immediately. Do not use water." },
            { q: "What is the emergency number for a power cut?", a: "Dial 105 to contact your local network operator." },
            { q: "Can I do my own electrical work?", a: "Minor work is allowed, but bathrooms/kitchens are special locations (Part P). Major work needs certification." },
            { q: "What is an EICR?", a: "Electrical Installation Condition Report. Mandatory for landlords (5 years), recommended for owners (10 years)." }
        ]
    },

    "PLUMBING": {
        safety_tips: [
            "⚠️ Burst Pipe? Turn off main stopcock (usually under sink).",
            "⚠️ Frozen Pipe? Thaw slowly. NEVER use naked flame.",
            "⚠️ Gas Smell? Open windows, evacuate, call 0800 111999."
        ],
        qa: [
            { q: "Where is my stopcock usually located?", a: "Usually under the kitchen sink, downstairs cloakroom, or under the stairs." },
            { q: "What is the first thing to do if a pipe bursts?", a: "Turn off the main stopcock immediately. Then open all taps to drain the system." },
            { q: "How do I thaw a frozen pipe?", a: "Turn off water. Apply gentle heat (hairdryer/hot water bottle) starting from the tap end. No naked flames." },
            { q: "Why is my boiler pressure dropping?", a: "Likely a leak or faulty relief valve. You may need to use the filling loop to repressurize." },
            { q: "My radiator is cold at the top.", a: "Air is trapped. Bleed the radiator with a key until water trickles out." },
            { q: "My radiator is cold at the bottom.", a: "Indicates sludge build-up. System likely needs a power flush." },
            { q: "Hot water smells like rotten eggs.", a: "Bacteria in the tank or corroded anode rod. Needs flushing/servicing." },
            { q: "How do I fix a dripping tap?", a: "Usually needs a new washer. Isolate water, unscrew headgear, replace washer." },
            { q: "What counts as a plumbing emergency?", a: "Uncontainable leaks, total water loss, ceiling collapse risk, or sewage backup." },
            { q: "My shower runs hot then cold.", a: "Blocked head, failing thermostatic cartridge, or pressure drops from other taps." }
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
            "⚠️ Burglary? Board up immediately."
        ],
        qa: [
            { q: "Will you break my door to get in?", a: "No. Pros prioritize Non-Destructive Entry (picking/bypassing). Drilling is a last resort." },
            { q: "My key snapped in the lock.", a: "We use extractor tools to remove it. Don't use glue." },
            { q: "What is Lock Snapping?", a: "A burglary technique on euro-cylinders. Upgrade to Anti-Snap (3-star) locks." },
            { q: "How much does it cost?", a: "Ask for a quote upfront. Avoid 'starts from £39' offers (often scams)." },
            { q: "uPVC handle won't lift.", a: "Multi-point gearbox failure. Can be replaced without a new door." },
            { q: "Do you ask for ID?", a: "Yes, to verify you live there and prevent assisting burglaries." },
            { q: "Key turns but door won't open.", a: "Mechanism/cam has sheared. Needs professional opening." },
            { q: "Change locks when moving house?", a: "Yes. You don't know who has old keys." },
            { q: "Can you open a safe?", a: "Yes, via picking or manipulation." }
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
