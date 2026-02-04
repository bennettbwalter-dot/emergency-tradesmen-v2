import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

// US Trades
const US_TRADES = [
    'plumber', 'electrician', 'locksmith', 'gas-engineer', 'drain-specialist',
    'glazier', 'roofer', 'builder', 'water-restoration', 'breakdown', 'hvac'
];

// Load US cities from JSON
const usCitiesPath = path.join(__dirname, '../src/lib/us_cities.json');
const usData = JSON.parse(fs.readFileSync(usCitiesPath, 'utf8'));

function extractAllUSCities(data) {
    const cities = [];
    if (data && data.states) {
        data.states.forEach(state => {
            if (state.metros) {
                state.metros.forEach(metro => {
                    if (metro.cities) {
                        metro.cities.forEach(city => {
                            cities.push({ name: city.name, state: state.name, stateSlug: state.slug });
                            if (city.suburbs) {
                                city.suburbs.forEach(sub => {
                                    cities.push({ name: sub.name, state: state.name, stateSlug: state.slug });
                                });
                            }
                        });
                    }
                });
            }
        });
    }
    return cities;
}

async function analyzeGaps() {
    console.log("🔍 Analyzing US Listing Gaps...\n");

    const allCities = extractAllUSCities(usData);
    console.log(`📊 Total US Cities/Suburbs in Master List: ${allCities.length}`);
    console.log(`📊 Total US Trades: ${US_TRADES.length}`);
    console.log(`📊 Total Possible Landing Pages: ${allCities.length * US_TRADES.length}\n`);

    // Aggregate by state
    const stateGaps = {};
    const cityGaps = [];

    // Fetch all US listings grouped by city and trade
    let from = 0;
    const step = 1000;
    let hasMore = true;
    const listingsByLocation = {};

    while (hasMore) {
        const { data, error } = await supabase
            .from('businesses')
            .select('city, trade')
            .eq('country_code', 'US')
            .eq('verified', true)
            .range(from, from + step - 1);

        if (error) {
            console.error("Error fetching listings:", error);
            break;
        }

        if (!data || data.length === 0) {
            hasMore = false;
            break;
        }

        data.forEach(item => {
            const key = `${(item.city || '').toLowerCase()}|${(item.trade || '').toLowerCase()}`;
            listingsByLocation[key] = (listingsByLocation[key] || 0) + 1;
        });

        if (data.length < step) {
            hasMore = false;
        } else {
            from += step;
        }
    }

    console.log(`✅ Loaded verified US listings from Supabase.\n`);

    // Analyze gaps
    for (const city of allCities) {
        const stateKey = city.stateSlug.toUpperCase();
        if (!stateGaps[stateKey]) {
            stateGaps[stateKey] = { state: city.state, totalPages: 0, pagesUnder5: 0, totalListings: 0 };
        }

        for (const trade of US_TRADES) {
            const key = `${city.name.toLowerCase()}|${trade}`;
            const count = listingsByLocation[key] || 0;

            stateGaps[stateKey].totalPages++;
            stateGaps[stateKey].totalListings += count;

            if (count < 5) {
                stateGaps[stateKey].pagesUnder5++;
                cityGaps.push({
                    city: city.name,
                    state: city.state,
                    stateSlug: city.stateSlug,
                    trade,
                    currentCount: count,
                    needed: 5 - count
                });
            }
        }
    }

    // Sort states by gap severity
    const sortedStates = Object.entries(stateGaps)
        .map(([slug, data]) => ({ slug, ...data }))
        .sort((a, b) => b.pagesUnder5 - a.pagesUnder5);

    console.log("=".repeat(60));
    console.log("STATE-LEVEL GAP ANALYSIS (Sorted by Gap Severity)");
    console.log("=".repeat(60));
    console.log("State | Pages Under 5 | Total Pages | Coverage %");
    console.log("-".repeat(60));

    sortedStates.slice(0, 20).forEach(s => {
        const coverage = ((s.totalPages - s.pagesUnder5) / s.totalPages * 100).toFixed(1);
        console.log(`${s.state.padEnd(20)} | ${String(s.pagesUnder5).padEnd(13)} | ${String(s.totalPages).padEnd(11)} | ${coverage}%`);
    });

    console.log("\n" + "=".repeat(60));
    console.log("TOP 50 CITY/TRADE GAPS (Prioritized for Fill)");
    console.log("=".repeat(60));

    // Sort by needed (descending) to prioritize empty pages first
    const sortedCityGaps = cityGaps.sort((a, b) => b.needed - a.needed);

    sortedCityGaps.slice(0, 50).forEach((g, i) => {
        console.log(`${i + 1}. ${g.city}, ${g.state} | ${g.trade} | Has: ${g.currentCount} | Needs: ${g.needed}`);
    });

    // Write gaps to JSON for script consumption
    const outputPath = path.join(__dirname, 'us_listing_gaps.json');
    fs.writeFileSync(outputPath, JSON.stringify(sortedCityGaps, null, 2));
    console.log(`\n✅ Full gap list written to: ${outputPath}`);
    console.log(`📊 Total landing pages needing fill: ${sortedCityGaps.length}`);
}

analyzeGaps();
