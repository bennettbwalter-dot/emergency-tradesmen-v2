import React from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Header />

            <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
                <h1 className="text-3xl font-bold mb-6 text-slate-900">Privacy Policy</h1>
                <p className="text-slate-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

                <div className="prose prose-slate max-w-none space-y-8">
                    <section>
                        <h2 className="text-xl font-semibold text-slate-800 mb-3">1. Introduction</h2>
                        <p className="text-slate-600">
                            Emergency Tradesmen ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy
                            explains how we collect, use, and safeguard your personal information when you use our website.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-slate-800 mb-3">2. Information We Collect</h2>
                        <ul className="list-disc pl-5 text-slate-600 space-y-2">
                            <li><strong>Personal Data:</strong> Name, email address, and phone number when you register or claim a business.</li>
                            <li><strong>Location Data:</strong> Your geographical location (via Google Maps API) to show relevant tradespeople near you.</li>
                            <li><strong>Usage Data:</strong> Information about how you use our website (e.g., pages visited, time spent).</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-slate-800 mb-3">3. How We Use Your Information</h2>
                        <p className="text-slate-600">
                            We use your data to:
                        </p>
                        <ul className="list-disc pl-5 text-slate-600 space-y-2 mt-2">
                            <li>Provide and maintain our service.</li>
                            <li>Manage your account and subscription orders (processed via Revolut).</li>
                            <li>Send you newsletters or marketing communications (via EmailOctopus), only if you have opted in.</li>
                            <li>Improve our website functionality and user experience.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-slate-800 mb-3">4. Third-Party Services</h2>
                        <p className="text-slate-600">
                            We may share data with trusted third-party service providers to help us operate our business, including:
                        </p>
                        <ul className="list-disc pl-5 text-slate-600 space-y-2 mt-2">
                            <li><strong>Google Maps:</strong> For location and mapping services.</li>
                            <li><strong>Revolut:</strong> For secure payment processing.</li>
                            <li><strong>Supabase:</strong> For database hosting and authentication.</li>
                            <li><strong>EmailOctopus:</strong> For email marketing campaigns.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-slate-800 mb-3">5. Cookies</h2>
                        <p className="text-slate-600">
                            We use cookies to store your preferences and settings (e.g., authentication status).
                            You can control cookie preferences through your browser settings.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-slate-800 mb-3">6. Your Rights (GDPR)</h2>
                        <p className="text-slate-600">
                            Under the GDPR, you have the right to access, correct, or delete your personal data.
                            If you wish to exercise these rights, please contact us.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-slate-800 mb-3">7. Contact Us</h2>
                        <p className="text-slate-600">
                            For any privacy-related inquiries, please contact us at: emergencytradesmen@outlook.com
                        </p>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
}
