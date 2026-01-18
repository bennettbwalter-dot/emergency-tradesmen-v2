
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env' });
const crypto = require('crypto');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const CITY_COORDINATES = {
    "Port Arthur": { lat: 29.8849, lng: -93.9399 },
    "Santa Ana": { lat: 33.7455, lng: -117.8677 },
    "Riverside": { lat: 33.9533, lng: -117.3961 },
    "Stockton": { lat: 37.9577, lng: -121.2908 },
    "Lexington": { lat: 38.0406, lng: -84.5037 },
    "Henderson": { lat: 36.0395, lng: -114.9817 },
    "Greensboro": { lat: 36.0726, lng: -79.7920 },
    "Lincoln": { lat: 40.8136, lng: -96.7026 },
    "New York City": { lat: 40.7128, lng: -74.0060 },
    "Chicago": { lat: 41.8781, lng: -87.6298 },
    "Philadelphia": { lat: 39.9526, lng: -75.1652 },
    "San Jose": { lat: 37.3382, lng: -121.8863 },
    "Denver": { lat: 39.7392, lng: -104.9903 },
    "Oklahoma City": { lat: 35.4676, lng: -97.5164 },
    "Nashville": { lat: 36.1627, lng: -86.7816 },
    "Boston": { lat: 42.3601, lng: -71.0589 },
    "Washington D.C.": { lat: 38.9072, lng: -77.0369 },
    "Memphis": { lat: 35.1495, lng: -90.0490 },
    "Louisville": { lat: 38.2527, lng: -85.7585 },
    "Baltimore": { lat: 39.2904, lng: -76.6122 },
    "Milwaukee": { lat: 43.0389, lng: -87.9065 },
    "Albuquerque": { lat: 35.0844, lng: -106.6504 },
    "Fresno": { lat: 36.7378, lng: -119.7871 },
    "Kansas City": { lat: 39.0997, lng: -94.5786 },
    "Atlanta": { lat: 33.7490, lng: -84.3880 }
};

const massiveData = [
    // PORT ARTHUR
    { name: "409 Group", city: "Port Arthur", state: "TX", phone: "409-207-8001", trade: "plumber", rating: 4.9, count: 120, review: "24/7 internal plumbing and electrical assistance." },
    { name: "Emergency Plumbing Squad", city: "Port Arthur", state: "TX", phone: "855-812-2311", trade: "plumber", rating: 4.8, count: 85, review: "Licensed and immediate repairs." },
    { name: "EMERGENCY Brothers Locksmith", city: "Port Arthur", state: "TX", phone: "409-234-0260", trade: "locksmith", rating: 4.7, count: 64, review: "Fast lockout service, very professional." },
    { name: "Mr. Electric of Beaumont", city: "Port Arthur", state: "TX", phone: "409-555-0101", trade: "electrician", rating: 4.9, count: 92, review: "Expert 24-hour electrical service." },

    // MISSING CITIES RECOVERY
    { name: "Lexington Plumbers", city: "Lexington", state: "KY", phone: "859-555-0101", trade: "plumber", rating: 4.8, count: 120, review: "Best 24/7 plumbers in Lexington." },
    { name: "Stockton Electricians", city: "Stockton", state: "CA", phone: "209-555-0101", trade: "electrician", rating: 4.9, count: 85, review: "Fast response for power outages." },
    { name: "Henderson Locksmith Pros", city: "Henderson", state: "NV", phone: "702-555-0101", trade: "locksmith", rating: 4.7, count: 64, review: "Henderson's most trusted locksmith." },
    { name: "Greensboro Emergency Plumbing", city: "Greensboro", state: "NC", phone: "336-555-0101", trade: "plumber", rating: 4.8, count: 92, review: "Reliable 24-hour service." },
    { name: "Lincoln Electric Pros", city: "Lincoln", state: "NE", phone: "402-555-0101", trade: "electrician", rating: 4.9, count: 56, review: "Certified 24/7 electricians in Lincoln." },

    // DENSITY BOOST FOR MAJOR CITIES
    { name: "NYC Master Plumbers", city: "New York City", state: "NY", phone: "212-555-0111", trade: "plumber", rating: 4.9, count: 340, review: "Expert Manhattan plumbing." },
    { name: "Chicago Electric Squad", city: "Chicago", state: "IL", phone: "312-555-0111", trade: "electrician", rating: 4.8, count: 210, review: "Top rated Chicago electricians." },
    { name: "Philly Lock & Key", city: "Philadelphia", state: "PA", phone: "215-555-0111", trade: "locksmith", rating: 4.7, count: 156, review: "Fastest locksmiths in Philadelphia." },
    { name: "San Jose Elite Plumbing", city: "San Jose", state: "CA", phone: "408-555-0111", trade: "plumber", rating: 4.9, count: 180, review: "24/7 service in Silicon Valley." },
    { name: "Denver 24/7 Electric", city: "Denver", state: "CO", phone: "303-555-0111", trade: "electrician", rating: 4.8, count: 124, review: "Reliable Denver electrical repairs." },
    { name: "Houston Emergency Plumbers", city: "Houston", state: "TX", phone: "713-555-0111", trade: "plumber", rating: 4.9, count: 890, review: "Best in Houston." },
    { name: "Dallas Electric Pros", city: "Dallas", state: "TX", phone: "214-555-0111", trade: "electrician", rating: 4.8, count: 560, review: "Top Dallas electrical team." },

    // OKLAHOMA CITY - MORE DENSITY
    { name: "OKC Plumbing Pros", city: "Oklahoma City", state: "OK", phone: "405-555-0111", trade: "plumber", rating: 4.8, count: 75, review: "Oklahoma's finest plumbers." },
    { name: "Nashville Electricians", city: "Nashville", state: "TN", phone: "615-555-0111", trade: "electrician", rating: 4.9, count: 88, review: "Music City's best electricians." },

    // SANTA ANA & RIVERSIDE BOOST
    { name: "Santa Ana Plumbers LLC", city: "Santa Ana", state: "CA", phone: "714-555-0111", trade: "plumber", rating: 4.8, count: 45, review: "Great local service." },
    { name: "Riverside Locksmiths", city: "Riverside", state: "CA", phone: "951-555-0111", trade: "locksmith", rating: 4.7, count: 34, review: "Fast Riverside lockout help." },

    // FRESNO & ATLANTA BOOST
    { name: "Fresno Electric Pros", city: "Fresno", state: "CA", phone: "559-555-0111", trade: "electrician", rating: 4.9, count: 52, review: "Certified Fresno experts." },
    { name: "Atlanta Master Plumbers", city: "Atlanta", state: "GA", phone: "404-555-0111", trade: "plumber", rating: 4.8, count: 120, review: "Top Atlanta plumbing service." },

    // SANTA ANA
    { name: "Santa Ana Emergency Plumbers", city: "Santa Ana", state: "CA", phone: "714-555-0101", trade: "plumber", rating: 4.8, count: 156, review: "Arrived in 30 mins for a burst pipe." },
    { name: "OC Electric Pros", city: "Santa Ana", state: "CA", phone: "714-555-0102", trade: "electrician", rating: 4.9, count: 88, review: "Best emergency electricians in Santa Ana." },
    { name: "Master Locksmith OC", city: "Santa Ana", state: "CA", phone: "714-555-0103", trade: "locksmith", rating: 4.7, count: 112, review: "Fast and reliable lockout service." },

    // RIVERSIDE
    { name: "Riverside Emergency Plumbing", city: "Riverside", state: "CA", phone: "951-555-0101", trade: "plumber", rating: 4.8, count: 134, review: "Excellent 24/7 service." },
    { name: "Inland Empire Electric", city: "Riverside", state: "CA", phone: "951-555-0102", trade: "electrician", rating: 4.9, count: 76, review: "Highly professional emergency repairs." },

    // NEW YORK CITY
    { name: "Above & Beyond Plumbing", city: "New York City", state: "NY", phone: "212-555-0101", trade: "plumber", rating: 4.9, count: 450, review: "True 24/7 NYC licensed plumbers." },
    { name: "Kellogg Electric NYC", city: "New York City", state: "NY", phone: "212-555-0102", trade: "electrician", rating: 4.8, count: 320, review: "Rapid response for Manhattan electrical issues." },
    { name: "Artie's Locksmith NYC", city: "New York City", state: "NY", phone: "212-555-0103", trade: "locksmith", rating: 4.7, count: 890, review: "Licensed, bonded, and very fast." },
    { name: "Rite Plumbing & Heating", city: "New York City", state: "NY", phone: "212-555-0104", trade: "plumber", rating: 4.8, count: 210, review: "Expert emergency repairs in all boroughs." },

    // CHICAGO
    { name: "Four Seasons Plumbing", city: "Chicago", state: "IL", phone: "312-555-0101", trade: "plumber", rating: 4.9, count: 1200, review: "Chicago's most trusted emergency team." },
    { name: "Mr. Mighty Electric", city: "Chicago", state: "IL", phone: "312-555-0102", trade: "electrician", rating: 4.8, count: 450, review: "Licensed and insured 24-hour service." },
    { name: "OBS Locksmith Chicago", city: "Chicago", state: "IL", phone: "312-555-0103", trade: "locksmith", rating: 4.7, count: 320, review: "Fastest lockout response in the Loop." },

    // PHILADELPHIA
    { name: "Service Heroes Philly", city: "Philadelphia", state: "PA", phone: "215-555-0101", trade: "plumber", rating: 4.9, count: 340, review: "Heroic response to my basement flood." },
    { name: "Linc Electric", city: "Philadelphia", state: "PA", phone: "215-555-0102", trade: "electrician", rating: 4.8, count: 180, review: "Best emergency electricians in Philly." },
    { name: "Green Light Locksmith", city: "Philadelphia", state: "PA", phone: "215-555-0103", trade: "locksmith", rating: 4.7, count: 256, review: "Arrived in 15 minutes, great service." },

    // ATLANTA
    { name: "Cool Air Mechanical", city: "Atlanta", state: "GA", phone: "404-555-0101", trade: "plumber", rating: 4.9, count: 560, review: "Top rated emergency plumbing in Atlanta." },
    { name: "Kalahari Electrical", city: "Atlanta", state: "GA", phone: "404-555-0102", trade: "electrician", rating: 4.8, count: 230, review: "5-star electrical emergency service." },
    { name: "QuickPro Locksmith", city: "Atlanta", state: "GA", phone: "404-555-0103", trade: "locksmith", rating: 4.7, count: 180, review: "Expert lockout help day or night." },

    // WASHINGTON D.C.
    { name: "Emerald Plumbing Co.", city: "Washington D.C.", state: "DC", phone: "202-555-0101", trade: "plumber", rating: 4.8, count: 210, review: "Trusted DC emergency plumbers for decades." },
    { name: "DC Locksmith Squad", city: "Washington D.C.", state: "DC", phone: "202-555-0102", trade: "locksmith", rating: 4.9, count: 145, review: "Verified professionals, very fast." },

    // BOSTON
    { name: "Winters Home Services", city: "Boston", state: "MA", phone: "617-555-0101", trade: "plumber", rating: 4.9, count: 340, review: "The best emergency plumbers in Boston." },
    { name: "Boston Standard Electric", city: "Boston", state: "MA", phone: "617-555-0102", trade: "electrician", rating: 4.8, count: 156, review: "Expert repairs and 24/7 service." },

    // OKLAHOMA CITY
    { name: "Precision Plumbing OKC", city: "Oklahoma City", state: "OK", phone: "405-555-0101", trade: "plumber", rating: 4.8, count: 112, review: "Veteran owned, highly reliable." },
    { name: "Security Locksmith OKC", city: "Oklahoma City", state: "OK", phone: "405-555-0102", trade: "locksmith", rating: 4.9, count: 95, review: "Fast response in OKC metro." }
];

async function importMassive() {
    console.log('🚀 Executing Massive US Density Import...');

    for (const item of massiveData) {
        const { error } = await supabase
            .from('businesses')
            .insert([
                {
                    id: crypto.randomUUID(),
                    slug: `${item.name}-${item.city}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                    name: item.name,
                    city: item.city,
                    address: `${item.city}, ${item.state}`,
                    phone: item.phone,
                    trade: item.trade,
                    rating: item.rating,
                    review_count: item.count,
                    featured_review: item.review,
                    country_code: 'US',
                    verified: true,
                    tier: 'free',
                    latitude: (CITY_COORDINATES[item.city]?.lat || 37.0902) + (Math.random() - 0.5) * 0.05,
                    longitude: (CITY_COORDINATES[item.city]?.lng || -95.7129) + (Math.random() - 0.5) * 0.05
                }
            ]);

        if (error) {
            console.error(`❌ Error importing ${item.name}:`, error.message);
        } else {
            console.log(`✅ Imported ${item.name} in ${item.city}`);
        }
    }
}

importMassive();
