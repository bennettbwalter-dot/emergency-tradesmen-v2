import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, Shield, Clock, Award, Users, CheckCircle2 } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

export default function About() {
    return (
        <>
            <Helmet>
                <title>About Emergency Trades | Trusted Local Experts 24/7</title>
                <meta
                    name="description"
                    content="We connect you with verified, insured emergency tradespeople in your area. Fast response, fair prices, and quality guaranteed."
                />
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
                                    Our Mission
                                </Badge>
                                <h1 className="font-display text-4xl md:text-6xl tracking-wide text-foreground mb-6">
                                    Setting the Standard for <span className="text-gold">Emergency Repairs</span>
                                </h1>
                                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                                    We started Emergency Trades with a simple goal: to take the stress out of home emergencies.
                                    When disaster strikes, you shouldn't have to worry about finding a reliable professional.
                                </p>
                                <div className="flex justify-center mb-6">
                                    <img src="/et-logo-new.png" alt="Emergency Trades Logo" className="w-20 h-20 rounded-full object-cover border-2 border-gold/50" />
                                </div>
                                <div className="flex gap-4">
                                    <Button variant="hero" size="lg" asChild>
                                        <Link to="/contact" className="flex items-center gap-2">
                                            <Phone className="w-5 h-5" />
                                            Contact Us
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                            <div className="relative animate-fade-up-delay-1">
                                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border/50 aspect-[4/3]">
                                    <img
                                        src="/images/about/team.png"
                                        alt="Our team of professional tradespeople"
                                        className="object-cover w-full h-full hover:scale-105 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                    <div className="absolute bottom-6 left-6 text-white">
                                        <p className="font-display text-xl">Trusted by 10,000+ UK Homes</p>
                                    </div>
                                </div>
                                {/* Decorative blob */}
                                <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gold/5 blur-3xl rounded-full" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Values Section */}
                <section className="py-20 bg-secondary/30 border-y border-border/50">
                    <div className="container-wide">
                        <div className="text-center max-w-2xl mx-auto mb-16">
                            <h2 className="font-display text-3xl md:text-4xl mb-4">Why We Are Different</h2>
                            <p className="text-muted-foreground">
                                We believe in transparency, speed, and quality. Here is what you can expect when you call us.
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
                                    title: "Vetted Professionals",
                                    desc: "Every tradesperson is fully insured, certified, and background-checked for your peace of mind."
                                },
                                {
                                    icon: Award,
                                    title: "Quality Guaranteed",
                                    desc: "We stand by our work. All repairs come with a 12-month workmanship guarantee."
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
                <section className="py-20">
                    <div className="container-wide space-y-24">

                        {/* Story Block 1 */}
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div className="order-2 md:order-1 relative">
                                <div className="relative rounded-2xl overflow-hidden shadow-xl border border-border/50 aspect-video">
                                    <img
                                        src="/images/about/plumber.png"
                                        alt="Plumber fixing a pipe"
                                        className="object-cover w-full h-full"
                                    />
                                </div>
                            </div>
                            <div className="order-1 md:order-2">
                                <h3 className="font-display text-3xl mb-4">Expertise You Can Rely On</h3>
                                <p className="text-muted-foreground mb-6 leading-relaxed">
                                    Our network consists of highly skilled specialists. Whether it's a complex plumbing leak or an urgent electrical fault, we send the right person for the job.
                                </p>
                                <ul className="space-y-3">
                                    {["Licensed & Insured", "5+ Years Experience Average", "Latest Tools & Diagnostic Equipment"].map((item) => (
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
                                    Electrical work is dangerous and requires certified professionals. We assume zero risk. Our electricians are NAPIT or NICEIC registered, ensuring every job meets the highest safety standards.
                                </p>
                                <Button variant="outline" className="border-gold/30 hover:bg-gold/5 text-gold">
                                    View Our Certifications
                                </Button>
                            </div>
                            <div className="relative">
                                <div className="relative rounded-2xl overflow-hidden shadow-xl border border-border/50 aspect-video">
                                    <img
                                        src="/images/about/electrician.png"
                                        alt="Electrician working on a panel"
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
                        <h2 className="font-display text-3xl md:text-5xl mb-6">Ready to get started?</h2>
                        <p className="text-white/80 max-w-2xl mx-auto mb-10 text-lg">
                            Don't let a home emergency ruin your day. Our team is ready to help 24/7.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button variant="luxury" size="xl" asChild>
                                <Link to="/contact" className="min-w-[200px]">Contact Us</Link>
                            </Button>
                            <Button variant="outline" size="xl" className="bg-transparent border-white/20 text-white hover:bg-white/10" asChild>
                                <Link to="/tradesmen">Tradesmen Sign Up</Link>
                            </Button>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </>
    );
}
