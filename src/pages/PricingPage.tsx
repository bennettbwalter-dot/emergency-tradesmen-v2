
import { useEffect, useCallback, useRef } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Shield, Star, Zap, TrendingUp, Crown, Mail } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useLocalization } from "@/contexts/LocalizationContext";
import { useFeatureFlagEnabled } from "posthog-js/react";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { getSupportEmail } from "@/lib/siteConfig";
import { GeneralFAQSection } from "@/components/GeneralFAQSection";
import { getUserSubscription } from "@/lib/subscriptionService";

// TypeScript declaration for Stripe's custom web component
declare global {
    namespace JSX {
        interface IntrinsicElements {
            'stripe-buy-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
                'buy-button-id': string;
                'publishable-key': string;
                'client-reference-id'?: string;
                'customer-email'?: string;
            }, HTMLElement>;
        }
    }
}

export default function PricingPage() {
    const { settings } = useLocalization();
    const { user } = useAuth();
    const navigate = useNavigate();
    const isNewSignupFlowEnabled = useFeatureFlagEnabled('new-us-signup-flow');
    const isUS = settings.countryCode === 'US';
    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
    const port = typeof window !== 'undefined' ? window.location.port : '';
    const isUSDomain = hostname.includes('emergencycontractors.net') || (hostname === 'localhost' && port === '3001') || (hostname === '127.0.0.1' && port === '3001');
    const countryPrefix = (isUS && !isUSDomain) ? '/us' : '';
    const siteUrl = isUSDomain ? 'https://emergencycontractors.net' : 'https://emergencytradesmen.net';

    // When user returns to this tab after completing Stripe payment, check if they now have an active subscription
    // and automatically redirect them to the profile editor
    const checkPostPaymentRedirect = useCallback(async () => {
        if (!user) return;
        try {
            const sub = await getUserSubscription();
            if (sub && sub.status === 'active' && sub.plan !== 'free') {
                navigate('/premium-profile');
            }
        } catch { /* ignore — user hasn't paid yet */ }
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

    // Stripe Payment Links — separate links for US vs UK
    const stripeLinks = isUSDomain
        ? {
              monthly: import.meta.env.VITE_STRIPE_US_PRO_MONTHLY_LINK || 'https://buy.stripe.com/fZu5kD5bx00feTcfRZcQU00',
              yearly: import.meta.env.VITE_STRIPE_US_PRO_YEARLY_LINK || 'https://buy.stripe.com/00w8wP47teV9bH0eNVcQU01',
              enterprise: import.meta.env.VITE_STRIPE_US_ENTERPRISE_LINK || 'https://buy.stripe.com/8x2fZh33p7sH9ySgW3cQU02',
          }
        : {
              monthly: 'https://buy.stripe.com/fZu5kD5bx00feTcfRZcQU00',
              yearly: 'https://buy.stripe.com/00w8wP47teV9bH0eNVcQU01',
              enterprise: 'https://buy.stripe.com/8x2fZh33p7sH9ySgW3cQU02',
          };

    const handleCheckout = (url: string) => {
        if (!user) {
            sessionStorage.setItem('post_auth_redirect', '/pricing');
            window.location.href = `/auth?redirect=/pricing`;
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
    };

    const handleContactUs = () => {
        window.location.href = `mailto:${getSupportEmail()}?subject=Pro%20Subscription%20Inquiry`;
    };

    return (
        <>
            <SEO
                title={`Pro Pricing Plans for ${isUS ? 'Contractors' : 'Tradesmen'} — Boost Your Business`}
                description={`Boost your business with Emergency ${isUS ? 'Contractors' : 'Tradesmen'} Pro. Get priority ranking, enhanced trust signals & 3x more leads. Sign up today from ${settings.currencySymbol}0/month.`}
                canonical={`${countryPrefix}/pricing`}
                jsonLd={breadcrumbSchema}
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
                                When emergencies happen, customers don’t shop around — they call the first trusted tradesperson they see.
                            </p>
                            <p>
                                Emergency {isUS ? 'Contractors' : 'Tradesmen'} puts your business front and centre at the exact moment people need help, turning urgent searches into real call-outs.
                            </p>
                        </div>
                    </div>


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
                                <div className="mt-2 text-3xl font-bold text-foreground">{settings.currencySymbol}99 <span className="text-base font-normal text-muted-foreground">/ year</span></div>
                                <p className="text-sm text-emerald-500 font-medium mt-1">Save {settings.currencySymbol}249 (over 70% off!)</p>
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
                            </ul>
                            <Button
                                className="w-full h-12 text-lg bg-emerald-500 hover:bg-emerald-600 text-white"
                                onClick={() => handleCheckout(stripeLinks.yearly)}
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
                                    Managing multiple vans, branches, or client listings? Get 5 Pro locations, a dedicated account manager, and priority support — at a fixed monthly rate.
                                </p>
                                <ul className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-sm text-muted-foreground">
                                    <li className="flex items-center gap-2 font-medium"><Check className="w-4 h-4 text-purple-500" /> 5 Pro listings included</li>
                                    <li className="flex items-center gap-2 font-medium"><Check className="w-4 h-4 text-purple-500" /> Dedicated account manager</li>
                                    <li className="flex items-center gap-2 font-medium"><Check className="w-4 h-4 text-purple-500" /> Custom reporting</li>
                                    <li className="flex items-center gap-2 font-medium"><Check className="w-4 h-4 text-purple-500" /> Priority support</li>
                                </ul>
                            </div>
                        </div>
                        <div className="shrink-0 flex flex-col items-center justify-center relative z-10 min-w-[280px]">
                            {/* Price is now handled by the Stripe Buy Button to avoid duplication */}
                            <div className="w-full">
                                <stripe-buy-button
                                    buy-button-id="buy_btn_1TNg3JHKzUFX5MS55gtYpCCN"
                                    publishable-key="pk_live_51SffwUHKzUFX5MS5SEAUYpbP3kxnk2RY7HSZPfjCU7UpIf1h3ADqESnPndZDyZb5eUCyxDGDo1khh5SNKMDvE7SZ00EnIeSPB6"
                                    {...(user?.email ? { 'customer-email': user.email } : {})}
                                    {...(user?.id ? { 'client-reference-id': user.id } : {})}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="text-center mt-8 text-muted-foreground">
                        <p>Secure payment processing via Stripe. Get listed and start receiving leads today.</p>
                    </div>

                    {/* Social Proof — Network Stats */}
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
                                We're building the go-to emergency {isUS ? 'contractor' : 'tradesman'} network for {isUS ? 'the US' : 'the UK'}. Early Pro members get locked-in pricing and front-of-queue placement as the network grows.
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
                <div className="container-narrow">
                    <div className="text-center mb-12">
                        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">Frequently Asked Questions</h2>
                        <p className="text-muted-foreground text-lg">Common questions about our pricing and membership plans.</p>
                    </div>
                    <GeneralFAQSection showTitle={false} useContainer={true} />
                </div>
            </section>

            <Footer />
        </>
    );
}
