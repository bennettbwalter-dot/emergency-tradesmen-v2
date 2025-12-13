import React from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export default function TermsOfService() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Header />

            <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
                <h1 className="text-3xl font-bold mb-6 text-slate-900">Terms of Service</h1>
                <p className="text-slate-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

                <div className="prose prose-slate max-w-none space-y-8">
                    <section>
                        <h2 className="text-xl font-semibold text-slate-800 mb-3">1. Introduction</h2>
                        <p className="text-slate-600">
                            Welcome to Emergency Tradesmen ("the Platform"). By accessing or using our website and services,
                            you agree to be bound by these Terms of Service. If you disagree with any part of these terms,
                            you may not use our service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-slate-800 mb-3">2. Platform Nature</h2>
                        <p className="text-slate-600">
                            Emergency Tradesmen acts solely as a marketplace connecting users with tradespeople ("Service Providers").
                            We are <strong>not</strong> a construction company, plumbing service, or employer of these Service Providers.
                            Any contract for work is directly between the User and the Service Provider.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-slate-800 mb-3">3. Liability Disclaimer</h2>
                        <p className="text-slate-600">
                            We do not vet or guarantee the quality, safety, or legality of the services provided by the tradespeople
                            listed on our platform. Users are responsible for conducting their own due diligence before hiring a Service Provider.
                            Emergency Tradesmen shall not be liable for any damages or disputes arising from the services provided by tradespeople.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-slate-800 mb-3">4. Business Accounts & Payments</h2>
                        <p className="text-slate-600">
                            Service Providers subscribing to our "Pro" or "Premium" plans agree to pay the subscription fees indicated
                            at the time of purchase. Payments are processed via third-party providers including Revolut and Stripe.
                            Subscriptions auto-renew unless canceled prior to the renewal date.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-slate-800 mb-3">5. User Conduct</h2>
                        <p className="text-slate-600">
                            Users agree not to misuse the platform, post false reviews, or harass other users. We reserve the right
                            to suspend or terminate accounts that violate these terms.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-slate-800 mb-3">6. Changes to Terms</h2>
                        <p className="text-slate-600">
                            We reserve the right to modify these terms at any time. We will notify users of any material changes
                            by posting the new Terms of Service on this page.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-slate-800 mb-3">7. Contact Us</h2>
                        <p className="text-slate-600">
                            If you have any questions about these Terms, please contact us at: emergencytradesmen@outlook.com
                        </p>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
}
