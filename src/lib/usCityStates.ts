// US City to State Mapping
// Maps US cities to their state abbreviations for accurate location handling and SEO

export const usCityStates: Record<string, string> = {
    // Texas
    "Dallas": "TX",
    "Houston": "TX",
    "Austin": "TX",
    "San Antonio": "TX",
    "Fort Worth": "TX",
    "Arlington": "TX",
    "Plano": "TX",
    "Irving": "TX",
    "Garland": "TX",
    "Frisco": "TX",
    "McKinney": "TX",
    "El Paso": "TX",
    "Corpus Christi": "TX",
    "Lubbock": "TX",
    "Laredo": "TX",
    "Amarillo": "TX",
    "Midland": "TX",
    "Abilene": "TX",
    "Denton": "TX",
    "Waco": "TX",
    "Carrollton": "TX",
    "Richardson": "TX",
    "Lewisville": "TX",
    "Round Rock": "TX",
    "College Station": "TX",
    "Tyler": "TX",
    "Pearland": "TX",
    "Sugar Land": "TX",
    "Allen": "TX",
    "League City": "TX",
    "Conroe": "TX",
    "New Braunfels": "TX",
    "Edinburg": "TX",
    "Mission": "TX",
    "Bryan": "TX",
    "Pharr": "TX",
    "Baytown": "TX",
    "Missouri City": "TX",
    "Temple": "TX",
    "Flower Mound": "TX",
    "North Richland Hills": "TX",
    "Mansfield": "TX",
    "Victoria": "TX",
    "Rowlett": "TX",
    "Harlingen": "TX",
    "Pflugerville": "TX",
    "San Marcos": "TX",
    "Euless": "TX",
    "Port Arthur": "TX",
    "Grapevine": "TX",

    // California
    "Los Angeles": "CA",
    "San Diego": "CA",
    "San Francisco": "CA",
    "Sacramento": "CA",

    // Florida
    "Miami": "FL",
    "Tampa": "FL",
    "Orlando": "FL",
    "Jacksonville": "FL",

    // Arizona
    "Phoenix": "AZ",
    "Scottsdale": "AZ",
    "Mesa": "AZ",
    "Tucson": "AZ",

    // Michigan
    "Detroit": "MI",

    // Ohio
    "Cleveland": "OH",

    // Pennsylvania
    "Pittsburgh": "PA",

    // New York
    "Buffalo": "NY",

    // Washington
    "Seattle": "WA",
    "Portland": "OR", // Note: Portland is in Oregon, not Washington
    "Tacoma": "WA",
    "Spokane": "WA",
};

/**
 * Get the state abbreviation for a given US city
 * @param city - The city name
 * @returns The state abbreviation (e.g., "TX", "CA") or empty string if not found
 */
export function getStateForCity(city: string): string {
    // Try direct match
    if (usCityStates[city]) return usCityStates[city];

    // Try fuzzy match for variations (e.g., "Greater Los Angeles" -> "Los Angeles")
    const normalizedKey = Object.keys(usCityStates).find(k => city.includes(k));
    if (normalizedKey) return usCityStates[normalizedKey];

    // Return empty if no match (graceful degradation)
    return "";
}

/**
 * Get the full state name from abbreviation
 * @param stateAbbr - The state abbreviation (e.g., "TX")
 * @returns The full state name (e.g., "Texas")
 */
export function getFullStateName(stateAbbr: string): string {
    const stateNames: Record<string, string> = {
        "TX": "Texas",
        "CA": "California",
        "FL": "Florida",
        "AZ": "Arizona",
        "MI": "Michigan",
        "OH": "Ohio",
        "PA": "Pennsylvania",
        "NY": "New York",
        "WA": "Washington",
        "OR": "Oregon",
    };

    return stateNames[stateAbbr] || "";
}
