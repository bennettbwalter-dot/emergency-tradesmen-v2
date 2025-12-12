// Quote request data types
export interface QuoteRequest {
    id: string;
    businessId: string;
    userId?: string;
    name: string;
    email: string;
    phone: string;
    postcode: string;
    urgency: "emergency" | "today" | "this-week" | "flexible";
    serviceType: string;
    description: string;
    preferredContactMethod: "phone" | "email" | "either";
    preferredTime?: string;
    images?: string[];
    createdAt: string;
    status: "pending" | "quoted" | "accepted" | "declined" | "completed";
}

export interface QuoteFormData {
    name: string;
    email: string;
    phone: string;
    postcode: string;
    urgency: "emergency" | "today" | "this-week" | "flexible";
    serviceType: string;
    description: string;
    preferredContactMethod: "phone" | "email" | "either";
    preferredTime?: string;
}

export const urgencyOptions = [
    {
        value: "emergency",
        label: "Emergency (ASAP)",
        description: "Need help right now",
        color: "text-red-500",
        badge: "bg-red-500/10 text-red-500 border-red-500/30",
    },
    {
        value: "today",
        label: "Today",
        description: "Within the next few hours",
        color: "text-orange-500",
        badge: "bg-orange-500/10 text-orange-500 border-orange-500/30",
    },
    {
        value: "this-week",
        label: "This Week",
        description: "Within the next 7 days",
        color: "text-yellow-500",
        badge: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
    },
    {
        value: "flexible",
        label: "Flexible",
        description: "No rush, best price preferred",
        color: "text-green-500",
        badge: "bg-green-500/10 text-green-500 border-green-500/30",
    },
] as const;

export function validateQuoteForm(data: Partial<QuoteFormData>): {
    isValid: boolean;
    errors: Partial<Record<keyof QuoteFormData, string>>;
} {
    const errors: Partial<Record<keyof QuoteFormData, string>> = {};

    // Name validation
    if (!data.name || data.name.trim().length < 2) {
        errors.name = "Please enter your full name";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !emailRegex.test(data.email)) {
        errors.email = "Please enter a valid email address";
    }

    // Phone validation (UK format)
    const phoneRegex = /^(\+44|0)[0-9]{10}$/;
    const cleanPhone = data.phone?.replace(/\s/g, "");
    if (!cleanPhone || !phoneRegex.test(cleanPhone)) {
        errors.phone = "Please enter a valid UK phone number";
    }

    // Postcode validation (basic UK postcode format)
    const postcodeRegex = /^[A-Z]{1,2}[0-9]{1,2}[A-Z]?\s?[0-9][A-Z]{2}$/i;
    if (!data.postcode || !postcodeRegex.test(data.postcode.trim())) {
        errors.postcode = "Please enter a valid UK postcode";
    }

    // Urgency validation
    if (!data.urgency) {
        errors.urgency = "Please select urgency level";
    }

    // Service type validation
    if (!data.serviceType || data.serviceType.trim().length < 3) {
        errors.serviceType = "Please select or describe the service needed";
    }

    // Description validation
    if (!data.description || data.description.trim().length < 20) {
        errors.description = "Please provide at least 20 characters describing your issue";
    }

    // Preferred contact method validation
    if (!data.preferredContactMethod) {
        errors.preferredContactMethod = "Please select your preferred contact method";
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
}

export function createQuoteRequest(
    formData: QuoteFormData,
    businessId: string
): QuoteRequest {
    return {
        id: `quote-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        businessId,
        ...formData,
        createdAt: new Date().toISOString(),
        status: "pending",
    };
}
