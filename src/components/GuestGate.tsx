
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AuthForm } from "@/components/AuthForm";

export function GuestGate() {
    const { isAuthenticated, isLoading } = useAuth();
    const [showModal, setShowModal] = useState(false);
    const [hasTriggered, setHasTriggered] = useState(false);

    // Check if previously skipped
    const hasSkipped = typeof window !== 'undefined' && sessionStorage.getItem("guest-gate-skipped") === "true";

    const [mode, setMode] = useState<"login" | "register">("register");

    // Reset mode to register when opening
    useEffect(() => {
        if (showModal) {
            setMode("register");
        }
    }, [showModal]);

    // Timer Logic
    useEffect(() => {
        if (isLoading || isAuthenticated || hasTriggered || hasSkipped) return;

        const timer = setTimeout(() => {
            setShowModal(true);
            setHasTriggered(true);
        }, 30000); // 30 seconds

        return () => clearTimeout(timer);
    }, [isLoading, isAuthenticated, hasTriggered, hasSkipped]);

    // Click Interception
    useEffect(() => {
        if (isLoading || isAuthenticated || hasSkipped) return;

        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            // Check if clicking a button or link (or their children)
            const clickable = target.closest("button, a");

            // Allow clicking inside the AuthModal itself to avoid trapping the user
            if (target.closest('[role="dialog"]')) return;

            if (clickable) {
                // We track interaction but don't blocking the first click unless we want strict gating.
                // User requested "pop-up where you don't need to sign up".
                // Let's rely on the timer predominantly, OR trigger on the first meaningful interaction but allow close.
                // Triggering on click can be annoying if it interrupts navigation.
                // Let's keep the logic: Trigger, blocking the default action ONLY ONCE.

                if (!hasTriggered) {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowModal(true);
                    setHasTriggered(true);
                }
            }
        };

        // Capture phase to intercept before others
        document.addEventListener("click", handleClick, true);

        return () => {
            document.removeEventListener("click", handleClick, true);
        };
    }, [isLoading, isAuthenticated, hasTriggered, hasSkipped]);

    const handleClose = () => {
        setShowModal(false);
        // Mark as skipped for this session
        sessionStorage.setItem("guest-gate-skipped", "true");
    };

    const handleSuccess = () => {
        setShowModal(false);
    };

    if (isAuthenticated || hasSkipped) return null;

    return (
        <Dialog open={showModal} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-[#0f172a] border-gold/20 text-white gap-0">
                <div className="relative w-full h-[180px] bg-[#0f172a]">
                    {/* Background/Tradesmen Image area */}
                    <div className="absolute right-0 top-0 bottom-0 w-[60%] z-0">
                        <img
                            src="/tradesman-hero-v2.jpg"
                            alt="Tradesmen"
                            className="w-full h-full object-cover object-top mask-image-linear-to-l"
                        />
                        {/* Gradient fade to blend with solid color on left */}
                        <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a] via-[#0f172a]/40 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent" />
                    </div>

                    {/* Text Content */}
                    <div className="relative z-10 p-6 flex flex-col justify-center h-full max-w-[65%]">
                        <DialogTitle className="text-xl font-display font-bold mb-2 text-white leading-tight">
                            {mode === "login" ? "Welcome Back" : "Join Emergency Tradesmen"}
                        </DialogTitle>
                        <DialogDescription className="text-sm text-gray-300">
                            {mode === "login" ? (
                                "Enter your credentials to access your account"
                            ) : (
                                <>Create a <span className="text-gold font-bold">FREE</span> account to continue browsing and connect with trusted professionals.</>
                            )}
                        </DialogDescription>
                    </div>
                </div>

                <div className="p-6 pt-2 bg-[#0f172a] dark z-10 relative">
                    <AuthForm
                        defaultTab="register"
                        mode={mode}
                        onModeChange={setMode}
                        onSuccess={handleSuccess}
                        hideHeader={true}
                    />

                    <div className="mt-4 text-center">
                        <button
                            onClick={handleClose}
                            className="text-xs text-gray-400 hover:text-white underline decoration-dotted underline-offset-4 transition-colors"
                        >
                            Skip for now & continue as guest
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
