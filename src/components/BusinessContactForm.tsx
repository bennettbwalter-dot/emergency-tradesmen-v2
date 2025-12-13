import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Mail, User, Phone, Send, CheckCircle, AlertCircle, MessageSquare, Crown } from "lucide-react";
import { Link } from "react-router-dom";

interface BusinessContactFormProps {
    businessId: string;
    businessName: string;
    businessEmail?: string; // If tradesman has email registered
    ownerUserId?: string;
}

export function BusinessContactForm({ businessId, businessName, businessEmail, ownerUserId }: BusinessContactFormProps) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        message: "",
        consent: false,
        honeypot: "", // Spam protection
        businessId: businessId,
        businessName: businessName
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateEmail = (email: string) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = "Name is required";
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!validateEmail(formData.email)) {
            newErrors.email = "Invalid email format";
        }

        if (!formData.message.trim()) {
            newErrors.message = "Message is required";
        } else if (formData.message.length < 10) {
            newErrors.message = "Message too short";
        }

        if (!formData.consent) {
            newErrors.consent = "Consent required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: "" }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Honeypot check
        if (formData.honeypot) {
            setSubmitted(true);
            return;
        }

        if (!validateForm()) {
            toast({
                title: "Please fix errors",
                description: "Some fields need attention.",
                variant: "destructive"
            });
            return;
        }

        setIsSubmitting(true);

        try {
            // Send to YOUR Formspree - you'll get all business enquiries
            // with the business name included so you can forward appropriately
            const response = await fetch("https://formspree.io/f/movgrbrz", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    _subject: `[Business Lead] Enquiry for ${businessName}`,
                    customer_name: formData.name,
                    customer_email: formData.email,
                    customer_phone: formData.phone || "Not provided",
                    message: formData.message,
                    business_id: businessId,
                    business_name: businessName,
                    lead_type: "premium_business_contact"
                })
            });

            if (response.ok) {
                setSubmitted(true);
                toast({
                    title: "Message sent!",
                    description: `Your enquiry has been sent to ${businessName}.`,
                });
            } else {
                throw new Error("Failed to send");
            }
        } catch (err) {
            toast({
                title: "Error sending message",
                description: "Please try again or call the business directly.",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="bg-card rounded-xl border border-green-500/30 p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Enquiry Sent!</h3>
                <p className="text-sm text-muted-foreground">
                    {businessName} will get back to you soon.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-card rounded-xl border border-gold/30 p-6 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
                <Crown className="w-5 h-5 text-gold" />
                <h3 className="font-display text-lg font-semibold">Contact This Business</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
                Send a message directly to {businessName}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Your Name *"
                            className={`pl-9 ${errors.name ? 'border-red-500' : ''}`}
                        />
                    </div>
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                {/* Email */}
                <div>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Your Email *"
                            className={`pl-9 ${errors.email ? 'border-red-500' : ''}`}
                        />
                    </div>
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                {/* Phone */}
                <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Phone (optional)"
                        className="pl-9"
                    />
                </div>

                {/* Message */}
                <div>
                    <div className="relative">
                        <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <Textarea
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            placeholder="Describe what you need help with... *"
                            rows={3}
                            className={`pl-9 resize-none ${errors.message ? 'border-red-500' : ''}`}
                        />
                    </div>
                    {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
                </div>

                {/* Honeypot */}
                <input
                    type="text"
                    name="honeypot"
                    value={formData.honeypot}
                    onChange={handleChange}
                    style={{ display: 'none' }}
                    tabIndex={-1}
                />

                {/* Consent */}
                <div className="flex items-start gap-2">
                    <Checkbox
                        id="business-consent"
                        checked={formData.consent}
                        onCheckedChange={(checked) => {
                            setFormData(prev => ({ ...prev, consent: checked === true }));
                            if (errors.consent) setErrors(prev => ({ ...prev, consent: "" }));
                        }}
                        className={errors.consent ? 'border-red-500' : ''}
                    />
                    <label htmlFor="business-consent" className="text-xs text-muted-foreground leading-tight cursor-pointer">
                        I agree to the <Link to="/privacy" className="text-gold hover:underline">Privacy Policy</Link>
                    </label>
                </div>
                {errors.consent && <p className="text-red-500 text-xs">{errors.consent}</p>}

                {/* Submit */}
                <Button
                    type="submit"
                    variant="hero"
                    disabled={isSubmitting}
                    className="w-full"
                >
                    {isSubmitting ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                            Sending...
                        </>
                    ) : (
                        <>
                            <Send className="w-4 h-4 mr-2" />
                            Send Enquiry
                        </>
                    )}
                </Button>
            </form>
        </div>
    );
}
