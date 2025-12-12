import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Helmet } from "react-helmet-async";

export default function PrivacyPolicy() {
    return (
        <>
            <Helmet>
                <title>Privacy Policy - Emergency Tradesmen UK</title>
                <meta name="description" content="Privacy Policy for Emergency Tradesmen UK - Learn how we collect, use, and protect your personal information." />
            </Helmet>

            <Header />

            <main className="min-h-screen bg-background">
                <div className="container-wide py-16">
                    <div className="max-w-4xl mx-auto">
                        <h1 className="font-display text-4xl md:text-5xl tracking-wide text-foreground mb-6">
                            Privacy Policy
                        </h1>
                        <p className="text-muted-foreground mb-8">
                            Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>

                        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
                            {/* Introduction */}
                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">Introduction</h2>
                                <p className="text-muted-foreground">
                                    Emergency Tradesmen UK ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
                                </p>
                                <p className="text-muted-foreground mt-4">
                                    Please read this Privacy Policy carefully. By using our Service, you agree to the collection and use of information in accordance with this policy.
                                </p>
                            </section>

                            {/* 1. Information We Collect */}
                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">1. Information We Collect</h2>

                                <h3 className="text-xl font-semibold text-foreground mb-2">1.1 Personal Information</h3>
                                <p className="text-muted-foreground mb-4">
                                    We may collect personal information that you voluntarily provide to us when you:
                                </p>
                                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                                    <li>Register for an account</li>
                                    <li>Request a quote from a tradesperson</li>
                                    <li>Make a booking</li>
                                    <li>Post a review</li>
                                    <li>Subscribe to our newsletter</li>
                                    <li>Contact us for support</li>
                                </ul>
                                <p className="text-muted-foreground mt-4">
                                    This information may include: name, email address, phone number, postal address, and payment information.
                                </p>

                                <h3 className="text-xl font-semibold text-foreground mb-2 mt-6">1.2 Automatically Collected Information</h3>
                                <p className="text-muted-foreground mb-4">
                                    When you access our Service, we automatically collect certain information, including:
                                </p>
                                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                                    <li>IP address and browser type</li>
                                    <li>Device information and operating system</li>
                                    <li>Pages visited and time spent on pages</li>
                                    <li>Referring website addresses</li>
                                    <li>Location data (with your permission)</li>
                                </ul>

                                <h3 className="text-xl font-semibold text-foreground mb-2 mt-6">1.3 Cookies and Tracking Technologies</h3>
                                <p className="text-muted-foreground">
                                    We use cookies and similar tracking technologies to track activity on our Service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
                                </p>
                            </section>

                            {/* 2. How We Use Your Information */}
                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">2. How We Use Your Information</h2>
                                <p className="text-muted-foreground mb-4">
                                    We use the collected information for various purposes:
                                </p>
                                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                                    <li>To provide and maintain our Service</li>
                                    <li>To process your transactions and send confirmations</li>
                                    <li>To connect you with tradespeople</li>
                                    <li>To send you quotes, booking confirmations, and updates</li>
                                    <li>To respond to your inquiries and provide customer support</li>
                                    <li>To send you marketing communications (with your consent)</li>
                                    <li>To improve our Service and user experience</li>
                                    <li>To detect, prevent, and address technical issues or fraud</li>
                                    <li>To comply with legal obligations</li>
                                    <li>To analyze usage patterns and trends</li>
                                </ul>
                            </section>

                            {/* 3. Legal Basis for Processing */}
                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">3. Legal Basis for Processing (GDPR)</h2>
                                <p className="text-muted-foreground mb-4">
                                    If you are from the European Economic Area (EEA), our legal basis for collecting and using your personal information depends on the data and the context:
                                </p>
                                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                                    <li><strong>Contract:</strong> Processing is necessary to perform a contract with you</li>
                                    <li><strong>Consent:</strong> You have given us permission to process your data</li>
                                    <li><strong>Legitimate Interests:</strong> Processing is in our legitimate interests and not overridden by your rights</li>
                                    <li><strong>Legal Obligation:</strong> Processing is necessary to comply with the law</li>
                                </ul>
                            </section>

                            {/* 4. Sharing Your Information */}
                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">4. Sharing Your Information</h2>
                                <p className="text-muted-foreground mb-4">
                                    We may share your information in the following situations:
                                </p>

                                <h3 className="text-xl font-semibold text-foreground mb-2">4.1 With Tradespeople</h3>
                                <p className="text-muted-foreground mb-4">
                                    When you request a quote or booking, we share your contact information and job details with the relevant tradesperson(s).
                                </p>

                                <h3 className="text-xl font-semibold text-foreground mb-2">4.2 With Service Providers</h3>
                                <p className="text-muted-foreground mb-4">
                                    We may share your information with third-party service providers who perform services on our behalf:
                                </p>
                                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                                    <li>Payment processors (Stripe)</li>
                                    <li>Email service providers</li>
                                    <li>Analytics providers (Google Analytics)</li>
                                    <li>Cloud hosting providers (Supabase)</li>
                                    <li>Customer support tools</li>
                                </ul>

                                <h3 className="text-xl font-semibold text-foreground mb-2 mt-6">4.3 For Legal Reasons</h3>
                                <p className="text-muted-foreground mb-4">
                                    We may disclose your information if required to do so by law or in response to valid requests by public authorities.
                                </p>

                                <h3 className="text-xl font-semibold text-foreground mb-2">4.4 Business Transfers</h3>
                                <p className="text-muted-foreground">
                                    If we are involved in a merger, acquisition, or asset sale, your personal information may be transferred.
                                </p>
                            </section>

                            {/* 5. Data Retention */}
                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">5. Data Retention</h2>
                                <p className="text-muted-foreground">
                                    We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. When we no longer need your information, we will securely delete or anonymize it.
                                </p>
                            </section>

                            {/* 6. Your Data Protection Rights */}
                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">6. Your Data Protection Rights</h2>
                                <p className="text-muted-foreground mb-4">
                                    Depending on your location, you may have the following rights:
                                </p>
                                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                                    <li><strong>Right to Access:</strong> Request copies of your personal data</li>
                                    <li><strong>Right to Rectification:</strong> Request correction of inaccurate data</li>
                                    <li><strong>Right to Erasure:</strong> Request deletion of your data</li>
                                    <li><strong>Right to Restrict Processing:</strong> Request limitation of processing</li>
                                    <li><strong>Right to Data Portability:</strong> Request transfer of your data</li>
                                    <li><strong>Right to Object:</strong> Object to processing of your data</li>
                                    <li><strong>Right to Withdraw Consent:</strong> Withdraw consent at any time</li>
                                </ul>
                                <p className="text-muted-foreground mt-4">
                                    To exercise these rights, please contact us at emergencytradesmen@outlook.com.
                                </p>
                            </section>

                            {/* 7. Security */}
                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">7. Security of Your Information</h2>
                                <p className="text-muted-foreground mb-4">
                                    We use administrative, technical, and physical security measures to protect your personal information. These measures include:
                                </p>
                                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                                    <li>SSL/TLS encryption for data transmission</li>
                                    <li>Encrypted data storage</li>
                                    <li>Regular security audits</li>
                                    <li>Access controls and authentication</li>
                                    <li>Secure payment processing through Stripe</li>
                                </ul>
                                <p className="text-muted-foreground mt-4">
                                    However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
                                </p>
                            </section>

                            {/* 8. Children's Privacy */}
                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">8. Children's Privacy</h2>
                                <p className="text-muted-foreground">
                                    Our Service is not intended for children under the age of 18. We do not knowingly collect personal information from children under 18. If you are a parent or guardian and believe your child has provided us with personal information, please contact us so we can delete it.
                                </p>
                            </section>

                            {/* 9. International Data Transfers */}
                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">9. International Data Transfers</h2>
                                <p className="text-muted-foreground">
                                    Your information may be transferred to and maintained on computers located outside of your country where data protection laws may differ. By using our Service, you consent to such transfers. We ensure appropriate safeguards are in place to protect your information.
                                </p>
                            </section>

                            {/* 10. Third-Party Links */}
                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">10. Third-Party Links</h2>
                                <p className="text-muted-foreground">
                                    Our Service may contain links to third-party websites. We are not responsible for the privacy practices of these websites. We encourage you to read the privacy policies of every website you visit.
                                </p>
                            </section>

                            {/* 11. Marketing Communications */}
                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">11. Marketing Communications</h2>
                                <p className="text-muted-foreground">
                                    With your consent, we may send you marketing emails about our services, special offers, and updates. You can opt out of marketing communications at any time by clicking the "unsubscribe" link in our emails or by contacting us at emergencytradesmen@outlook.com.
                                </p>
                            </section>

                            {/* 12. Do Not Track Signals */}
                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">12. Do Not Track Signals</h2>
                                <p className="text-muted-foreground">
                                    We do not currently respond to Do Not Track (DNT) signals. However, you can disable cookies in your browser settings.
                                </p>
                            </section>

                            {/* 13. Changes to Privacy Policy */}
                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">13. Changes to This Privacy Policy</h2>
                                <p className="text-muted-foreground">
                                    We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
                                </p>
                            </section>

                            {/* 14. Contact Us */}
                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">14. Contact Us</h2>
                                <p className="text-muted-foreground mb-4">
                                    If you have any questions about this Privacy Policy or our data practices, please contact us:
                                </p>
                                <div className="bg-card border border-border rounded-lg p-6">
                                    <p className="text-foreground font-semibold mb-2">Emergency Tradesmen UK</p>
                                    <p className="text-muted-foreground mb-2">Email: emergencytradesmen@outlook.com</p>
                                    <p className="text-muted-foreground text-sm mt-4">
                                        For data protection inquiries, please include "Data Protection Request" in your email subject line.
                                    </p>
                                </div>
                            </section>

                            {/* 15. Supervisory Authority */}
                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">15. Supervisory Authority</h2>
                                <p className="text-muted-foreground">
                                    If you are located in the EEA and believe we have not addressed your concerns, you have the right to lodge a complaint with your local data protection supervisory authority.
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
