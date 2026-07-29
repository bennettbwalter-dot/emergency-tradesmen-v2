import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Crown, ShieldCheck } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import confetti from "canvas-confetti";
import { useAuth } from "@/contexts/AuthContext";
import { sendEmail } from "@/lib/email";
import { trackConversion } from "@/lib/analytics";
import { useLocalization } from "@/contexts/LocalizationContext";
import { SEO } from "@/components/SEO";
import { getUserSubscription, PLANS, type Subscription } from "@/lib/subscriptionService";
import { getSupportEmail, getSiteDomain, getSiteName } from "@/lib/siteConfig";
import { BusinessEnquiryForm } from "@/components/business/BusinessEnquiryForm";

export default function PaymentSuccessPage() {
    const { user, refreshUser } = useAuth();
    const { settings } = useLocalization();
    const navigate = useNavigate();
    const [countdown, setCountdown] = useState(5);
    const [verified, setVerified] = useState(false);
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [websiteIntent, setWebsiteIntent] = useState<string | null>(() => {
        if (typeof window === "undefined") return null;
        return sessionStorage.getItem("pro_website_build_intent");
    });
    const hasSentRef = useRef(false);
    const shouldShowWebsiteBrief = websiteIntent === "yes" || websiteIntent === "not-sure";

    useEffect(() => {
        // In dev/test mode webhooks don't reach localhost, so proceed quickly.
        // In production give the webhook up to 8s to write the subscription.
        const maxWait = import.meta.env.DEV ? 2000 : 8000;
        const pollInterval = 1000;

        // Hard fallback  -  always show success page after maxWait regardless of DB state
        const fallback = setTimeout(() => setVerified(true), maxWait);

        let stopped = false;
        const poll = setInterval(async () => {
            if (stopped) return;
            try {
                const s = await getUserSubscription();
                if (s && s.status === 'active' && s.plan !== 'free') {
                    setSubscription(s);
                    stopped = true;
                    clearInterval(poll);
                    clearTimeout(fallback);
                    setVerified(true);
                }
            } catch {
                // ignore  -  fallback timer will resolve
            }
        }, pollInterval);

        return () => {
            stopped = true;
            clearInterval(poll);
            clearTimeout(fallback);
        };
    }, []);

    useEffect(() => {
        if (!verified) return;

        // Refresh user session to pick up new subscription status immediately
        refreshUser();
        if (shouldShowWebsiteBrief) return;

        // Redirection timer
        const timer = setTimeout(() => {
            navigate('/premium-profile');
        }, 5000);

        // Visual Countdown
        const interval = setInterval(() => {
            setCountdown(prev => Math.max(0, prev - 1));
        }, 1000);

        return () => {
            clearTimeout(timer);
            clearInterval(interval);
        };
    }, [navigate, refreshUser, shouldShowWebsiteBrief, verified]);

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
                to: getSupportEmail(),
                subject: "💰 New PRO Subscription Purchased!",
                text: `Likely new PRO subscription from ${user?.email || 'Unknown User'}.\n\nPlease check Stripe Dashboard to confirm payment.`
            });

            // 2. Receipt to User
            if (user?.email) {
                const baseDomain = getSiteDomain();
                const siteName = getSiteName();

                sendEmail({
                    to: user.email,
                    subject: `Welcome to Premium - ${siteName}`,
                    text: `Hi ${(user as any)?.user_metadata?.name || user?.email?.split('@')[0] || 'there'},\n\nThank you for upgrading to Pro! Your payment was successful.\n\nYou now have access to:\n- Priority Ranking\n- Featured Badge\n- Lead Notifications\n\nGo to your dashboard to set up your profile: ${baseDomain}/user/dashboard`
                });

            }
        }

        return () => clearInterval(interval);
    }, [user, settings.countryCode]);

    // Conversion tracking is deliberately separate from the email block above:
    // it must not depend on the user having an email, and it is keyed to the
    // transaction rather than the date, so an upgrade on the same day still
    // reports and a page refresh does not double-count.
    useEffect(() => {
        if (!verified || !subscription) return;

        const txId = subscription.paymentSubscriptionId || subscription.id;
        const dedupeKey = `conversion_tracked_${txId}`;
        if (localStorage.getItem(dedupeKey)) return;
        localStorage.setItem(dedupeKey, '1');

        const isGB = settings.countryCode === 'GB';
        const currency = isGB ? 'GBP' : 'USD';
        // Real plan price, not a flat 29. `agency` has no entry in PLANS, so its
        // value is reported as undefined rather than guessed - see note to Nick.
        const price = PLANS[subscription.plan as keyof typeof PLANS]?.price;

        if (typeof price === 'number') {
            trackConversion(price, currency, txId);
        }
        (window as any).posthog?.capture('Plan Purchased', {
            region: isGB ? 'UK' : 'US',
            trade_category: (user as any)?.trade || 'unknown',
            plan_tier: subscription.plan,
            value: price,
            currency,
            transaction_id: txId,
        });
    }, [verified, subscription, user, settings.countryCode]);

    return (
        <div className="min-h-screen flex flex-col bg-slate-950 text-white">
            <SEO title="Payment Successful" noIndex />
            <Header />

            <main className="flex-grow flex items-center justify-center p-4">
                {!verified ? (
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
                        <p className="text-slate-400">Verifying your payment...</p>
                    </div>
                ) : (
                <div className={`bg-slate-900 border border-slate-800 p-8 md:p-12 rounded-3xl shadow-2xl ${shouldShowWebsiteBrief ? "max-w-4xl" : "max-w-2xl"} w-full text-center relative overflow-hidden`}>
                    {/* Top Decor Line */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#D4AF37] to-yellow-600" />

                    <div className="mb-8">
                        <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                            Official Premium Member
                        </Badge>
                    </div>

                    {/* Success Icon */}
                    <div className="w-24 h-24 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-yellow-500/20 shadow-[0_0_30px_rgba(212,175,55,0.1)]">
                        <CheckCircle className="w-12 h-12 text-[#D4AF37]" />
                    </div>

                    <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">
                        Thank you for joining!
                    </h1>
                    <div className="flex items-center justify-center gap-2 mb-6">
                        <Crown className="w-5 h-5 text-[#D4AF37]" />
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-[#D4AF37] to-yellow-600 bg-clip-text text-transparent">
                            Welcome to the family
                        </h2>
                    </div>

                    <p className="text-slate-400 mb-8 max-w-xl mx-auto text-lg leading-relaxed">
                        {shouldShowWebsiteBrief
                            ? "Your premium features are now active. Because you asked about the included website build, complete the website brief below and we will follow up by email."
                            : <>We're thrilled to have you with us. Your premium features are now active. Redirecting you to complete your profile in <span className="text-white font-bold">{countdown}</span> seconds...</>}
                    </p>

                    <div className="space-y-4">
                        <Button asChild className="w-full bg-[#D4AF37] hover:bg-yellow-600 text-black font-bold py-7 rounded-2xl text-xl shadow-xl shadow-yellow-900/20 transition-all hover:scale-[1.02]">
                            <Link to="/premium-profile">
                                Complete Your Setup Now
                            </Link>
                        </Button>

                        <div className="pt-4 border-t border-slate-800">
                            <Link to="/user/dashboard" className="text-slate-500 hover:text-[#D4AF37] transition-colors text-sm flex items-center justify-center gap-2">
                                Go to Dashboard instead <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>

                    {shouldShowWebsiteBrief && (
                        <div className="mt-10 rounded-2xl border border-yellow-500/20 bg-black/30 p-5 text-left">
                            <div className="mb-5 text-center">
                                <p className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">Included website build</p>
                                <h3 className="mt-2 font-display text-2xl font-bold text-white">Send your website brief</h3>
                                <p className="mt-2 text-sm text-slate-400">
                                    You can also browse the showroom again before choosing a preferred template.
                                </p>
                                <Link
                                    to={settings.countryCode === "US" ? "/for-contractors/website-showroom" : "/for-tradesmen/website-showroom"}
                                    className="mt-3 inline-flex text-sm font-bold text-[#D4AF37] hover:underline"
                                >
                                    View Website Showroom
                                </Link>
                            </div>
                            <div className="rounded-xl bg-slate-950/70 p-4">
                                <BusinessEnquiryForm
                                    region={settings.countryCode === "US" ? "US" : "UK"}
                                    defaultEnquiryType="Get a website built"
                                    defaultPackage={sessionStorage.getItem("pro_website_build_plan") === "agency" ? "Free website build with Agency / Multi-Location" : "Free website build with Pro Yearly"}
                                    onSuccess={() => {
                                        sessionStorage.removeItem("pro_website_build_intent");
                                        sessionStorage.removeItem("pro_website_build_plan");
                                        setWebsiteIntent(null);
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Subscription Summary */}
                    <div className="mt-10 bg-black/40 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                                <ShieldCheck className="w-5 h-5 text-green-500" />
                            </div>
                            <div className="text-left">
                                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Status</p>
                                <p className="text-sm font-semibold text-white">Active Premium</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Plan</p>
                            <p className="text-sm font-semibold text-[#D4AF37]">Pro Profile</p>
                        </div>
                    </div>
                </div>
                )}
            </main>

            <Footer />
        </div>
    );
}

const ArrowRight = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
    </svg>
);
