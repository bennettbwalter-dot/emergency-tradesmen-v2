import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog";
import { AuthForm } from "@/components/AuthForm";

interface AuthModalProps {
    defaultTab?: "login" | "register";
    trigger?: React.ReactNode;
    onSuccess?: () => void;
}

export function AuthModal({ defaultTab = "login", trigger, onSuccess }: AuthModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [mode, setMode] = useState<"login" | "register">(defaultTab);

    // Reset mode when opening
    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (open) {
            setMode(defaultTab);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {trigger || <Button variant="ghost">Sign In</Button>}
            </DialogTrigger>
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
                        <h2 className="text-xl font-display font-bold mb-2 text-white leading-tight">
                            {mode === "login" ? "Welcome Back" : "Join Emergency Tradesmen"}
                        </h2>
                        <p className="text-sm text-gray-300">
                            {mode === "login" ? (
                                "Enter your credentials to access your account"
                            ) : (
                                <>Create a <span className="text-gold font-bold">FREE</span> account to continue browsing and connect with trusted professionals.</>
                            )}
                        </p>
                    </div>
                </div>

                <div className="p-6 pt-2 bg-[#0f172a] dark z-10 relative">
                    <AuthForm
                        defaultTab={defaultTab}
                        mode={mode}
                        onModeChange={setMode}
                        onSuccess={() => {
                            setIsOpen(false);
                            onSuccess?.();
                        }}
                        hideHeader={true}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
