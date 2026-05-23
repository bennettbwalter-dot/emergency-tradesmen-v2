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
            title: "Initial Screening",
            description: "Every professional undergoes an initial background check and history review before joining our network."
        },
        {
            icon: ShieldCheck,
            title: "Identity Verification",
            description: `We verify government-issued ID and right-to-work documentation for every individual ${settings.tradeTerm.toLowerCase().replace(/s$/, '')}.`
        },
        {
            icon: Award,
            title: isUS ? "Licensed & Certified" : "Trade Certifications",
            description: isUS 
                ? "Mandatory verification of state licenses, EPA Section 608 (HVAC), and trade-specific certifications."
                : "Mandatory verification of Gas Safe, NICEIC, or relevant trade-specific certifications."
        },
        {
            icon: ClipboardCheck,
            title: isUS ? "General Liability Insurance" : "Public Liability Insurance",
            description: isUS
                ? "Continuous monitoring of active insurance coverage (minimum $1M-$2M depending on trade)."
                : "Continuous monitoring of active insurance coverage (minimum £1M-£5M depending on trade)."
        },
        {
            icon: Users,
            title: "Recent Work Audit",
            description: "Review of recent project completions and customer feedback to ensure quality standards."
        },
        {
            icon: PhoneCall,
            title: "Response Time Monitoring",
            description: "Emergency pros are tracked on their ability to respond to calls within the 30-90 minute window."
        }
    ];

    return (
        <div className="min-h-screen bg-background">
            <SEO
                title={`Claim Checks | ${settings.tradeTerm} Listing Reviews`}
                description={`Learn how Emergency ${isUS ? 'Contractors' : 'Tradesmen'} reviews claimed listings and keeps public listing statuses clear.`}
            />
            <Header />

            <main className="pt-24 pb-16">
                <section className="container-wide py-16">
                    <div className="max-w-3xl mx-auto text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm font-bold uppercase tracking-widest mb-6">
                            <Shield className="w-4 h-4" />
                            Your Safety First
                        </div>
                        <h1 className="text-4xl md:text-6xl font-display text-foreground mb-6">Claim Checks</h1>
                        <p className="text-xl text-muted-foreground leading-relaxed">
                    Public listings can be claimed, updated, corrected, or removed. A business only receives a higher status after a real review process confirms the relevant details.
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
                        <h2 className="text-3xl md:text-5xl font-display text-white mb-8">Honest Listing Status</h2>
                        <p className="text-white/60 text-lg max-w-2xl mx-auto mb-12">
                        Our commitment is to make status clear: public listings stay labelled as public listings unless they have passed a claim or admin review.
                        </p>
                        <div className="flex flex-wrap justify-center gap-8">
                            <div className="flex flex-col items-center">
                                <span className="text-4xl font-display text-gold font-bold">Public</span>
                                <span className="text-white/40 text-sm uppercase tracking-widest mt-2">Listings by default</span>
                            </div>
                            <div className="w-px h-12 bg-white/10 hidden md:block"></div>
                            <div className="flex flex-col items-center">
                                <span className="text-4xl font-display text-gold font-bold">100%</span>
                                <span className="text-white/40 text-sm uppercase tracking-widest mt-2">Insured Engineers</span>
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
