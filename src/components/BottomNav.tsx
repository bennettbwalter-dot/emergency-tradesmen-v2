import { Link, useLocation } from "react-router-dom";
import { Home, BookText, LogIn, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocalization } from "@/contexts/LocalizationContext";

export function BottomNav() {
    const location = useLocation();
    const { isAuthenticated } = useAuth();
    const { settings } = useLocalization();
    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
    const port = typeof window !== 'undefined' ? window.location.port : '';
    const isUSDomain = hostname.includes('emergencycontractors.net') || (hostname === 'localhost' && port === '3001') || (hostname === '127.0.0.1' && port === '3001');
    const isActive = (path: string) => {
        if (path === "/" && location.pathname === "/") return true;
        if (path !== "/" && location.pathname.startsWith(path)) return true;
        // Special handling for dashboard tabs
        if (path.includes("tab=") && location.search.includes(path.split("?")[1])) return true;
        return false;
    };

    const countryPrefix = '';

    const navItems = [
        {
            label: "Home",
            icon: Home,
            path: "/",
        },
        {
            label: "Blog",
            icon: BookText,
            path: `${countryPrefix}/blog`,
        },
        {
            label: "Sign In",
            icon: LogIn,
            path: "/auth?tab=login",
        },
        {
            label: "Profile",
            icon: User,
            path: isAuthenticated ? "/user/dashboard?tab=profile" : "/auth?tab=login",
        },
    ];

    // If we are on desktop, don't render (or control via CSS)
    // We'll use CSS utility classes for visibility.

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-background border-t border-border/50 flex items-center justify-around z-50 pb-safe">
            {navItems.map((item) => (
                <Link
                    key={item.label}
                    to={item.path}
                    className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive(item.path) ? "text-gold" : "text-muted-foreground hover:text-foreground"
                        }`}
                >
                    <div className="relative">
                        <item.icon className={`w-5 h-5 ${isActive(item.path) ? "stroke-[2.5px]" : "stroke-2"}`} />
                    </div>
                    <span className="text-[10px] font-medium">{item.label}</span>
                </Link>
            ))}
        </div>
    );
}
