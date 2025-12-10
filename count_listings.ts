
import { businessListings } from "./src/lib/businesses";

const counts: Record<string, number> = {};

for (const city in businessListings) {
    const electricianListings = businessListings[city]?.electrician || [];
    counts[city] = electricianListings.length;
}

console.log("Listing counts per city:");
const sorted = Object.entries(counts).sort((a, b) => a[1] - b[1]);
sorted.forEach(([city, count]) => {
    console.log(`${city}: ${count}`);
});
