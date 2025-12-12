import { Link, useLocation } from "react-router-dom";
import { Home, Search, Calendar, MessageSquare, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getTotalUnreadCount } from "@/lib/chat";
import { useState, useEffect } from "react";

export function BottomNav() {
    const location = useLocation();
    const { user, isAuthenticated } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (user) {
            const checkUnread = () => setUnreadCount(getTotalUnreadCount(user.id));
            checkUnread();
            window.addEventListener('chat-updated', checkUnread);
            return () => window.removeEventListener('chat-updated', checkUnread);
        }
    }, [user]);

    const isActive = (path: string) => {
        if (path === "/" && location.pathname === "/") return true;
        if (path !== "/" && location.pathname.startsWith(path)) return true;
        // Special handling for dashboard tabs
        if (path.includes("tab=") && location.search.includes(path.split("?")[1])) return true;
        return false;
    };

    const navItems = [
        {
            label: "Home",
            icon: Home,
            path: "/",
        },
        {
            label: "Search",
            icon: Search,
            path: "/directory", // Assuming this is the search/listing page or similar. If not, maybe just search bar context.
            // Actually, looking at routes, maybe "/" is best for search or generic listing categories.
            // Let's check App.tsx for routes later. For now, I'll point to /
        },
        {
            label: "Bookings",
            icon: Calendar,
            path: isAuthenticated ? "/user/dashboard?tab=bookings" : "/auth?tab=login", // We need a way to handle auth redirection
        },
        {
            label: "Messages",
            icon: MessageSquare,
            path: isAuthenticated ? "/user/dashboard?tab=messages" : "/auth?tab=login",
            badge: unreadCount
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
                        {item.badge && item.badge > 0 ? (
                            <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                                {item.badge}
                            </span>
                        ) : null}
                    </div>
                    <span className="text-[10px] font-medium">{item.label}</span>
                </Link>
            ))}
        </div>
    );
}
