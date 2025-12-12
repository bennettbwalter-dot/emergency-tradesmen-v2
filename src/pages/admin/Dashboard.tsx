import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Building2, Star, Users, TrendingUp } from "lucide-react";

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalBusinesses: 0,
        verifiedBusinesses: 0,
        totalReviews: 0,
        avgRating: 0,
    });

    useEffect(() => {
        async function loadStats() {
            // Get business stats
            const { data: businesses } = await supabase
                .from('businesses')
                .select('id, verified, rating');

            // Get review count
            const { count: reviewCount } = await supabase
                .from('reviews')
                .select('*', { count: 'exact', head: true });

            if (businesses) {
                const verified = businesses.filter(b => b.verified).length;
                const avgRating = businesses.reduce((sum, b) => sum + (Number(b.rating) || 0), 0) / businesses.length;

                setStats({
                    totalBusinesses: businesses.length,
                    verifiedBusinesses: verified,
                    totalReviews: reviewCount || 0,
                    avgRating: Number(avgRating.toFixed(2)),
                });
            }
        }

        loadStats();
    }, []);

    const statCards = [
        {
            title: "Total Businesses",
            value: stats.totalBusinesses,
            icon: Building2,
            color: "text-blue-500",
        },
        {
            title: "Verified",
            value: stats.verifiedBusinesses,
            icon: Star,
            color: "text-gold",
        },
        {
            title: "Total Reviews",
            value: stats.totalReviews,
            icon: Users,
            color: "text-green-500",
        },
        {
            title: "Avg Rating",
            value: stats.avgRating.toFixed(1),
            icon: TrendingUp,
            color: "text-purple-500",
        },
    ];

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-display text-foreground mb-2">Dashboard</h1>
                <p className="text-muted-foreground">Welcome to the Emergency Tradesmen admin panel</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statCards.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={stat.title} className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-medium text-muted-foreground">{stat.title}</h3>
                                <Icon className={`w-5 h-5 ${stat.color}`} />
                            </div>
                            <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                        </Card>
                    );
                })}
            </div>

            {/* Quick Actions */}
            <Card className="p-6">
                <h2 className="text-xl font-display mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <a
                        href="/admin/businesses"
                        className="p-4 border border-border rounded-lg hover:border-gold/50 hover:bg-gold/5 transition-colors"
                    >
                        <Building2 className="w-6 h-6 text-gold mb-2" />
                        <h3 className="font-semibold mb-1">Manage Businesses</h3>
                        <p className="text-sm text-muted-foreground">Add, edit, or remove business listings</p>
                    </a>

                    <a
                        href="/admin/reviews"
                        className="p-4 border border-border rounded-lg hover:border-gold/50 hover:bg-gold/5 transition-colors"
                    >
                        <Star className="w-6 h-6 text-gold mb-2" />
                        <h3 className="font-semibold mb-1">Review Management</h3>
                        <p className="text-sm text-muted-foreground">Moderate and respond to reviews</p>
                    </a>

                    <a
                        href="/admin/photos"
                        className="p-4 border border-border rounded-lg hover:border-gold/50 hover:bg-gold/5 transition-colors"
                    >
                        <TrendingUp className="w-6 h-6 text-gold mb-2" />
                        <h3 className="font-semibold mb-1">Upload Photos</h3>
                        <p className="text-sm text-muted-foreground">Manage business photos and galleries</p>
                    </a>
                </div>
            </Card>
        </div>
    );
}
