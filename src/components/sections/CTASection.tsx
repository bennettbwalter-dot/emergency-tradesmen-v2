import { Link } from "react-router-dom";
import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AvailabilityCarousel } from "@/components/AvailabilityCarousel";
import { useLocalization } from "@/contexts/LocalizationContext";

export function CTASection() {
    const { settings } = useLocalization();
    
    return (
        <section className="container-wide py-16">
            <div className="relative overflow-hidden rounded-2xl border border-gold/30 bg-card backdrop-blur-sm p-10 md:p-16 text-center">
                {/* Decorative elements */}
                <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-gold/5" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-gold/50 to-transparent" />

                <div className="relative z-10">
                    <p className="text-gold uppercase tracking-luxury text-sm mb-6">24/7 Availability</p>
                    <h2 className="font-display text-3xl md:text-5xl tracking-wide text-foreground mb-6">
                        Need an Emergency {settings.tradeTerm.toLowerCase().replace(/s$/, '')}?
                    </h2>

                    {/* AI Triage CTA */}
                    <div className="mb-8 -mx-6 md:mx-auto max-w-4xl">
                        <AvailabilityCarousel />
                    </div>

                    <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">
                        Our team is standing by 24/7 to connect you with a local emergency {settings.tradeTerm.toLowerCase().replace(/s$/, '')}.
                        One call is all it takes.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button variant="outline" size="xl" className="rounded-full" asChild>
                            <Link to="/contact" className="flex items-center gap-3">
                                <Phone className="w-5 h-5" />
                                Contact Us
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
