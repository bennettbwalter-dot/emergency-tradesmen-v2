import { useState } from "react";
import { FileText, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { trackEvent } from "@/lib/analytics";
import { useLocalization } from "@/contexts/LocalizationContext";

interface FloatingQuoteButtonProps {
    tradeName: string;
    city: string;
}

export function FloatingQuoteButton({ tradeName, city }: FloatingQuoteButtonProps) {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    const { settings } = useLocalization();

    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        postcode: "",
        description: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.phone || !formData.description) {
            toast({
                title: "Missing required fields",
                description: "Please fill in your name, phone number, and job description.",
                variant: "destructive",
            });
            return;
        }

        if (formData.description.length < 20) {
            toast({
                title: "More details needed",
                description: "Please describe your issue in at least 20 characters.",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);
        try {
            // TODO: Store in quotes table when backend is ready
            // For now, track the conversion
            trackEvent("Conversion", "General Quote Request", `${tradeName} in ${city}`);

            toast({
                title: "Quote request received!",
                description: `${settings.tradeTerm} in ${city} will contact you shortly.`,
            });

            // Reset form
            setFormData({ name: "", phone: "", email: "", postcode: "", description: "" });
            setOpen(false);
        } catch (error) {
            toast({
                title: "Error submitting request",
                description: "Please try again or call directly.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {/* Floating Button - Fixed bottom-left on mobile, right side on desktop */}
            <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1.5, duration: 0.3 }}
                onClick={() => setOpen(true)}
                className="fixed bottom-20 left-4 md:bottom-8 md:left-8 z-50 flex items-center gap-2 bg-gold text-black px-4 py-3 rounded-full shadow-lg hover:bg-gold/90 transition-all font-bold text-sm"
                aria-label="Request a quote"
            >
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Request Quote</span>
            </motion.button>

            {/* Quote Modal */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="font-display text-2xl tracking-wide">
                            Request a Quote
                        </DialogTitle>
                        <DialogDescription>
                            Describe your {tradeName.toLowerCase()} job and local {settings.tradeTerm.toLowerCase()}s will get back to you with pricing.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Non-Emergency Notice */}
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3">
                        <p className="text-sm text-amber-700 dark:text-amber-400">
                            ⚠️ <strong>For emergencies, call immediately.</strong> This form is for non-urgent work only.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5 mt-2">
                        {/* Name & Phone */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="quote-name">Full Name *</Label>
                                <Input
                                    id="quote-name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="John Smith"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="quote-phone">Phone Number *</Label>
                                <Input
                                    id="quote-phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="07123 456789"
                                />
                            </div>
                        </div>

                        {/* Email & Postcode */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="quote-email">Email</Label>
                                <Input
                                    id="quote-email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="john@example.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="quote-postcode">{settings.postcodeTerm}</Label>
                                <Input
                                    id="quote-postcode"
                                    value={formData.postcode}
                                    onChange={(e) => setFormData({ ...formData, postcode: e.target.value.toUpperCase() })}
                                    placeholder={settings.postcodeTerm === "Postcode" ? "SW1A 1AA" : "10001"}
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="quote-description">Describe your job *</Label>
                            <Textarea
                                id="quote-description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder={`E.g., "Need a new ${tradeName.toLowerCase()} installed in my kitchen..."`}
                                rows={4}
                                className="resize-none"
                            />
                            <p className="text-xs text-muted-foreground">
                                {(formData.description.length < 20 ? `${formData.description.length}/20 minimum` : `${formData.description.length} characters ✓`)}
                            </p>
                        </div>

                        {/* Submit */}
                        <div className="flex gap-3 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1"
                                onClick={() => setOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 bg-gold text-black hover:bg-gold/90 font-bold"
                            >
                                {isSubmitting ? "Submitting..." : "Submit Request"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
