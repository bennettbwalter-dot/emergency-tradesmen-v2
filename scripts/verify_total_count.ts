
import { businessListings } from '../src/lib/businesses';
import { usCities } from '../src/lib/trades';

async function verify() {
    console.log('--- Checking Total Listings in businesses.ts ---');

    console.log();

    const trade = 'emergency-plumber';
    const normalizedTrade = trade.toLowerCase().replace('emergency-', '');

    // Logic: Exclusion Approach (All keys - US keys)
    let staticBusinessesExclusion: any[] = [];
    const usCitiesLower = (usCities as readonly string[]).map(c => (c as string).toLowerCase());

    let ukCityCount = 0;

    Object.keys(businessListings).forEach(cityKey => {
        const keyLower = cityKey.toLowerCase();

        // Exclude US cities
        if (!usCitiesLower.includes(keyLower)) {
            ukCityCount++;
            // Count all trades for this city? or just plumber?
            // User said "13,000 for uk side" - likely total businesses across all trades?
            // Let's count TOTAL businesses first
            Object.values(businessListings[cityKey]).forEach(bizList => {
                staticBusinessesExclusion = [...staticBusinessesExclusion, ...bizList];
            });
        }
    });

    console.log(`Total UK Cities found (Exclusion): ${ukCityCount}`);
    console.log(`Total UK Businesses found (All Trades, Exclusion): ${staticBusinessesExclusion.length}`);

    // Specific trade count
    let plumberCount = 0;
    Object.keys(businessListings).forEach(cityKey => {
        const keyLower = cityKey.toLowerCase();
        if (!usCitiesLower.includes(keyLower)) {
            const cityBiz = businessListings[cityKey][normalizedTrade];
            if (cityBiz) {
                plumberCount += cityBiz.length;
            }
        }
    });
    console.log(`Total UK Plumbers found (Exclusion): ${plumberCount}`);
}

verify().catch(console.error);
