import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Cookie } from "lucide-react";
import { Link } from "react-router-dom";

declare function gtag(...args: unknown[]): void;

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

    // Google Consent Mode v2  -  keep GA/AdSense in sync with the user's choice.
    // The default 'denied' state is set in index.html before gtag loads.
    const updateGoogleConsent = (granted: boolean) => {
        const value = granted ? "granted" : "denied";
        if (typeof gtag !== "undefined") {
            gtag("consent", "update", {
                ad_storage: value,
                ad_user_data: value,
                ad_personalization: value,
                analytics_storage: value,
            });
        }
    };

    const acceptCookies = () => {
        localStorage.setItem("cookieConsent", "accepted");
        updateGoogleConsent(true);
        setShowBanner(false);
    };

    const declineCookies = () => {
        localStorage.setItem("cookieConsent", "declined");
        updateGoogleConsent(false);
        setShowBanner(false);
    };

    if (!showBanner) return null;

    return (
        <div className="fixed left-3 right-3 bottom-20 z-[70] p-0 md:left-auto md:right-6 md:top-20 md:bottom-auto md:w-[28rem] md:max-w-[calc(100vw-3rem)] animate-in slide-in-from-bottom">
            <div>
                <div className="bg-card border border-border rounded-lg shadow-2xl p-3 md:p-8 relative">
                    <button
                        onClick={declineCookies}
                        className="hidden absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-3 md:gap-6">
                        <div className="hidden md:block flex-shrink-0">
                            <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center">
                                <Cookie className="w-6 h-6 text-gold" />
                            </div>
                        </div>

                        <div className="flex-1 min-w-0">
                            <h3 className="font-display text-sm md:text-xl text-foreground md:mb-2">
                                We Value Your Privacy
                            </h3>
                            <p className="sr-only">
                                We use cookies to enhance your browsing experience, provide personalized content, and analyze our traffic.
                                By clicking "Accept All", you consent to our use of cookies. You can manage your preferences or learn more in our{" "}
                                <Link to="/privacy" className="text-gold hover:underline">
                                    Privacy Policy
                                </Link>
                                .
                            </p>
                        </div>

                        <div className="flex flex-row gap-2 md:gap-3 w-auto">
                            <Button
                                variant="outline"
                                onClick={declineCookies}
                                className="h-8 px-3 text-xs md:h-10 md:px-4 md:text-sm"
                            >
                                Decline
                            </Button>
                            <Button
                                onClick={acceptCookies}
                                className="h-8 px-3 text-xs md:h-10 md:px-4 md:text-sm bg-gold hover:bg-gold/90 text-black"
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
