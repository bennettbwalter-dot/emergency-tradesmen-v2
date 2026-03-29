
import { businessListings } from "../src/lib/businesses";

let totalListings = 0;
const tradeCounts: Record<string, number> = {};

console.log("Starting count...");

for (const city in businessListings) {
    const cityData = businessListings[city as keyof typeof businessListings];
    if (!cityData) continue;

    for (const trade in cityData) {
        const listings = cityData[trade as keyof typeof cityData];
        if (Array.isArray(listings)) {
            totalListings += listings.length;
            tradeCounts[trade] = (tradeCounts[trade] || 0) + listings.length;
        }
    }
}

console.log(`\nGRAND TOTAL LISTINGS: ${totalListings}`);
console.log("\nBreakdown by Trade:");
Object.entries(tradeCounts)
    .sort(([, a], [, b]) => b - a)
    .forEach(([trade, count]) => {
        console.log(`${trade}: ${count}`);
    });
