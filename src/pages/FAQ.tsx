import React from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Helmet } from 'react-helmet-async';
import { GeneralFAQSection } from '../components/GeneralFAQSection';

export default function FAQ() {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Helmet>
                <title>FAQ | Emergency Tradesmen - Frequently Asked Questions</title>
                <meta name="description" content="Find answers to common questions about Emergency Tradesmen, our AI chatbot, and how to find emergency help quickly." />
            </Helmet>

            <Header />

            <main className="flex-grow py-16 md:py-24">
                <div className="container-narrow">
                    <GeneralFAQSection initiallyOpened={true} />

                    <div className="mt-16 p-8 rounded-2xl bg-gold/5 border border-gold/20 text-center animate-fade-up-delay-2">
                        <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">Still have questions?</h2>
                        <p className="text-muted-foreground mb-8">
                            We're here to help. Contact our support team for any further inquiries.
                        </p>
                        <a
                            href="/contact"
                            className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-gold hover:bg-gold-light text-primary font-bold transition-all duration-300 transform hover:scale-105"
                        >
                            Get in Touch
                        </a>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
