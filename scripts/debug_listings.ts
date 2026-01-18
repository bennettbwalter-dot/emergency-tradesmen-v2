
import { fetchBusinesses } from '../src/lib/businessService';
import { trades } from '../src/lib/trades';

async function debug() {
    console.log('--- Debugging fetchBusinesses ---');

    // Test case 1: Generic UK Plumber
    // We expect this to aggregate London/Luton data
    // trade slug is usually just "plumber" if normalized, or "emergency-plumber" if passed raw.
    // Let's test both.

    console.log('\nTest 1: trade="plumber", city="", country="GB"');
    const results1 = await fetchBusinesses('plumber', '', 'GB');
    console.log(`Results count: ${results1.length}`);
    if (results1.length > 0) {
        console.log('First result:', results1[0].name, results1[0].city);
    } else {
        console.log('No results found.');
    }

    console.log('\nTest 2: trade="emergency-plumber", city="", country="GB"');
    const results2 = await fetchBusinesses('emergency-plumber', '', 'GB');
    console.log(`Results count: ${results2.length}`);

    // Check what keys are actually in businessListings (we can't access it directly easily, but we can infer from results)
}

debug().catch(console.error);
