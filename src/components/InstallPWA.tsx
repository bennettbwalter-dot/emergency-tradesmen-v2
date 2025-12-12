import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function InstallPWA() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        // Check if iOS
        const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        setIsIOS(ios);

        // Check if already in standalone mode
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
        if (isStandalone) {
            return; // Already installed/running as app
        }

        // Check if recently dismissed
        const dismissed = localStorage.getItem('pwa-install-dismissed');
        if (dismissed && Date.now() - parseInt(dismissed) < 1000 * 60 * 60 * 24 * 7) {
            // Dismissed within last 7 days
            return;
        }

        if (ios) {
            // Show iOS instructions immediately if not standalone/dismissed
            setIsVisible(true);
        }

        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setIsVisible(true);
        };

        window.addEventListener("beforeinstallprompt", handler);

        return () => window.removeEventListener("beforeinstallprompt", handler);
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setDeferredPrompt(null);
            setIsVisible(false);
        }
    };

    const handleDismiss = () => {
        setIsVisible(false);
        localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    };

    if (!isVisible) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-[60] p-4 bg-background/95 backdrop-blur border-b border-border/50 shadow-md animate-fade-down">
            <div className="container max-w-md mx-auto flex items-center justify-between gap-4">
                <div className="flex-1">
                    <h3 className="font-semibold text-sm">Get the App</h3>
                    <p className="text-xs text-muted-foreground">
                        {isIOS
                            ? "Tap 'Share' and 'Add to Home Screen' for the best experience."
                            : "Install our app for offline access and faster booking."}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {!isIOS && (
                        <Button size="sm" onClick={handleInstallClick} className="bg-gold hover:bg-gold/90 text-gold-foreground h-8 text-xs">
                            <Download className="w-3 h-3 mr-1.5" />
                            Install
                        </Button>
                    )}
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleDismiss}>
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
