import { businessListings } from "./src/lib/businesses.ts";

console.log("Locksmith Listing counts per city:");

const cities = Object.keys(businessListings).sort();

cities.forEach(city => {
    const locksmithCount = businessListings[city]?.locksmith?.length || 0;
    console.log(`${city.charAt(0).toUpperCase() + city.slice(1).replace(/-/g, ' ').replace(/&/g, '&')}: ${locksmithCount}`);
});
