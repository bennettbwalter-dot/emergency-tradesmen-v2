import { businessListings } from "./src/lib/businesses.ts";

console.log("=".repeat(80));
console.log("EMERGENCY TRADESMEN APP - COMPLETE COVERAGE SUMMARY");
console.log("=".repeat(80));
console.log("");

const cities = Object.keys(businessListings).sort();
const trades = ["electrician", "plumber", "locksmith", "gas-engineer", "glazier", "drain-specialist"];

let totalCities = cities.length;
let totalListings = 0;

// Summary by trade
console.log("SUMMARY BY TRADE:");
console.log("-".repeat(80));
trades.forEach(trade => {
    let count = 0;
    let citiesWithTrade = 0;
    cities.forEach(city => {
        const tradeCount = businessListings[city]?.[trade]?.length || 0;
        count += tradeCount;
        if (tradeCount > 0) citiesWithTrade++;
    });
    console.log(`${trade.toUpperCase().replace(/-/g, ' ').padEnd(20)}: ${count.toString().padStart(5)} listings across ${citiesWithTrade} cities`);
    totalListings += count;
});

console.log("-".repeat(80));
console.log(`TOTAL LISTINGS: ${totalListings}`);
console.log("");

// Cities with incomplete coverage
console.log("COVERAGE CHECK (20+ per trade):");
console.log("-".repeat(80));
let incompleteCities = [];
cities.forEach(city => {
    const cityName = city.charAt(0).toUpperCase() + city.slice(1).replace(/-/g, ' ').replace(/&/g, '&');
    const electricians = businessListings[city]?.electrician?.length || 0;
    const plumbers = businessListings[city]?.plumber?.length || 0;
    const locksmiths = businessListings[city]?.locksmith?.length || 0;
    const gasEngineers = businessListings[city]?.["gas-engineer"]?.length || 0;
    const glaziers = businessListings[city]?.glazier?.length || 0;
    const drainSpecialists = businessListings[city]?.["drain-specialist"]?.length || 0;

    const total = electricians + plumbers + locksmiths + gasEngineers + glaziers + drainSpecialists;

    if (electricians < 20 || plumbers < 20 || locksmiths < 20 || gasEngineers < 20 || glaziers < 20 || drainSpecialists < 20) {
        incompleteCities.push({
            name: cityName,
            electricians,
            plumbers,
            locksmiths,
            gasEngineers,
            glaziers,
            drainSpecialists,
            total
        });
    }
});

if (incompleteCities.length === 0) {
    console.log("✅ ALL CITIES HAVE COMPLETE COVERAGE (20+ listings for each trade)!");
} else {
    console.log(`⚠️  ${incompleteCities.length} cities have incomplete coverage:`);
    console.log("");
    incompleteCities.forEach(city => {
        console.log(`${city.name}:`);
        console.log(`  Elec: ${city.electricians}, Plumb: ${city.plumbers}, Lock: ${city.locksmiths}, Gas: ${city.gasEngineers}, Glaz: ${city.glaziers}, Drain: ${city.drainSpecialists}`);
    });
}

console.log("");
console.log("=".repeat(80));
console.log(`TOTAL CITIES: ${totalCities}`);
console.log(`TOTAL LISTINGS: ${totalListings}`);
console.log(`AVERAGE LISTINGS PER CITY: ${Math.round(totalListings / totalCities)}`);
console.log("=".repeat(80));
