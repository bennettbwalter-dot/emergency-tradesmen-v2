
import { businessListings } from '../src/lib/businesses';
import { cities } from '../src/lib/trades';

console.log('--- Static Business Listings Keys ---');
const keys = Object.keys(businessListings);
console.log(`Total Keys: ${keys.length}`);
keys.forEach(k => console.log(k));

console.log('--- Master UK Cities ---');
console.log(`Total Master Cities: ${cities.length}`);
// cities.forEach(c => console.log(c));

const missing = cities.filter(c => !keys.find(k => k.toLowerCase() === c.toLowerCase()));
console.log(`--- Missing Cities (${missing.length}) ---`);
if (missing.length < 20) {
    missing.forEach(m => console.log(m));
} else {
    console.log(missing.slice(0, 10));
    console.log('...and more');
}
