import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { User, LogOut, Heart, History, Settings, CalendarDays, MessageSquare } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/AuthModal";
import { getTotalUnreadCount } from "@/lib/chat";

export function UserMenu() {
    const { user, logout, isAuthenticated } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (user) {
            const checkUnread = () => setUnreadCount(getTotalUnreadCount(user.id));
            checkUnread();
            window.addEventListener('chat-updated', checkUnread);
            return () => window.removeEventListener('chat-updated', checkUnread);
        }
    }, [user]);

    if (!isAuthenticated || !user) {
        return (
            <div className="flex items-center gap-2">
                <AuthModal
                    trigger={
                        <Button variant="ghost" className="text-sm font-medium hover:text-gold transition-colors h-auto p-0 bg-transparent">
                            Log In
                        </Button>
                    }
                    defaultTab="login"
                />
                <AuthModal
                    trigger={
                        <Button variant="ghost" className="text-sm font-medium hover:text-gold transition-colors h-auto p-0 bg-transparent">
                            Sign Up
                        </Button>
                    }
                    defaultTab="register"
                />
            </div>
        );
    }

    const safeName = user.name || "Guest User";
    const initials = safeName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10 border border-border/50">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback className="bg-gold/10 text-gold font-medium">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                            {unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" asChild>
                    <a href="/user/dashboard?tab=profile">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                    </a>
                </DropdownMenuItem>

                <DropdownMenuItem className="cursor-pointer" asChild>
                    <a href="/user/dashboard?tab=messages" className="flex items-center justify-between w-full">
                        <span className="flex items-center">
                            <MessageSquare className="mr-2 h-4 w-4" />
                            <span>Messages</span>
                        </span>
                        {unreadCount > 0 && (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                                {unreadCount}
                            </span>
                        )}
                    </a>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" asChild>
                    <a href="/user/dashboard?tab=favorites">
                        <Heart className="mr-2 h-4 w-4" />
                        <span>Favorites</span>
                    </a>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" asChild>
                    <a href="/user/dashboard?tab=history">
                        <History className="mr-2 h-4 w-4" />
                        <span>Quote History</span>
                    </a>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" asChild>
                    <a href="/user/dashboard?tab=settings">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                    </a>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive" onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
