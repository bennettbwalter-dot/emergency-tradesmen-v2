// AI Emergency Triage Logic
// Provides smart matching based on problem type and urgency

export type UrgencyLevel = "emergency" | "same-day" | "next-day" | "scheduled";

export interface TriageResult {
    priorityScore: number; // 1-10, higher = more urgent
    estimatedCost: { min: number; max: number };
    estimatedWaitTime: string;
    recommendedAction: string;
}

export interface TradeOption {
    id: string;
    name: string;
    icon: string;
    problems: ProblemOption[];
}

export interface ProblemOption {
    id: string;
    label: string;
    urgencyHint: UrgencyLevel;
    baseCostMultiplier: number;
}

// Trade definitions with common problems
export const TRADE_OPTIONS: TradeOption[] = [
    {
        id: "electrician",
        name: "Electrician",
        icon: "⚡",
        problems: [
            { id: "no-power", label: "Total power outage", urgencyHint: "emergency", baseCostMultiplier: 1.5 },
            { id: "sparking", label: "Sparking outlet or smell of burning", urgencyHint: "emergency", baseCostMultiplier: 1.8 },
            { id: "partial-outage", label: "Some lights/sockets not working", urgencyHint: "same-day", baseCostMultiplier: 1.2 },
            { id: "tripping-breaker", label: "Circuit breaker keeps tripping", urgencyHint: "same-day", baseCostMultiplier: 1.3 },
            { id: "new-installation", label: "New socket/light installation", urgencyHint: "scheduled", baseCostMultiplier: 1.0 },
            { id: "inspection", label: "Electrical inspection (EICR)", urgencyHint: "scheduled", baseCostMultiplier: 0.9 },
        ],
    },
    {
        id: "plumber",
        name: "Plumber",
        icon: "🔧",
        problems: [
            { id: "burst-pipe", label: "Burst pipe / major leak", urgencyHint: "emergency", baseCostMultiplier: 1.8 },
            { id: "no-hot-water", label: "No hot water or heating", urgencyHint: "emergency", baseCostMultiplier: 1.5 },
            { id: "blocked-toilet", label: "Blocked toilet", urgencyHint: "same-day", baseCostMultiplier: 1.3 },
            { id: "dripping-tap", label: "Dripping tap or slow leak", urgencyHint: "next-day", baseCostMultiplier: 1.0 },
            { id: "boiler-service", label: "Boiler service needed", urgencyHint: "scheduled", baseCostMultiplier: 1.0 },
            { id: "bathroom-install", label: "Bathroom installation", urgencyHint: "scheduled", baseCostMultiplier: 0.9 },
        ],
    },
    {
        id: "locksmith",
        name: "Locksmith",
        icon: "🔐",
        problems: [
            { id: "locked-out", label: "Locked out of home", urgencyHint: "emergency", baseCostMultiplier: 1.5 },
            { id: "break-in", label: "Break-in / damaged lock", urgencyHint: "emergency", baseCostMultiplier: 1.8 },
            { id: "key-stuck", label: "Key stuck or broken in lock", urgencyHint: "same-day", baseCostMultiplier: 1.3 },
            { id: "lock-change", label: "Change locks (moved home)", urgencyHint: "next-day", baseCostMultiplier: 1.0 },
            { id: "security-upgrade", label: "Security upgrade", urgencyHint: "scheduled", baseCostMultiplier: 1.1 },
        ],
    },
    {
        id: "gas-engineer",
        name: "Gas Engineer",
        icon: "🔥",
        problems: [
            { id: "gas-smell", label: "Smell of gas", urgencyHint: "emergency", baseCostMultiplier: 2.0 },
            { id: "boiler-breakdown", label: "Boiler not working", urgencyHint: "emergency", baseCostMultiplier: 1.6 },
            { id: "no-heating", label: "No heating", urgencyHint: "same-day", baseCostMultiplier: 1.4 },
            { id: "gas-safety", label: "Gas safety check needed", urgencyHint: "scheduled", baseCostMultiplier: 1.0 },
            { id: "boiler-install", label: "New boiler installation", urgencyHint: "scheduled", baseCostMultiplier: 0.9 },
        ],
    },
    {
        id: "glazier",
        name: "Glazier",
        icon: "🪟",
        problems: [
            { id: "smashed-window", label: "Smashed window (security risk)", urgencyHint: "emergency", baseCostMultiplier: 1.7 },
            { id: "cracked-glass", label: "Cracked glass", urgencyHint: "next-day", baseCostMultiplier: 1.2 },
            { id: "misted-double-glazing", label: "Misted double glazing", urgencyHint: "scheduled", baseCostMultiplier: 1.0 },
            { id: "new-windows", label: "New window installation", urgencyHint: "scheduled", baseCostMultiplier: 0.9 },
        ],
    },
    {
        id: "drain-specialist",
        name: "Drain Specialist",
        icon: "🚿",
        problems: [
            { id: "sewage-backup", label: "Sewage backup in home", urgencyHint: "emergency", baseCostMultiplier: 2.0 },
            { id: "blocked-drain", label: "Blocked drain (not draining)", urgencyHint: "same-day", baseCostMultiplier: 1.4 },
            { id: "slow-drain", label: "Slow draining", urgencyHint: "next-day", baseCostMultiplier: 1.1 },
            { id: "drain-smell", label: "Bad smell from drains", urgencyHint: "next-day", baseCostMultiplier: 1.2 },
            { id: "drain-survey", label: "CCTV drain survey", urgencyHint: "scheduled", baseCostMultiplier: 1.0 },
        ],
    },
];

// Base costs per trade (call-out + typical first hour)
const BASE_COSTS: Record<string, number> = {
    electrician: 85,
    plumber: 90,
    locksmith: 75,
    "gas-engineer": 95,
    glazier: 80,
    "drain-specialist": 100,
};

// Urgency multipliers
const URGENCY_MULTIPLIERS: Record<UrgencyLevel, number> = {
    emergency: 1.5,
    "same-day": 1.25,
    "next-day": 1.1,
    scheduled: 1.0,
};

// Time-of-day multipliers
function getTimeMultiplier(): number {
    const hour = new Date().getHours();
    if (hour >= 22 || hour < 6) return 1.5; // Night rate
    if (hour >= 18 || hour < 8) return 1.25; // Evening/early morning
    return 1.0; // Standard hours
}

export function assessTriage(
    tradeId: string,
    problemId: string,
    urgency: UrgencyLevel
): TriageResult {
    const trade = TRADE_OPTIONS.find((t) => t.id === tradeId);
    const problem = trade?.problems.find((p) => p.id === problemId);

    if (!trade || !problem) {
        return {
            priorityScore: 5,
            estimatedCost: { min: 80, max: 200 },
            estimatedWaitTime: "2-4 hours",
            recommendedAction: "Call for assessment",
        };
    }

    const baseCost = BASE_COSTS[tradeId] || 85;
    const urgencyMultiplier = URGENCY_MULTIPLIERS[urgency];
    const timeMultiplier = getTimeMultiplier();
    const problemMultiplier = problem.baseCostMultiplier;

    const estimatedBase = baseCost * urgencyMultiplier * timeMultiplier * problemMultiplier;
    const estimatedCost = {
        min: Math.round(estimatedBase * 0.8),
        max: Math.round(estimatedBase * 1.4),
    };

    // Calculate priority score (1-10)
    let priorityScore = 5;
    if (urgency === "emergency") priorityScore = 10;
    else if (urgency === "same-day") priorityScore = 7;
    else if (urgency === "next-day") priorityScore = 4;
    else priorityScore = 2;

    // Adjust based on problem severity
    if (problem.urgencyHint === "emergency") priorityScore = Math.min(10, priorityScore + 2);

    // Estimated wait time
    let estimatedWaitTime = "Within 1-2 hours";
    if (urgency === "emergency") estimatedWaitTime = "Within 30-60 minutes";
    else if (urgency === "same-day") estimatedWaitTime = "Within 2-4 hours";
    else if (urgency === "next-day") estimatedWaitTime = "Tomorrow";
    else estimatedWaitTime = "Within 3-5 days";

    // Recommended action
    let recommendedAction = "Request a quote";
    if (priorityScore >= 8) recommendedAction = "Call immediately for fastest response";
    else if (priorityScore >= 6) recommendedAction = "Book same-day appointment";
    else recommendedAction = "Schedule at your convenience";

    return {
        priorityScore,
        estimatedCost,
        estimatedWaitTime,
        recommendedAction,
    };
}

export function formatCostRange(cost: { min: number; max: number }): string {
    return `£${cost.min} - £${cost.max}`;
}
