import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { AuthForm } from "@/components/AuthForm";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { subscribePostHogFeatureFlag } from "@/lib/posthog";
import { SEO } from "@/components/SEO";
import { Gift } from "lucide-react";

export default function AuthPage({ defaultTab = "login" }: { defaultTab?: "login" | "register" }) {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const redirect = searchParams.get("redirect") || "/user/dashboard";
    const [mode, setMode] = useState<"login" | "register">(defaultTab);
    const showProWebsiteBonus = mode === "register" && redirect.includes("pricing");

    // Check if the user is in the "new-us-signup-flow" test group
    const [isNewSignupFlowEnabled, setIsNewSignupFlowEnabled] = useState(false);

    useEffect(() => {
        return subscribePostHogFeatureFlag(
            "new-us-signup-flow",
            setIsNewSignupFlowEnabled,
        );
    }, []);

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
                    <div className="flex justify-center mb-6">
                        <img src="/et-logo-v3.webp" alt="Emergency Trades Logo" loading="lazy" decoding="async" className="w-16 h-16 object-contain transition-transform hover:scale-110 duration-500" />
                    </div>
                    <Card className="overflow-hidden border-gold/20 bg-[#0f172a] text-white shadow-lg">
                        <div className="relative h-36 overflow-hidden">
                            <div className="absolute right-0 top-0 h-full w-3/5">
                                <img
                                    src="/tradesman-hero-v2.webp"
                                    alt=""
                                    loading="lazy"
                                    decoding="async"
                                    className="h-full w-full object-cover object-top"
                                />
                                <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a] via-[#0f172a]/60 to-transparent" />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent" />
                            </div>
                            <div className="relative z-10 flex h-full max-w-[70%] flex-col justify-center p-6">
                                <h1 className="font-display text-2xl leading-tight text-white">
                                    {isNewSignupFlowEnabled ? "Join Emergency Tradesmen US Preview" : (mode === "login" ? "Welcome Back" : "Join Emergency Tradesmen")}
                                </h1>
                                <p className="mt-2 text-sm text-gray-300">
                                    {isNewSignupFlowEnabled
                                        ? "You have been selected to preview our new sign-up flow."
                                        : mode === "register"
                                            ? "Create an account to continue."
                                            : "Please sign in to access this page."}
                                </p>
                            </div>
                        </div>
                        <CardContent className="p-6 pt-4">
                            <h1 className="text-2xl font-display mb-2">
                                {mode === "login" ? "Sign in" : "Create account"}
                            </h1>
                            {showProWebsiteBonus && (
                                <div className="mb-5 rounded-lg border border-emerald-400/30 bg-emerald-400/10 p-4 text-sm text-emerald-50">
                                    <div className="mb-2 flex items-center gap-2 font-bold text-emerald-200">
                                        <Gift className="h-4 w-4" />
                                        Free website bonus
                                    </div>
                                    <p className="text-gray-200">
                                        Sign up to Pro Yearly or Agency / Multi-Location and we'll build your emergency-ready website completely free, with no upfront website build fee.
                                    </p>
                                </div>
                            )}
                            <AuthForm
                                defaultTab={defaultTab}
                                mode={mode}
                                onModeChange={setMode}
                                hideHeader
                                onSuccess={() => navigate(redirect)}
                            />
                        </CardContent>
                    </Card>
                </div>
            </main>
            <Footer />
        </div>
    );
}
