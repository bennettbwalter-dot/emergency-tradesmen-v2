import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = fs.existsSync(path.join(__dirname, '../.env.production'))
    ? path.join(__dirname, '../.env.production')
    : path.join(__dirname, '../.env');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const ukTrades = ["plumber", "electrician", "locksmith", "gas-engineer", "drain-specialist", "glazier", "breakdown"];
const usTrades = ["plumber", "electrician", "locksmith", "drain-specialist", "glazier", "roofer", "water-restoration", "breakdown"];

const ukCities = [
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

const usCitiesPath = path.join(__dirname, '../src/lib/us_cities.json');
const usData = JSON.parse(fs.readFileSync(usCitiesPath, 'utf8'));

let usCities = [];
if (usData && usData.states) {
    usData.states.forEach(state => {
        if (state.metros) {
            state.metros.forEach(metro => {
                if (metro.cities) {
                    metro.cities.forEach(city => {
                        if (city.name) usCities.push({ name: city.name, state: state.name });
                        if (city.suburbs) {
                            city.suburbs.forEach(sub => {
                                if (sub.name) usCities.push({ name: sub.name, state: state.name });
                            });
                        }
                    });
                }
            });
        }
    });
}

async function auditPages() {
    console.log('🔍 Starting audit of landing pages...');
    const emptyPages = [];

    // UK Audit
    console.log('🇬🇧 Auditing UK pages...');
    for (const trade of ukTrades) {
        for (const city of ukCities) {
            const { count, error } = await supabase
                .from('businesses')
                .select('*', { count: 'exact', head: true })
                .eq('country_code', 'GB')
                .eq('trade', trade)
                .eq('city', city);
            
            if (error) console.error(`Error checking ${trade} in ${city}:`, error);
            if (count === 0) {
                emptyPages.push(`GB: /emergency-${trade}/${city.toLowerCase().replace(/ /g, '-')}`);
            }
        }
    }

    // US Audit
    console.log('🇺🇸 Auditing US pages...');
    // Only sample for now as there are too many US cities
    const sampleUSCities = usCities.slice(0, 100); 
    for (const trade of usTrades) {
        for (const cityObj of sampleUSCities) {
            const { count, error } = await supabase
                .from('businesses')
                .select('*', { count: 'exact', head: true })
                .eq('country_code', 'US')
                .eq('trade', trade)
                .eq('city', cityObj.name);

            if (error) console.error(`Error checking ${trade} in ${cityObj.name}:`, error);
            if (count === 0) {
                emptyPages.push(`US: /emergency-${trade}/${cityObj.name.toLowerCase().replace(/ /g, '-')}`);
            }
        }
    }

    console.log(`\n📊 Audit Complete!`);
    console.log(`Found ${emptyPages.length} empty landing pages (sampled US).`);
    if (emptyPages.length > 0) {
        console.log('First 20 empty pages:');
        emptyPages.slice(0, 20).forEach(p => console.log(p));
        fs.writeFileSync('empty_pages_audit.txt', emptyPages.join('\n'));
        console.log('\nFull list saved to empty_pages_audit.txt');
    }
}

auditPages();
