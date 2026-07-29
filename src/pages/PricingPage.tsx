
import { useEffect, useCallback, useRef, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Shield, Star, Zap, TrendingUp, Crown, Gift, Globe2 } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useLocalization } from "@/contexts/LocalizationContext";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { GeneralFAQSection } from "@/components/GeneralFAQSection";
import { getUserSubscription } from "@/lib/subscriptionService";
import { trackEvent } from "@/lib/analytics";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";


export default function PricingPage() {
    const { settings } = useLocalization();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const isUS = settings.countryCode === 'US';
    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
    const port = typeof window !== 'undefined' ? window.location.port : '';
    const isUSDomain = hostname.includes('emergencycontractors.net') || (hostname === 'localhost' && port === '3001') || (hostname === '127.0.0.1' && port === '3001');
    const countryPrefix = (isUS && !isUSDomain) ? '/us' : '';
    const siteUrl = isUSDomain ? 'https://emergencycontractors.net' : 'https://emergencytradesmen.net';
    const [websiteChoiceOpen, setWebsiteChoiceOpen] = useState(false);
    const [selectedWebsiteChoice, setSelectedWebsiteChoice] = useState("yes");
    const [pendingCheckout, setPendingCheckout] = useState<{ url?: string | null; plan: "pro-yearly" | "agency" } | null>(null);
    const arrivedFromWebsiteOffer = searchParams.get("offer") === "website";

    // When user returns to this tab after completing Stripe payment, check if they now have an active subscription
    // and automatically redirect them to the profile editor
    const checkPostPaymentRedirect = useCallback(async () => {
        if (!user) return;
        try {
            const sub = await getUserSubscription();
            if (sub && sub.status === 'active' && sub.plan !== 'free') {
                navigate('/premium-profile');
            }
        } catch { /* ignore  -  user hasn't paid yet */ }
    }, [user, navigate]);

    useEffect(() => {
        // Check on tab re-focus (user may have completed payment in Stripe tab)
        const handleVisibility = () => {
            if (document.visibilityState === 'visible') {
                checkPostPaymentRedirect();
            }
        };
        document.addEventListener('visibilitychange', handleVisibility);
        return () => document.removeEventListener('visibilitychange', handleVisibility);
    }, [checkPostPaymentRedirect]);

    // Load Stripe Buy Button script once
    const stripeScriptLoaded = useRef(false);
    useEffect(() => {
        if (stripeScriptLoaded.current) return;
        if (document.querySelector('script[src*="buy-button.js"]')) {
            stripeScriptLoaded.current = true;
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://js.stripe.com/v3/buy-button.js';
        script.async = true;
        document.head.appendChild(script);
        stripeScriptLoaded.current = true;
    }, []);

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": siteUrl },
            { "@type": "ListItem", "position": 2, "name": "Pricing", "item": `${siteUrl}/pricing` }
        ]
    };

    // Stripe Payment Links  -  separate links for US vs UK; test links used in dev
    const isDev = import.meta.env.DEV;
    const stripeLinks = isUSDomain
        ? {
              monthly: (isDev ? import.meta.env.VITE_STRIPE_US_MONTHLY_TEST : null) || 'https://buy.stripe.com/7sY6oH9rN3cr4ey219cQU03',
              yearly: (isDev ? import.meta.env.VITE_STRIPE_US_YEARLY_TEST : null) || 'https://buy.stripe.com/3cIcI59rN14j9yS5dlcQU04',
              enterprise: (isDev ? import.meta.env.VITE_STRIPE_US_AGENCY_TEST : null) || 'https://buy.stripe.com/fZu3cv47t6oDfXg6hpcQU05',
          }
        : {
              monthly: (isDev ? import.meta.env.VITE_STRIPE_UK_MONTHLY_TEST : null) || 'https://buy.stripe.com/fZu5kD5bx00feTcfRZcQU00',
              yearly: (isDev ? import.meta.env.VITE_STRIPE_UK_YEARLY_TEST : null) || 'https://buy.stripe.com/5kQ28rdI3dR54ey219cQU06',
              // Live UK Agency Payment Link comes from env so it can go live without a deploy;
              // until it's set, the CTA routes to the contact form (prefilled via ?subject=).
              enterprise: (isDev ? import.meta.env.VITE_STRIPE_UK_AGENCY_TEST : null) || import.meta.env.VITE_STRIPE_UK_AGENCY_LINK || null,
          };


    const startStripeCheckout = useCallback((url?: string | null) => {
        if (!url) {
            navigate('/contact?subject=agency-plan');
            return;
        }

        if (!user) {
            sessionStorage.setItem('post_auth_redirect', '/pricing');
            window.location.href = `/register?redirect=/pricing`;
            return;
        }

        // Build Stripe checkout URL with user identification
        const stripeUrl = new URL(url);
        if (user.email) {
            stripeUrl.searchParams.set('prefilled_email', user.email);
        }
        // client_reference_id is used by webhooks to identify the user
        stripeUrl.searchParams.set('client_reference_id', user.id);

        // Navigate in the same tab so Stripe's after_completion redirect works.
        // The Stripe Payment Link should be configured with:
        //   after_completion → redirect → https://yourdomain.com/payment/success
        window.location.href = stripeUrl.toString();
    }, [navigate, user]);

    useEffect(() => {
        if (!user) return;
        const pendingUrl = sessionStorage.getItem("pending_pro_checkout_url");
        if (!pendingUrl) return;

        sessionStorage.removeItem("pending_pro_checkout_url");
        sessionStorage.removeItem("pending_pro_checkout_plan");
        startStripeCheckout(pendingUrl === "agency-contact" ? null : pendingUrl);
    }, [startStripeCheckout, user]);

    useEffect(() => {
        if (arrivedFromWebsiteOffer) {
            trackEvent("Business owner", "Website offer pricing viewed", isUSDomain ? "US" : "UK");
        }
    }, [arrivedFromWebsiteOffer, isUSDomain]);

    const handleCheckout = (url?: string | null) => {
        startStripeCheckout(url);
    };

    const startWebsitePlanCheckout = (url: string | null | undefined, plan: "pro-yearly" | "agency") => {
        trackEvent(
            "Business owner",
            "Website plan checkout started",
            `${isUSDomain ? "US" : "UK"}: ${plan}${arrivedFromWebsiteOffer ? ": website offer" : ""}`
        );
        setPendingCheckout({ url, plan });
        setSelectedWebsiteChoice("yes");
        setWebsiteChoiceOpen(true);
    };

    const continueWebsitePlanCheckout = () => {
        if (!pendingCheckout) return;

        sessionStorage.setItem("pro_website_build_intent", selectedWebsiteChoice);
        sessionStorage.setItem("pro_website_build_plan", pendingCheckout.plan);

        if (!user) {
            sessionStorage.setItem("pending_pro_checkout_url", pendingCheckout.url || "agency-contact");
            sessionStorage.setItem("pending_pro_checkout_plan", pendingCheckout.plan);
            sessionStorage.setItem("post_auth_redirect", "/pricing");
            window.location.href = "/register?redirect=/pricing";
            return;
        }

        setWebsiteChoiceOpen(false);
        startStripeCheckout(pendingCheckout.url);
    };


    return (
        <>
            <SEO
                title={`Pro Pricing Plans for ${isUS ? 'Contractors' : 'Tradesmen'} | Emergency ${isUS ? 'Contractors' : 'Tradesmen'}`}
                description={`Boost your business with Emergency ${isUS ? 'Contractors' : 'Tradesmen'} Pro. Get priority ranking, enhanced trust signals & 3x more leads. Sign up today from ${settings.currencySymbol}0/month.`}
                canonical={`${countryPrefix}/pricing`}
                jsonLd={breadcrumbSchema}
                alternates={[
                    { lang: 'en-GB', href: 'https://emergencytradesmen.net/pricing' },
                    { lang: 'en-US', href: 'https://emergencycontractors.net/pricing' },
                    { lang: 'x-default', href: 'https://emergencytradesmen.net/pricing' },
                ]}
            />
            <Header />
            <main className="min-h-screen bg-background py-20">
                <div className="container-wide">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <div className="relative w-full rounded-3xl overflow-hidden mb-12 border border-gold/20 shadow-2xl">
                            <img
                                src="/tradesman-hero-v2.webp"
                                alt="Professional tradesman"
                                className="w-full h-auto"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
                                <Badge className="bg-gold text-black hover:bg-gold/90 font-bold px-6 py-2 rounded-full text-sm">
                                    Join Our Premium Network
                                </Badge>
                            </div>
                        </div>
                        <h1 className="font-display text-4xl md:text-5xl text-foreground mb-6">
                            Boost Your Business with <span className="text-gold">Premium</span>
                        </h1>
                        <p className="text-xl text-muted-foreground">
                            Get priority ranking, enhanced trust signals, and 3x more leads.
                        </p>
                    </div>
                    <div className="max-w-3xl mx-auto mb-16 text-center bg-card/50 border border-gold/20 p-8 rounded-2xl backdrop-blur-sm">
                        <p className="text-gold uppercase tracking-widest text-sm font-bold mb-4">for {isUS ? 'Contractors' : 'Tradesmen'}</p>
                        <h2 className="text-3xl font-display mb-6">Why Join Emergency {isUS ? 'Contractors' : 'Tradesmen'}?</h2>
                        <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
                            <p>
                                When emergencies happen, customers don’t shop around  -  they call the first relevant local contact they see.
                            </p>
                            <p>
                                Emergency {isUS ? 'Contractors' : 'Tradesmen'} puts your business front and centre at the exact moment people need help, turning urgent searches into real call-outs.
                            </p>
                        </div>
                    </div>


                    <div className="max-w-5xl mx-auto mb-10 overflow-hidden rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 md:p-8">
                        <div className="flex flex-col gap-5 md:flex-row md:items-start">
                            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-emerald-500/15">
                                <Gift className="h-6 w-6 text-emerald-500" />
                            </div>
                            <div className="flex-1">
                                <p className="mb-2 text-sm font-bold uppercase tracking-widest text-emerald-500">Free website bonus</p>
                                <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">
                                    Sign up to Pro Yearly or Agency / Multi-Location and we will build your emergency-ready website with no build fee.
                                </h2>
                                <p className="mt-3 text-muted-foreground">
                                    During Pro Yearly or Agency signup, we ask whether you need the website. If you do, the brief form appears after payment so only active members complete it.
                                </p>
                            </div>
                        </div>
                    </div>

                    {arrivedFromWebsiteOffer && (
                        <div className="mx-auto mb-10 max-w-5xl rounded-2xl border border-gold/25 bg-gold/5 px-6 py-5 text-center">
                            <p className="font-display text-xl font-bold text-foreground">
                                Choose Pro Yearly or Agency, then select a template and send your website brief after payment.
                            </p>
                        </div>
                    )}

                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {/* Free Tier */}
                        <div className="bg-card border border-border rounded-xl p-8 flex flex-col">
                            <div className="mb-6">
                                <h3 className="text-2xl font-bold text-foreground">Basic Listing</h3>
                                <div className="mt-2 text-3xl font-bold text-foreground">{settings.currencySymbol}0 <span className="text-base font-normal text-muted-foreground">/ forever</span></div>
                            </div>
                            <ul className="space-y-4 mb-8 flex-1">
                                <li className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center"><Check className="w-4 h-4 text-primary" /></div>
                                    <span className="text-muted-foreground">Standard listing</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center"><Check className="w-4 h-4 text-primary" /></div>
                                    <span className="text-muted-foreground">Basic contact details</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center"><Check className="w-4 h-4 text-primary" /></div>
                                    <span className="text-muted-foreground">Receive reviews</span>
                                </li>
                            </ul>
                            {user ? (
                                <Button variant="outline" className="w-full" disabled>Current Plan</Button>
                            ) : (
                                <Button variant="outline" className="w-full" asChild>
                                    <Link to="/register">Get Started Free</Link>
                                </Button>
                            )}
                        </div>

                        {/* Monthly Pro */}
                        <div className="relative bg-card border border-gold/50 rounded-xl p-8 flex flex-col shadow-2xl shadow-gold/5 overflow-hidden">
                            <div className="absolute top-0 right-0 bg-gold text-black text-xs font-bold px-4 py-1 rounded-bl-xl uppercase tracking-wider">
                                Most Popular
                            </div>
                            <div className="mb-6">
                                <h3 className="text-2xl font-bold text-gold flex items-center gap-2">
                                    <Zap className="w-6 h-6 fill-current" /> Pro Monthly
                                </h3>
                                <div className="mt-2 text-3xl font-bold text-foreground">{settings.currencySymbol}29 <span className="text-base font-normal text-muted-foreground">/ month</span></div>
                            </div>
                            <ul className="space-y-4 mb-8 flex-1">
                                <li className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-gold/10 flex items-center justify-center"><TrendingUp className="w-4 h-4 text-gold" /></div>
                                    <span className="text-foreground font-medium">Priority Top Ranking</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-gold/10 flex items-center justify-center"><Shield className="w-4 h-4 text-gold" /></div>
                                    <span className="text-foreground font-medium">"Featured" Badge</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-gold/10 flex items-center justify-center"><Star className="w-4 h-4 text-gold" /></div>
                                    <span className="text-foreground font-medium">Enhanced Profile</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-full bg-gold/10 flex items-center justify-center shrink-0 mt-0.5"><Check className="w-4 h-4 text-gold" /></div>
                                    <div>
                                        <span className="text-foreground font-medium">Lead Notifications</span>
                                        <p className="text-xs text-muted-foreground mt-0.5">SMS + email the moment someone searches your trade in your area</p>
                                    </div>
                                </li>
                            </ul>
                            <Button
                                variant="hero"
                                className="w-full h-12 text-lg"
                                onClick={() => handleCheckout(stripeLinks.monthly)}
                            >
                                Get Pro Monthly
                            </Button>
                            <p className="text-xs text-center text-muted-foreground mt-3">Cancel anytime. No lock-in.</p>
                        </div>

                        {/* Yearly Pro */}
                        <div className="relative bg-card border border-emerald-500/50 rounded-xl p-8 flex flex-col shadow-2xl shadow-emerald-500/5 overflow-hidden">
                            <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-bold px-4 py-1 rounded-bl-xl uppercase tracking-wider">
                                Best Value
                            </div>
                            <div className="mb-6">
                                <h3 className="text-2xl font-bold text-emerald-500 flex items-center gap-2">
                                    <Crown className="w-6 h-6 fill-current" /> Pro Yearly
                                </h3>
                                <div className="mt-2 text-3xl font-bold text-foreground">{settings.currencySymbol}150 <span className="text-base font-normal text-muted-foreground">/ year</span></div>
                                <p className="text-sm text-emerald-500 font-medium mt-1">Save {settings.currencySymbol}198 (~57% off!)</p>
                            </div>
                            <ul className="space-y-4 mb-8 flex-1">
                                <li className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center"><TrendingUp className="w-4 h-4 text-emerald-500" /></div>
                                    <span className="text-foreground font-medium">Priority Top Ranking</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center"><Shield className="w-4 h-4 text-emerald-500" /></div>
                                    <span className="text-foreground font-medium">"Featured" Badge</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center"><Star className="w-4 h-4 text-emerald-500" /></div>
                                    <span className="text-foreground font-medium">Enhanced Profile</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5"><Check className="w-4 h-4 text-emerald-500" /></div>
                                    <div>
                                        <span className="text-foreground font-medium">Lead Notifications</span>
                                        <p className="text-xs text-muted-foreground mt-0.5">SMS + email the moment someone searches your trade in your area</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5"><Globe2 className="w-4 h-4 text-emerald-500" /></div>
                                    <div>
                                        <span className="text-foreground font-medium">Free Professional Website Build</span>
                                        <p className="text-xs text-muted-foreground mt-0.5">Emergency-ready website included with no upfront build fee</p>
                                    </div>
                                </li>
                            </ul>
                            <Button
                                className="w-full h-12 text-lg bg-emerald-500 hover:bg-emerald-600 text-white"
                                onClick={() => startWebsitePlanCheckout(stripeLinks.yearly, "pro-yearly")}
                            >
                                Get Pro Yearly
                            </Button>
                            <p className="text-xs text-center text-muted-foreground mt-3">One payment. Full year of leads.</p>
                        </div>
                    </div>

                    {/* Agency / Multi-location Tier */}
                    <div className="mt-12 max-w-6xl mx-auto bg-card/60 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group hover:border-purple-500/50 transition-all duration-500 shadow-xl shadow-purple-500/5">
                        {/* Decorative background glow */}
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl group-hover:bg-purple-600/20 transition-all duration-700" />
                        
                        <div className="flex items-center gap-6 relative z-10">
                            <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center shrink-0 border border-purple-500/20">
                                <TrendingUp className="w-8 h-8 text-purple-500" />
                            </div>
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-2xl font-bold text-foreground font-display tracking-tight">Agency / Multi-Location</h3>
                                    <span className="text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-3 py-1 rounded-full font-bold uppercase tracking-widest">Enterprise</span>
                                </div>
                                <p className="text-muted-foreground text-base max-w-lg leading-relaxed">
                                    Manage multiple vans, branches, or client listings with 5 Pro locations, a dedicated account manager, and priority support at a fixed monthly rate.
                                </p>
                                <p className="mt-3 text-sm font-semibold text-purple-300">
                                    Includes a professional emergency-ready website built with no build fee for your agency, franchise, or multi-location business.
                                </p>
                                <ul className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-sm text-muted-foreground">
                                    <li className="flex items-center gap-2 font-medium"><Check className="w-4 h-4 text-purple-500" /> 5 Pro listings included</li>
                                    <li className="flex items-center gap-2 font-medium"><Check className="w-4 h-4 text-purple-500" /> Dedicated account manager</li>
                                    <li className="flex items-center gap-2 font-medium"><Check className="w-4 h-4 text-purple-500" /> Custom reporting</li>
                                    <li className="flex items-center gap-2 font-medium"><Check className="w-4 h-4 text-purple-500" /> Priority support</li>
                                    <li className="flex items-center gap-2 font-medium"><Gift className="w-4 h-4 text-purple-500" /> Free website build included</li>
                                </ul>
                            </div>
                        </div>
                        <div className="shrink-0 flex flex-col items-center justify-center relative z-10 min-w-[280px] gap-4">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-foreground">{settings.currencySymbol}199 <span className="text-base font-normal text-muted-foreground">/ month</span></div>
                                <p className="text-sm text-purple-400 mt-1">5 locations included</p>
                            </div>
                            <Button
                                className="w-full h-12 text-lg bg-purple-600 hover:bg-purple-700 text-white"
                                onClick={() => startWebsitePlanCheckout(stripeLinks.enterprise, "agency")}
                            >
                                {stripeLinks.enterprise ? "Get Agency Plan" : "Enquire About Agency Plan"}
                            </Button>
                        </div>
                    </div>

                    <div className="text-center mt-8 text-muted-foreground">
                        <p>Secure payment processing via Stripe. Get listed and start receiving leads today.</p>
                    </div>

                    {/* Social Proof  -  Network Stats */}
                    <div className="mt-20 max-w-4xl mx-auto">
                        <div className="grid grid-cols-3 gap-4 sm:gap-8 mb-16">
                            <div className="text-center">
                                <div className="text-3xl sm:text-4xl font-bold text-gold">20,000+</div>
                                <div className="text-xs sm:text-sm text-muted-foreground mt-1 uppercase tracking-wider">{isUS ? 'Contractors' : 'Tradesmen'} Listed</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl sm:text-4xl font-bold text-gold">50+</div>
                                <div className="text-xs sm:text-sm text-muted-foreground mt-1 uppercase tracking-wider">Cities Covered</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl sm:text-4xl font-bold text-gold">24/7</div>
                                <div className="text-xs sm:text-sm text-muted-foreground mt-1 uppercase tracking-wider">Customer Access</div>
                            </div>
                        </div>

                        {/* Early Adopter CTA */}
                        <div className="bg-card border border-gold/20 rounded-2xl p-8 text-center">
                            <Crown className="w-10 h-10 text-gold mx-auto mb-4" />
                            <h3 className="font-display text-2xl md:text-3xl text-foreground mb-3">
                                Be Among Our First Pro Members
                            </h3>
                            <p className="text-muted-foreground max-w-lg mx-auto mb-6 leading-relaxed">
                                We are building the emergency {isUS ? 'contractor' : 'tradesman'} network for {isUS ? 'the US' : 'the UK'}. Early Pro members get locked-in pricing and front-of-queue placement as the network grows.
                            </p>
                            <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto text-center">
                                <div>
                                    <div className="text-xl font-bold text-gold">1st</div>
                                    <div className="text-xs text-muted-foreground mt-1">In your area</div>
                                </div>
                                <div>
                                    <div className="text-xl font-bold text-gold">24/7</div>
                                    <div className="text-xs text-muted-foreground mt-1">Lead exposure</div>
                                </div>
                                <div>
                                    <div className="text-xl font-bold text-gold">Direct</div>
                                    <div className="text-xs text-muted-foreground mt-1">Customer calls</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <section className="py-20 bg-background border-t border-border/50">
                <div className="container-wide">
                    <div className="text-center mb-12">
                        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                            Three ways to grow with us
                        </h2>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                            Claim your existing listing, browse the approved website templates, or choose Pro Yearly / Agency and answer the website question during signup.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                        <Link
                            to="/claim-your-business"
                            className="group bg-card border border-border hover:border-gold/50 rounded-xl p-8 transition-colors flex flex-col"
                        >
                            <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center mb-5 group-hover:bg-gold/20 transition-colors">
                                <Shield className="w-5 h-5 text-gold" />
                            </div>
                            <h3 className="font-display text-xl font-bold mb-2">Claim Your Business</h3>
                            <p className="text-sm text-muted-foreground mb-4 flex-1">
                                Send a manual claim request so we can verify ownership before any listing changes are made.
                            </p>
                            <span className="text-gold text-sm font-bold uppercase tracking-wider">Start claim</span>
                        </Link>
                        <Link
                            to={isUSDomain || isUS ? "/for-contractors/website-showroom" : "/for-tradesmen/website-showroom"}
                            className="group bg-card border border-border hover:border-gold/50 rounded-xl p-8 transition-colors flex flex-col"
                        >
                            <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center mb-5 group-hover:bg-gold/20 transition-colors">
                                <Star className="w-5 h-5 text-gold" />
                            </div>
                            <h3 className="font-display text-xl font-bold mb-2">Website Showroom</h3>
                            <p className="text-sm text-muted-foreground mb-4 flex-1">
                                Browse the approved emergency-ready website templates that Pro Yearly and Agency members can build from.
                            </p>
                            <span className="text-gold text-sm font-bold uppercase tracking-wider">View showroom</span>
                        </Link>
                        <button
                            type="button"
                            onClick={() => startWebsitePlanCheckout(stripeLinks.yearly, "pro-yearly")}
                            className="group bg-card border border-border hover:border-gold/50 rounded-xl p-8 transition-colors flex flex-col"
                        >
                            <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center mb-5 group-hover:bg-gold/20 transition-colors">
                                <Crown className="w-5 h-5 text-gold" />
                            </div>
                            <h3 className="font-display text-xl font-bold mb-2 text-left">Pro Website Option</h3>
                            <p className="text-sm text-muted-foreground mb-4 flex-1">
                                Full-service website design, hosting, and setup. We build it, you go live with a working enquiry form.
                            </p>
                            <span className="text-gold text-sm font-bold uppercase tracking-wider">Learn more</span>
                        </button>
                    </div>
                </div>
            </section>

            <section className="py-20 bg-background border-t border-border/50">
                <div className="container-narrow">
                    <div className="text-center mb-12">
                        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">Frequently Asked Questions</h2>
                        <p className="text-muted-foreground text-lg">Common questions about our pricing and membership plans.</p>
                    </div>
                    <GeneralFAQSection showTitle={false} useContainer={true} />
                </div>
            </section>

            <Dialog open={websiteChoiceOpen} onOpenChange={setWebsiteChoiceOpen}>
                <DialogContent className="border-gold/20 bg-background sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle className="font-display text-2xl">Do you need a website?</DialogTitle>
                        <DialogDescription>
                            Pro Yearly and Agency / Multi-Location include the website build option. Choose now, then continue to secure checkout.
                        </DialogDescription>
                    </DialogHeader>
                    <RadioGroup value={selectedWebsiteChoice} onValueChange={setSelectedWebsiteChoice} className="gap-3">
                        {[
                            { value: "yes", title: "Yes, build me a website", copy: "After payment, we show the website brief and template choice." },
                            { value: "no", title: "No, I already have one", copy: "You can skip the website brief and go straight to profile setup." },
                            { value: "not-sure", title: "Not sure yet", copy: "We will show the brief after payment, but you can decide later." },
                        ].map((option) => (
                            <Label
                                key={option.value}
                                htmlFor={`website-choice-${option.value}`}
                                className="flex cursor-pointer gap-3 rounded-xl border border-border bg-card/70 p-4 transition-colors hover:border-gold/40"
                            >
                                <RadioGroupItem id={`website-choice-${option.value}`} value={option.value} className="mt-1" />
                                <span>
                                    <span className="block font-semibold text-foreground">{option.title}</span>
                                    <span className="mt-1 block text-sm text-muted-foreground">{option.copy}</span>
                                </span>
                            </Label>
                        ))}
                    </RadioGroup>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setWebsiteChoiceOpen(false)}>Cancel</Button>
                        <Button className="bg-gold text-black hover:bg-gold-light" onClick={continueWebsitePlanCheckout}>
                            Continue to checkout
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Footer />
        </>
    );
}
