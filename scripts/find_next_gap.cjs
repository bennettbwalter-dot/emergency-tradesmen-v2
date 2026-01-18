const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const UK_CITIES = [
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
    "Brixton", "Hackney", "Camden", "Islington", "Greenwich", "Chelsea", "Wembley", "Croydon", "Ealing", "Enfield",
    "Harrow", "Hounslow", "Kingston", "Merton", "Newham", "Redbridge", "Richmond", "Southwark", "Tower Hamlets",
    "Waltham Forest", "Wandsworth", "Woolwich", "Fulham"
];

const STANDARD_TRADES = [
    "plumber", "electrician", "locksmith", "hvac", "gas-engineer",
    "drain-specialist", "glazier", "roofer", "builder",
    "water-restoration", "breakdown"
];

async function findGaps() {
    console.log("Searching for gaps...");

    // We can't query count of every combo efficiently in loop without spamming DB.
    // Better: Fetch ALL GB businesses, then process in memory.
    // 17k records is fine for memory.

    let allData = [];
    let page = 0;
    const pageSize = 1000;
    while (true) {
        const { data, error } = await supabase
            .from('businesses')
            .select('city, trade')
            .eq('country_code', 'GB')
            .range(page * pageSize, (page + 1) * pageSize - 1);

        if (error) { console.error(error); break; }
        if (!data || data.length === 0) break;
        allData = allData.concat(data);
        page++;
    }

    console.log(`Loaded ${allData.length} records.`);

    const counts = {}; // city|trade -> count

    // Helper to normalize
    const norm = (s) => s ? s.toLowerCase().trim() : '';

    allData.forEach(r => {
        const k = `${norm(r.city)}|${norm(r.trade)}`;
        counts[k] = (counts[k] || 0) + 1;
    });

    // Find gaps
    const gaps = [];

    // Prioritize major cities first in the loop (UK_CITIES is roughly sorted by size/importance?)
    for (const city of UK_CITIES) {
        for (const trade of STANDARD_TRADES) {
            const nCity = norm(city);
            const nTrade = norm(trade);
            const k = `${nCity}|${nTrade}`;
            const count = counts[k] || 0;

            if (count < 5) {
                gaps.push({ city, trade, count, missing: 5 - count });
            }
        }
    }

    // Sort by most missing? Or just order of cities?
    // Let's stick to city order to complete one city at a time.

    console.log(`Found ${gaps.length} gaps.`);
    if (gaps.length > 0) {
        console.log("Top 5 Gaps:");
        gaps.slice(0, 5).forEach(g => console.log(`${g.city} - ${g.trade} (Found: ${g.count}, Need: ${g.missing})`));
    }
}

findGaps();
