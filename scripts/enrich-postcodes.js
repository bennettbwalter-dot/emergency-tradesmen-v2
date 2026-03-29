import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Comprehensive Map from src/lib/cityPostcodes.ts
const cityPostcodes = {
    "London": "SW1A 1AA",
    "Manchester": "M1 1AE",
    "Birmingham": "B1 1BB",
    "Leeds": "LS1 1UR",
    "Glasgow": "G1 1RX",
    "Sheffield": "S1 2HH",
    "Bradford": "BD1 1US",
    "Liverpool": "L1 8JQ",
    "Edinburgh": "EH1 1YZ",
    "Bristol": "BS1 2AA",
    "Cardiff": "CF10 1AA",
    "Coventry": "CV1 1AA",
    "Nottingham": "NG1 1AA",
    "Leicester": "LE1 1AA",
    "Sunderland": "SR1 1AA",
    "Belfast": "BT1 5GS",
    "Newcastle upon Tyne": "NE1 1AA",
    "Newcastle-upon-Tyne": "NE1 1AA",
    "Brighton": "BN1 1AA",
    "Brighton & Hove": "BN1 1AA",
    "Hull": "HU1 1AA",
    "Plymouth": "PL1 1AA",
    "Stoke-on-Trent": "ST1 1AA",
    "Wolverhampton": "WV1 1AA",
    "Derby": "DE1 1AA",
    "Swansea": "SA1 1AA",
    "Southampton": "SO14 7SJ",
    "Salford": "M50 2EQ",
    "Aberdeen": "AB10 1AA",
    "Portsmouth": "PO1 1AA",
    "York": "YO1 6GA",
    "Peterborough": "PE1 1AA",
    "Dundee": "DD1 1AA",
    "Oxford": "OX1 1AA",
    "Cambridge": "CB1 1AA",
    "Norwich": "NR1 1AA",
    "Exeter": "EX1 1AA",
    "Luton": "LU1 2BN",
    "Milton Keynes": "MK9 1AA",
    "Northampton": "NN1 1AA",
    "Bournemouth": "BH1 1AA",
    "Reading": "RG1 1AA",
    "Blackpool": "FY1 1AA",
    "Preston": "PR1 1AA",
    "Huddersfield": "HD1 1AA",
    "Slough": "SL1 1AA",
    "Swindon": "SN1 1AA",
    "Bolton": "BL1 1SA",
    "Oldham": "OL1 1AA",
    "Rochdale": "OL16 1AA",
    "Doncaster": "DN1 1AA",
    "Bedford": "MK40 1AA",
    "Ipswich": "IP1 1AA",
    "Cheltenham": "GL50 1AA",
    "Gloucester": "GL1 1AA",
    "Worcester": "WR1 1AA",
    "Hereford": "HR1 2AA",
    "Shrewsbury": "SY1 1AA",
    "Telford": "TF3 4NT",
    "Canterbury": "CT1 2YA",
    "Carlisle": "CA3 8AN",
    "Chelmsford": "CM1 1AA",
    "Chester": "CH1 2HJ",
    "Colchester": "CO1 1JG",
    "Durham": "DH1 3NJ",
    "Lancaster": "LA1 1AA",
    "Lincoln": "LN1 1AA",
    "Southend-on-Sea": "SS1 1AA",
    "St Albans": "AL1 3PG",
    "Truro": "TR1 2LL",
    "Wakefield": "WF1 1AA",
    "Winchester": "SO23 9BE",
    "Westminster": "SW1A 1AA",
    "Warrington": "WA1 1AA",
    "Wigan": "WN1 1AA",
    "Middlesbrough": "TS1 1AA",
    "Barnsley": "S70 1AA",
    "Newport": "NP20 1AA",
    "Poole": "BH15 1AA",
    "Stockport": "SK1 1AA",
    "Basildon": "SS14 1AA",
    "Maidstone": "ME14 1AA",
    "Crawley": "RH10 1AA",
    "Worthing": "BN11 1AA",
    "Sutton Coldfield": "B72 1AA",
    "Dudley": "DY1 1AA",
    "Walsall": "WS1 1AA",
    "Watford": "WD17 1AA",
    "High Wycombe": "HP11 1AA",
    "Harlow": "CM20 1AA",
    "Stevenage": "SG1 1AA",
    "Redditch": "B97 4AA",
    "Chesterfield": "S40 1AA",
    "Mansfield": "NG18 1AA",
    "Beeston": "NG9 1AA",
    "Loughborough": "LE11 1AA",
    "Burton upon Trent": "DE14 1AA",
    "Crewe": "CW1 2BD",
    "Macclesfield": "SK11 6BA",
    "Scunthorpe": "DN15 6AA",
    "Grimsby": "DN31 1AA",
    "Harrogate": "HG1 1TE",
    "Halifax": "HX1 1AA",
    "Batley": "WF17 5DA",
    "Keighley": "BD21 3AA",
    "South Shields": "NE33 1AA",
    "Gateshead": "NE8 1AA",
    "Darlington": "DL1 5AD",
    "Hartlepool": "TS24 7DA",
    "Stockton-on-Tees": "TS18 1AA",
    "Hemel Hempstead": "HP1 1AA",
    "Gillingham": "ME7 1AA",
    "Eastbourne": "BN21 1AA",
    "Rayleigh": "SS6 7EW",
    "Lowestoft": "NR32 1AA",
    "Woking": "GU21 6BG",
    "Maidenhead": "SL6 1AA",
    "Basingstoke": "RG21 4AA",
    "Fareham": "PO16 7AA",
    "Gosport": "PO12 1AA",
    "Ewell": "KT17 1TN",
    "Crosby": "L23 2SE",
    "Paignton": "TQ3 3AA",
    "Torquay": "TQ1 1AA",
    "Bebington": "CH63 7PG",
    "Halesowen": "B63 3AQ",
    "Kidderminster": "DY10 1AA",
    "Rugby": "CV21 2AA",
    "Leamington Spa": "CV32 4AA",
    "Kettering": "NN16 0AA",
    "Wellingborough": "NN8 1AA",
    "Dunstable": "LU6 1AA",
    "Aylesbury": "HP20 1AA",
    "Cheshunt": "EN8 9XQ",
    "Welwyn Garden City": "AL8 6AE",
    "Margate": "CT9 1AA",
    "Royal Tunbridge Wells": "TN1 1AA",
    "Ashford": "TN23 1AA",
    "Braintree": "CM7 3AA",
    "Canvey Island": "SS8 7AA",
    "Clacton-on-Sea": "CO15 1AA",
    "Sittingbourne": "ME10 1AA",
    "Gravesend": "DA12 1AA",
    "Dartford": "DA1 1AA",
    "Weymouth": "DT4 8AA",
    "Falmouth": "TR11 2AA",
    "St Austell": "PL25 4AA",
    "Scarborough": "YO11 2AA",
    "Bridlington": "YO15 2AA",
    "Castleford": "WF10 1AA",
    "Pontefract": "WF8 1AA",
    "Rotherham": "S60 1AA",
    "Sale": "M33 7AA",
    "Widnes": "WA8 6AA",
    "Runcorn": "WA7 1AA",
    "Ellesmere Port": "CH65 0AA",
    "Birkenhead": "CH41 5NG",
    "Wallasey": "CH45 4NS",
    "Barrow-in-Furness": "LA14 1AA",
    "Workington": "CA14 3EP",
    "Whitehaven": "CA28 7EU",
    "Chorley": "PR7 1AA",
    "Accrington": "BB5 1AA",
    "Burnley": "BB11 1AA",
    "Lytham St Annes": "FY8 1AA",
    "Stafford": "ST16 1AA",
    "Bromsgrove": "B61 8DA",
    "Grantham": "NG31 6AA",
    "Ely": "CB7 4AA",
    "Lichfield": "WS13 6AA",
    "Ripon": "HG4 1AA",
    "Salisbury": "SP1 2AA",
    "Wells": "BA5 2PU",
    "Solihull": "B91 3AA",
    "Guildford": "GU1 4AA",
    "Staines": "TW18 4AA",
    "Chatham": "ME4 4AA",
    "Hastings": "TN34 1AA",
    "Nuneaton": "CV11 4AA",
    "Tamworth": "B79 7AA",
    "Cannock": "WS11 1AA",
    "Bath": "BA1 1AA",
};

function getDefaultPostcode(city) {
    if (!city) return null;

    // Normalize: lowercase, replace hyphens/underscores with spaces, trim
    const cityLower = city.toLowerCase().replace(/[-_]/g, ' ').trim();

    // Create lower case map for lookup (do this once efficiently if possible, but here is fine for script)
    const normalizedMap = Object.keys(cityPostcodes).reduce((acc, key) => {
        const kNorm = key.toLowerCase().replace(/[-_]/g, ' ').trim();
        acc[kNorm] = cityPostcodes[key];
        return acc;
    }, {});

    // Direct match against normalized map
    if (normalizedMap[cityLower]) return normalizedMap[cityLower];

    // Fuzzy match
    const matchedKey = Object.keys(normalizedMap).find(k => {
        return cityLower.includes(k) || k.includes(cityLower);
    });

    if (matchedKey) return normalizedMap[matchedKey];

    return null;
}

// Regex for valid UK Postcodes
const POSTCODE_REGEX = /([Gg][Ii][Rr] 0[Aa]{2})|((([A-Za-z][0-9]{1,2})|(([A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2})|(([A-Za-z][0-9][A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y][0-9][A-Za-z]?))))\s?[0-9][A-Za-z]{2})/;

async function enrichPostcodes() {
    console.log("🚀 Starting Postcode Enrichment...");

    // 1. Count Total
    const { count, error: countError } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true });

    if (countError) {
        console.error("Error counting businesses:", countError);
        return;
    }

    console.log(`Found ${count} total businesses.`);

    let enrichedCount = 0;
    let extractedCount = 0;
    let fallbackCount = 0;
    let processCount = 0;

    const BATCH_SIZE = 1000;
    const totalBatches = Math.ceil(count / BATCH_SIZE);

    for (let i = 0; i < totalBatches; i++) {
        console.log(`Processing Batch ${i + 1}/${totalBatches}...`);

        const { data: businesses, error } = await supabase
            .from('businesses')
            .select('id, address, city, postcode')
            .range(i * BATCH_SIZE, (i + 1) * BATCH_SIZE - 1);

        if (error) {
            console.error("Error fetching batch:", error);
            continue;
        }

        // Parallel processing within batch
        const updates = await Promise.all(businesses.map(async (biz) => {
            // Processing logic

            let newPostcode = null;
            let method = null;

            // Strategy 1: Extraction
            if (biz.address) {
                const match = biz.address.match(POSTCODE_REGEX);
                if (match) {
                    newPostcode = match[0].toUpperCase();
                    method = 'Extracted';
                }
            }

            // Strategy 2: Fallback
            if (!newPostcode && biz.city) {
                const fallback = getDefaultPostcode(biz.city);
                if (fallback) {
                    newPostcode = fallback;
                    method = 'Fallback';
                }
            }

            // Return update promise if needed
            if (newPostcode && (!biz.postcode || biz.postcode !== newPostcode)) {
                const { error: updateError } = await supabase
                    .from('businesses')
                    .update({ postcode: newPostcode })
                    .eq('id', biz.id);

                if (!updateError) {
                    return { success: true, method };
                } else {
                    console.error(`Failed to update ${biz.id}:`, updateError.message);
                    return { success: false };
                }
            }
            return { skipped: true };
        }));

        // Stats update
        updates.forEach(u => {
            if (u.success) {
                enrichedCount++;
                if (u.method === 'Extracted') extractedCount++;
                if (u.method === 'Fallback') fallbackCount++;
            }
            processCount++;
        });
    }

    console.log("✅ Enrichment Complete!");
    console.log(`Total Processed: ${processCount}`); // Note: processCount logic in loop might be slightly off if batched map returns array length? No, map returns array of promises.
    console.log(`Total Updated: ${enrichedCount}`);
    console.log(`  - Extracted from Address: ${extractedCount}`);
    console.log(`  - City Fallback Applied: ${fallbackCount}`);
}

enrichPostcodes();
