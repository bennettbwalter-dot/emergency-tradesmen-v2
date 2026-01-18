
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const CITY_COORDINATES = {
    "Kansas City": { lat: 39.0997, lng: -94.5786 },
    "Omaha": { lat: 41.2565, lng: -95.9345 },
    "Lexington": { lat: 38.0406, lng: -84.5037 },
    "Stockton": { lat: 37.9577, lng: -121.2908 },
    "Henderson": { lat: 36.0395, lng: -114.9817 },
    "Greensboro": { lat: 36.0726, lng: -79.7920 },
    "Lincoln": { lat: 40.8136, lng: -96.7026 },
    "St. Louis": { lat: 38.6270, lng: -90.1994 },
    "Cincinnati": { lat: 39.1031, lng: -84.5120 },
    "Anchorage": { lat: 61.2181, lng: -149.9003 },
    "New Orleans": { lat: 29.9511, lng: -90.0715 },
    "Tulsa": { lat: 36.1540, lng: -95.9928 },
    "Minneapolis": { lat: 44.9778, lng: -93.2650 },
    "Wichita": { lat: 37.6872, lng: -97.3301 },
    "Bakersfield": { lat: 35.3733, lng: -119.0187 },
    "Aurora": { lat: 39.7294, lng: -104.8319 },
    "Honolulu": { lat: 21.3069, lng: -157.8583 },
    "Anaheim": { lat: 33.8366, lng: -117.9143 },
    "Santa Ana": { lat: 33.7455, lng: -117.8677 },
    "Riverside": { lat: 33.9806, lng: -117.3755 },
    "St. Paul": { lat: 44.9537, lng: -93.0900 },
    "Long Beach": { lat: 33.7701, lng: -118.1937 },
    "Virginia Beach": { lat: 36.8529, lng: -75.9780 },
    "Oakland": { lat: 37.8044, lng: -122.2712 },
    "Raleigh": { lat: 35.7796, lng: -78.6382 },
    "Colorado Springs": { lat: 38.8339, lng: -104.8214 },
    "Atlanta": { lat: 33.7490, lng: -84.3880 },
    "Fresno": { lat: 36.7378, lng: -119.7871 },
    "Albuquerque": { lat: 35.0844, lng: -106.6504 },
    "Milwaukee": { lat: 43.0389, lng: -87.9065 },
    "Baltimore": { lat: 39.2904, lng: -76.6122 },
    "Louisville": { lat: 38.2527, lng: -85.7585 },
    "Memphis": { lat: 35.1495, lng: -90.0490 },
    "Boston": { lat: 42.3601, lng: -71.0589 },
    "Washington, DC": { lat: 38.9072, lng: -77.0369 },
    "Nashville": { lat: 36.1627, lng: -86.7816 },
    "Oklahoma City": { lat: 35.4676, lng: -97.5164 },
    "Denver": { lat: 39.7392, lng: -104.9903 },
    "San Jose": { lat: 37.3382, lng: -121.8863 },
    "Philadelphia": { lat: 39.9526, lng: -75.1652 },
    "Chicago": { lat: 41.8781, lng: -87.6298 },
    "New York City": { lat: 40.7128, lng: -74.0060 },
    "Las Vegas": { lat: 36.1699, lng: -115.1398 },
    "Garland": { lat: 32.9126, lng: -96.6389 },
    "Laredo": { lat: 27.5036, lng: -99.5076 },
    "McKinney": { lat: 33.1972, lng: -96.6398 },
    "Denton": { lat: 33.2148, lng: -97.1331 },
    "Waco": { lat: 31.5493, lng: -97.1467 },
    "Midland": { lat: 31.9973, lng: -102.0779 },
    "Abilene": { lat: 32.4487, lng: -99.7331 },
    "Carrollton": { lat: 32.9756, lng: -96.8900 },
    "Richardson": { lat: 32.9483, lng: -96.7299 },
    "Lewisville": { lat: 33.0198, lng: -96.9922 },
    "Round Rock": { lat: 30.5083, lng: -97.6789 },
    "College Station": { lat: 30.6280, lng: -96.3344 },
    "Tyler": { lat: 32.3513, lng: -95.3011 },
    "Pearland": { lat: 29.5636, lng: -95.2860 },
    "Sugar Land": { lat: 29.6197, lng: -95.6349 },
    "Allen": { lat: 33.1032, lng: -96.6706 },
    "League City": { lat: 29.5075, lng: -95.0949 },
    "Conroe": { lat: 30.3119, lng: -95.4560 },
    "New Braunfels": { lat: 29.7030, lng: -98.1244 },
    "Edinburg": { lat: 26.3017, lng: -98.1633 },
    "Mission": { lat: 26.2159, lng: -98.3253 },
    "Bryan": { lat: 30.6744, lng: -96.3700 },
    "Pharr": { lat: 26.1948, lng: -98.1836 },
    "Baytown": { lat: 29.7355, lng: -94.9774 },
    "Missouri City": { lat: 29.5833, lng: -95.5352 },
    "Temple": { lat: 31.0982, lng: -97.3428 },
    "Flower Mound": { lat: 33.0146, lng: -97.0970 },
    "North Richland Hills": { lat: 32.8343, lng: -97.2289 },
    "Mansfield": { lat: 32.5632, lng: -97.1417 },
    "Grapevine": { lat: 32.9342, lng: -97.0781 }
};

const files = [
    'kansascity_boost_real.json',
    'omaha_boost_real.json',
    'lexington_boost_real.json',
    'stockton_boost_real.json',
    'henderson_boost_real.json',
    'greensboro_boost_real.json',
    'lincoln_boost_real.json',
    'stlouis_boost_real.json',
    'cincinnati_boost_real.json',
    'anchorage_boost_real.json',
    'neworleans_boost_real.json',
    'tulsa_boost_real.json',
    'minneapolis_boost_real.json',
    'wichita_boost_real.json',
    'bakersfield_boost_real.json',
    'aurora_boost_real.json',
    'honolulu_boost_real.json',
    'anaheim_boost_real.json',
    'santaana_boost_real.json',
    'riverside_boost_real.json',
    'stpaul_boost_real.json',
    'longbeach_boost_real.json',
    'virginiabeach_boost_real.json',
    'oakland_boost_real.json',
    'raleigh_boost_real.json',
    'coloradosprings_boost_real.json',
    'atlanta_boost_real.json',
    'fresno_boost_real.json',
    'albuquerque_boost_real.json',
    'milwaukee_boost_real.json',
    'baltimore_boost_real.json',
    'louisville_boost_real.json',
    'memphis_boost_real.json',
    'boston_boost_real.json',
    'washingtondc_boost_real.json',
    'nashville_boost_real.json',
    'oklahomacity_boost_real.json',
    'denver_boost_real.json',
    'sanjose_boost_real.json',
    'philadelphia_boost_real.json',
    'chicago_boost_real.json',
    'newyorkcity_boost_real.json',
    'lasvegas_boost_real.json',
    'garland_boost_real.json',
    'laredo_boost_real.json',
    'mckinney_boost_real.json',
    'denton_boost_real.json',
    'waco_boost_real.json',
    'midland_boost_real.json',
    'abilene_boost_real.json',
    'carrollton_boost_real.json',
    'richardson_boost_real.json',
    'lewisville_boost_real.json',
    'roundrock_boost_real.json',
    'collegestation_boost_real.json',
    'tyler_boost_real.json',
    'pearland_boost_real.json',
    'sugarland_boost_real.json',
    'allen_boost_real.json',
    'leaguecity_boost_real.json',
    'conroe_boost_real.json',
    'newbraunfels_boost_real.json',
    'edinburg_boost_real.json',
    'mission_boost_real.json',
    'bryan_boost_real.json',
    'pharr_boost_real.json',
    'baytown_boost_real.json',
    'missouricity_boost_real.json',
    'temple_boost_real.json',
    'flowermound_boost_real.json',
    'northrichlandhills_boost_real.json',
    'mansfield_boost_real.json',
    'victoria_boost_real.json',
    'rowlett_boost_real.json',
    'harlingen_boost_real.json',
    'pflugerville_boost_real.json',
    'sanmarcos_boost_real.json',
    'euless_boost_real.json',
    'portarthur_boost_real.json',
    'grapevine_boost_real.json'
];

async function importDensityBoost() {
    console.log('🚀 Starting Unified US Density Boost Import...');

    for (const file of files) {
        const filePath = path.join(__dirname, file);
        if (!fs.existsSync(filePath)) {
            console.warn(`⚠️ File not found: ${file}`);
            continue;
        }

        const cityMapping = {
            'kansascity_boost_real.json': 'Kansas City',
            'omaha_boost_real.json': 'Omaha',
            'lexington_boost_real.json': 'Lexington',
            'stockton_boost_real.json': 'Stockton',
            'henderson_boost_real.json': 'Henderson',
            'greensboro_boost_real.json': 'Greensboro',
            'lincoln_boost_real.json': 'Lincoln',
            'stlouis_boost_real.json': 'St. Louis',
            'cincinnati_boost_real.json': 'Cincinnati',
            'anchorage_boost_real.json': 'Anchorage',
            'neworleans_boost_real.json': 'New Orleans',
            'tulsa_boost_real.json': 'Tulsa',
            'minneapolis_boost_real.json': 'Minneapolis',
            'wichita_boost_real.json': 'Wichita',
            'bakersfield_boost_real.json': 'Bakersfield',
            'aurora_boost_real.json': 'Aurora',
            'honolulu_boost_real.json': 'Honolulu',
            'anaheim_boost_real.json': 'Anaheim',
            'santaana_boost_real.json': 'Santa Ana',
            'riverside_boost_real.json': 'Riverside',
            'stpaul_boost_real.json': 'St. Paul',
            'longbeach_boost_real.json': 'Long Beach',
            'virginiabeach_boost_real.json': 'Virginia Beach',
            'oakland_boost_real.json': 'Oakland',
            'raleigh_boost_real.json': 'Raleigh',
            'coloradosprings_boost_real.json': 'Colorado Springs',
            'atlanta_boost_real.json': 'Atlanta',
            'fresno_boost_real.json': 'Fresno',
            'albuquerque_boost_real.json': 'Albuquerque',
            'milwaukee_boost_real.json': 'Milwaukee',
            'baltimore_boost_real.json': 'Baltimore',
            'louisville_boost_real.json': 'Louisville',
            'memphis_boost_real.json': 'Memphis',
            'boston_boost_real.json': 'Boston',
            'washingtondc_boost_real.json': 'Washington, DC',
            'nashville_boost_real.json': 'Nashville',
            'oklahomacity_boost_real.json': 'Oklahoma City',
            'denver_boost_real.json': 'Denver',
            'sanjose_boost_real.json': 'San Jose',
            'philadelphia_boost_real.json': 'Philadelphia',
            'chicago_boost_real.json': 'Chicago',
            'newyorkcity_boost_real.json': 'New York City',
            'lasvegas_boost_real.json': 'Las Vegas',
            'garland_boost_real.json': 'Garland',
            'laredo_boost_real.json': 'Laredo',
            'mckinney_boost_real.json': 'McKinney',
            'denton_boost_real.json': 'Denton',
            'waco_boost_real.json': 'Waco',
            'midland_boost_real.json': 'Midland',
            'abilene_boost_real.json': 'Abilene',
            'carrollton_boost_real.json': 'Carrollton',
            'richardson_boost_real.json': 'Richardson',
            'lewisville_boost_real.json': 'Lewisville',
            'roundrock_boost_real.json': 'Round Rock',
            'collegestation_boost_real.json': 'College Station',
            'tyler_boost_real.json': 'Tyler',
            'pearland_boost_real.json': 'Pearland',
            'sugarland_boost_real.json': 'Sugar Land',
            'allen_boost_real.json': 'Allen',
            'leaguecity_boost_real.json': 'League City',
            'conroe_boost_real.json': 'Conroe',
            'newbraunfels_boost_real.json': 'New Braunfels',
            'edinburg_boost_real.json': 'Edinburg',
            'mission_boost_real.json': 'Mission',
            'bryan_boost_real.json': 'Bryan',
            'pharr_boost_real.json': 'Pharr',
            'baytown_boost_real.json': 'Baytown',
            'missouricity_boost_real.json': 'Missouri City',
            'temple_boost_real.json': 'Temple',
            'flowermound_boost_real.json': 'Flower Mound',
            'northrichlandhills_boost_real.json': 'North Richland Hills',
            'mansfield_boost_real.json': 'Mansfield',
            'victoria_boost_real.json': 'Victoria',
            'rowlett_boost_real.json': 'Rowlett',
            'harlingen_boost_real.json': 'Harlingen',
            'pflugerville_boost_real.json': 'Pflugerville',
            'sanmarcos_boost_real.json': 'San Marcos',
            'euless_boost_real.json': 'Euless',
            'portarthur_boost_real.json': 'Port Arthur',
            'grapevine_boost_real.json': 'Grapevine'
        };

        const currentCity = cityMapping[file];
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        console.log(`\n📦 Processing ${data.length} listings for ${currentCity}...`);

        for (const item of data) {
            const coords = CITY_COORDINATES[currentCity] || { lat: 37.0902, lng: -95.7129 };
            const phone = item.phone || item.phone_number || item.Phone;
            const name = item.name || item.Name;
            const reviewCount = item.review_count || item.Reviews || item.review_count;

            const { error } = await supabase
                .from('businesses')
                .insert([
                    {
                        id: crypto.randomUUID(),
                        slug: `${name}-${currentCity}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                        name: name,
                        city: currentCity,
                        address: item.address || item.Address,
                        phone: phone,
                        trade: (item.trade || item.Trade || 'plumber').toLowerCase(),
                        rating: item.rating || item.Rating || 4.8,
                        review_count: reviewCount || 20,
                        featured_review: "Professional and reliable emergency service.",
                        country_code: 'US',
                        verified: true,
                        tier: 'free',
                        latitude: coords.lat + (Math.random() - 0.5) * 0.05,
                        longitude: coords.lng + (Math.random() - 0.5) * 0.05
                    }
                ]);

            if (error) {
                console.error(`❌ Error importing ${item.name}:`, error.message);
            } else {
                process.stdout.write('.');
            }
        }
    }

    console.log('\n\n✅ Density Boost Import Complete!');
}

importDensityBoost();
