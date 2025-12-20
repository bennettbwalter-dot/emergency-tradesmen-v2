import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/admin/MetricCard";
import {
    Building2,
    Users,
    TrendingUp,
    DollarSign,
    UserPlus,
    Activity,
    BarChart3
} from "lucide-react";
import {
    getSubscriptionMetrics,
    getRevenueMetrics,
    getChurnMetrics,
    getRecentActivity,
    getSubscriptionTrends,
    type SubscriptionMetrics,
    type RevenueMetrics,
    type ChurnMetrics,
    type SubscriptionEvent,
    type SubscriptionTrend
} from "@/lib/analyticsService";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
    const [metrics, setMetrics] = useState<SubscriptionMetrics>({
        activeBasic: 0, activePro: 0, totalActive: 0, totalCancelled: 0,
        basicMRR: 0, proMRR: 0, totalMRR: 0, totalARR: 0,
        nonSubscribers: 0, conversionRate: 0
    });
    const [revenue, setRevenue] = useState<RevenueMetrics>({
        currentMonth: 0, lastMonth: 0, growth: 0, basicRevenue: 0, proRevenue: 0
    });
    const [churn, setChurn] = useState<ChurnMetrics>({
        monthlyChurnRate: 0, cancellationsThisMonth: 0, joinsThisMonth: 0, netChange: 0
    });
    const [activity, setActivity] = useState<SubscriptionEvent[]>([]);
    const [trends, setTrends] = useState<SubscriptionTrend[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAnalytics();
    }, []);

    async function loadAnalytics() {
        setLoading(true);
        try {
            const results = await Promise.allSettled([
                getSubscriptionMetrics(),
                getRevenueMetrics(),
                getChurnMetrics(),
                getRecentActivity(10),
                getSubscriptionTrends()
            ]);

            // Helper to get value or null
            const getResult = <T,>(result: PromiseSettledResult<T>) =>
                result.status === 'fulfilled' ? result.value : null;

            if (results[0].status === 'fulfilled' && results[0].value) setMetrics(results[0].value);
            if (results[1].status === 'fulfilled' && results[1].value) setRevenue(results[1].value);
            if (results[2].status === 'fulfilled' && results[2].value) setChurn(results[2].value);
            if (results[3].status === 'fulfilled' && results[3].value) setActivity(results[3].value);
            if (results[4].status === 'fulfilled' && results[4].value) setTrends(results[4].value);

        } catch (error) {
            console.error('Critical error loading analytics:', error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="animate-pulse space-y-6">
                <div className="h-8 bg-secondary rounded w-64"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-32 bg-secondary rounded"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground mt-2">
                    Real-time overview of your business and subscription metrics
                </p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Total Businesses"
                    value={metrics.totalActive + metrics.nonSubscribers}
                    icon={Building2}
                    iconColor="text-blue-600"
                />
                <MetricCard
                    title="£29 Subscribers"
                    value={metrics.activeBasic}
                    change={churn.joinsThisMonth}
                    changeLabel="this month"
                    icon={Users}
                    iconColor="text-gold"
                    trend="up"
                />
                <MetricCard
                    title="£99 Subscribers"
                    value={metrics.activePro}
                    change={churn.netChange}
                    changeLabel="net change"
                    icon={TrendingUp}
                    iconColor="text-emerald-600"
                    trend={churn.netChange >= 0 ? 'up' : 'down'}
                />
                <MetricCard
                    title="Total MRR"
                    value={`£${metrics.totalMRR.toFixed(0)}`}
                    change={revenue.growth}
                    changeLabel="% growth"
                    icon={DollarSign}
                    iconColor="text-purple-600"
                    trend={revenue.growth >= 0 ? 'up' : 'down'}
                />
            </div>

            {/* Secondary Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard
                    title="Total Active Subs"
                    value={metrics.totalActive}
                    icon={Activity}
                    iconColor="text-green-600"
                />
                <MetricCard
                    title="Non-Subscribers"
                    value={metrics.nonSubscribers}
                    change={metrics.conversionRate}
                    changeLabel="% conversion"
                    icon={UserPlus}
                    iconColor="text-gray-600"
                    trend="neutral"
                />
                <MetricCard
                    title="Annual Revenue"
                    value={`£${metrics.totalARR.toFixed(0)}`}
                    icon={BarChart3}
                    iconColor="text-gold"
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Subscriber Growth Chart */}
                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Subscriber Growth (Last 12 Months)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={trends}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="basic" stroke="#3b82f6" name="£29 Plan" />
                            <Line type="monotone" dataKey="pro" stroke="#10b981" name="£99 Plan" />
                            <Line type="monotone" dataKey="total" stroke="#d4af37" name="Total" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </Card>

                {/* Revenue Breakdown */}
                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Revenue Breakdown</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={[
                            { name: '£29 Plan', revenue: metrics.basicMRR },
                            { name: '£99 Plan', revenue: metrics.proMRR }
                        ]}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip formatter={(value) => `£${Number(value).toFixed(0)}`} />
                            <Bar dataKey="revenue" fill="#d4af37" />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            </div>

            {/* Recent Activity */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Subscription Activity</h3>
                <div className="space-y-3">
                    {activity.length === 0 ? (
                        <p className="text-muted-foreground text-sm">No recent activity</p>
                    ) : (
                        activity.map((event) => (
                            <div key={event.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${event.event_type === 'created' ? 'bg-green-500' :
                                        event.event_type === 'cancelled' ? 'bg-red-500' :
                                            event.event_type === 'upgraded' ? 'bg-blue-500' :
                                                'bg-gray-500'
                                        }`} />
                                    <div>
                                        <p className="text-sm font-medium">
                                            {event.event_type === 'created' ? 'New Subscription' :
                                                event.event_type === 'cancelled' ? 'Cancelled' :
                                                    event.event_type === 'upgraded' ? 'Upgraded' :
                                                        event.event_type === 'downgraded' ? 'Downgraded' :
                                                            event.event_type}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {event.plan === 'basic' ? '£29 Plan' : '£99 Plan'} •
                                            {new Date(event.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <span className="text-sm font-semibold">£{event.price}</span>
                            </div>
                        ))
                    )}
                </div>
            </Card>
        </div>
    );
}
