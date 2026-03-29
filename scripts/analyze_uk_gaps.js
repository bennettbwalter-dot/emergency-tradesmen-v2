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

// UK Trades
const UK_TRADES = [
    "plumber", "electrician", "locksmith", "gas-engineer", "drain-specialist", "glazier", "breakdown"
];

// UK Cities (From generate-sitemap.js)
const UK_CITIES = [
    "London", "Manchester", "Birmingham", "Leeds", "Glasgow", "Sheffield", "Bradford", "Liverpool", "Edinburgh", "Bristol",
    "Cardiff", "Coventry", "Nottingham", "Leicester", "Sunderland", "Belfast", "Newcastle upon Tyne", "Brighton", "Hull",
    "Plymouth", "Stoke-on-Trent", "Wolverhampton", "Derby", "Swansea", "Southampton", "Salford", "Aberdeen", "Portsmouth",
    "York", "Peterborough", "Dundee", "Oxford", "Cambridge", "Norwich", "Exeter", "Luton", "Milton Keynes", "Northampton",
    "Bournemouth", "Reading", "Blackpool", "Preston", "Huddersfield", "Slough", "Swindon", "Bolton", "Oldham", "Rochdale",
    "Doncaster", "Rotherham", "Stockport", "Wigan", "Burnley", "Blackburn", "Worcester", "Gloucester", "Cheltenham",
    "Bedford", "Ipswich", "Hereford", "Shrewsbury", "Telford", "Canterbury", "Carlisle", "Chelmsford", "Chester", "Colchester",
    "Durham", "Lancaster", "Lincoln", "Southend-on-Sea", "St Albans", "Truro", "Wakefield", "Winchester", "Westminster",
    "Warrington", "Middlesbrough", "Barnsley", "Newport", "Poole", "Basildon", "Maidstone", "Crawley", "Worthing",
    "Sutton Coldfield", "Dudley", "Walsall", "Watford", "High Wycombe", "Harlow", "Stevenage", "Redditch", "Chesterfield",
    "Mansfield", "Beeston", "Loughborough", "Burton upon Trent", "Crewe", "Macclesfield", "Scunthorpe", "Grimsby", "Harrogate",
    "Halifax", "Batley", "Keighley", "South Shields", "Gateshead", "Darlington", "Hartlepool", "Stockton-on-Tees", "Hemel Hempstead",
    "Gillingham", "Eastbourne", "Rayleigh", "Lowestoft", "Woking", "Maidenhead", "Basingstoke", "Fareham", "Gosport", "Ewell",
    "Crosby", "Paignton", "Torquay", "Bebington", "Halesowen", "Kidderminster", "Rugby", "Leamington Spa", "Kettering",
    "Wellingborough", "Dunstable", "Aylesbury", "Cheshunt", "Welwyn Garden City", "Margate", "Royal Tunbridge Wells", "Ashford",
    "Braintree", "Canvey Island", "Clacton-on-Sea", "Sittingbourne", "Gravesend", "Dartford", "Weymouth", "Falmouth", "St Austell",
    "Scarborough", "Bridlington", "Castleford", "Pontefract", "Sale", "Widnes", "Runcorn", "Ellesmere Port", "Birkenhead",
    "Wallasey", "Barrow-in-Furness", "Workington", "Whitehaven", "Chorley", "Accrington", "Lytham St Annes", "Stafford",
    "Bromsgrove", "Grantham", "Ely", "Lichfield", "Ripon", "Salisbury", "Wells", "Solihull", "Guildford", "Staines", "Chatham",
    "Hastings", "Nuneaton", "Tamworth", "Cannock", "Bath"
];

async function analyzeUKGaps() {
    console.log("🔍 Analyzing UK Listing Gaps...\n");

    const totalPossible = UK_CITIES.length * UK_TRADES.length;
    console.log(`📊 Total UK Cities: ${UK_CITIES.length}`);
    console.log(`📊 Total UK Trades: ${UK_TRADES.length}`);
    console.log(`📊 Total Possible Landing Pages: ${totalPossible}\n`);

    const cityGaps = [];

    // Fetch all UK listings grouped by city and trade
    let from = 0;
    const step = 1000;
    let hasMore = true;
    const listingsByLocation = {};

    while (hasMore) {
        const { data, error } = await supabase
            .from('businesses')
            .select('city, trade')
            .eq('country_code', 'GB')
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

    console.log(`✅ Loaded verified UK listings from Supabase.\n`);

    // Analyze gaps
    for (const city of UK_CITIES) {
        for (const trade of UK_TRADES) {
            const key = `${city.toLowerCase()}|${trade}`;
            const count = listingsByLocation[key] || 0;

            if (count < 5) {
                cityGaps.push({
                    city: city,
                    countryCode: 'GB',
                    trade,
                    currentCount: count,
                    needed: 5 - count
                });
            }
        }
    }

    // Sort by needed (descending)
    const sortedCityGaps = cityGaps.sort((a, b) => b.needed - a.needed);

    console.log("=".repeat(60));
    console.log("TOP 50 UK CITY/TRADE GAPS (Prioritized for Fill)");
    console.log("=".repeat(60));

    sortedCityGaps.slice(0, 50).forEach((g, i) => {
        console.log(`${i + 1}. ${g.city} | ${g.trade} | Has: ${g.currentCount} | Needs: ${g.needed}`);
    });

    // Write gaps to JSON
    const outputPath = path.join(__dirname, 'uk_listing_gaps.json');
    fs.writeFileSync(outputPath, JSON.stringify(sortedCityGaps, null, 2));
    console.log(`\n✅ Full UK gap list written to: ${outputPath}`);
    console.log(`📊 Total UK landing pages needing fill: ${sortedCityGaps.length}`);
}

analyzeUKGaps();
