import { useState } from "react";
import { FileText, Upload, X, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import {
    QuoteFormData,
    urgencyOptions,
    validateQuoteForm,
} from "@/lib/quotes";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";

interface QuoteRequestModalProps {
    businessName: string;
    businessId: string;
    tradeName: string;
    variant?: "default" | "hero" | "outline";
    className?: string;
    triggerText?: string;
}

export function QuoteRequestModal({
    businessName,
    businessId,
    tradeName,
    variant = "default",
    className = "",
    triggerText = "Request Quote",
}: QuoteRequestModalProps) {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [formData, setFormData] = useState<Partial<QuoteFormData>>({
        urgency: "today",
        preferredContactMethod: "either",
    });
    const [errors, setErrors] = useState<Partial<Record<keyof QuoteFormData, string>>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const updateField = (field: keyof QuoteFormData, value: string) => {
        setFormData({ ...formData, [field]: value });
        // Clear error for this field when user starts typing
        if (errors[field]) {
            setErrors({ ...errors, [field]: undefined });
        }
    };

    const handleNext = () => {
        if (step === 1) {
            // Validate urgency and service type
            const stepErrors: Partial<Record<keyof QuoteFormData, string>> = {};
            if (!formData.urgency) stepErrors.urgency = "Please select urgency";
            if (!formData.serviceType) stepErrors.serviceType = "Please select service type";
            if (!formData.description || formData.description.length < 20) {
                stepErrors.description = "Please provide at least 20 characters";
            }

            if (Object.keys(stepErrors).length > 0) {
                setErrors(stepErrors);
                return;
            }
            setStep(2);
        } else if (step === 2) {
            // Validate contact details
            const validation = validateQuoteForm(formData);
            if (!validation.isValid) {
                setErrors(validation.errors);
                return;
            }
            setStep(3);
        }
    };

    const handleBack = () => {
        if (step > 1) setStep((step - 1) as 1 | 2);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validation = validateQuoteForm(formData);
        if (!validation.isValid) {
            setErrors(validation.errors);
            toast({
                title: "Please check your details",
                description: "Some required fields are missing or invalid",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);
        try {
            await db.quotes.create({
                businessId,
                businessName,
                tradeName,
                urgency: formData.urgency || "today",
                description: formData.description || "",
                contact: {
                    name: formData.name || "",
                    phone: formData.phone || "",
                    email: formData.email || "",
                    postcode: formData.postcode || "",
                }
            });

            toast({
                title: "Quote request sent!",
                description: "The business will contact you shortly with a quote.",
            });

            // Reset and close
            setFormData({ urgency: "today", preferredContactMethod: "either" });
            setErrors({});
            setStep(1);
            setOpen(false);
        } catch (error) {
            console.error("Failed to submit quote:", error);
            toast({
                title: "Error submitting request",
                description: "Please try again later.",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectedUrgency = urgencyOptions.find((opt) => opt.value === formData.urgency);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant={variant} className={className}>
                    <FileText className="w-4 h-4 mr-2" />
                    {triggerText}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="font-display text-2xl tracking-wide">
                        Request a Quote from {businessName}
                    </DialogTitle>
                    <DialogDescription>
                        Fill in the details below and we'll get you a quote as soon as possible
                    </DialogDescription>
                </DialogHeader>

                {/* Progress Steps */}
                <div className="flex items-center justify-between mb-6 px-4">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center flex-1">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${s === step
                                    ? "bg-gold text-gold-foreground"
                                    : s < step
                                        ? "bg-gold/30 text-gold"
                                        : "bg-secondary text-muted-foreground"
                                    }`}
                            >
                                {s < step ? <CheckCircle2 className="w-5 h-5" /> : s}
                            </div>
                            {s < 3 && (
                                <div
                                    className={`flex-1 h-0.5 mx-2 ${s < step ? "bg-gold" : "bg-secondary"
                                        }`}
                                />
                            )}
                        </div>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Step 1: Job Details */}
                    {step === 1 && (
                        <div className="space-y-6 animate-fade-up">
                            <div>
                                <h3 className="text-lg font-medium mb-4">Tell us about your job</h3>

                                {/* Urgency */}
                                <div className="space-y-3 mb-6">
                                    <Label className="text-base">How urgent is this? *</Label>
                                    <RadioGroup
                                        value={formData.urgency}
                                        onValueChange={(value: any) => updateField("urgency", value)}
                                    >
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {urgencyOptions.map((option) => (
                                                <label
                                                    key={option.value}
                                                    className={`relative flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${formData.urgency === option.value
                                                        ? "border-gold bg-gold/5"
                                                        : "border-border/50 hover:border-gold/30"
                                                        }`}
                                                >
                                                    <RadioGroupItem value={option.value} className="mt-1" />
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-medium text-foreground">
                                                                {option.label}
                                                            </span>
                                                            <Badge variant="outline" className={option.badge}>
                                                                {option.value === "emergency" && "🚨"}
                                                                {option.value === "today" && "⚡"}
                                                                {option.value === "this-week" && "📅"}
                                                                {option.value === "flexible" && "💰"}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">
                                                            {option.description}
                                                        </p>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </RadioGroup>
                                    {errors.urgency && (
                                        <p className="text-sm text-destructive flex items-center gap-1">
                                            <AlertCircle className="w-4 h-4" />
                                            {errors.urgency}
                                        </p>
                                    )}
                                </div>

                                {/* Service Type */}
                                <div className="space-y-2 mb-6">
                                    <Label htmlFor="serviceType">What service do you need? *</Label>
                                    <Select
                                        value={formData.serviceType}
                                        onValueChange={(value) => updateField("serviceType", value)}
                                    >
                                        <SelectTrigger id="serviceType" className="bg-card border-border/50">
                                            <SelectValue placeholder="Select service type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="emergency-repair">Emergency Repair</SelectItem>
                                            <SelectItem value="installation">Installation</SelectItem>
                                            <SelectItem value="maintenance">Maintenance</SelectItem>
                                            <SelectItem value="inspection">Inspection</SelectItem>
                                            <SelectItem value="replacement">Replacement</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.serviceType && (
                                        <p className="text-sm text-destructive flex items-center gap-1">
                                            <AlertCircle className="w-4 h-4" />
                                            {errors.serviceType}
                                        </p>
                                    )}
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                    <Label htmlFor="description">Describe the issue *</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description || ""}
                                        onChange={(e) => updateField("description", e.target.value)}
                                        placeholder={`E.g., "Burst pipe in the kitchen, water leaking from under the sink..."`}
                                        rows={5}
                                        className="bg-card border-border/50 resize-none"
                                    />
                                    <div className="flex items-center justify-between text-xs">
                                        <span
                                            className={
                                                (formData.description?.length || 0) < 20
                                                    ? "text-muted-foreground"
                                                    : "text-green-500"
                                            }
                                        >
                                            {formData.description?.length || 0}/20 characters minimum
                                        </span>
                                    </div>
                                    {errors.description && (
                                        <p className="text-sm text-destructive flex items-center gap-1">
                                            <AlertCircle className="w-4 h-4" />
                                            {errors.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Contact Details */}
                    {step === 2 && (
                        <div className="space-y-6 animate-fade-up">
                            <h3 className="text-lg font-medium mb-4">Your contact details</h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 sm:col-span-1 space-y-2">
                                    <Label htmlFor="name">Full Name *</Label>
                                    <Input
                                        id="name"
                                        value={formData.name || ""}
                                        onChange={(e) => updateField("name", e.target.value)}
                                        placeholder="John Smith"
                                        className="bg-card border-border/50"
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-destructive flex items-center gap-1">
                                            <AlertCircle className="w-4 h-4" />
                                            {errors.name}
                                        </p>
                                    )}
                                </div>

                                <div className="col-span-2 sm:col-span-1 space-y-2">
                                    <Label htmlFor="phone">Phone Number *</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={formData.phone || ""}
                                        onChange={(e) => updateField("phone", e.target.value)}
                                        placeholder="07123 456789"
                                        className="bg-card border-border/50"
                                    />
                                    {errors.phone && (
                                        <p className="text-sm text-destructive flex items-center gap-1">
                                            <AlertCircle className="w-4 h-4" />
                                            {errors.phone}
                                        </p>
                                    )}
                                </div>

                                <div className="col-span-2 sm:col-span-1 space-y-2">
                                    <Label htmlFor="email">Email Address *</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email || ""}
                                        onChange={(e) => updateField("email", e.target.value)}
                                        placeholder="john@example.com"
                                        className="bg-card border-border/50"
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-destructive flex items-center gap-1">
                                            <AlertCircle className="w-4 h-4" />
                                            {errors.email}
                                        </p>
                                    )}
                                </div>

                                <div className="col-span-2 sm:col-span-1 space-y-2">
                                    <Label htmlFor="postcode">Postcode *</Label>
                                    <Input
                                        id="postcode"
                                        value={formData.postcode || ""}
                                        onChange={(e) => updateField("postcode", e.target.value.toUpperCase())}
                                        placeholder="SW1A 1AA"
                                        className="bg-card border-border/50"
                                    />
                                    {errors.postcode && (
                                        <p className="text-sm text-destructive flex items-center gap-1">
                                            <AlertCircle className="w-4 h-4" />
                                            {errors.postcode}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Preferred Contact Method */}
                            <div className="space-y-2">
                                <Label>How would you like to be contacted? *</Label>
                                <RadioGroup
                                    value={formData.preferredContactMethod}
                                    onValueChange={(value: any) =>
                                        updateField("preferredContactMethod", value)
                                    }
                                >
                                    <div className="flex gap-3">
                                        <label className="flex items-center gap-2 flex-1 p-3 rounded-lg border border-border/50 cursor-pointer hover:border-gold/30">
                                            <RadioGroupItem value="phone" />
                                            <span className="text-sm">Phone</span>
                                        </label>
                                        <label className="flex items-center gap-2 flex-1 p-3 rounded-lg border border-border/50 cursor-pointer hover:border-gold/30">
                                            <RadioGroupItem value="email" />
                                            <span className="text-sm">Email</span>
                                        </label>
                                        <label className="flex items-center gap-2 flex-1 p-3 rounded-lg border border-border/50 cursor-pointer hover:border-gold/30">
                                            <RadioGroupItem value="either" />
                                            <span className="text-sm">Either</span>
                                        </label>
                                    </div>
                                </RadioGroup>
                            </div>

                            {/* Preferred Time */}
                            <div className="space-y-2">
                                <Label htmlFor="preferredTime">Preferred contact time (optional)</Label>
                                <Input
                                    id="preferredTime"
                                    value={formData.preferredTime || ""}
                                    onChange={(e) => updateField("preferredTime", e.target.value)}
                                    placeholder="E.g., Weekday mornings, After 6pm"
                                    className="bg-card border-border/50"
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 3: Review & Submit */}
                    {step === 3 && (
                        <div className="space-y-6 animate-fade-up">
                            <h3 className="text-lg font-medium mb-4">Review your quote request</h3>

                            <div className="bg-secondary/30 rounded-lg p-6 space-y-4">
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Urgency</p>
                                    <Badge variant="outline" className={selectedUrgency?.badge}>
                                        {selectedUrgency?.label}
                                    </Badge>
                                </div>

                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Service Type</p>
                                    <p className="font-medium">{formData.serviceType}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Description</p>
                                    <p className="text-sm">{formData.description}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/30">
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Name</p>
                                        <p className="font-medium">{formData.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Phone</p>
                                        <p className="font-medium">{formData.phone}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Email</p>
                                        <p className="font-medium">{formData.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Postcode</p>
                                        <p className="font-medium">{formData.postcode}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gold/10 border border-gold/30 rounded-lg p-4">
                                <p className="text-sm text-foreground">
                                    <strong>What happens next?</strong> {businessName} will review your request
                                    and contact you within {formData.urgency === "emergency" ? "30 minutes" : formData.urgency === "today" ? "2 hours" : "24 hours"} with a quote.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t border-border/30">
                        {step > 1 && (
                            <Button type="button" variant="outline" onClick={handleBack}>
                                Back
                            </Button>
                        )}
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setOpen(false);
                                setStep(1);
                                setFormData({ urgency: "today", preferredContactMethod: "either" });
                                setErrors({});
                            }}
                            className="ml-auto"
                        >
                            Cancel
                        </Button>
                        {step < 3 ? (
                            <Button
                                type="button"
                                onClick={handleNext}
                                className="bg-gold hover:bg-gold/90 text-gold-foreground"
                            >
                                Next Step
                            </Button>
                        ) : (
                            <Button
                                type="submit"
                                className="bg-gold hover:bg-gold/90 text-gold-foreground"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Sending..." : "Submit Request"}
                            </Button>
                        )}
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
