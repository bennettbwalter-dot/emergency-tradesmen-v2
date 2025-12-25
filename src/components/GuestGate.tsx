
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/AuthModal";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AuthForm } from "@/components/AuthForm";

export function GuestGate() {
    const { isAuthenticated, isLoading } = useAuth();
    const [showModal, setShowModal] = useState(false);
    const [isRestricted, setIsRestricted] = useState(false);
    const [hasTriggered, setHasTriggered] = useState(false);

    // Lock scroll when restricted
    useEffect(() => {
        if (isRestricted) {
            document.body.style.overflow = "hidden";
            document.body.style.height = "100vh";
            window.scrollTo(0, 0);
        } else {
            document.body.style.overflow = "";
            document.body.style.height = "";
        }

        return () => {
            document.body.style.overflow = "";
            document.body.style.height = "";
        };
    }, [isRestricted]);

    // Timer Logic
    useEffect(() => {
        if (isLoading || isAuthenticated || hasTriggered) return;

        const timer = setTimeout(() => {
            setShowModal(true);
            setHasTriggered(true);
        }, 30000); // 30 seconds

        return () => clearTimeout(timer);
    }, [isLoading, isAuthenticated, hasTriggered]);

    // Click Interception
    useEffect(() => {
        if (isLoading || isAuthenticated) return;

        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            // Check if clicking a button or link (or their children)
            const clickable = target.closest("button, a");

            // Allow clicking inside the AuthModal itself to avoid trapping the user
            if (target.closest('[role="dialog"]')) return;

            if (clickable) {
                e.preventDefault();
                e.stopPropagation();
                setShowModal(true);
                setHasTriggered(true);
            }
        };

        // Capture phase to intercept before others
        document.addEventListener("click", handleClick, true);

        return () => {
            document.removeEventListener("click", handleClick, true);
        };
    }, [isLoading, isAuthenticated]);

    const handleClose = () => {
        setShowModal(false);
        // If they close it without authenticating, restrict them
        if (!isAuthenticated) {
            setIsRestricted(true);
        }
    };

    const handleSuccess = () => {
        setShowModal(false);
        setIsRestricted(false);
    };

    if (isAuthenticated) return null;

    return (
        <>
            <Dialog open={showModal} onOpenChange={(open) => !open && handleClose()}>
                <DialogContent className="sm:max-w-md">
                    <div className="text-center mb-4">
                        <h2 className="text-xl font-bold mb-2">Join Emergency Tradesmen</h2>
                        <p className="text-sm text-muted-foreground">
                            Create an account to continue browsing and connect with trusted professionals.
                        </p>
                    </div>
                    <AuthForm
                        defaultTab="register"
                        onSuccess={handleSuccess}
                    />
                </DialogContent>
            </Dialog>

            {/* Visual indicator for restriction (Optional, maybe a blurry overlay below the fold) */}
            {isRestricted && (
                <div
                    className="fixed bottom-0 left-0 w-full h-24 bg-gradient-to-t from-background to-transparent pointer-events-none z-40"
                    style={{ top: '90vh' }}
                >
                    <div className="absolute inset-0 bg-background/80 mobile-restriction-overlay backdrop-blur-[1px]" />
                </div>
            )}
        </>
    );
}
