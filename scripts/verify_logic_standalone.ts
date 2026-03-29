
import { businessListings } from '../src/lib/businesses';
import { cities } from '../src/lib/trades';

// MOCK the usCities list since we can't import it easily if it has dependencies or just define it.
// Actually trades.ts has no complex dependencies, so we can import 'cities' from it.
// But businessListings might. checks: businesses.ts imports LocalizationContext... likely fine for types?
// businesses.ts imports city json files. validation usually passes in tsx.

async function verify() {
    console.log('--- Verifying Aggregation Logic ---');

    const trade = 'emergency-plumber';
    const normalizedTrade = trade.toLowerCase().replace('emergency-', '');
    const countryCode = 'GB';

    // Exact logic from businessService.ts
    let staticBusinesses: any[] = [];
    const ukCitiesLower = (cities as readonly string[]).map(c => (c as string).toLowerCase());

    console.log(`Normalized Trade: ${normalizedTrade}`);
    console.log(`UK Cities Count: ${ukCitiesLower.length}`);
    console.log(`London in UK Cities? ${ukCitiesLower.includes('london')}`);

    Object.keys(businessListings).forEach(cityKey => {
        const keyLower = cityKey.toLowerCase();
        // Check if this cityKey is in our UK whitelist OR explicitly 'london'/'luton'
        if (ukCitiesLower.includes(keyLower) || keyLower === 'london' || keyLower === 'luton') {
            const cityBiz = businessListings[cityKey][normalizedTrade];
            if (cityBiz) {
                console.log(`Found ${cityBiz.length} listings in ${cityKey}`);
                staticBusinesses = [...staticBusinesses, ...cityBiz];
            }
        }
    });

    console.log(`Total Aggregated Static Businesses: ${staticBusinesses.length}`);

    if (staticBusinesses.length > 0) {
        console.log('SUCCESS: Logic found listings.');
        // Print first one to prove it's real
        console.log('Sample:', staticBusinesses[0].name, 'of', staticBusinesses[0].address);
    } else {
        console.error('FAILURE: Logic found NO listings.');
    }
}

verify().catch(console.error);
