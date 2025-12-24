
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Shield, Star, Zap, TrendingUp, Crown, Mail } from "lucide-react";

export default function PricingPage() {
    const handleContactUs = () => {
        window.location.href = "mailto:emergencytradesmen@outlook.com?subject=Pro%20Subscription%20Inquiry";
    };

    return (
        <>
            <Header />
            <main className="min-h-screen bg-background py-20">
                <div className="container-wide">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <div className="relative w-full rounded-3xl overflow-hidden mb-12 border border-gold/20 shadow-2xl">
                            <img
                                src="/tradesman-hero-v2.jpg"
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
                        <p className="text-gold uppercase tracking-widest text-sm font-bold mb-4">for Tradesmen</p>
                        <h2 className="text-3xl font-display mb-6">Why Join Emergency Tradesmen?</h2>
                        <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
                            <p>
                                When emergencies happen, customers don’t shop around — they call the first trusted tradesperson they see.
                            </p>
                            <p>
                                Emergency Tradesmen puts your business front and centre at the exact moment people need help, turning urgent searches into real call-outs.
                            </p>
                        </div>
                    </div>


                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {/* Free Tier */}
                        <div className="bg-card border border-border rounded-xl p-8 flex flex-col">
                            <div className="mb-6">
                                <h3 className="text-2xl font-bold text-foreground">Basic Listing</h3>
                                <div className="mt-2 text-3xl font-bold text-foreground">£0 <span className="text-base font-normal text-muted-foreground">/ forever</span></div>
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
                            <Button variant="outline" className="w-full" disabled>
                                Current Plan
                            </Button>
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
                                <div className="mt-2 text-3xl font-bold text-foreground">£29 <span className="text-base font-normal text-muted-foreground">/ month</span></div>
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
                                <li className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-gold/10 flex items-center justify-center"><Check className="w-4 h-4 text-gold" /></div>
                                    <span className="text-foreground font-medium">Lead Notifications</span>
                                </li>
                            </ul>
                            <Button
                                variant="hero"
                                className="w-full h-12 text-lg"
                                onClick={() => window.open('https://buy.stripe.com/fZu5kD5bx00feTcfRZcQU00', '_blank')}
                            >
                                Get Pro Monthly
                            </Button>
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
                                <div className="mt-2 text-3xl font-bold text-foreground">£99 <span className="text-base font-normal text-muted-foreground">/ year</span></div>
                                <p className="text-sm text-emerald-500 font-medium mt-1">Save £249 (over 70% off!)</p>
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
                                <li className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center"><Check className="w-4 h-4 text-emerald-500" /></div>
                                    <span className="text-foreground font-medium">Lead Notifications</span>
                                </li>
                            </ul>
                            <Button
                                className="w-full h-12 text-lg bg-emerald-500 hover:bg-emerald-600 text-white"
                                onClick={() => window.open('https://buy.stripe.com/00w8wP47teV9bH0eNVcQU01', '_blank')}
                            >
                                Get Pro Yearly
                            </Button>
                        </div>
                    </div>

                    <div className="text-center mt-12 text-muted-foreground">
                        <p>Secure payment processing via Stripe. Get listed and start receiving leads today.</p>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
