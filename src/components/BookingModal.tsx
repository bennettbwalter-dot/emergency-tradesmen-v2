import { useState } from "react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/AuthModal";
import {
    Calendar,
    Clock,
    CheckCircle2,
    AlertCircle,
    CalendarDays,
    FileText,
    User as UserIcon,
    MapPin,
    Phone,
    Mail,
    Zap,
} from "lucide-react";
import {
    BookingFormData,
    BookingUrgency,
    validateBookingForm,
    createBooking,
    saveBooking,
    generateTimeSlots,
    getAvailableDates,
    formatBookingDate,
    formatTimeSlot,
    getUrgencyColor,
} from "@/lib/bookings";

interface BookingModalProps {
    businessName: string;
    businessId: string;
    tradeName: string;
    variant?: "default" | "outline" | "ghost" | "hero";
    className?: string;
}

const urgencyOptions = [
    {
        value: "emergency" as BookingUrgency,
        label: "Emergency",
        description: "Need help right now",
        badge: "text-red-600",
        icon: "🚨",
    },
    {
        value: "same-day" as BookingUrgency,
        label: "Same Day",
        description: "Today if possible",
        badge: "text-orange-600",
        icon: "⚡",
    },
    {
        value: "next-day" as BookingUrgency,
        label: "Next Day",
        description: "Tomorrow works",
        badge: "text-yellow-600",
        icon: "📅",
    },
    {
        value: "scheduled" as BookingUrgency,
        label: "Scheduled",
        description: "Plan ahead",
        badge: "text-blue-600",
        icon: "📆",
    },
];

export function BookingModal({
    businessName,
    businessId,
    tradeName,
    variant = "default",
    className = "",
}: BookingModalProps) {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
    const [formData, setFormData] = useState<Partial<BookingFormData>>({
        businessId,
        businessName,
        tradeName,
        urgency: "scheduled",
        preferredContactMethod: "either",
    });
    const [errors, setErrors] = useState<Partial<Record<keyof BookingFormData, string>>>({});
    const { toast } = useToast();
    const { user, isAuthenticated } = useAuth();

    const [availableDates, setAvailableDates] = useState<Date[]>([]);
    const [timeSlots, setTimeSlots] = useState<ReturnType<typeof generateTimeSlots>>([]);

    const updateField = (field: keyof BookingFormData, value: string) => {
        setFormData({ ...formData, [field]: value });
        if (errors[field]) {
            setErrors({ ...errors, [field]: undefined });
        }

        // Update available dates when urgency changes
        if (field === "urgency") {
            const urgencyValue = value as BookingUrgency;
            const dates = getAvailableDates(urgencyValue);
            setAvailableDates(dates);
            setFormData(prev => ({ ...prev, urgency: urgencyValue, date: "", timeSlot: "" }));
        }

        // Generate time slots when date is selected
        if (field === "date") {
            const selectedDate = new Date(value);
            const slots = generateTimeSlots(selectedDate);
            setTimeSlots(slots);
            setFormData(prev => ({ ...prev, date: value, timeSlot: "" }));
        }
    };

    const handleNext = () => {
        if (step === 1) {
            const stepErrors: Partial<Record<keyof BookingFormData, string>> = {};
            if (!formData.urgency) stepErrors.urgency = "Please select urgency";
            if (!formData.date) stepErrors.date = "Please select a date";
            if (!formData.timeSlot) stepErrors.timeSlot = "Please select a time slot";

            if (Object.keys(stepErrors).length > 0) {
                setErrors(stepErrors);
                return;
            }
            setStep(2);
        } else if (step === 2) {
            const stepErrors: Partial<Record<keyof BookingFormData, string>> = {};
            if (!formData.serviceType) stepErrors.serviceType = "Please select service type";
            if (!formData.description || formData.description.length < 20) {
                stepErrors.description = "Please provide at least 20 characters";
            }

            if (Object.keys(stepErrors).length > 0) {
                setErrors(stepErrors);
                return;
            }
            setStep(3);
        } else if (step === 3) {
            const validation = validateBookingForm(formData);
            if (!validation.isValid) {
                setErrors(validation.errors);
                return;
            }
            setStep(4);
        }
    };

    const handleBack = () => {
        if (step > 1) setStep((step - 1) as 1 | 2 | 3);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!isAuthenticated || !user) {
            toast({
                title: "Please log in",
                description: "You need to be logged in to make a booking",
                variant: "destructive",
            });
            return;
        }

        const validation = validateBookingForm(formData);
        if (!validation.isValid) {
            setErrors(validation.errors);
            toast({
                title: "Please check your details",
                description: "Some required fields are missing or invalid",
                variant: "destructive",
            });
            return;
        }

        const booking = createBooking(formData as BookingFormData, user.id);
        saveBooking(booking);

        toast({
            title: "Booking confirmed!",
            description: `Your appointment with ${businessName} is scheduled for ${formatBookingDate(booking.date)} at ${formatTimeSlot(booking.timeSlot)}`,
        });

        // Reset and close
        setFormData({
            businessId,
            businessName,
            tradeName,
            urgency: "scheduled",
            preferredContactMethod: "either",
        });
        setErrors({});
        setStep(1);
        setOpen(false);
    };

    // Initialize available dates on open
    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
        if (newOpen && formData.urgency) {
            const dates = getAvailableDates(formData.urgency);
            setAvailableDates(dates);
        }
    };

    if (!isAuthenticated) {
        return (
            <AuthModal
                trigger={
                    <Button variant={variant} className={className}>
                        <CalendarDays className="w-4 h-4 mr-2" />
                        Book Appointment
                    </Button>
                }
                defaultTab="login"
            />
        );
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant={variant} className={className}>
                    <CalendarDays className="w-4 h-4 mr-2" />
                    Book Appointment
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="font-display text-2xl tracking-wide">
                        Book Appointment with {businessName}
                    </DialogTitle>
                    <DialogDescription>
                        Schedule a visit from our {tradeName} at a time that suits you
                    </DialogDescription>
                </DialogHeader>

                {/* Progress Steps */}
                <div className="flex items-center justify-between mb-6 px-4">
                    {[1, 2, 3, 4].map((s) => (
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
                            {s < 4 && (
                                <div
                                    className={`flex-1 h-0.5 mx-2 ${s < step ? "bg-gold" : "bg-secondary"
                                        }`}
                                />
                            )}
                        </div>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Step 1: Date & Time */}
                    {step === 1 && (
                        <div className="space-y-6 animate-fade-up">
                            <div>
                                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-gold" />
                                    When do you need service?
                                </h3>

                                {/* Urgency Selection */}
                                <div className="space-y-3 mb-6">
                                    <Label className="text-base">Urgency Level *</Label>
                                    <RadioGroup
                                        value={formData.urgency}
                                        onValueChange={(value: BookingUrgency) => updateField("urgency", value)}
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
                                                            <Badge variant="outline" className={getUrgencyColor(option.value)}>
                                                                {option.icon}
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

                                {/* Date Selection */}
                                {availableDates.length > 0 && (
                                    <div className="space-y-3 mb-6">
                                        <Label className="text-base">Select Date *</Label>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            {availableDates.map((date) => {
                                                const dateString = date.toISOString().split("T")[0];
                                                const isSelected = formData.date === dateString;
                                                return (
                                                    <button
                                                        key={dateString}
                                                        type="button"
                                                        onClick={() => updateField("date", dateString)}
                                                        className={`p-4 rounded-lg border-2 text-left transition-all ${isSelected
                                                            ? "border-gold bg-gold/5"
                                                            : "border-border/50 hover:border-gold/30"
                                                            }`}
                                                    >
                                                        <div className="font-medium">
                                                            {date.toLocaleDateString("en-GB", { weekday: "short" })}
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {date.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        {errors.date && (
                                            <p className="text-sm text-destructive flex items-center gap-1">
                                                <AlertCircle className="w-4 h-4" />
                                                {errors.date}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Time Slot Selection */}
                                {timeSlots.length > 0 && (
                                    <div className="space-y-3">
                                        <Label className="text-base flex items-center gap-2">
                                            <Clock className="w-4 h-4" />
                                            Select Time Slot *
                                        </Label>
                                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-64 overflow-y-auto p-2 bg-secondary/20 rounded-lg">
                                            {timeSlots.map((slot) => (
                                                <button
                                                    key={slot.id}
                                                    type="button"
                                                    disabled={!slot.available}
                                                    onClick={() => updateField("timeSlot", slot.time)}
                                                    className={`p-3 rounded-lg border text-sm font-medium transition-all ${formData.timeSlot === slot.time
                                                        ? "border-gold bg-gold text-gold-foreground"
                                                        : slot.available
                                                            ? "border-border/50 hover:border-gold/30 bg-card"
                                                            : "border-border/30 bg-secondary/50 text-muted-foreground cursor-not-allowed opacity-50"
                                                        }`}
                                                >
                                                    {formatTimeSlot(slot.time)}
                                                </button>
                                            ))}
                                        </div>
                                        {errors.timeSlot && (
                                            <p className="text-sm text-destructive flex items-center gap-1">
                                                <AlertCircle className="w-4 h-4" />
                                                {errors.timeSlot}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Service Details */}
                    {step === 2 && (
                        <div className="space-y-6 animate-fade-up">
                            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-gold" />
                                What service do you need?
                            </h3>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="serviceType">Service Type *</Label>
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
                                            <SelectItem value="consultation">Consultation</SelectItem>
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

                                <div className="space-y-2">
                                    <Label htmlFor="description">Describe Your Needs *</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description || ""}
                                        onChange={(e) => updateField("description", e.target.value)}
                                        placeholder="Please describe what you need help with in detail..."
                                        rows={6}
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

                                <div className="space-y-2">
                                    <Label htmlFor="specialRequirements">Special Requirements (Optional)</Label>
                                    <Textarea
                                        id="specialRequirements"
                                        value={formData.specialRequirements || ""}
                                        onChange={(e) => updateField("specialRequirements", e.target.value)}
                                        placeholder="Any special access requirements, parking info, or other notes..."
                                        rows={3}
                                        className="bg-card border-border/50 resize-none"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Contact Details */}
                    {step === 3 && (
                        <div className="space-y-6 animate-fade-up">
                            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                                <UserIcon className="w-5 h-5 text-gold" />
                                Your Contact Information
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name *</Label>
                                    <Input
                                        id="name"
                                        value={formData.name || user?.name || ""}
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

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address *</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email || user?.email || ""}
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

                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number *</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={formData.phone || user?.phone || ""}
                                        onChange={(e) => updateField("phone", e.target.value)}
                                        placeholder="+44 7123 456789"
                                        className="bg-card border-border/50"
                                    />
                                    {errors.phone && (
                                        <p className="text-sm text-destructive flex items-center gap-1">
                                            <AlertCircle className="w-4 h-4" />
                                            {errors.phone}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="postcode">Postcode *</Label>
                                    <Input
                                        id="postcode"
                                        value={formData.postcode || user?.postcode || ""}
                                        onChange={(e) => updateField("postcode", e.target.value)}
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

                                <div className="md:col-span-2 space-y-2">
                                    <Label htmlFor="address">Full Address *</Label>
                                    <Input
                                        id="address"
                                        value={formData.address || ""}
                                        onChange={(e) => updateField("address", e.target.value)}
                                        placeholder="123 Main Street, London"
                                        className="bg-card border-border/50"
                                    />
                                    {errors.address && (
                                        <p className="text-sm text-destructive flex items-center gap-1">
                                            <AlertCircle className="w-4 h-4" />
                                            {errors.address}
                                        </p>
                                    )}
                                </div>

                                <div className="md:col-span-2 space-y-3">
                                    <Label>Preferred Contact Method *</Label>
                                    <RadioGroup
                                        value={formData.preferredContactMethod}
                                        onValueChange={(value: any) => updateField("preferredContactMethod", value)}
                                        className="flex gap-4"
                                    >
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <RadioGroupItem value="phone" />
                                            <Phone className="w-4 h-4" />
                                            <span>Phone</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <RadioGroupItem value="email" />
                                            <Mail className="w-4 h-4" />
                                            <span>Email</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <RadioGroupItem value="either" />
                                            <Zap className="w-4 h-4" />
                                            <span>Either</span>
                                        </label>
                                    </RadioGroup>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Review & Confirm */}
                    {step === 4 && (
                        <div className="space-y-6 animate-fade-up">
                            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-gold" />
                                Review Your Booking
                            </h3>

                            <div className="bg-secondary/30 rounded-lg p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Business</p>
                                        <p className="font-medium">{businessName}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Service</p>
                                        <p className="font-medium capitalize">{formData.serviceType?.replace("-", " ")}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Date</p>
                                        <p className="font-medium">{formData.date && formatBookingDate(formData.date)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Time</p>
                                        <p className="font-medium">{formData.timeSlot && formatTimeSlot(formData.timeSlot)}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-sm text-muted-foreground mb-1">Description</p>
                                        <p className="text-sm">{formData.description}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-sm text-muted-foreground mb-1">Location</p>
                                        <p className="text-sm">{formData.address}, {formData.postcode}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                                <p className="text-sm text-blue-600 dark:text-blue-400">
                                    <strong>Note:</strong> This booking is pending confirmation. The business will contact you shortly to confirm the appointment.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between pt-6 border-t border-border/30">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleBack}
                            disabled={step === 1}
                        >
                            Back
                        </Button>
                        {step < 4 ? (
                            <Button type="button" onClick={handleNext} className="bg-gold hover:bg-gold/90 text-gold-foreground">
                                Next
                            </Button>
                        ) : (
                            <Button type="submit" className="bg-gold hover:bg-gold/90 text-gold-foreground">
                                Confirm Booking
                            </Button>
                        )}
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
