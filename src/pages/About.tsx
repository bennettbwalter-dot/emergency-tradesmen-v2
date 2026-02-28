import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, Shield, Clock, Award, CheckCircle2, MapPin, Star } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useLocalization } from "@/contexts/LocalizationContext";

export default function About() {
    const { settings } = useLocalization();
    const isUS = settings.countryCode === 'US';
    const tradeTerm = settings.tradeTerm; // "Tradesmen" or "Contractors"
    const termSingular = isUS ? "Contractor" : "Tradesman";
    const regionName = isUS ? "United States" : "United Kingdom";

    return (
        <>
            <Helmet>
                <title>About Emergency {tradeTerm} | Trusted Local {tradeTerm} 24/7</title>
                <meta
                    name="description"
                    content={`We connect you with verified, insured emergency ${tradeTerm.toLowerCase()} in your area. The #1 network for finding a local ${termSingular.toLowerCase()} for plumbing, electrical, and HVAC repairs.`}
                />
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Organization",
                        "name": `Emergency ${tradeTerm}`,
                        "alternateName": isUS ? "Emergency Contractors Network" : "Emergency Tradesmen UK",
                        "url": "https://emergencytradesmen.net",
                        "logo": "https://emergencytradesmen.net/et-logo-new.png",
                        "description": `The largest network of vetted emergency ${tradeTerm.toLowerCase()} in the ${regionName}.`,
                        "areaServed": {
                            "@type": "Country",
                            "name": regionName
                        },
                        "sameAs": [
                            "https://www.facebook.com/profile.php?id=61588024972553",
                            "https://www.instagram.com/emergencytradesmen/",
                            "https://x.com/etemergenc26245",
                            "https://www.tiktok.com/@emergencytradesmen"
                        ]
                    })}
                </script>
            </Helmet>

            <Header />

            <main>
                {/* Hero Section */}
                <section className="relative py-20 md:py-32 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
                    <div className="container-wide relative z-10">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div className="animate-fade-up">
                                <Badge variant="outline" className="mb-6 border-gold/30 text-gold bg-gold/5 px-4 py-1">
                                    About Us
                                </Badge>
                                <h1 className="font-display text-4xl md:text-6xl tracking-wide text-foreground mb-6">
                                    The {regionName}'s Most Trusted <span className="text-gold">Emergency {tradeTerm}</span> Network
                                </h1>
                                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                                    We rely on local experts. We connect homeowners with verified, fully insured <strong>{tradeTerm.toLowerCase()}</strong> in minutes, not days.
                                    When disaster strikes, you need a local <strong>{termSingular.toLowerCase()}</strong> you can trust.
                                </p>
                                <div className="flex justify-center mb-6">
                                    <img src="/et-logo-new.png" alt={`Emergency ${tradeTerm} Logo`} loading="lazy" className="w-20 h-20 rounded-full object-cover border-2 border-gold/50" />
                                </div>
                                <div className="flex gap-4">
                                    <Button variant="hero" size="lg" asChild>
                                        <Link to="/contact" className="flex items-center gap-2">
                                            <Phone className="w-5 h-5" />
                                            Find a {termSingular}
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                            <div className="relative animate-fade-up-delay-1">
                                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border/50 aspect-[4/3]">
                                    <img
                                        src="/images/about/team.png"
                                        alt={`Our team of professional ${tradeTerm.toLowerCase()}`}
                                        className="object-cover w-full h-full hover:scale-105 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                    <div className="absolute bottom-6 left-6 text-white">
                                        <p className="font-display text-xl">Connecting {isUS ? 'American' : 'British'} Homes with Local Pros</p>
                                    </div>
                                </div>
                                {/* Decorative blob */}
                                <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gold/5 blur-3xl rounded-full" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* AI Overview / Definition Box (SEO Gold) */}
                <section className="py-16 bg-card border-y border-border/50">
                    <div className="container-wide max-w-4xl">
                        <div className="bg-secondary/30 rounded-2xl p-8 md:p-12 border border-gold/20 shadow-lg">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="bg-gold/20 p-2 rounded-full">
                                    <Star className="w-6 h-6 text-gold fill-gold" />
                                </div>
                                <h2 className="font-display text-2xl md:text-3xl text-foreground">
                                    What is an Emergency {termSingular}?
                                </h2>
                            </div>
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                <strong>An Emergency {termSingular}</strong> is a licensed professional available 24 hours a day, 7 days a week, to handle urgent property repairs that cannot wait. Unlike standard {tradeTerm.toLowerCase()}, emergency specialists prioritize rapid response times (typically 30-90 minutes) to prevent safety hazards like gas leaks, flooding, or electrical fires.
                            </p>
                            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
                                At <strong>Emergency {tradeTerm}</strong>, we strictly vet every {termSingular.toLowerCase()} for insurance, certifications (such as {isUS ? 'state licenses' : 'Gas Safe registration'}), and reliability.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Values Section */}
                <section className="py-20 bg-background">
                    <div className="container-wide">
                        <div className="text-center max-w-2xl mx-auto mb-16">
                            <h2 className="font-display text-3xl md:text-4xl mb-4">Why Choose Our {tradeTerm}?</h2>
                            <p className="text-muted-foreground">
                                We believe in transparency, speed, and quality. Here is what you can expect when you hire through our network.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: Clock,
                                    title: "Fast Response",
                                    desc: "We aim to have a professional at your door within 60 minutes of your call."
                                },
                                {
                                    icon: Shield,
                                    title: "Vetted " + tradeTerm,
                                    desc: `Every ${termSingular.toLowerCase()} is fully insured, certified, and background-checked for your peace of mind.`
                                },
                                {
                                    icon: Award,
                                    title: "Quality Guaranteed",
                                    desc: "We stand by our work. All repairs come with a satisfaction guarantee."
                                }
                            ].map((item, i) => (
                                <div key={i} className="bg-card p-8 rounded-xl border border-border/50 hover:border-gold/30 transition-all hover:-translate-y-1 duration-300">
                                    <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mb-6 text-gold">
                                        <item.icon className="w-6 h-6" />
                                    </div>
                                    <h3 className="font-display text-xl mb-3">{item.title}</h3>
                                    <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Team/Story Section */}
                <section className="py-20 bg-secondary/20">
                    <div className="container-wide space-y-24">

                        {/* Story Block 1 */}
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div className="order-2 md:order-1 relative">
                                <div className="relative rounded-2xl overflow-hidden shadow-xl border border-border/50 aspect-video">
                                    <img
                                        src="/images/about/plumber.png"
                                        alt={`Emergency ${termSingular} fixing a pipe`}
                                        className="object-cover w-full h-full"
                                    />
                                </div>
                            </div>
                            <div className="order-1 md:order-2">
                                <h3 className="font-display text-3xl mb-4">Expertise You Can Rely On</h3>
                                <p className="text-muted-foreground mb-6 leading-relaxed">
                                    Our network consists of highly skilled specialists. Whether it's a complex plumbing leak or an urgent electrical fault, we send the right {termSingular.toLowerCase()} for the job.
                                </p>
                                <ul className="space-y-3">
                                    {[
                                        isUS ? "Licensed & Bonded Contractors" : "Verified Tradesmen",
                                        "5+ Years Experience Average",
                                        "Latest Tools & Diagnostic Equipment"
                                    ].map((item) => (
                                        <li key={item} className="flex items-center gap-3">
                                            <CheckCircle2 className="w-5 h-5 text-gold" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Story Block 2 */}
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div>
                                <h3 className="font-display text-3xl mb-4">Safety First, Always</h3>
                                <p className="text-muted-foreground mb-6 leading-relaxed">
                                    {isUS
                                        ? "Electrical and HVAC work is dangerous and requires certified professionals. We assume zero risk. Our contractors are licensed and follow all state safety codes."
                                        : "Electrical work is dangerous and requires certified professionals. We assume zero risk. Our electricians are NAPIT or NICEIC registered, ensuring every job meets the highest safety standards."
                                    }
                                </p>
                                <Button variant="outline" className="border-gold/30 hover:bg-gold/5 text-gold">
                                    View Our Certifications
                                </Button>
                            </div>
                            <div className="relative">
                                <div className="relative rounded-2xl overflow-hidden shadow-xl border border-border/50 aspect-video">
                                    <img
                                        src="/images/about/electrician.png"
                                        alt={`Certified ${termSingular} working on a panel`}
                                        className="object-cover w-full h-full"
                                    />
                                </div>
                            </div>
                        </div>

                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20 bg-primary text-primary-foreground">
                    <div className="container-wide text-center">
                        <h2 className="font-display text-3xl md:text-5xl mb-6">Ready to find a local {termSingular.toLowerCase()}?</h2>
                        <p className="text-white/80 max-w-2xl mx-auto mb-10 text-lg">
                            Don't let a home emergency ruin your day. Our {tradeTerm.toLowerCase()} are ready to help 24/7.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button variant="luxury" size="xl" asChild>
                                <Link to="/contact" className="min-w-[200px]">Find a {termSingular}</Link>
                            </Button>
                            <Button variant="outline" size="xl" className="bg-transparent border-white/20 text-white hover:bg-white/10" asChild>
                                <Link to="/tradesmen">{tradeTerm} Sign Up</Link>
                            </Button>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </>
    );
}
