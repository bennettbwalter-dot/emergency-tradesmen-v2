import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, User, MessageSquare, Send, CheckCircle, AlertCircle, Shield } from "lucide-react";
import { Link } from "react-router-dom";

export default function ContactPage() {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
            console.log("Bot detected");
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
            // Using Formspree for email delivery
            const response = await fetch("https://formspree.io/f/movgrbrz", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: formData.fullName,
                    email: formData.email,
                    phone: formData.phone || "Not provided",
                    subject: formData.subject,
                    message: formData.message,
                    _subject: `[Emergency Tradesmen] ${formData.subject}`
                })
            });

            if (response.ok) {
                setSubmitted(true);
                toast({
                    title: "Message sent!",
                    description: "We'll get back to you as soon as possible.",
                });
            } else {
                throw new Error("Failed to send message");
            }
        } catch (err) {
            setError("Failed to send message. Please try again or email us directly.");
            toast({
                title: "Error sending message",
                description: "Please try again or email us directly at emergencytradesmen@outlook.com",
                variant: "destructive"
            });
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
            <Helmet>
                <title>Contact Us | Emergency Tradesmen UK</title>
                <meta
                    name="description"
                    content="Get in touch with Emergency Tradesmen UK. We're here to help with any questions about our services or business listings."
                />
            </Helmet>

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
                                    src="/images/contact-profile.jpg"
                                    alt="Professional tradesman at work"
                                    className="w-full aspect-[4/5] object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                                    <h3 className="text-xl font-semibold mb-2">Emergency Tradesmen UK</h3>
                                    <p className="text-white/80 text-sm">
                                        Connecting you with trusted local tradesmen 24/7
                                    </p>
                                </div>
                            </div>

                            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                                <h3 className="font-semibold text-foreground">Why Contact Us?</h3>
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

            <Footer />
        </>
    );
}

