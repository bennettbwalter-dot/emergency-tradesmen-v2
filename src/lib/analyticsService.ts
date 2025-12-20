import { supabase } from './supabase';

export interface SubscriptionMetrics {
    activeBasic: number;
    activePro: number;
    totalActive: number;
    totalCancelled: number;
    basicMRR: number;
    proMRR: number;
    totalMRR: number;
    totalARR: number;
    nonSubscribers: number;
    conversionRate: number;
}

export interface RevenueMetrics {
    currentMonth: number;
    lastMonth: number;
    growth: number;
    basicRevenue: number;
    proRevenue: number;
}

export interface ChurnMetrics {
    monthlyChurnRate: number;
    cancellationsThisMonth: number;
    joinsThisMonth: number;
    netChange: number;
}

export interface SubscriptionEvent {
    id: string;
    event_type: string;
    plan: string;
    price: number;
    created_at: string;
    user_id: string;
    subscription_id: string;
}

export interface SubscriptionTrend {
    month: string;
    basic: number;
    pro: number;
    total: number;
}

/**
 * Get current subscription metrics
 */
export async function getSubscriptionMetrics(): Promise<SubscriptionMetrics> {
    // Get active subscriptions by plan
    const { data: subscriptions, error } = await supabase
        .from('subscriptions')
        .select('plan, price, status');

    if (error) {
        console.error('Error fetching subscription metrics:', error);
        throw error;
    }

    const activeBasic = subscriptions?.filter(s => s.status === 'active' && s.plan === 'basic').length || 0;
    const activePro = subscriptions?.filter(s => s.status === 'active' && s.plan === 'pro').length || 0;
    const totalActive = activeBasic + activePro;
    const totalCancelled = subscriptions?.filter(s => s.status === 'cancelled').length || 0;

    // Calculate MRR (Monthly Recurring Revenue)
    const basicMRR = activeBasic * 29;
    const proMRR = activePro * (99 / 12); // Convert yearly to monthly
    const totalMRR = basicMRR + proMRR;
    const totalARR = (basicMRR * 12) + (activePro * 99);

    // Get total businesses to calculate non-subscribers
    const { count: totalBusinesses } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true });

    const nonSubscribers = (totalBusinesses || 0) - totalActive;
    const conversionRate = totalBusinesses ? (totalActive / totalBusinesses) * 100 : 0;

    return {
        activeBasic,
        activePro,
        totalActive,
        totalCancelled,
        basicMRR,
        proMRR,
        totalMRR,
        totalARR,
        nonSubscribers,
        conversionRate
    };
}

/**
 * Get revenue metrics with growth
 */
export async function getRevenueMetrics(): Promise<RevenueMetrics> {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Current month revenue (from active subscriptions)
    const { data: currentSubs } = await supabase
        .from('subscriptions')
        .select('plan, price')
        .eq('status', 'active')
        .gte('created_at', currentMonthStart.toISOString());

    const currentMonth = currentSubs?.reduce((sum, s) => sum + (s.price || 0), 0) || 0;

    // Last month revenue
    const { data: lastSubs } = await supabase
        .from('subscriptions')
        .select('plan, price')
        .eq('status', 'active')
        .gte('created_at', lastMonthStart.toISOString())
        .lte('created_at', lastMonthEnd.toISOString());

    const lastMonth = lastSubs?.reduce((sum, s) => sum + (s.price || 0), 0) || 0;

    const growth = lastMonth > 0 ? ((currentMonth - lastMonth) / lastMonth) * 100 : 0;

    const basicRevenue = currentSubs?.filter(s => s.plan === 'basic').reduce((sum, s) => sum + (s.price || 0), 0) || 0;
    const proRevenue = currentSubs?.filter(s => s.plan === 'pro').reduce((sum, s) => sum + (s.price || 0), 0) || 0;

    return {
        currentMonth,
        lastMonth,
        growth,
        basicRevenue,
        proRevenue
    };
}

/**
 * Get churn metrics
 */
export async function getChurnMetrics(): Promise<ChurnMetrics> {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get events this month
    const { data: events } = await supabase
        .from('subscription_events')
        .select('event_type')
        .gte('created_at', monthStart.toISOString());

    const cancellationsThisMonth = events?.filter(e => e.event_type === 'cancelled').length || 0;
    const joinsThisMonth = events?.filter(e => e.event_type === 'created').length || 0;
    const netChange = joinsThisMonth - cancellationsThisMonth;

    // Get total active at start of month for churn rate calculation
    const { count: activeAtStart } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
        .lt('created_at', monthStart.toISOString());

    const monthlyChurnRate = activeAtStart ? (cancellationsThisMonth / activeAtStart) * 100 : 0;

    return {
        monthlyChurnRate,
        cancellationsThisMonth,
        joinsThisMonth,
        netChange
    };
}

/**
 * Get recent subscription activity
 */
export async function getRecentActivity(limit: number = 20): Promise<SubscriptionEvent[]> {
    const { data, error } = await supabase
        .from('subscription_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching recent activity:', error);
        throw error;
    }

    return data || [];
}

/**
 * Get subscription trends over time (last 12 months)
 */
export async function getSubscriptionTrends(): Promise<SubscriptionTrend[]> {
    const trends: SubscriptionTrend[] = [];
    const now = new Date();

    for (let i = 11; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        const monthName = monthDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

        // Count active subscriptions at end of month
        const { data: subs } = await supabase
            .from('subscriptions')
            .select('plan')
            .eq('status', 'active')
            .lte('created_at', monthEnd.toISOString());

        const basic = subs?.filter(s => s.plan === 'basic').length || 0;
        const pro = subs?.filter(s => s.plan === 'pro').length || 0;

        trends.push({
            month: monthName,
            basic,
            pro,
            total: basic + pro
        });
    }

    return trends;
}
