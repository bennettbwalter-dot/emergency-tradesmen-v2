import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { SEO } from '../components/SEO';
import { GeneralFAQSection } from '../components/GeneralFAQSection';

export default function FAQ() {
    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
    const port = typeof window !== 'undefined' ? window.location.port : '';
    const isUSDomain = hostname.includes('emergencycontractors.net') || (hostname === 'localhost' && port === '3001') || (hostname === '127.0.0.1' && port === '3001');
    const siteUrl = isUSDomain ? 'https://emergencycontractors.net' : 'https://emergencytradesmen.net';

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": siteUrl },
            { "@type": "ListItem", "position": 2, "name": "FAQ", "item": `${siteUrl}/faq` }
        ]
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <SEO
                title={isUSDomain
                    ? "Emergency Contractors FAQ — Find Local Emergency Contractors 24/7"
                    : "Emergency Tradesmen FAQ — Find Local Emergency Tradesmen 24/7"}
                description={isUSDomain
                    ? "Find answers to common questions about emergency plumbers, electricians & HVAC techs near you. Check local contractor listings and confirm details directly."
                    : "Find answers to common questions about emergency plumbers, electricians & locksmiths near you. Check local tradesmen listings and confirm details directly."}
                canonical="/faq"
                jsonLd={breadcrumbSchema}
                alternates={[
                    { lang: 'en-GB', href: 'https://emergencytradesmen.net/faq' },
                    { lang: 'en-US', href: 'https://emergencycontractors.net/faq' },
                    { lang: 'x-default', href: 'https://emergencytradesmen.net/faq' },
                ]}
            />

            <Header />

            <main className="flex-grow py-16 md:py-24">
                <div className="container-narrow">
                    <h1 className="text-3xl md:text-4xl font-display font-bold mb-8 text-foreground">Frequently Asked Questions</h1>
                    <GeneralFAQSection initiallyOpened={true} />

                    <div className="mt-16 p-8 rounded-2xl bg-gold/5 border border-gold/20 text-center animate-fade-up-delay-2">
                        <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">Still have questions?</h2>
                        <p className="text-muted-foreground mb-8">
                            We're here to help. Contact our support team for any further inquiries.
                        </p>
                        <Link
                            to="/contact"
                            className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-gold hover:bg-gold-light text-primary font-bold transition-all duration-300 transform hover:scale-105"
                        >
                            Get in Touch
                        </Link>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
