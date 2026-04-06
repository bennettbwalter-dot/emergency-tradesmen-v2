import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { AlertCircle, CreditCard, Mail, RefreshCw } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { getSupportEmail } from "@/lib/siteConfig";

interface LockoutOverlayProps {
    onRetry: () => void;
}

export function LockoutOverlay({ onRetry }: LockoutOverlayProps) {
    const [isRedirecting, setIsRedirecting] = useState(false);
    const { toast } = useToast();
    const overlayRef = useRef<HTMLDivElement>(null);

    // Focus trap: focus the first interactive element on mount
    useEffect(() => {
        overlayRef.current?.focus();
    }, []);

    const handleUpdatePayment = async () => {
        setIsRedirecting(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("No session found");

            const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-portal-session`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error(data.error || "Failed to create portal session");
            }
        } catch (error: any) {
            console.error("Portal error:", error);
            toast({
                title: "Error",
                description: error.message || "Could not open billing portal. Please contact support.",
                variant: "destructive"
            });
            setIsRedirecting(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-[9999] bg-background/80 backdrop-blur-md flex items-center justify-center p-4 overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="lockout-title"
            aria-describedby="lockout-desc"
            ref={overlayRef}
            tabIndex={-1}
        >
            <Card className="w-full max-w-md border-destructive shadow-2xl animate-in fade-in zoom-in duration-300">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                        <AlertCircle className="w-10 h-10 text-destructive" />
                    </div>
                    <CardTitle className="text-2xl font-bold" id="lockout-title">Account Locked</CardTitle>
                    <CardDescription className="text-base mt-2" id="lockout-desc">
                        Your professional account has been locked due to multiple failed payment attempts.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                    <div className="bg-muted p-4 rounded-lg text-sm text-muted-foreground leading-relaxed">
                        <p>Access to your premium dashboard, priority ranking, and lead notifications is currently restricted.</p>
                        <p className="mt-2 font-medium text-foreground">
                            Please update your credit card details to restore full access.
                        </p>
                    </div>
                    
                    <Button 
                        onClick={handleUpdatePayment} 
                        className="w-full bg-gold hover:bg-gold/90 text-gold-foreground h-12 text-lg font-bold shadow-lg"
                        disabled={isRedirecting}
                    >
                        {isRedirecting ? (
                            <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                        ) : (
                            <CreditCard className="w-5 h-5 mr-2" />
                        )}
                        Update Payment Method
                    </Button>
                </CardContent>
                <CardFooter className="flex flex-col gap-3 pt-2">
                    <Button variant="ghost" onClick={onRetry} className="w-full text-muted-foreground">
                        I've updated my payment—recheck status
                    </Button>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground pt-4 border-t w-full justify-center">
                        <Mail className="w-4 h-4" />
                        <span>Support: {getSupportEmail()}</span>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
