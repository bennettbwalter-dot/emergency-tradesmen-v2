// Stripe configuration and tier mapping

// Accessing environment variables
// Vite/React apps use import.meta.env
// Next.js apps use process.env.NEXT_PUBLIC_...
// We fallback to checking both patterns for flexibility

const getEnv = (key: string, viteKey: string) => {
    try {
        if (typeof import.meta !== 'undefined' && import.meta.env) {
            return import.meta.env[viteKey] || '';
        }
        if (typeof process !== 'undefined' && process.env) {
            return process.env[key] || '';
        }
    } catch {
        // Ignore ReferenceErrors
    }
    return '';
};

export const STRIPE_PLANS = {
    // These IDs come from your Stripe Dashboard -> Products
    // They map to your 'pro' and 'premium' (enterprise) database tiers
    PRO_PRICE_ID: getEnv('STRIPE_PRO_PRICE_ID', 'VITE_STRIPE_PRO_PRICE_ID'),
    PREMIUM_PRICE_ID: getEnv('STRIPE_PREMIUM_PRICE_ID', 'VITE_STRIPE_PREMIUM_PRICE_ID'),
};
