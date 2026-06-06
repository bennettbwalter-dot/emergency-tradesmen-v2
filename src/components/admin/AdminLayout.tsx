import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import {
    LayoutDashboard,
    Building2,
    Star,
    Users,
    Image,
    FileText,
    LogOut,
    Menu,
    X,
    Calendar,
    Settings,
    Download,
    Edit3,
    BarChart3,
    Mail,
    ShieldCheck,
    Globe,
    MessageSquareText
} from "lucide-react";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminLayout() {
    const { user, signOut, isLoading } = useAuth();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // Wait for Supabase session to restore so queries run authenticated
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-gold" />
            </div>
        );
    }

    // UI gating only. Sensitive admin mutations must still be enforced by RLS/RPCs.
    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
    const isAdmin = Boolean(user?.email && adminEmail && user.email.toLowerCase() === adminEmail.toLowerCase());
    const isLocalDevAdmin = import.meta.env.DEV && !user;

    if (isLocalDevAdmin) {
        // fall through to render admin UI
    } else if (!user) {
        return <Navigate to={`/login?redirect=${location.pathname}`} replace />;
    } else if (!isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <h1 className="text-3xl font-display text-foreground mb-4">Access Denied</h1>
                    <p className="text-muted-foreground mb-6">You don't have permission to access the admin panel.</p>
                    <Link to="/">
                        <Button>Go to Homepage</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const navItems = [
        { path: "/admin", icon: LayoutDashboard, label: "Dashboard" },
        { path: "/admin/businesses", icon: Building2, label: "Businesses" },
        { path: "/admin/profile-editor", icon: Edit3, label: "Profile Editor" },
        { path: "/admin/availability", icon: Calendar, label: "Availability" },
        { path: "/admin/subscriptions", icon: FileText, label: "Subscriptions" },
        { path: "/admin/quotes", icon: MessageSquareText, label: "Lead Inbox" },
        { path: "/admin/reviews", icon: Star, label: "Reviews" },
        { path: "/admin/photos", icon: Image, label: "Photos" },
        { path: "/admin/analytics", icon: BarChart3, label: "Analytics" },
        { path: "/admin/email-outreach", icon: Mail, label: "Email Campaigns" },
        { path: "/admin/evidence", icon: ShieldCheck, label: "Evidence" },
        { path: "/admin/export", icon: Download, label: "Data Export" },
        { path: "/landing", icon: Globe, label: "Landing Page" },
    ];

    const handleSignOut = async () => {
        await signOut();
    };

    return (
        <div className="min-h-screen bg-background flex">
            {/* Sidebar */}
            <aside
                className={`${sidebarOpen ? "w-64" : "w-20"
                    } bg-card border-r border-border transition-all duration-300 flex flex-col`}
            >
                {/* Logo/Header */}
                <div className="p-6 border-b border-border flex items-center justify-between">
                    {sidebarOpen && (
                        <div className="flex items-center gap-2">
                            <img src="/et-logo-v3.webp" alt="ET Logo" loading="lazy" decoding="async" className="w-8 h-8 rounded-full border border-gold/50 object-cover" />
                            <h1 className="font-display text-xl text-gold">Admin</h1>
                        </div>
                    )}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 hover:bg-secondary rounded-lg transition-colors"
                    >
                        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                    ? "bg-gold/10 text-gold"
                                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                    }`}
                            >
                                <Icon className="w-5 h-5 flex-shrink-0" />
                                {sidebarOpen && <span>{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Info & Sign Out */}
                <div className="p-4 border-t border-border">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                            <span className="text-gold font-semibold">
                                {user?.email?.[0].toUpperCase() ?? 'A'}
                            </span>
                        </div>
                        {sidebarOpen && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{user?.email ?? 'Local Dev'}</p>
                                <p className="text-xs text-muted-foreground">Admin</p>
                            </div>
                        )}
                    </div>
                    <Button
                        variant="outline"
                        size={sidebarOpen ? "default" : "icon"}
                        onClick={handleSignOut}
                        className="w-full"
                    >
                        <LogOut className="w-4 h-4" />
                        {sidebarOpen && <span className="ml-2">Sign Out</span>}
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <div className="p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
