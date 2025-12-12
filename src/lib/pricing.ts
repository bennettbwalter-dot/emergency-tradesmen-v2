import { Business, Pricing } from "./businesses";

// Storage key for comparison list
const COMPARISON_STORAGE_KEY = "emergency_tradesmen_comparison";

// Get businesses in comparison list
export function getComparisonList(): string[] {
    const stored = localStorage.getItem(COMPARISON_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
}

// Add business to comparison
export function addToComparison(businessId: string): boolean {
    const current = getComparisonList();
    if (current.includes(businessId)) return false;
    if (current.length >= 4) return false; // Max 4 businesses

    current.push(businessId);
    localStorage.setItem(COMPARISON_STORAGE_KEY, JSON.stringify(current));
    return true;
}

// Remove from comparison
export function removeFromComparison(businessId: string): void {
    const current = getComparisonList();
    const updated = current.filter(id => id !== businessId);
    localStorage.setItem(COMPARISON_STORAGE_KEY, JSON.stringify(updated));
}

// Check if in comparison
export function isInComparison(businessId: string): boolean {
    return getComparisonList().includes(businessId);
}

// Clear all comparisons
export function clearComparison(): void {
    localStorage.setItem(COMPARISON_STORAGE_KEY, JSON.stringify([]));
}

// Calculate total cost for a job
export function calculateJobCost(pricing: Pricing, hours: number, isEmergency: boolean = false): number {
    let cost = pricing.callOutFee;
    let rate = pricing.hourlyRate;

    if (isEmergency && pricing.emergency24hSurcharge) {
        rate = rate * (1 + pricing.emergency24hSurcharge / 100);
    }

    cost += rate * hours;

    if (pricing.minimumCharge && cost < pricing.minimumCharge) {
        cost = pricing.minimumCharge;
    }

    return cost;
}

// Format currency
export function formatPrice(amount: number): string {
    return `£${amount.toFixed(2)}`;
}

// Get price tier label with color
export function getPriceTier(pricing?: Pricing): { label: string; color: string } {
    if (!pricing) return { label: 'N/A', color: 'text-muted-foreground' };

    switch (pricing.tier) {
        case 'budget':
            return { label: 'Budget', color: 'text-green-600' };
        case 'standard':
            return { label: 'Standard', color: 'text-blue-600' };
        case 'premium':
            return { label: 'Premium', color: 'text-purple-600' };
        default:
            return { label: 'Standard', color: 'text-blue-600' };
    }
}

// Compare businesses by price (returns sorted by total cost for 2hr job)
export function sortByPrice(businesses: Business[], ascending: boolean = true): Business[] {
    return [...businesses].sort((a, b) => {
        const costA = a.pricing ? calculateJobCost(a.pricing, 2) : Infinity;
        const costB = b.pricing ? calculateJobCost(b.pricing, 2) : Infinity;
        return ascending ? costA - costB : costB - costA;
    });
}

// Get price range label
export function getPriceRangeLabel(pricing: Pricing): string {
    const twoHourCost = calculateJobCost(pricing, 2);

    if (twoHourCost < 100) return '£';
    if (twoHourCost < 200) return '££';
    if (twoHourCost < 300) return '£££';
    return '££££';
}

// Generate mock pricing for businesses without pricing data
export function generateMockPricing(businessId: string, tradeName: string): Pricing {
    // Use businessId as seed for consistent random values
    const seed = businessId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const random = (min: number, max: number) => {
        const x = Math.sin(seed) * 10000;
        const normalized = x - Math.floor(x);
        return Math.floor(normalized * (max - min + 1)) + min;
    };

    const callOutFees = [0, 25, 35, 50, 75];
    const hourlyRates = [35, 45, 55, 65, 75, 85];
    const tiers: Array<'budget' | 'standard' | 'premium'> = ['budget', 'standard', 'premium'];

    const callOutFee = callOutFees[random(0, callOutFees.length - 1)];
    const hourlyRate = hourlyRates[random(0, hourlyRates.length - 1)];
    const tier = tiers[random(0, 2)];

    const typicalJobs = {
        electrician: [
            { name: 'Socket Installation', priceRange: '£50-£80', duration: '1-2 hours' },
            { name: 'Fuse Box Repair', priceRange: '£100-£200', duration: '2-3 hours' },
            { name: 'Full Rewire', priceRange: '£2,500-£4,000', duration: '3-5 days' },
        ],
        plumber: [
            { name: 'Tap Repair', priceRange: '£60-£100', duration: '1 hour' },
            { name: 'Boiler Service', priceRange: '£80-£120', duration: '1-2 hours' },
            { name: 'Pipe Replacement', priceRange: '£150-£300', duration: '2-4 hours' },
        ],
        locksmith: [
            { name: 'Lock Change', priceRange: '£80-£120', duration: '30min-1hr' },
            { name: 'Emergency Lockout', priceRange: '£100-£150', duration: '30min' },
            { name: 'Security Upgrade', priceRange: '£200-£400', duration: '2-3 hours' },
        ],
    };

    return {
        callOutFee,
        hourlyRate,
        emergency24hSurcharge: random(0, 1) ? 50 : undefined,
        minimumCharge: callOutFee > 0 ? undefined : random(60, 100),
        typicalJobs: typicalJobs[tradeName as keyof typeof typicalJobs] || typicalJobs.electrician,
        whatsIncluded: [
            'Free quote',
            'No hidden costs',
            tier === 'premium' ? '12-month guarantee' : '6-month guarantee',
            'Fully insured',
            tier !== 'budget' ? 'Same-day service' : 'Next-day service',
        ],
        tier,
    };
}
