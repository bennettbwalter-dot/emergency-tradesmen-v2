import { supabase } from './supabase';

export interface Subscription {
    id: string;
    userId: string;
    paymentCustomerId?: string;
    paymentSubscriptionId?: string;
    plan: 'free' | 'professional' | 'enterprise';
    status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'inactive';
    subscriptionExpiresAt?: string;
    currentPeriodStart?: string;
    currentPeriodEnd?: string;
    createdAt: string;
    updatedAt: string;
}

export const PLANS = {
    free: {
        name: 'Free Starter',
        price: 0,
        features: ['Basic Business Profile', 'Listed in 1 Category', 'Standard Support'],
    },
    professional: {
        name: 'Professional',
        price: 29,
        durationDays: 30,
        features: ['Enhanced Profile', '3 Categories', 'Priority Placement', 'Verified Badge', 'Analytics'],
    },
    enterprise: {
        name: 'Enterprise',
        price: 99,
        durationDays: 365,
        features: ['Premium Profile + Video', 'All Categories', 'Top of Results', 'Account Manager', 'Featured'],
    },
};

// Get current user's subscription
export async function getUserSubscription(): Promise<Subscription | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Developer Bypass
    const devEmails = ['nicholas.bennett247@gmail.com', 'bennett.b.walter@gmail.com'];
    if (user.email && devEmails.includes(user.email.toLowerCase())) {
        console.log("Bypassing subscription check for developer:", user.email);
        return {
            id: 'dev-bypass-id',
            userId: user.id,
            plan: 'enterprise',
            status: 'active',
            subscriptionExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
    }

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

// Get subscription by user ID (for admin use)
export async function getSubscriptionByUserId(userId: string): Promise<Subscription | null> {
    const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (error || !data) return null;
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
            payment_customer_id: subscription.paymentCustomerId,
            payment_subscription_id: subscription.paymentSubscriptionId,
            plan: subscription.plan || 'free',
            status: subscription.status || 'active',
            subscription_expires_at: subscription.subscriptionExpiresAt,
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

// Check if user has a specific plan or higher (with expiry check)
export async function hasAccess(requiredPlan: 'professional' | 'enterprise'): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();

    // Developer Bypass Check
    const devEmails = ['nicholas.bennett247@gmail.com', 'bennett.b.walter@gmail.com'];
    if (user?.email && devEmails.includes(user.email.toLowerCase())) {
        console.log("Access granted via developer bypass");
        return true;
    }

    const subscription = await getUserSubscription();
    if (!subscription) return false;

    // Check if subscription is active
    if (subscription.status !== 'active') return false;

    // Check if subscription has expired
    if (subscription.subscriptionExpiresAt) {
        const expiryDate = new Date(subscription.subscriptionExpiresAt);
        if (expiryDate < new Date()) {
            return false; // Expired
        }
    }

    const planHierarchy = { free: 0, professional: 1, enterprise: 2 };
    return planHierarchy[subscription.plan] >= planHierarchy[requiredPlan];
}

// Check if a specific subscription is currently valid (not expired)
export function isSubscriptionActive(subscription: Subscription): boolean {
    if (subscription.status !== 'active') return false;

    if (subscription.subscriptionExpiresAt) {
        const expiryDate = new Date(subscription.subscriptionExpiresAt);
        if (expiryDate < new Date()) {
            return false;
        }
    }

    return true;
}

// Extend subscription by days (Admin function)
export async function extendSubscription(userId: string, days: number): Promise<boolean> {
    // Call the database function
    const { error } = await supabase.rpc('extend_subscription', {
        p_user_id: userId,
        p_days: days
    });

    if (error) {
        console.error('Error extending subscription:', error);
        return false;
    }

    return true;
}

// Mark subscription as paid (Admin function - sets active + extends)
export async function markSubscriptionAsPaid(userId: string, plan: 'professional' | 'enterprise'): Promise<boolean> {
    const days = plan === 'enterprise' ? 365 : 30;
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);

    const { error } = await supabase
        .from('subscriptions')
        .upsert({
            user_id: userId,
            plan: plan,
            status: 'active',
            subscription_expires_at: expiryDate.toISOString(),
            updated_at: new Date().toISOString(),
        }, {
            onConflict: 'user_id',
        });

    if (error) {
        console.error('Error marking subscription as paid:', error);
        return false;
    }

    return true;
}

// Cancel subscription
export async function cancelSubscription(): Promise<boolean> {
    const subscription = await getUserSubscription();
    if (!subscription) return false;

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
        paymentCustomerId: row.payment_customer_id,
        paymentSubscriptionId: row.payment_subscription_id,
        plan: row.plan,
        status: row.status,
        subscriptionExpiresAt: row.subscription_expires_at,
        currentPeriodStart: row.current_period_start,
        currentPeriodEnd: row.current_period_end,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

// Developer emails with bypass permissions
export const DEV_EMAILS = ['nicholas.bennett247@gmail.com', 'bennett.b.walter@gmail.com'];

// Check if email is a developer/admin
export function isDeveloper(email?: string | null): boolean {
    if (!email) return false;
    return DEV_EMAILS.includes(email.toLowerCase());
}

// Get location limit based on plan type
// basic (£29) = 1 location, pro (£99) = 3 locations, developer = unlimited
export function getLocationLimit(planType: string, email?: string | null): number {
    // Developer bypass - unlimited locations
    if (isDeveloper(email)) return 99;

    // Plan-based limits
    if (planType === 'pro' || planType === 'enterprise') return 3;
    return 1; // basic plan
}

// Get plan type display name
export function getPlanDisplayName(planType: string): string {
    switch (planType) {
        case 'pro':
        case 'enterprise':
            return 'Pro (£99/year)';
        case 'basic':
        case 'professional':
            return 'Basic (£29/month)';
        default:
            return 'Basic';
    }
}

