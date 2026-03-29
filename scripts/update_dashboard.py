import os

file_path = os.path.join('..', 'src', 'pages', 'admin', 'Dashboard.tsx')

if not os.path.exists(file_path):
    print(f"Error: {file_path} not found")
    exit(1)

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update stats state
old_stats_state = """    const [stats, setStats] = useState({
        totalBusinesses: 0,
        verifiedBusinesses: 0,
        totalReviews: 0,
        avgRating: 0,
    });"""

new_stats_state = """    const [stats, setStats] = useState({
        totalBusinesses: 0,
        verifiedBusinesses: 0,
        totalReviews: 0,
        avgRating: 0,
        proMonthly: 0,
        proYearly: 0,
        totalQuotes: 0
    });"""

content = content.replace(old_stats_state, new_stats_state)

# 2. Update loadStats logic
old_load_stats = """            if (businesses) {
                const verified = businesses.filter(b => b.verified).length;
                const avgRating = businesses.reduce((sum, b) => sum + (Number(b.rating) || 0), 0) / businesses.length;

                setStats({
                    totalBusinesses: businesses.length,
                    verifiedBusinesses: verified,
                    totalReviews: reviewCount || 0,
                    avgRating: Number(avgRating.toFixed(2)),
                });
            }"""

new_load_stats = """            // Get subscription stats
            const { data: subs } = await supabase
                .from('subscriptions')
                .select('plan, status');
            
            // Get quotes count
            const { count: quoteCount } = await supabase
                .from('quotes')
                .select('*', { count: 'exact', head: true });

            if (businesses) {
                const verified = businesses.filter(b => b.verified).length;
                const avgRating = businesses.length > 0 
                    ? businesses.reduce((sum, b) => sum + (Number(b.rating) || 0), 0) / businesses.length
                    : 0;

                const activeSubs = subs?.filter(s => s.status === 'active') || [];
                const monthly = activeSubs.filter(s => s.plan === 'professional').length;
                const yearly = activeSubs.filter(s => s.plan === 'enterprise').length;

                setStats({
                    totalBusinesses: businesses.length,
                    verifiedBusinesses: verified,
                    totalReviews: reviewCount || 0,
                    avgRating: Number(avgRating.toFixed(2)),
                    proMonthly: monthly,
                    proYearly: yearly,
                    totalQuotes: quoteCount || 0
                });
            }"""

content = content.replace(old_load_stats, new_load_stats)

# 3. Update statCards
old_stat_cards = """    const statCards = [
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
    ];"""

new_stat_cards = """    const statCards = [
        {
            title: "Total Businesses",
            value: stats.totalBusinesses,
            icon: Building2,
            color: "text-blue-500",
        },
        {
            title: "Pro Monthly (£29)",
            value: stats.proMonthly,
            icon: Star,
            color: "text-gold",
        },
        {
            title: "Pro Yearly (£99)",
            value: stats.proYearly,
            icon: TrendingUp,
            color: "text-emerald-500",
        },
        {
            title: "Total Quotes",
            value: stats.totalQuotes,
            icon: Users,
            color: "text-purple-500",
        },
    ];"""

content = content.replace(old_stat_cards, new_stat_cards)

# 4. Update Quick Actions
old_quick_actions = """                    <a
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
                    </a>"""

new_quick_actions = """                    <a
                        href="/admin/businesses"
                        className="p-4 border border-border rounded-lg hover:border-gold/50 hover:bg-gold/5 transition-colors"
                    >
                        <Building2 className="w-6 h-6 text-gold mb-2" />
                        <h3 className="font-semibold mb-1">Manage Businesses</h3>
                        <p className="text-sm text-muted-foreground">Add, edit, or remove business listings</p>
                    </a>

                    <a
                        href="/admin/profile-editor"
                        className="p-4 border border-border rounded-lg hover:border-gold/50 hover:bg-gold/5 transition-colors"
                    >
                        <Star className="w-6 h-6 text-gold mb-2" />
                        <h3 className="font-semibold mb-1">Profile Editor</h3>
                        <p className="text-sm text-muted-foreground">Enhance and verify business profiles</p>
                    </a>

                    <a
                        href="/admin/availability"
                        className="p-4 border border-border rounded-lg hover:border-gold/50 hover:bg-gold/5 transition-colors"
                    >
                        <TrendingUp className="w-6 h-6 text-gold mb-2" />
                        <h3 className="font-semibold mb-1">Set Availability</h3>
                        <p className="text-sm text-muted-foreground">Manage real-time trade availability</p>
                    </a>"""

content = content.replace(old_quick_actions, new_quick_actions)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Successfully updated Dashboard.tsx")
