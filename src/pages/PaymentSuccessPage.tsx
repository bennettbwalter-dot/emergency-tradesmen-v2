import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, ShieldCheck } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import confetti from "canvas-confetti";
import { useAuth } from "@/contexts/AuthContext";
import { sendEmail } from "@/lib/email";
import { useLocalization } from "@/contexts/LocalizationContext";

export default function PaymentSuccessPage() {
    const { user } = useAuth();
    const { settings } = useLocalization();
    const navigate = useNavigate();
    const hasSentRef = useRef(false);
    const [countdown, setCountdown] = useState(4);

    useEffect(() => {
        // Countdown timer
        const timer = setInterval(() => {
            setCountdown((prev) => prev - 1);
        }, 1000);

        // Redirect after countdown
        const redirectTimeout = setTimeout(() => {
            navigate('/premium-profile');
        }, 4000);

        return () => {
            clearInterval(timer);
            clearTimeout(redirectTimeout);
        };
    }, [navigate]);

    useEffect(() => {
        // Fire confetti on load
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
        const random = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval = window.setInterval(() => {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) return clearInterval(interval);
            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: random(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: random(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);

        // Send Email Notification (once per session)
        const sessionKey = `payment_email_sent_${new Date().toISOString().split('T')[0]}`;
        if (!hasSentRef.current && !sessionStorage.getItem(sessionKey)) {
            hasSentRef.current = true;
            sessionStorage.setItem(sessionKey, 'true');

            // 1. Alert Admin
            sendEmail({
                to: "emergencytradesmen@outlook.com",
                subject: "💰 New PRO Subscription Purchased!",
                text: `Likely new PRO subscription from ${user?.email || 'Unknown User'}.\n\nPlease check Stripe Dashboard to confirm payment.`
            });

            // 2. Receipt to User
            if (user?.email) {
                sendEmail({
                    to: user.email,
                    subject: "Welcome to Premium - Emergency Tradesmen",
                    text: `Hi ${user.name},\n\nThank you for upgrading to Pro! Your payment was successful.\n\nYou now have access to:\n- Priority Ranking\n- Featured Badge\n- Lead Notifications\n\nGo to your dashboard to set up your profile: https://emergencytradesmen.net/user/dashboard`
                });

                // 3. Track Conversion in PostHog
                (window as any).posthog?.capture('Plan Purchased', {
                    region: settings.countryCode === 'GB' ? 'UK' : 'US',
                    trade_category: (user as any)?.trade || 'unknown',
                    plan_tier: 'pro'
                });
            }
        }

        return () => clearInterval(interval);
    }, [user]);

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Header />

            <main className="flex-grow flex items-center justify-center p-4">
                <div className="bg-white p-8 md:p-12 rounded-xl shadow-xl max-w-2xl w-full text-center border border-slate-100 relative overflow-hidden">
                    {/* Top Decor Line */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-[#D4AF37]" />

                    {/* Success Icon */}
                    <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-sm ring-4 ring-green-50/50">
                        <CheckCircle className="w-12 h-12 text-[#D4AF37]" />
                    </div>

                    <h1 className="text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">
                        Payment Successful!
                    </h1>
                    <h2 className="text-2xl font-bold text-[#D4AF37] mb-4">
                        You're a Verified Pro!
                    </h2>

                    <p className="text-slate-600 mb-8 max-w-lg mx-auto">
                        Thank you for your payment. Your 'Emergency Tradesmen' subscription is confirmed.
                        <br />
                        <span className="font-semibold text-foreground block mt-2">
                            Redirecting to Profile Setup in {countdown}...
                        </span>
                    </p>

                    {/* Subscription Details Bar */}
                    <div className="bg-black text-white rounded-lg overflow-hidden mb-10 shadow-md">
                        <div className="py-2 px-4 bg-slate-900 text-xs font-bold tracking-widest uppercase border-b border-slate-800">
                            Subscription Details
                        </div>
                        <div className="py-3 px-4 text-sm font-medium bg-black">
                            Plan: <span className="text-[#D4AF37]">Verified Pro Monthly</span> • Status: <span className="text-green-400">Active</span>
                        </div>
                    </div>

                    {/* Primary Dashboard Action */}
                    <Link to="/premium-profile">
                        <Button className="w-full py-6 text-lg font-bold bg-[#D4AF37] hover:bg-[#b5932a] text-white shadow-lg shadow-[#D4AF37]/20 transition-all hover:scale-[1.01]">
                            Setup Your Profile Now
                        </Button>
                    </Link>

                    <div className="mt-4">
                        <Link to="/user/dashboard" className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4">
                            Go to Dashboard instead
                        </Link>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
