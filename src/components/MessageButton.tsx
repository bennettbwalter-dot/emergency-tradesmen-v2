import { useNavigate } from "react-router-dom";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/AuthModal";
import { startConversation } from "@/lib/chat";
import { Business } from "@/lib/businesses";

interface MessageButtonProps {
    business: Business;
    className?: string;
    variant?: "default" | "outline" | "ghost" | "hero" | "secondary";
    size?: "default" | "sm" | "lg" | "icon";
    children?: React.ReactNode;
}

export function MessageButton({
    business,
    className,
    variant = "default",
    size = "default",
    children
}: MessageButtonProps) {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const handleMessage = () => {
        if (user) {
            startConversation(business, user.id);
            navigate("/user/dashboard?tab=messages");
        }
    };

    if (!isAuthenticated) {
        return (
            <AuthModal
                trigger={
                    <Button variant={variant} size={size} className={className}>
                        {children || (
                            <>
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Message
                            </>
                        )}
                    </Button>
                }
                defaultTab="login"
            />
        );
    }

    return (
        <Button
            variant={variant}
            size={size}
            className={className}
            onClick={handleMessage}
        >
            {children || (
                <>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Message
                </>
            )}
        </Button>
    );
}
