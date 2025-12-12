import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/AuthModal";
import { useToast } from "@/hooks/use-toast";

const tiers = [
    {
        name: "Free Starter",
        price: "£0",
        description: "Perfect for new tradesmen establishing their presence.",
        features: [
            "Basic Business Profile",
            "Listed in 1 Category",
            "Standard Support",
            "Receive Direct Calls",
        ],
        cta: "Get Started",
        priceId: null,
        popular: false,
    },
    {
        name: "Professional",
        price: "£29",
        period: "/month",
        description: "For growing businesses wanting more leads.",
        features: [
            "Enhanced Business Profile",
            "Listed in 3 Categories",
            "Priority Listing Placement",
            "Verified Business Badge",
            "Photo Gallery (Unlimited)",
            "Analytics Dashboard",
        ],
        cta: "Start Free Trial",
        priceId: "price_1Sd9xAARLaUTbUu469jyT4Ss",
        popular: true,
    },
    {
        name: "Enterprise",
        price: "£99",
        period: "/month",
        description: "Maximum visibility for established companies.",
        features: [
            "Premium Profile + Video",
            "Listed in All Categories",
            "Top of Search Results Service",
            "Dedicated Account Manager",
            "Featured on Homepage",
            "Instant Lead Notifications",
        ],
        cta: "Contact Sales",
        priceId: "price_1Sd9zMARLaUTbUu4oWIneNFS",
        popular: false,
    },
];

export default function PricingPage() {
    const { isAuthenticated } = useAuth();
    const { toast } = useToast();

    const handlePlanSelect = (tierName: string, priceId: string | null) => {
        if (isAuthenticated) {
            if (!priceId) {
                toast({
                    title: "Plan Activated",
                    description: "You are now on the Free Starter plan.",
                });
                return;
            }

            // Redirect to Stripe Checkout
            toast({
                title: "Redirecting to Stripe",
                description: `Opening checkout for ${tierName}...`,
            });

            // Open Stripe checkout in new tab (using Payment Links approach)
            // In production, you'd create a checkout session via Edge Function
            window.open(`https://buy.stripe.com/${priceId}`, '_blank');
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-grow bg-background">
                <div className="py-24 sm:py-32">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="mx-auto max-w-4xl text-center">
                            <h2 className="text-base font-semibold leading-7 text-gold">For Tradespeople</h2>
                            <p className="mt-2 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                                Choose the right plan for your business
                            </p>
                            <p className="mt-6 text-lg leading-8 text-muted-foreground">
                                Join thousands of tradespeople getting more work through Emergency Tradesmen.
                                No hidden fees, cancel anytime.
                            </p>
                        </div>

                        <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8 xl:gap-x-12">
                            {tiers.map((tier) => (
                                <div
                                    key={tier.name}
                                    className={`rounded-3xl p-8 ring-1 ring-border xl:p-10 transition-all duration-300 hover:shadow-2xl hover:scale-105 ${tier.popular ? 'bg-secondary/50 ring-gold shadow-gold/10 relative overflow-hidden' : 'bg-card'
                                        }`}
                                >
                                    {tier.popular && (
                                        <div className="absolute top-0 right-0 -mr-2 -mt-2 w-24 h-24 overflow-hidden">
                                            <div className="absolute top-0 right-0 transform translate-x-10 translate-y-6 rotate-45 bg-gold text-primary-foreground text-xs font-bold py-1 px-10 text-center">
                                                POPULAR
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between gap-x-4">
                                        <h3 id={tier.name} className="text-lg font-semibold leading-8 text-foreground">
                                            {tier.name}
                                        </h3>
                                    </div>
                                    <p className="mt-4 text-sm leading-6 text-muted-foreground">{tier.description}</p>
                                    <p className="mt-6 flex items-baseline gap-x-1">
                                        <span className="text-4xl font-bold tracking-tight text-foreground">{tier.price}</span>
                                        {tier.period && <span className="text-sm font-semibold leading-6 text-muted-foreground">{tier.period}</span>}
                                    </p>

                                    {isAuthenticated ? (
                                        <Button
                                            className={`mt-6 w-full ${tier.popular ? 'bg-gold hover:bg-gold/90 text-primary-foreground' : ''}`}
                                            variant={tier.popular ? "default" : "outline"}
                                            onClick={() => handlePlanSelect(tier.name, tier.priceId)}
                                        >
                                            {tier.cta}
                                        </Button>
                                    ) : (
                                        <AuthModal
                                            trigger={
                                                <Button
                                                    className={`mt-6 w-full ${tier.popular ? 'bg-gold hover:bg-gold/90 text-primary-foreground' : ''}`}
                                                    variant={tier.popular ? "default" : "outline"}
                                                >
                                                    {tier.cta}
                                                </Button>
                                            }
                                            defaultTab="register"
                                        />
                                    )}

                                    <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-muted-foreground">
                                        {tier.features.map((feature) => (
                                            <li key={feature} className="flex gap-x-3 text-foreground">
                                                <Check className="h-6 w-5 flex-none text-gold" aria-hidden="true" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
