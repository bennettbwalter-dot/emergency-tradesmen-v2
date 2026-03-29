import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Cookie } from "lucide-react";
import { Link } from "react-router-dom";

export function CookieConsent() {
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        // Check if user has already accepted cookies
        const consent = localStorage.getItem("cookieConsent");
        if (!consent) {
            // Show banner after a short delay
            setTimeout(() => setShowBanner(true), 1000);
        }
    }, []);

    const acceptCookies = () => {
        localStorage.setItem("cookieConsent", "accepted");
        setShowBanner(false);
    };

    const declineCookies = () => {
        localStorage.setItem("cookieConsent", "declined");
        setShowBanner(false);
    };

    if (!showBanner) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 animate-in slide-in-from-bottom">
            <div className="container-wide">
                <div className="bg-card border border-border rounded-lg shadow-2xl p-6 md:p-8 relative">
                    <button
                        onClick={declineCookies}
                        className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                        <div className="flex-shrink-0">
                            <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center">
                                <Cookie className="w-6 h-6 text-gold" />
                            </div>
                        </div>

                        <div className="flex-1">
                            <h3 className="font-display text-lg md:text-xl text-foreground mb-2">
                                We Value Your Privacy
                            </h3>
                            <p className="text-sm text-muted-foreground mb-4 md:mb-0">
                                We use cookies to enhance your browsing experience, provide personalized content, and analyze our traffic.
                                By clicking "Accept All", you consent to our use of cookies. You can manage your preferences or learn more in our{" "}
                                <Link to="/privacy" className="text-gold hover:underline">
                                    Privacy Policy
                                </Link>
                                .
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                            <Button
                                variant="outline"
                                onClick={declineCookies}
                                className="w-full sm:w-auto"
                            >
                                Decline
                            </Button>
                            <Button
                                onClick={acceptCookies}
                                className="w-full sm:w-auto bg-gold hover:bg-gold/90 text-black"
                            >
                                Accept All
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
