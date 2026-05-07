import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { ShieldCheck, CheckCircle, Shield, Award, Users, Search, ClipboardCheck, PhoneCall } from "lucide-react";
import { motion } from "framer-motion";
import { useLocalization } from "@/contexts/LocalizationContext";

export default function VettingProcess() {
    const { settings } = useLocalization();
    const isUS = settings.countryCode === 'US';
    const steps = [
        {
            icon: Search,
            title: "Public Listing Review",
            description: "Public listings are reviewed for obvious formatting and contact issues before they appear on the site."
        },
        {
            icon: ShieldCheck,
            title: "Claim Checks",
            description: `When a business owner claims a listing, we can request supporting information before changing the public listing status.`
        },
        {
            icon: Award,
            title: isUS ? "License Confirmation" : "Trade Certification Confirmation",
            description: isUS 
                ? "Contractors should confirm state licenses, EPA Section 608 (HVAC), and trade-specific certifications directly with customers."
                : "Tradespeople should confirm Gas Safe, NICEIC, or relevant trade-specific certifications directly with customers."
        },
        {
            icon: ClipboardCheck,
            title: isUS ? "General Liability Insurance" : "Public Liability Insurance",
            description: isUS
                ? "Customers should ask the contractor to confirm current insurance before work starts."
                : "Customers should ask the tradesperson to confirm current insurance before work starts."
        },
        {
            icon: Users,
            title: "Update Requests",
            description: "Business owners and customers can request corrections when public listing details are outdated."
        },
        {
            icon: PhoneCall,
            title: "Removal Requests",
            description: "Businesses can request removal if a public listing should not appear."
        }
    ];

    return (
        <div className="min-h-screen bg-background">
            <SEO
                title={`Listing Checks | Claim and Update ${settings.tradeTerm} Listings`}
                description={`Learn how public emergency ${settings.tradeTerm.toLowerCase()} listings can be checked, claimed, corrected, or removed in the ${settings.countryCode === 'GB' ? 'UK' : 'US'}.`}
            />
            <Header />

            <main className="pt-24 pb-16">
                <section className="container-wide py-16">
                    <div className="max-w-3xl mx-auto text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm font-bold uppercase tracking-widest mb-6">
                            <Shield className="w-4 h-4" />
                            Your Safety First
                        </div>
                        <h1 className="text-4xl md:text-6xl font-display text-foreground mb-6">Listing Checks</h1>
                        <p className="text-xl text-muted-foreground leading-relaxed">
                            Public listings are shown to help people find emergency contacts quickly. Unless a profile is clearly marked with a stronger status, business details should be confirmed directly before booking.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {steps.map((step, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="p-8 rounded-3xl bg-card border border-border/50 hover:border-emerald-500/30 transition-all group"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-6 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                    <step.icon className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-bold text-foreground mb-4">{step.title}</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    {step.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                <section className="container-wide py-16">
                    <div className="bg-[#0A0A0A] rounded-[3rem] p-8 md:p-16 border border-white/10 relative overflow-hidden text-center">
                        <div className="absolute inset-0 bg-gradient-to-b from-gold/5 to-transparent pointer-events-none" />
                        <h2 className="text-3xl md:text-5xl font-display text-white mb-8">Public Listing Status</h2>
                        <p className="text-white/60 text-lg max-w-2xl mx-auto mb-12">
                            Our commitment is honest wording. Public listings are not given stronger status wording unless a real claim or confirmation record supports it. Owners can claim, correct, or request removal.
                        </p>
                        <div className="flex flex-wrap justify-center gap-8">
                            <div className="flex flex-col items-center">
                                <span className="text-4xl font-display text-gold font-bold">Public</span>
                                <span className="text-white/40 text-sm uppercase tracking-widest mt-2">Listings</span>
                            </div>
                            <div className="w-px h-12 bg-white/10 hidden md:block"></div>
                            <div className="flex flex-col items-center">
                                <span className="text-4xl font-display text-gold font-bold">Claim</span><span className="text-white/40 text-sm uppercase tracking-widest mt-2">Updates</span>
                            </div>
                            <div className="w-px h-12 bg-white/10 hidden md:block"></div>
                            <div className="flex flex-col items-center">
                                <span className="text-4xl font-display text-gold font-bold">30min</span>
                                <span className="text-white/40 text-sm uppercase tracking-widest mt-2">Avg. Response</span>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
