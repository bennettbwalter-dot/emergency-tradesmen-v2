import { supabase } from './supabase';

export interface Subscription {
    id: string;
    userId: string;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    plan: 'free' | 'professional' | 'enterprise';
    status: 'active' | 'canceled' | 'past_due' | 'trialing';
    currentPeriodStart?: string;
    currentPeriodEnd?: string;
    createdAt: string;
    updatedAt: string;
}

export const PLANS = {
    free: {
        name: 'Free Starter',
        price: 0,
        priceId: null,
        features: ['Basic Business Profile', 'Listed in 1 Category', 'Standard Support'],
    },
    professional: {
        name: 'Professional',
        price: 29,
        priceId: 'price_1Sd9xAARLaUTbUu469jyT4Ss',
        features: ['Enhanced Profile', '3 Categories', 'Priority Placement', 'Verified Badge', 'Analytics'],
    },
    enterprise: {
        name: 'Enterprise',
        price: 99,
        priceId: 'price_1Sd9zMARLaUTbUu4oWIneNFS',
        features: ['Premium Profile + Video', 'All Categories', 'Top of Results', 'Account Manager', 'Featured'],
    },
};

// Get current user's subscription
export async function getUserSubscription(): Promise<Subscription | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

    if (error || !data) {
        // Return default free subscription if none exists
        return {
            id: '',
            userId: user.id,
            plan: 'free',
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
    }

    return mapSubscription(data);
}

// Create or update subscription
export async function upsertSubscription(subscription: Partial<Subscription>): Promise<Subscription | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('subscriptions')
        .upsert({
            user_id: user.id,
            stripe_customer_id: subscription.stripeCustomerId,
            stripe_subscription_id: subscription.stripeSubscriptionId,
            plan: subscription.plan || 'free',
            status: subscription.status || 'active',
            current_period_start: subscription.currentPeriodStart,
            current_period_end: subscription.currentPeriodEnd,
            updated_at: new Date().toISOString(),
        }, {
            onConflict: 'user_id',
        })
        .select()
        .single();

    if (error) {
        console.error('Error upserting subscription:', error);
        return null;
    }

    return mapSubscription(data);
}

// Check if user has a specific plan or higher
export async function hasAccess(requiredPlan: 'professional' | 'enterprise'): Promise<boolean> {
    const subscription = await getUserSubscription();
    if (!subscription || subscription.status !== 'active') return false;

    const planHierarchy = { free: 0, professional: 1, enterprise: 2 };
    return planHierarchy[subscription.plan] >= planHierarchy[requiredPlan];
}

// Create Stripe checkout session redirect URL
export function getCheckoutUrl(priceId: string): string {
    // In production, this would call a Supabase Edge Function that creates a Stripe Checkout Session
    // For now, we'll just return a placeholder that could be used with Stripe Payment Links
    const baseUrl = window.location.origin;
    return `https://checkout.stripe.com/pay/${priceId}?client_reference_id=${encodeURIComponent(baseUrl)}`;
}

// Cancel subscription
export async function cancelSubscription(): Promise<boolean> {
    const subscription = await getUserSubscription();
    if (!subscription || !subscription.stripeSubscriptionId) return false;

    // In production, this would call a Supabase Edge Function to cancel via Stripe API
    const { error } = await supabase
        .from('subscriptions')
        .update({ status: 'canceled', updated_at: new Date().toISOString() })
        .eq('user_id', subscription.userId);

    return !error;
}

// Map database row to Subscription interface
function mapSubscription(row: any): Subscription {
    return {
        id: row.id,
        userId: row.user_id,
        stripeCustomerId: row.stripe_customer_id,
        stripeSubscriptionId: row.stripe_subscription_id,
        plan: row.plan,
        status: row.status,
        currentPeriodStart: row.current_period_start,
        currentPeriodEnd: row.current_period_end,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}
