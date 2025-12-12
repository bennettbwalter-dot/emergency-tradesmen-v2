import { useState } from "react";
import { Send, Mail, Phone, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface ContactFormProps {
    businessName?: string;
    businessEmail?: string;
    businessPhone?: string;
}

export function ChatSystem({ businessName, businessEmail, businessPhone }: ContactFormProps = {}) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [name, setName] = useState(user?.name || "");
    const [email, setEmail] = useState(user?.email || "");
    const [phone, setPhone] = useState(user?.phone || "");
    const [message, setMessage] = useState("");
    const [isSending, setIsSending] = useState(false);

    // Default to platform support if no business specified
    const recipientEmail = businessEmail || "emergencytradesmen@outlook.com";
    const recipientName = businessName || "Emergency Tradesmen Support";

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim() || !email.trim() || !message.trim()) {
            toast({
                title: "Missing Information",
                description: "Please fill in all required fields.",
                variant: "destructive"
            });
            return;
        }

        setIsSending(true);

        // Create mailto link with pre-filled content
        const subject = encodeURIComponent(`Inquiry from ${name} via Emergency Tradesmen`);
        const body = encodeURIComponent(
            `New inquiry from Emergency Tradesmen website:\n\n` +
            `Name: ${name}\n` +
            `Email: ${email}\n` +
            `Phone: ${phone || "Not provided"}\n\n` +
            `Message:\n${message}\n\n` +
            `---\n` +
            `Sent via Emergency Tradesmen UK`
        );

        const mailtoLink = `mailto:${recipientEmail}?subject=${subject}&body=${body}`;

        // Open email client
        window.location.href = mailtoLink;

        // Show success message
        setTimeout(() => {
            toast({
                title: "Opening Email Client",
                description: "Your default email app should open. Click send to complete your message."
            });
            setIsSending(false);
        }, 500);
    };

    return (
        <div className="max-w-2xl mx-auto">
            <Card>
                <CardHeader className="text-center">
                    <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Mail className="w-8 h-8 text-gold" />
                    </div>
                    <CardTitle className="text-2xl">Contact {recipientName}</CardTitle>
                    <CardDescription>
                        Send your inquiry via email. We typically respond within 24 hours.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="contact-name">Your Name *</Label>
                                <Input
                                    id="contact-name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="John Smith"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="contact-email">Your Email *</Label>
                                <Input
                                    id="contact-email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="john@example.com"
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="contact-phone">Your Phone (Optional)</Label>
                            <Input
                                id="contact-phone"
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="+44 7123 456789"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="contact-message">Your Message *</Label>
                            <Textarea
                                id="contact-message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Describe your inquiry, the service you need, or any questions..."
                                rows={5}
                                required
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full bg-gold hover:bg-gold/90 text-gold-foreground h-12 text-lg"
                            disabled={isSending}
                        >
                            <Send className="w-5 h-5 mr-2" />
                            {isSending ? "Opening Email..." : "Send via Email"}
                        </Button>
                    </form>

                    {/* Alternative contact methods */}
                    <div className="mt-8 pt-6 border-t border-border/50">
                        <p className="text-center text-muted-foreground text-sm mb-4">
                            Need urgent help? Contact us directly:
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <a
                                href={`mailto:${recipientEmail}`}
                                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-gold transition-colors"
                            >
                                <Mail className="w-4 h-4" />
                                {recipientEmail}
                            </a>
                            {businessPhone && (
                                <a
                                    href={`tel:${businessPhone}`}
                                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-gold transition-colors"
                                >
                                    <Phone className="w-4 h-4" />
                                    {businessPhone}
                                </a>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
