
import * as fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from parent directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 1. Define Expected UK Cities
const ukCities = [
    "London", "Manchester", "Birmingham", "Leeds", "Glasgow", "Sheffield", "Bradford", "Liverpool", "Edinburgh", "Bristol",
    "Cardiff", "Coventry", "Nottingham", "Leicester", "Sunderland", "Belfast", "Newcastle upon Tyne", "Newcastle-upon-Tyne",
    "Brighton", "Brighton & Hove", "Hull", "Plymouth", "Stoke-on-Trent", "Wolverhampton", "Derby", "Swansea", "Southampton",
    "Salford", "Aberdeen", "Portsmouth", "York", "Peterborough", "Dundee", "Oxford", "Cambridge", "Norwich", "Exeter",
    "Luton", "Milton Keynes", "Northampton", "Bournemouth", "Reading", "Blackpool", "Preston", "Huddersfield", "Slough",
    "Swindon", "Bolton", "Oldham", "Rochdale", "Doncaster", "Bedford", "Ipswich", "Cheltenham", "Gloucester", "Worcester",
    "Hereford", "Shrewsbury", "Telford", "Canterbury", "Carlisle", "Chelmsford", "Chester", "Colchester", "Durham",
    "Lancaster", "Lincoln", "Southend-on-Sea", "St Albans", "Truro", "Wakefield", "Winchester", "Westminster", "Warrington",
    "Wigan", "Middlesbrough", "Barnsley", "Newport", "Poole", "Stockport", "Basildon", "Maidstone", "Crawley", "Worthing",
    "Sutton Coldfield", "Dudley", "Walsall", "Watford", "High Wycombe", "Harlow", "Stevenage", "Redditch", "Chesterfield",
    "Mansfield", "Beeston", "Loughborough", "Burton upon Trent", "Crewe", "Macclesfield", "Scunthorpe", "Grimsby",
    "Harrogate", "Halifax", "Batley", "Keighley", "South Shields", "Gateshead", "Darlington", "Hartlepool", "Stockton-on-Tees",
    "Hemel Hempstead", "Gillingham", "Eastbourne", "Rayleigh", "Lowestoft", "Woking", "Maidenhead", "Basingstoke", "Fareham",
    "Gosport", "Ewell", "Crosby", "Paignton", "Torquay", "Bebington", "Halesowen", "Kidderminster", "Rugby", "Leamington Spa",
    "Kettering", "Wellingborough", "Dunstable", "Aylesbury", "Cheshunt", "Welwyn Garden City", "Margate", "Royal Tunbridge Wells",
    "Ashford", "Braintree", "Canvey Island", "Clacton-on-Sea", "Sittingbourne", "Gravesend", "Dartford", "Weymouth", "Falmouth",
    "St Austell", "Scarborough", "Bridlington", "Castleford", "Pontefract", "Rotherham", "Sale", "Widnes", "Runcorn",
    "Ellesmere Port", "Birkenhead", "Wallasey", "Barrow-in-Furness", "Workington", "Whitehaven", "Chorley", "Accrington",
    "Burnley", "Lytham St Annes", "Stafford", "Bromsgrove", "Grantham", "Ely", "Lichfield", "Ripon", "Salisbury", "Wells",
    "Solihull", "Guildford", "Staines", "Chatham", "Hastings", "Nuneaton", "Tamworth", "Cannock", "Bath",
    // London Boroughs
    "Brixton", "Hackney", "Camden", "Islington", "Greenwich", "Chelsea", "Wembley", "Croydon", "Ealing", "Enfield",
    "Harrow", "Hounslow", "Kingston", "Merton", "Newham", "Redbridge", "Richmond", "Southwark", "Tower Hamlets",
    "Waltham Forest", "Wandsworth", "Woolwich", "Fulham"
];

// 2. Define Expected Trades (excluding water-restoration and hvac)
const ukTrades = [
    "plumber",
    "electrician",
    "locksmith",
    "gas-engineer",
    "drain-specialist",
    "glazier",
    "roofer",
    "builder",
    "breakdown"
];

async function runAudit() {
    console.log("🚀 Starting UK Data Coverage Audit...");
    console.log(`Checking ${ukCities.length} cities against ${ukTrades.length} trades.`);
    console.log("Fetching current UK data from Supabase...");

    let allData: any[] = [];
    let page = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
        const { data, error } = await supabase
            .from('businesses')
            .select('city, trade')
            .eq('country_code', 'GB')
            .range(page * pageSize, (page + 1) * pageSize - 1);

        if (error) {
            console.error("Error fetching data:", error);
            return;
        }

        if (data && data.length > 0) {
            allData = [...allData, ...data];
            console.log(`Fetched ${data.length} records (Total: ${allData.length})...`);
            page++;
        } else {
            hasMore = false;
        }
    }

    console.log(`Downloaded ${allData.length} TOTAL UK records.`);

    // Build Map of Counts
    const coverage: Record<string, Record<string, number>> = {};

    // Initialize map
    ukCities.forEach(city => {
        coverage[city] = {};
        ukTrades.forEach(trade => {
            coverage[city][trade] = 0;
        });
    });

    // Populate counts
    // Normalization helper
    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

    const cityMap = new Map<string, string>();
    ukCities.forEach(c => cityMap.set(normalize(c), c));

    let matchedCount = 0;
    let unmatchedCount = 0;

    allData.forEach(record => {
        if (!record.city || !record.trade) return;

        let tradeSlug = record.trade.toLowerCase();
        // Normalize trade slug if needed (e.g. 'emergency-plumber' -> 'plumber')
        tradeSlug = tradeSlug.replace('emergency-', '');

        if (!ukTrades.includes(tradeSlug)) return; // Skip excluded trades (hvac, water-restoration)

        const normCity = normalize(record.city);
        const officialCity = cityMap.get(normCity);

        if (officialCity) {
            coverage[officialCity][tradeSlug]++;
            matchedCount++;
        } else {
            // Try fuzzy?
            const found = ukCities.find(c => normalize(c) === normCity);
            if (found) {
                coverage[found][tradeSlug]++;
                matchedCount++;
            } else {
                unmatchedCount++;
            }
        }
    });

    console.log(`Matched ${matchedCount} records to known cities.`);
    console.log(`Unmatched CS/typo cities: ${unmatchedCount} (ignored for this audit).`);

    // LOG TOP CITIES FOUND
    console.log("\n--- TOP 20 FOUND CITIES (RAW DB VALUES) ---");
    const cityCounts: Record<string, number> = {};
    allData.forEach(r => {
        const c = r.city || "Unknown";
        cityCounts[c] = (cityCounts[c] || 0) + 1;
    });
    Object.entries(cityCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .forEach(([c, count]) => console.log(`${c}: ${count}`));
    console.log("-------------------------------------------\n");

    // Identify Gaps
    const gaps: { city: string; trade: string }[] = [];
    const missingCities: string[] = [];

    ukCities.forEach(city => {
        let cityHasAnyData = false;
        ukTrades.forEach(trade => {
            if (coverage[city][trade] === 0) {
                gaps.push({ city, trade });
            } else {
                cityHasAnyData = true;
            }
        });
        if (!cityHasAnyData) {
            missingCities.push(city);
        }
    });

    console.log("\n--- AUDIT RESULTS ---");
    console.log(`Total Expected Combinations: ${ukCities.length * ukTrades.length}`);
    console.log(`Missing Combinations: ${gaps.length}`);

    if (missingCities.length > 0) {
        console.log(`\n🚨 CITIES WITH ZERO DATA (ALL TRADES MISSING): ${missingCities.length}`);
        console.log(missingCities.slice(0, 50).join(", ") + (missingCities.length > 50 ? "..." : ""));
    }

    if (gaps.length > 0) {
        console.log(`\n🚨 MISSING DATA REPORT (Sample of first 50 gaps):`);
        gaps.slice(0, 50).forEach(gap => {
            console.log(`[MISSING] ${gap.city} - ${gap.trade}`);
        });

        // Write full report to file
        const reportPath = path.join(__dirname, 'uk_data_audit_report.json');
        fs.writeFileSync(reportPath, JSON.stringify(gaps, null, 2));
        console.log(`\nFull report written to: ${reportPath}`);
    } else {
        console.log("\n✅ NO GAPS FOUND! All UK cities have coverage for all target trades.");
    }
}

runAudit();
