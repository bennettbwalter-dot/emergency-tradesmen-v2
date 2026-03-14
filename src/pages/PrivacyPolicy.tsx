import React from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { SEO } from '@/components/SEO';
import { Link } from 'react-router-dom';
import { useLocalization } from "@/contexts/LocalizationContext";

export default function PrivacyPolicy() {
    const { settings } = useLocalization();
    const isUS = settings.countryCode === 'US';
    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
    const port = typeof window !== 'undefined' ? window.location.port : '';
    const isUSDomain = hostname.includes('emergencycontractors.net') || (hostname === 'localhost' && port === '3001');
    const siteName = isUSDomain ? 'Emergency Contractors' : 'Emergency Tradesmen';
    const siteUrl = isUSDomain ? 'emergencycontractors.net' : 'emergencytradesmen.net';
    const countryPrefix = (isUS && !isUSDomain) ? '/us' : '';

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <SEO
                title={`Privacy Policy | ${siteName}`}
                description={`Read our Privacy Policy to understand how ${siteUrl} safely collects and processes your data to connect you with specialized emergency trades.`}
                canonical={`${countryPrefix}/privacy`}
            />
            <Header />

            <main className="flex-grow container mx-auto px-4 py-12 max-w-4xl">
                <article className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12">
                    <header className="mb-10 border-b border-slate-100 pb-8 text-center md:text-left">
                        <p className="text-sm font-bold tracking-widest text-gold uppercase mb-3">Legal & Compliance</p>
                        <h1 className="text-4xl md:text-5xl font-display font-bold text-slate-900 mb-4">Privacy Policy</h1>
                        <p className="text-slate-500">Effective Date: March 2, 2026</p>
                    </header>

                    <div className="prose prose-slate prose-lg max-w-none prose-headings:font-display prose-headings:font-bold prose-headings:text-slate-900 prose-a:text-gold hover:prose-a:text-gold/80">
                        <p className="lead text-xl text-slate-600">
                            At {siteUrl}, our core mission is safely and rapidly connecting you with verified professionals during property emergencies. This Privacy Policy is written in plain English to clearly explain exactly how your data is handled when you use our platform in the United Kingdom or the United States.
                        </p>

                        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg my-8">
                            <h3 className="text-blue-900 mt-0 mb-2">Our Data Promise</h3>
                            <p className="text-blue-800 mb-0">
                                We act strictly as a dispatch connection service. We only collect the information absolutely necessary to get help to your door, and we <strong>only share it with the specific tradesperson responding to your emergency.</strong> We do not sell your personal data to mass marketing lists.
                            </p>
                        </div>

                        <h2>1. The Information We Collect</h2>
                        <p>To dispatch an emergency tradesperson to your exact location, we must collect specific details when you submit a request or use our AI dispatcher:</p>
                        <ul>
                            <li><strong>Identity Information:</strong> Your first and last name.</li>
                            <li><strong>Contact Details:</strong> Your active phone number and email address.</li>
                            <li><strong>Location Data:</strong> Your physical service address (including house number, street, city, and zip/postcode) so the tradesperson can find you.</li>
                            <li><strong>Emergency Details:</strong> Descriptions, voice recordings, or photos you provide detailing the nature of the fault (e.g., "burst pipe in kitchen").</li>
                        </ul>

                        <h2>2. Who We Share Your Data With (The 11 Trades)</h2>
                        <p>
                            We partner with specialized independent contractors and local businesses. When you request a service, we share your <strong>Name, Phone Number, and Address</strong> strictly with the assigned responder in your local area to facilitate the repair.
                        </p>
                        <p>Depending on your emergency, your data is sent securely to one of the following 11 professional categories:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                            <ul className="mt-0 mb-0">
                                <li>Plumber / Water Damage Restoration</li>
                                <li>Electrician</li>
                                <li>Locksmith</li>
                                <li>Gas Engineer / Heating Specialists</li>
                                <li>Drain & Sewer Specialist</li>
                                <li>Air Conditioning (HVAC) / Cooling</li>
                            </ul>
                            <ul className="mt-0 mb-0">
                                <li>Glazier / Emergency Glass Repair</li>
                                <li>Roofer / Roof Tarps & Repair</li>
                                <li>Builder / Structural Support</li>
                                <li>Tow Truck / Breakdown Recovery</li>
                                <li>Fire & Flood Restoration Specialists</li>
                            </ul>
                        </div>

                        <h2>3. Analytics and Third-Party Tools</h2>
                        <p>To ensure our platform runs smoothly and connects you with the closest professionals efficiently, we use industry-standard tools:</p>
                        <ul>
                            <li><strong>Google Analytics & PostHog:</strong> We use these to understand overall website traffic (e.g., how many users visit the "US Plumbers" page vs. the "UK Electricians" page). This data is aggregated and anonymized.</li>
                            <li><strong>Google Maps API & OpenStreetMap:</strong> Used strictly to geolocate your address coordinates to match you with the nearest physical tradesperson. We fully comply with the Google Maps Controller-to-Controller data protection terms.</li>
                            <li><strong>Stripe:</strong> Used exclusively for processing subscription payments for verified business owners (tradespeople) joining our directory. Consumer emergency requests are always free to submit and do not require payment details on our site.</li>
                        </ul>

                        <hr className="my-12 border-slate-200" />

                        <div className="bg-slate-50 p-8 rounded-xl border border-slate-200" id="uk-residents">
                            <h2 className="mt-0 text-slate-900 border-b border-slate-200 pb-4 mb-6 relative">
                                <span className="absolute -left-4 top-1 text-2xl">🇬🇧</span>
                                <span className="ml-6">Information for UK Residents (UK GDPR)</span>
                            </h2>
                            <p>For individuals residing in the United Kingdom, Emergency Tradesmen complies fully with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.</p>

                            <h4>Lawful Basis for Processing</h4>
                            <p>We process your personal data under the following lawful bases:</p>
                            <ul>
                                <li><strong>Contractual Necessity:</strong> To fulfill your request for an emergency tradesperson to visit your property.</li>
                                <li><strong>Legitimate Interests:</strong> To improve our dispatch technology, prevent fraud, and maintain platform security.</li>
                                <li><strong>Consent:</strong> When you actively opt-in to marketing communications (which is entirely separate from emergency requests).</li>
                            </ul>

                            <h4>Your UK Data Rights</h4>
                            <p>You maintain the right to Request Access to your data, Request Correction of your data, Request Erasure ("Right to be Forgotten"), Object to processing, and Request Data Portability.</p>

                            <h4>Data Protection Officer & ICO Complaints</h4>
                            <p>If you believe we have not handled your data properly, you have the right to lodge a complaint with the Information Commissioner's Office (ICO). Prior to contacting the ICO, we encourage you to contact our Data Protection Officer directly at <strong>legal@{siteUrl}</strong> so we can resolve any issues immediately.</p>
                        </div>

                        <div className="bg-slate-50 p-8 rounded-xl border border-slate-200 mt-8" id="us-residents">
                            <h2 className="mt-0 text-slate-900 border-b border-slate-200 pb-4 mb-6 relative">
                                <span className="absolute -left-4 top-1 text-2xl">🇺🇸</span>
                                <span className="ml-6">Information for US Residents (CCPA / CPRA)</span>
                            </h2>
                            <p>For individuals residing in the United States—specifically those in states with comprehensive privacy laws such as California (CCPA/CPRA), Virginia (VCDPA), Texas (TDPSA), and Colorado (CPA)—the following disclosures apply.</p>

                            <h4>Notice at Collection</h4>
                            <p>We collect Identifiers (Name, Phone, Email, Address) and Geolocation Data specifically to dispatch emergency home repair services to your location. We retain this data only as long as necessary to facilitate the service, handle customer service inquiries relating to the job, and maintain legal business records.</p>

                            <h4>Do Not Sell or Share My Personal Information</h4>
                            <p><strong>We do not sell your personal information to data brokers for monetary value.</strong></p>
                            <p>Under the CCPA/CPRA, "sharing" can broadly include transferring data to perform the service requested. When you submit an emergency request, you are directing us to intentionally disclose your information to the independent contractor (e.g., the Plumber or Electrician) so they can fulfill your service request. This is an exempt disclosure under CCPA Section 1798.140(v)(2)(A).</p>
                            <p>However, you always maintain the right to know what data we have collected about you, request deletion of that data post-service, and the right to non-discrimination for exercising your privacy rights.</p>
                        </div>

                        <hr className="my-12 border-slate-200" />

                        <p>We mandate strict HTTPS encryption (SSL/TLS) across all UK and US jurisdictions on {siteUrl}. Any data entered into our platform is encrypted in transit and at rest within our secure Supabase infrastructure.</p>

                        <h2>5. Contact the Privacy Team</h2>
                        <p>
                            To exercise your data rights, request a data deletion, or ask questions about this policy, please email us directly: <br />
                            <strong>Email:</strong> privacy@{siteUrl}
                        </p>
                    </div>
                </article>
            </main>

            <Footer />
        </div>
    );
}
