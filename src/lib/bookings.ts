export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";
export type BookingUrgency = "emergency" | "same-day" | "next-day" | "scheduled";

export interface TimeSlot {
    id: string;
    time: string;
    available: boolean;
}

export interface BookingFormData {
    businessId: string;
    businessName: string;
    tradeName: string;
    date: string;
    timeSlot: string;
    urgency: BookingUrgency;
    serviceType: string;
    description: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    postcode: string;
    preferredContactMethod: "phone" | "email" | "either";
    specialRequirements?: string;
}

export interface Booking {
    id: string;
    userId: string;
    businessId: string;
    businessName: string;
    tradeName: string;
    date: string;
    timeSlot: string;
    urgency: BookingUrgency;
    serviceType: string;
    description: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    address: string;
    postcode: string;
    preferredContactMethod: "phone" | "email" | "either";
    specialRequirements?: string;
    status: BookingStatus;
    createdAt: string;
    updatedAt: string;
    estimatedDuration?: number; // in minutes
    estimatedCost?: string;
}

// Generate available time slots for a given date
export function generateTimeSlots(date: Date): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

    hours.forEach(hour => {
        ["00", "30"].forEach(minute => {
            const timeString = `${hour.toString().padStart(2, "0")}:${minute}`;
            slots.push({
                id: `${date.toISOString().split("T")[0]}-${timeString}`,
                time: timeString,
                available: Math.random() > 0.3, // Mock availability
            });
        });
    });

    return slots;
}

// Get available dates (next 14 days, excluding Sundays for non-emergency)
export function getAvailableDates(urgency: BookingUrgency): Date[] {
    const dates: Date[] = [];
    const today = new Date();

    if (urgency === "emergency") {
        // Emergency: today only
        dates.push(today);
    } else if (urgency === "same-day") {
        // Same day: today
        dates.push(today);
    } else if (urgency === "next-day") {
        // Next day: tomorrow
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        dates.push(tomorrow);
    } else {
        // Scheduled: next 14 days (excluding Sundays)
        for (let i = 1; i <= 14; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() + i);
            if (date.getDay() !== 0) { // Exclude Sundays
                dates.push(date);
            }
        }
    }

    return dates;
}

// Validate booking form
export function validateBookingForm(data: Partial<BookingFormData>): {
    isValid: boolean;
    errors: Partial<Record<keyof BookingFormData, string>>;
} {
    const errors: Partial<Record<keyof BookingFormData, string>> = {};

    if (!data.date) {
        errors.date = "Please select a date";
    }

    if (!data.timeSlot) {
        errors.timeSlot = "Please select a time slot";
    }

    if (!data.serviceType || data.serviceType.trim().length < 3) {
        errors.serviceType = "Please select or describe the service needed";
    }

    if (!data.description || data.description.trim().length < 20) {
        errors.description = "Please provide at least 20 characters describing your needs";
    }

    if (!data.name || data.name.trim().length < 2) {
        errors.name = "Please enter your full name";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !emailRegex.test(data.email)) {
        errors.email = "Please enter a valid email address";
    }

    const phoneRegex = /^(\+44|0)[0-9]{10}$/;
    const cleanPhone = data.phone?.replace(/\s/g, "");
    if (!cleanPhone || !phoneRegex.test(cleanPhone)) {
        errors.phone = "Please enter a valid UK phone number";
    }

    if (!data.address || data.address.trim().length < 5) {
        errors.address = "Please enter your full address";
    }

    const postcodeRegex = /^[A-Z]{1,2}[0-9]{1,2}[A-Z]?\s?[0-9][A-Z]{2}$/i;
    if (!data.postcode || !postcodeRegex.test(data.postcode.trim())) {
        errors.postcode = "Please enter a valid UK postcode";
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
}

// Create a new booking
export function createBooking(data: BookingFormData, userId: string): Booking {
    const now = new Date().toISOString();

    return {
        id: `booking-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId,
        businessId: data.businessId,
        businessName: data.businessName,
        tradeName: data.tradeName,
        date: data.date,
        timeSlot: data.timeSlot,
        urgency: data.urgency,
        serviceType: data.serviceType,
        description: data.description,
        customerName: data.name,
        customerEmail: data.email,
        customerPhone: data.phone,
        address: data.address,
        postcode: data.postcode,
        preferredContactMethod: data.preferredContactMethod,
        specialRequirements: data.specialRequirements,
        status: "pending",
        createdAt: now,
        updatedAt: now,
        estimatedDuration: 60, // Default 1 hour
    };
}

// Local storage management
const BOOKINGS_KEY = "emergency_tradesmen_bookings";

export function saveBooking(booking: Booking): void {
    const bookings = getBookings();
    bookings.push(booking);
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
}

export function getBookings(): Booking[] {
    const stored = localStorage.getItem(BOOKINGS_KEY);
    return stored ? JSON.parse(stored) : [];
}

export function getUserBookings(userId: string): Booking[] {
    return getBookings().filter(b => b.userId === userId);
}

export function getBookingById(id: string): Booking | null {
    return getBookings().find(b => b.id === id) || null;
}

export function updateBookingStatus(id: string, status: BookingStatus): void {
    const bookings = getBookings();
    const index = bookings.findIndex(b => b.id === id);

    if (index !== -1) {
        bookings[index].status = status;
        bookings[index].updatedAt = new Date().toISOString();
        localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
    }
}

export function cancelBooking(id: string): void {
    updateBookingStatus(id, "cancelled");
}

// Format date for display
export function formatBookingDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

// Format time slot for display
export function formatTimeSlot(timeSlot: string): string {
    const [hours, minutes] = timeSlot.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
}

// Get urgency badge color
export function getUrgencyColor(urgency: BookingUrgency): string {
    switch (urgency) {
        case "emergency":
            return "bg-red-500/10 text-red-600 border-red-500/20";
        case "same-day":
            return "bg-orange-500/10 text-orange-600 border-orange-500/20";
        case "next-day":
            return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
        case "scheduled":
            return "bg-blue-500/10 text-blue-600 border-blue-500/20";
        default:
            return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    }
}

// Get status badge color
export function getStatusColor(status: BookingStatus): string {
    switch (status) {
        case "pending":
            return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
        case "confirmed":
            return "bg-green-500/10 text-green-600 border-green-500/20";
        case "completed":
            return "bg-blue-500/10 text-blue-600 border-blue-500/20";
        case "cancelled":
            return "bg-red-500/10 text-red-600 border-red-500/20";
        default:
            return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    }
}

