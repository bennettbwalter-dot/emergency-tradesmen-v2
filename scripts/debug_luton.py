import os

# Let's add debug logging to see what's being passed to getBusinessListings
businesses_path = r"..\src\lib\businesses.ts"

with open(businesses_path, "r", encoding="utf-8") as f:
    content = f.read()

# Add console logging to getBusinessListings function
old_func_start = """export function getBusinessListings(city: string, trade: string): Business[] | null {
    const normalizedCity = city.toLowerCase().replace(/\\s+/g, "-");
    const normalizedTrade = trade.toLowerCase().replace(/\\s+/g, "-");

    // 1. Try static list first
    if (businessListings[normalizedCity]?.[normalizedTrade]) {
        return businessListings[normalizedCity][normalizedTrade];
    }"""

new_func_start = """export function getBusinessListings(city: string, trade: string): Business[] | null {
    console.log('[getBusinessListings] Input:', { city, trade });
    const normalizedCity = city.toLowerCase().replace(/\\s+/g, "-");
    const normalizedTrade = trade.toLowerCase().replace(/\\s+/g, "-");
    console.log('[getBusinessListings] Normalized:', { normalizedCity, normalizedTrade });
    console.log('[getBusinessListings] Available cities:', Object.keys(businessListings));

    // 1. Try static list first
    if (businessListings[normalizedCity]?.[normalizedTrade]) {
        console.log('[getBusinessListings] Found in static list:', businessListings[normalizedCity][normalizedTrade].length, 'businesses');
        return businessListings[normalizedCity][normalizedTrade];
    }
    console.log('[getBusinessListings] NOT found in static list for', normalizedCity, normalizedTrade);"""

content = content.replace(old_func_start, new_func_start)

with open(businesses_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Debug logging added to getBusinessListings")
