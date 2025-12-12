import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Helmet } from "react-helmet-async";

export default function TermsOfService() {
    return (
        <>
            <Helmet>
                <title>Terms of Service - Emergency Tradesmen UK</title>
                <meta name="description" content="Terms of Service for Emergency Tradesmen UK - Read our terms and conditions for using our emergency tradesman directory service." />
            </Helmet>

            <Header />

            <main className="min-h-screen bg-background">
                <div className="container-wide py-16">
                    <div className="max-w-4xl mx-auto">
                        <h1 className="font-display text-4xl md:text-5xl tracking-wide text-foreground mb-6">
                            Terms of Service
                        </h1>
                        <p className="text-muted-foreground mb-8">
                            Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>

                        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
                            {/* 1. Agreement to Terms */}
                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">1. Agreement to Terms</h2>
                                <p className="text-muted-foreground">
                                    By accessing and using Emergency Tradesmen UK ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these Terms of Service, please do not use the Service.
                                </p>
                            </section>

                            {/* 2. Use of Service */}
                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">2. Use of Service</h2>
                                <p className="text-muted-foreground mb-4">
                                    Emergency Tradesmen UK is a directory and connection service that helps users find emergency tradespeople in the UK. We provide:
                                </p>
                                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                                    <li>A searchable directory of emergency tradespeople</li>
                                    <li>Quote request and booking services</li>
                                    <li>Review and rating systems</li>
                                    <li>Communication tools between users and businesses</li>
                                </ul>
                            </section>

                            {/* 3. User Responsibilities */}
                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">3. User Responsibilities</h2>
                                <p className="text-muted-foreground mb-4">You agree to:</p>
                                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                                    <li>Provide accurate and truthful information</li>
                                    <li>Maintain the security of your account credentials</li>
                                    <li>Not use the Service for any illegal or unauthorized purpose</li>
                                    <li>Not attempt to gain unauthorized access to any part of the Service</li>
                                    <li>Not post false, misleading, or defamatory reviews</li>
                                    <li>Comply with all applicable laws and regulations</li>
                                </ul>
                            </section>

                            {/* 4. Business Listings */}
                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">4. Business Listings</h2>
                                <p className="text-muted-foreground mb-4">
                                    We provide two types of business listings:
                                </p>
                                <h3 className="text-xl font-semibold text-foreground mb-2">4.1 Free Directory Listings</h3>
                                <p className="text-muted-foreground mb-4">
                                    Basic business information is displayed from publicly available sources. These listings are provided for informational purposes and do not constitute an endorsement.
                                </p>
                                <h3 className="text-xl font-semibold text-foreground mb-2">4.2 Premium Subscriptions</h3>
                                <p className="text-muted-foreground">
                                    Businesses may subscribe to premium features including enhanced profiles, priority placement, and lead management tools. Subscription terms and pricing are outlined separately.
                                </p>
                            </section>

                            {/* 5. Disclaimer of Warranties */}
                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">5. Disclaimer of Warranties</h2>
                                <p className="text-muted-foreground mb-4">
                                    THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND. We do not:
                                </p>
                                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                                    <li>Guarantee the accuracy, completeness, or reliability of business listings</li>
                                    <li>Verify the credentials, licenses, or qualifications of listed businesses</li>
                                    <li>Guarantee the quality of work performed by any tradesperson</li>
                                    <li>Warrant that the Service will be uninterrupted or error-free</li>
                                    <li>Endorse any particular business or tradesperson</li>
                                </ul>
                            </section>

                            {/* 6. Limitation of Liability */}
                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">6. Limitation of Liability</h2>
                                <p className="text-muted-foreground mb-4">
                                    Emergency Tradesmen UK acts solely as a directory and connection service. We are not responsible for:
                                </p>
                                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                                    <li>The quality, safety, or legality of services provided by tradespeople</li>
                                    <li>Any disputes between users and tradespeople</li>
                                    <li>Any damages, injuries, or losses resulting from services obtained through the platform</li>
                                    <li>The accuracy of quotes, estimates, or pricing information</li>
                                    <li>Any failure by businesses to respond to inquiries or complete work</li>
                                </ul>
                                <p className="text-muted-foreground mt-4">
                                    IN NO EVENT SHALL EMERGENCY TRADESMEN UK BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES.
                                </p>
                            </section>

                            {/* 7. User Conduct and Reviews */}
                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">7. User Conduct and Reviews</h2>
                                <p className="text-muted-foreground mb-4">
                                    When posting reviews or using communication features, you must not:
                                </p>
                                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                                    <li>Post false, misleading, or defamatory content</li>
                                    <li>Include personal information of others without consent</li>
                                    <li>Use offensive, abusive, or discriminatory language</li>
                                    <li>Attempt to manipulate ratings or reviews</li>
                                    <li>Post spam or promotional content</li>
                                </ul>
                                <p className="text-muted-foreground mt-4">
                                    We reserve the right to remove any content that violates these terms.
                                </p>
                            </section>

                            {/* 8. Payment Terms */}
                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">8. Payment Terms</h2>
                                <p className="text-muted-foreground mb-4">
                                    For premium subscriptions:
                                </p>
                                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                                    <li>Payments are processed securely through Stripe</li>
                                    <li>Subscriptions renew automatically unless cancelled</li>
                                    <li>Refunds are subject to our refund policy</li>
                                    <li>Prices may change with 30 days' notice</li>
                                    <li>You are responsible for all applicable taxes</li>
                                </ul>
                            </section>

                            {/* 9. Intellectual Property */}
                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">9. Intellectual Property</h2>
                                <p className="text-muted-foreground">
                                    All content on the Service, including text, graphics, logos, and software, is the property of Emergency Tradesmen UK or its licensors and is protected by copyright and other intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written permission.
                                </p>
                            </section>

                            {/* 10. Privacy */}
                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">10. Privacy</h2>
                                <p className="text-muted-foreground">
                                    Your use of the Service is also governed by our Privacy Policy. Please review our Privacy Policy to understand our practices regarding your personal information.
                                </p>
                            </section>

                            {/* 11. Termination */}
                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">11. Termination</h2>
                                <p className="text-muted-foreground">
                                    We reserve the right to suspend or terminate your access to the Service at any time, without notice, for conduct that we believe violates these Terms of Service or is harmful to other users, us, or third parties, or for any other reason.
                                </p>
                            </section>

                            {/* 12. Indemnification */}
                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">12. Indemnification</h2>
                                <p className="text-muted-foreground">
                                    You agree to indemnify and hold harmless Emergency Tradesmen UK, its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from your use of the Service or violation of these Terms.
                                </p>
                            </section>

                            {/* 13. Dispute Resolution */}
                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">13. Dispute Resolution</h2>
                                <p className="text-muted-foreground mb-4">
                                    Any disputes between users and tradespeople should be resolved directly between the parties. We may provide contact information but are not responsible for mediating or resolving such disputes.
                                </p>
                                <p className="text-muted-foreground">
                                    For disputes with Emergency Tradesmen UK, you agree to first attempt to resolve the matter informally by contacting us at emergencytradesmen@outlook.com.
                                </p>
                            </section>

                            {/* 14. Governing Law */}
                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">14. Governing Law</h2>
                                <p className="text-muted-foreground">
                                    These Terms of Service shall be governed by and construed in accordance with the laws of England and Wales, without regard to its conflict of law provisions.
                                </p>
                            </section>

                            {/* 15. Changes to Terms */}
                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">15. Changes to Terms</h2>
                                <p className="text-muted-foreground">
                                    We reserve the right to modify these Terms of Service at any time. We will notify users of any material changes by posting the new Terms of Service on this page and updating the "Last updated" date. Your continued use of the Service after such changes constitutes acceptance of the new Terms.
                                </p>
                            </section>

                            {/* 16. Contact Information */}
                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">16. Contact Information</h2>
                                <p className="text-muted-foreground mb-4">
                                    If you have any questions about these Terms of Service, please contact us:
                                </p>
                                <div className="bg-card border border-border rounded-lg p-6">
                                    <p className="text-foreground font-semibold mb-2">Emergency Tradesmen UK</p>
                                    <p className="text-muted-foreground">Email: emergencytradesmen@outlook.com</p>
                                </div>
                            </section>

                            {/* 17. Severability */}
                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">17. Severability</h2>
                                <p className="text-muted-foreground">
                                    If any provision of these Terms of Service is found to be unenforceable or invalid, that provision will be limited or eliminated to the minimum extent necessary so that these Terms will otherwise remain in full force and effect.
                                </p>
                            </section>

                            {/* 18. Entire Agreement */}
                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">18. Entire Agreement</h2>
                                <p className="text-muted-foreground">
                                    These Terms of Service, together with our Privacy Policy, constitute the entire agreement between you and Emergency Tradesmen UK regarding the use of the Service.
                                </p>
                            </section>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </>
    );
}
