import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function FloatingBackButton() {
    const location = useLocation();
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Show button if not on home page
        setIsVisible(location.pathname !== "/");
    }, [location.pathname]);

    if (!isVisible) return null;

    return (
        <Button
            variant="secondary"
            size="icon"
            className={cn(
                "fixed bottom-6 left-6 z-40 h-12 w-12 rounded-full shadow-lg border border-border/50",
                "bg-background/80 backdrop-blur-md hover:bg-gold/10 hover:border-gold hover:text-gold transition-all duration-300",
                "animate-in fade-in zoom-in duration-300"
            )}
            onClick={() => navigate(-1)}
            aria-label="Go back"
        >
            <ArrowLeft className="h-6 w-6" />
        </Button>
    );
}
