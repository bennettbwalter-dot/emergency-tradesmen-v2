/**
 * Parses business hours and determines if the business is currently open
 * @param hours - The hours string from the business (e.g., "Open 24 hours", "Open · Closes 8 PM")
 * @param isOpen24Hours - Whether the business operates 24/7
 * @returns true if the business is currently open
 */
export function isBusinessCurrentlyOpen(hours: string, isOpen24Hours: boolean): boolean {
    // 24-hour businesses are always open
    if (isOpen24Hours) {
        return true;
    }

    // Try to parse the closing time from hours string
    const closingMatch = hours.match(/Closes (\d{1,2}(?::\d{2})?\s*(?:AM|PM))/i);

    if (!closingMatch) {
        // If we can't parse it, assume it's open during business hours (8 AM - 10 PM)
        const now = new Date();
        const currentHour = now.getHours();
        return currentHour >= 8 && currentHour < 22;
    }

    const closingTimeStr = closingMatch[1];
    const now = new Date();

    // Parse the closing time
    let closingHour = 0;
    const pmMatch = closingTimeStr.match(/(\d{1,2})\s*PM/i);
    const amMatch = closingTimeStr.match(/(\d{1,2})\s*AM/i);

    if (pmMatch) {
        closingHour = parseInt(pmMatch[1]);
        if (closingHour !== 12) closingHour += 12;
    } else if (amMatch) {
        closingHour = parseInt(amMatch[1]);
        if (closingHour === 12) closingHour = 0;
    }

    const currentHour = now.getHours();

    // Assume opening hour is 8 AM for non-24hr businesses
    const openingHour = 8;

    return currentHour >= openingHour && currentHour < closingHour;
}
