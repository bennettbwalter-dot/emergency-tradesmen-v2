
import { businessListings } from "./src/lib/businesses";
import { cities } from "./src/lib/trades";

const counts: Record<string, number> = {};

console.log("Plumber Listing counts per city:");

for (const city of cities) {
    const cityKey = city.toLowerCase().replace(/ /g, '-'); // Ensure key matches how it's stored (e.g. milton-keynes) - wait, let me check how keys are stored.
    // In businesses.ts I saw "luton", "manchester". "milton-keynes" probably? 
    // Let's check a few keys from the previous output. "milton-keynes", "stoke-on-trent".
    // So spaces are replaced by hyphens and lowercase.
    // But "Brighton & Hove" -> "brighton-&-hove" based on previous output.

    // Actually, let's just normalize the city name to the key format.
    const key = city.toLowerCase().replace(/ /g, '-').replace(/&/g, '&'); // keep ampersand?
    // checking businesses.ts output again: "brighton-&-hove".
    // let's try to match logic or just check businessListings keys.

    // Easier way: Iterate through keys of businessListings to find matches, 
    // BUT I need to know which cities are completely missing.

    let normalizedKey = city.toLowerCase().replace(/ /g, '-');
    // If it's not found try other variations? No, consistent naming is better.
    // Let's assume the previous developer followed a convention.

    const listings = businessListings[normalizedKey];
    const plumberListings = listings?.plumber || [];
    counts[city] = plumberListings.length;
}

const sorted = Object.entries(counts).sort((a, b) => a[1] - b[1]);
sorted.forEach(([city, count]) => {
    console.log(`${city}: ${count}`);
});
