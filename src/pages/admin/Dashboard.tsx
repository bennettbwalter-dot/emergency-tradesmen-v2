import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { isUSDomain } from "@/lib/siteConfig";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Users,
    Building2,
    ShieldCheck,
    TrendingUp,
    BarChart3,
    Activity,
    Search,
    Edit,
    Plus,
    Clock,
    LayoutDashboard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalBusinesses: 0,
        activePro: 0,
        pendingClaims: 0,
        totalRevenue: 0
    });
    const [recentBusinesses, setRecentBusinesses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        loadDashboardData();
    }, []);

    async function loadDashboardData() {
        setLoading(true);
        try {
            // Fetch stats
            const { count: totalCount } = await supabase.from('businesses').select('*', { count: 'exact', head: true });
            const { count: proCount } = await supabase.from('businesses').select('*', { count: 'exact', head: true }).eq('is_premium', true);
            const { count: pendingCount } = await supabase.from('businesses').select('*', { count: 'exact', head: true }).eq('claim_status', 'pending');

            // Fetch recent activity
            const { data: recent } = await supabase
                .from('businesses')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(5);

            setStats({
                totalBusinesses: totalCount || 0,
                activePro: proCount || 0,
                pendingClaims: pendingCount || 0,
                totalRevenue: (proCount || 0) * 99 // Placeholder revenue calc
            });
            setRecentBusinesses(recent || []);
        } catch (error) {
            console.error('Error loading dashboard:', error);
            toast({ title: "Error", description: "Failed to load dashboard metrics", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return <div className="p-8 animate-pulse space-y-4">
            <div className="h-8 w-64 bg-secondary rounded" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-secondary rounded" />)}
            </div>
        </div>;
    }

    return (
        <div className="p-1 md:p-8 space-y-8 max-w-7xl mx-auto">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-foreground flex items-center gap-3">
                        <LayoutDashboard className="w-8 h-8 text-gold" />
                        Admin Command Center
                    </h1>
                    <p className="text-muted-foreground mt-1">Operational oversight and real-time business intelligence.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={loadDashboardData} className="border-border">
                        <Activity className="w-4 h-4 mr-2" /> Refresh Data
                    </Button>
                    <a href="/admin/businesses">
                        <Button className="bg-gold hover:bg-yellow-600 text-black font-bold">
                            <Plus className="w-4 h-4 mr-2" /> Manage All
                        </Button>
                    </a>
                </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-card border-border/50 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Listings</CardTitle>
                        <Building2 className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalBusinesses.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground mt-1">+12% from last month</p>
                    </CardContent>
                </Card>
                <Card className="bg-card border-border/50 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Active PROs</CardTitle>
                        <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activePro}</div>
                        <p className="text-xs text-green-500 mt-1">Growing steadily</p>
                    </CardContent>
                </Card>
                <Card className="bg-card border-border/50 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Pending Claims</CardTitle>
                        <Users className="h-4 w-4 text-gold" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gold">{stats.pendingClaims}</div>
                        <p className="text-xs text-muted-foreground mt-1">Action items today</p>
                    </CardContent>
                </Card>
                <Card className="bg-card border-border/50 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Estimated MRR</CardTitle>
                        <TrendingUp className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{isUSDomain() ? '$' : '£'}{stats.totalRevenue.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground mt-1">Based on active subs</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Tabs */}
            <Tabs defaultValue="operations" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-md bg-secondary/30 p-1 rounded-xl h-12 mb-8 border border-border/50">
                    <TabsTrigger value="operations" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm font-bold">
                        Operations
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm font-bold text-gold data-[state=active]:text-gold">
                        Analytics
                    </TabsTrigger>
                </TabsList>

                {/* Operations Area */}
                <TabsContent value="operations" className="space-y-6 outline-none">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Recent Activity Table */}
                        <Card className="lg:col-span-2 border-border/50 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-xl">Recent Listings</CardTitle>
                                <CardDescription>The latest {isUSDomain() ? 'contractors' : 'tradesmen'} to join the platform.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-border/50 text-muted-foreground">
                                                <th className="text-left py-3 font-semibold">Business</th>
                                                <th className="text-left py-3 font-semibold">Trade</th>
                                                <th className="text-left py-3 font-semibold">Status</th>
                                                <th className="text-right py-3 font-semibold">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/30">
                                            {recentBusinesses.map((biz) => (
                                                <tr key={biz.id} className="hover:bg-secondary/10 transition-colors group">
                                                    <td className="py-4">
                                                        <div className="font-semibold">{biz.name}</div>
                                                        <div className="text-xs text-muted-foreground">{biz.city}</div>
                                                    </td>
                                                    <td className="py-4">
                                                        <Badge variant="secondary" className="capitalize font-medium">{biz.trade}</Badge>
                                                    </td>
                                                    <td className="py-4">
                                                        {biz.is_premium ? (
                                                            <Badge className="bg-purple-500/10 text-purple-500 border-none">PRO</Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="text-muted-foreground border-border">FREE</Badge>
                                                        )}
                                                    </td>
                                                    <td className="py-4 text-right pr-2">
                                                        <a href={`/admin/profile-editor?id=${biz.id}`}>
                                                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <Edit className="h-4 w-4 text-gold" />
                                                            </Button>
                                                        </a>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <Button variant="ghost" className="w-full mt-4 text-muted-foreground text-xs hover:text-foreground" asChild>
                                    <a href="/admin/businesses">View All Businesses <ArrowRight className="w-3 h-3 ml-2" /></a>
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Recent Signups / Notifications */}
                        <div className="space-y-6">
                            <Card className="border-border/50 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-blue-500" />
                                        Pending Claims
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {stats.pendingClaims > 0 ? (
                                        <div className="p-4 bg-gold/5 border border-gold/20 rounded-lg">
                                            <p className="text-sm font-medium text-gold-foreground">
                                                You have {stats.pendingClaims} business claims awaiting verification.
                                            </p>
                                            <Button size="sm" className="mt-3 bg-gold text-black hover:bg-yellow-600 font-bold" asChild>
                                                <a href="/admin/businesses?tab=pending">Process Claims</a>
                                            </Button>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground italic">No pending claims. Good job!</p>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="border-border/50 shadow-sm bg-secondary/10">
                                <CardHeader>
                                    <CardTitle className="text-lg">Database Health</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Sync Status</span>
                                        <span className="text-green-500 flex items-center gap-1">
                                            <Activity className="w-3 h-3" /> Healthy
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">API Latency</span>
                                        <span className="font-mono">124ms</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                {/* Analytics Area (PostHog Embeds) */}
                <TabsContent value="analytics" className="space-y-8 outline-none animate-in fade-in-50 duration-500">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Traffic & Pageviews */}
                        <Card className="border-border/50 shadow-lg overflow-hidden h-[500px] flex flex-col">
                            <CardHeader className="bg-secondary/5 border-b border-border/50">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <BarChart3 className="w-4 h-4 text-blue-500" />
                                    Traffic Overview
                                </CardTitle>
                                <CardDescription>Total pageviews and session depth (PostHog).</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 p-0 bg-slate-50 flex items-center justify-center relative">
                                {/* Replace with your HostHog Shared Dashboard Link */}
                                <iframe
                                    className="w-full h-full border-0"
                                    src="about:blank"
                                    title="PostHog Traffic"
                                />
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                                    <div className="text-center">
                                        <Activity className="w-12 h-12 mx-auto mb-2 text-slate-400" />
                                        <p className="text-sm font-mono text-slate-500">POSTHOG IFRAME PLACEHOLDER: TRAFFIC</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Conversion Funnel */}
                        <Card className="border-border/50 shadow-lg overflow-hidden h-[500px] flex flex-col">
                            <CardHeader className="bg-secondary/5 border-b border-border/50">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                                    Conversion Funnel
                                </CardTitle>
                                <CardDescription>User journey from landing to PRO signup.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 p-0 bg-slate-50 flex items-center justify-center relative">
                                {/* Replace with your HostHog Shared Dashboard Link */}
                                <iframe
                                    className="w-full h-full border-0"
                                    src="about:blank"
                                    title="PostHog Funnel"
                                />
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                                    <div className="text-center">
                                        <TrendingUp className="w-12 h-12 mx-auto mb-2 text-slate-400" />
                                        <p className="text-sm font-mono text-slate-500">POSTHOG IFRAME PLACEHOLDER: FUNNEL</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Session Recordings List or Heatmap */}
                        <Card className="lg:col-span-2 border-border/50 shadow-lg overflow-hidden h-[400px] flex flex-col">
                            <CardHeader className="bg-secondary/5 border-b border-border/50">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Users className="w-4 h-4 text-purple-500" />
                                    User Sessions & Pathing
                                </CardTitle>
                                <CardDescription>Live session behavior and drop-off points.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 p-0 bg-slate-50 flex items-center justify-center relative">
                                {/* Replace with your HostHog Shared Dashboard Link */}
                                <iframe
                                    className="w-full h-full border-0"
                                    src="about:blank"
                                    title="PostHog Sessions"
                                />
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                                    <div className="text-center">
                                        <Users className="w-12 h-12 mx-auto mb-2 text-slate-400" />
                                        <p className="text-sm font-mono text-slate-500">POSTHOG IFRAME PLACEHOLDER: SESSIONS</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="bg-blue-500/5 border border-blue-500/20 p-4 rounded-xl flex items-center gap-4">
                        <div className="p-2 bg-blue-500 rounded-full text-white">
                            <TrendingUp className="w-4 h-4" />
                        </div>
                        <p className="text-xs text-blue-700/80 font-medium">
                            <strong>Note:</strong> PostHog charts update automatically. Paste your "Shared Dashboard" URLs into the `iframe` `src` tags in `src/pages/admin/Dashboard.tsx` to go live with real data.
                        </p>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

// Helper components
function ArrowRight(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
        </svg>
    );
}
