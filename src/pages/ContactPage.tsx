import { useState } from "react";
import { SEO } from "@/components/SEO";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, User, MessageSquare, Send, CheckCircle, AlertCircle, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { sendEmail } from "@/lib/email";
import { GlassSocialIcon } from "@/components/ui/GlassSocialIcon";
import { getSupportEmail, getSiteName } from "@/lib/siteConfig";
import { GeneralFAQSection } from "@/components/GeneralFAQSection";

export default function ContactPage() {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
    const port = typeof window !== 'undefined' ? window.location.port : '';
    const isUSDomain = hostname.includes('emergencycontractors.net') || (hostname === 'localhost' && port === '3001') || (hostname === '127.0.0.1' && port === '3001');
    const siteUrl = isUSDomain ? 'https://emergencycontractors.net' : 'https://emergencytradesmen.net';

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": siteUrl },
            { "@type": "ListItem", "position": 2, "name": "Contact", "item": `${siteUrl}/contact` }
        ]
    };

    // Form state
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
        consent: false,
        honeypot: "" // Spam protection - hidden field
    });

    // Validation state
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateEmail = (email: string) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.fullName.trim()) {
            newErrors.fullName = "Full name is required";
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email address is required";
        } else if (!validateEmail(formData.email)) {
            newErrors.email = "Please enter a valid email address";
        }

        if (!formData.subject.trim()) {
            newErrors.subject = "Subject is required";
        }

        if (!formData.message.trim()) {
            newErrors.message = "Message is required";
        } else if (formData.message.length < 10) {
            newErrors.message = "Message must be at least 10 characters";
        }

        if (!formData.consent) {
            newErrors.consent = "You must agree to the privacy policy";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: "" }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Honeypot check - if filled, it's a bot
        if (formData.honeypot) {
            setSubmitted(true);
            return;
        }

        if (!validateForm()) {
            toast({
                title: "Please fix the errors",
                description: "Some required fields are missing or invalid.",
                variant: "destructive"
            });
            return;
        }

        setIsSubmitting(true);

        try {
            // Primary: Supabase Edge Function (SendGrid)
            await sendEmail({
                to: getSupportEmail(),
                subject: `Contact Form: ${formData.subject}`,
                html: `
                    <h2>New Contact Form Submission</h2>
                    <p><strong>Name:</strong> ${formData.fullName}</p>
                    <p><strong>Email:</strong> ${formData.email}</p>
                    <p><strong>Phone:</strong> ${formData.phone || "Not provided"}</p>
                    <p><strong>Subject:</strong> ${formData.subject}</p>
                    <h3>Message:</h3>
                    <p>${formData.message.replace(/\n/g, '<br>')}</p>
                `,
                from_name: "Emergency Tradesmen Website"
            });

            setSubmitted(true);
            toast({
                title: "Message sent!",
                description: "We'll get back to you as soon as possible.",
            });

        } catch (err) {
            console.warn("Primary email failed, falling back to Formspree:", err);
            // Fallback: Formspree (no backend needed)
            try {
                const response = await fetch("https://formspree.io/f/movgrbrz", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        _subject: `[Contact Form] ${formData.subject}`,
                        customer_name: formData.fullName,
                        customer_email: formData.email,
                        customer_phone: formData.phone || "Not provided",
                        message: formData.message,
                        lead_type: "site_contact_form_fallback"
                    })
                });

                if (response.ok) {
                    setSubmitted(true);
                    toast({
                        title: "Message sent!",
                        description: "We'll get back to you as soon as possible.",
                    });
                } else {
                    throw new Error("Formspree also failed");
                }
            } catch (fallbackErr) {
                console.error("Contact form error:", err, fallbackErr);
                setError("Failed to send message. Please try again or email us directly at " + getSupportEmail());
                toast({
                    title: "Error sending message",
                    description: `Please try again or email us directly at ${getSupportEmail()}`,
                    variant: "destructive"
                });
            }
        } finally {
            setIsSubmitting(false);
        }
        };

        if (submitted) {
            return (
                <>
                    <Header />
                    <main className="min-h-screen bg-background py-20">
                        <div className="container-wide max-w-2xl text-center">
                            <div className="bg-card border border-border rounded-2xl p-12">
                                <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle className="w-10 h-10 text-green-500" />
                                </div>
                                <h1 className="text-3xl font-display text-foreground mb-4">Message Sent!</h1>
                                <p className="text-muted-foreground mb-8">
                                    Thank you for contacting us. We've received your message and will get back to you
                                    within 24 hours.
                                </p>
                                <Link to="/">
                                    <Button variant="hero" size="lg">
                                        Return to Homepage
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </main>
                    <Footer />
                </>
            );
        }

        return (
            <>
                <SEO
                    title={isUSDomain ? "Contact Emergency Contractors — Get 24/7 Help Now" : "Contact Emergency Tradesmen — Get 24/7 Help Now"}
                    description={isUSDomain
                        ? "Need an emergency contractor? Contact us for fast, verified local plumbers, electricians & HVAC techs. Available 24/7 across the US. Call now for immediate help."
                        : "Need an emergency tradesman? Contact us for fast, verified local plumbers, electricians & locksmiths. Available 24/7 across the UK. Call now for immediate help."}
                    canonical="/contact"
                    jsonLd={breadcrumbSchema}
                    alternates={[
                        { lang: 'en-GB', href: 'https://emergencytradesmen.net/contact' },
                        { lang: 'en-US', href: 'https://emergencycontractors.net/contact' },
                        { lang: 'x-default', href: 'https://emergencytradesmen.net/contact' },
                    ]}
                />

                <Header />

                <main className="min-h-screen bg-background py-12 md:py-20">
                    <div className="container-wide max-w-6xl">
                        {/* Header */}
                        <div className="text-center mb-12">
                            <h1 className="text-4xl md:text-5xl font-display text-foreground mb-4">
                                Get in Touch
                            </h1>
                            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                                Have questions about our services or want to list your business?
                                We'd love to hear from you.
                            </p>
                        </div>

                        <div className="grid lg:grid-cols-5 gap-12 items-start">
                            {/* Left Side - Image and Info */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                                    <img
                                        src="/images/contact-profile.webp"
                                        alt="Professional tradesman at work"
                                        className="w-full aspect-[4/5] object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                                        <img src="/et-logo-v3.png" alt="Logo" loading="lazy" className="w-20 h-20 mb-4 object-contain transition-transform hover:scale-110 duration-500" />
                                        <h2 className="text-xl font-semibold mb-2">{getSiteName()}</h2>
                                        <p className="text-white/80 text-sm">
                                            Connecting you with trusted local {getSiteName().split(' ')[1].toLowerCase()} 24/7
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                                    <h2 className="font-semibold text-foreground">Why Contact Us?</h2>
                                    <ul className="space-y-3 text-sm text-muted-foreground">
                                        <li className="flex items-start gap-3">
                                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                            <span>Questions about our tradesman directory</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                            <span>List your business with us</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                            <span>Premium subscription enquiries</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                            <span>Partnerships and advertising</span>
                                        </li>
                                    </ul>
                                </div>

                                <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                                    <h2 className="font-semibold text-foreground">Connect With Us</h2>
                                    <div className="flex gap-4">
                                        <GlassSocialIcon platform="facebook" href="https://www.facebook.com/profile.php?id=61588024972553" className="w-12 h-12" />
                                        <GlassSocialIcon platform="instagram" href="https://www.instagram.com/emergencytradesmen/" className="w-12 h-12" />
                                        <GlassSocialIcon platform="twitter" href="https://x.com/etemergenc26245" className="w-12 h-12" />
                                        <GlassSocialIcon platform="tiktok" href="https://www.tiktok.com/@emergencytradesmen" className="w-12 h-12" />
                                    </div>
                                </div>
                            </div>

                            {/* Right Side - Contact Form */}
                            <div className="lg:col-span-3">
                                <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-8 shadow-lg">
                                    <div className="space-y-6">
                                        {/* Full Name */}
                                        <div>
                                            <label htmlFor="fullName" className="block text-sm font-medium text-foreground mb-2">
                                                Full Name <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                                <Input
                                                    id="fullName"
                                                    name="fullName"
                                                    value={formData.fullName}
                                                    onChange={handleChange}
                                                    placeholder="John Smith"
                                                    className={`pl-11 ${errors.fullName ? 'border-red-500' : ''}`}
                                                />
                                            </div>
                                            {errors.fullName && (
                                                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                                    <AlertCircle className="w-3 h-3" /> {errors.fullName}
                                                </p>
                                            )}
                                        </div>

                                        {/* Email */}
                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                                                Email Address <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                                <Input
                                                    id="email"
                                                    name="email"
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    placeholder="john@example.com"
                                                    className={`pl-11 ${errors.email ? 'border-red-500' : ''}`}
                                                />
                                            </div>
                                            {errors.email && (
                                                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                                    <AlertCircle className="w-3 h-3" /> {errors.email}
                                                </p>
                                            )}
                                        </div>

                                        {/* Phone (Optional) */}
                                        <div>
                                            <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
                                                Phone Number <span className="text-muted-foreground">(optional)</span>
                                            </label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                                <Input
                                                    id="phone"
                                                    name="phone"
                                                    type="tel"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    placeholder="07123 456789"
                                                    className="pl-11"
                                                />
                                            </div>
                                        </div>

                                        {/* Subject */}
                                        <div>
                                            <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-2">
                                                Subject <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                id="subject"
                                                name="subject"
                                                value={formData.subject}
                                                onChange={handleChange}
                                                placeholder="How can we help?"
                                                className={errors.subject ? 'border-red-500' : ''}
                                            />
                                            {errors.subject && (
                                                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                                    <AlertCircle className="w-3 h-3" /> {errors.subject}
                                                </p>
                                            )}
                                        </div>

                                        {/* Message */}
                                        <div>
                                            <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                                                Message <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                                                <Textarea
                                                    id="message"
                                                    name="message"
                                                    value={formData.message}
                                                    onChange={handleChange}
                                                    placeholder="Tell us more about your enquiry..."
                                                    rows={5}
                                                    className={`pl-11 resize-none ${errors.message ? 'border-red-500' : ''}`}
                                                />
                                            </div>
                                            {errors.message && (
                                                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                                    <AlertCircle className="w-3 h-3" /> {errors.message}
                                                </p>
                                            )}
                                        </div>

                                        {/* Honeypot - Hidden spam protection */}
                                        <input
                                            type="text"
                                            name="honeypot"
                                            value={formData.honeypot}
                                            onChange={handleChange}
                                            style={{ display: 'none' }}
                                            tabIndex={-1}
                                            autoComplete="off"
                                        />

                                        {/* Privacy Consent */}
                                        <div className="flex items-start gap-3">
                                            <Checkbox
                                                id="consent"
                                                checked={formData.consent}
                                                onCheckedChange={(checked) => {
                                                    setFormData(prev => ({ ...prev, consent: checked === true }));
                                                    if (errors.consent) {
                                                        setErrors(prev => ({ ...prev, consent: "" }));
                                                    }
                                                }}
                                                className={errors.consent ? 'border-red-500' : ''}
                                            />
                                            <div className="flex-1">
                                                <label htmlFor="consent" className="text-sm text-foreground cursor-pointer">
                                                    I agree to the{" "}
                                                    <Link to="/privacy" className="text-gold hover:underline">
                                                        Privacy Policy
                                                    </Link>{" "}
                                                    and consent to Emergency Tradesmen UK contacting me regarding my enquiry.
                                                    <span className="text-red-500"> *</span>
                                                </label>
                                                {errors.consent && (
                                                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                                        <AlertCircle className="w-3 h-3" /> {errors.consent}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Error Message */}
                                        {error && (
                                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
                                                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-red-500 font-medium">Error sending message</p>
                                                    <p className="text-red-400 text-sm">{error}</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Submit Button */}
                                        <Button
                                            type="submit"
                                            variant="hero"
                                            size="lg"
                                            disabled={isSubmitting}
                                            className="w-full"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                                                    Sending...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="w-5 h-5 mr-2" />
                                                    Send Message
                                                </>
                                            )}
                                        </Button>

                                        {/* Security Note */}
                                        <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
                                            <Shield className="w-4 h-4" />
                                            <span>Your information is secure and never shared</span>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </main>

                <section className="py-20 bg-background border-t border-border/50">
                    <div className="container-narrow">
                        <div className="text-center mb-12">
                            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">Frequently Asked Questions</h2>
                            <p className="text-muted-foreground text-lg">Quick answers to common questions about our service.</p>
                        </div>
                        <GeneralFAQSection showTitle={false} useContainer={true} />
                    </div>
                </section>

                <Footer />
            </>
        );
    }

