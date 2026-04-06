import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { AuthModal } from "@/components/AuthModal";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { useFeatureFlagEnabled } from "posthog-js/react";
import { SEO } from "@/components/SEO";

export default function AuthPage({ defaultTab = "login" }: { defaultTab?: "login" | "register" }) {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const redirect = searchParams.get("redirect") || "/user/dashboard";

    // Check if the user is in the "new-us-signup-flow" test group
    const isNewSignupFlowEnabled = useFeatureFlagEnabled('new-us-signup-flow');

    useEffect(() => {
        if (isAuthenticated) {
            navigate(redirect);
        }
    }, [isAuthenticated, navigate, redirect]);

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <SEO title={defaultTab === "login" ? "Sign In" : "Create Account"} noIndex />
            <Header />
            <main className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    {/* Reuse AuthModal internal form logic if possible, 
                        BUT since AuthModal is a Dialog, we might want to just render it open 
                        OR refactor. For simplicity now, we can try to render it triggers manually
                        or just tell user to click.
                        
                        Actually, better UX is to extract the form from AuthModal.
                        For now, to save time/complexity, we'll wrap a "Sign In required" message 
                        that triggers the modal automatically or presents it nicely.
                    */}

                    <div className="flex justify-center mb-6">
                        <img src="/et-logo-new.webp" alt="Emergency Trades Logo" loading="lazy" className="w-16 h-16 rounded-full object-cover border-2 border-gold/50" />
                    </div>
                    <Card className="border-gold/20 shadow-lg">
                        <CardContent className="pt-6 text-center">
                            <h1 className="text-2xl font-display mb-2">
                                {isNewSignupFlowEnabled ? "Join Emergency Tradesmen US Preview" : (defaultTab === "login" ? "Welcome Back" : "Join Emergency Tradesmen")}
                            </h1>
                            <p className="text-muted-foreground mb-6">
                                {isNewSignupFlowEnabled ? "You have been selected to preview our new sign-up flow." : "Please sign in to access this page."}
                            </p>

                            <div className="flex justify-center">
                                {/* We render the AuthModal but we want it to be 'invoked' 
                                    Since AuthModal is a Dialog, we can trigger it or just use it.
                                    Let's use a trick: Render it "open"? No, that's messy.
                                    
                                    Ideally we refactor AuthModal to separate Form vs Dialog.
                                    However, looking at AuthModal usage, it has a trigger.
                                */}
                                <AuthModal
                                    defaultTab={defaultTab}
                                    trigger={
                                        <button className="bg-gold text-gold-foreground px-8 py-3 rounded-lg font-medium hover:bg-gold/90 transition-colors w-full">
                                            {defaultTab === "login" ? "Sign In Now" : "Create Account"}
                                        </button>
                                    }
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
            <Footer />
        </div>
    );
}
