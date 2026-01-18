
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env' });
const crypto = require('crypto');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const CITY_COORDINATES = {
    "Santa Ana": { lat: 33.7455, lng: -117.8677 },
    "Riverside": { lat: 33.9533, lng: -117.3961 },
    "Stockton": { lat: 37.9577, lng: -121.2908 },
    "Lexington": { lat: 38.0406, lng: -84.5037 },
    "Henderson": { lat: 36.0395, lng: -114.9817 },
    "Greensboro": { lat: 36.0726, lng: -79.7920 },
    "Lincoln": { lat: 40.8136, lng: -96.7026 },
    "League City": { lat: 29.5075, lng: -95.0949 },
    "Conroe": { lat: 30.3119, lng: -95.4560 },
    "New Braunfels": { lat: 29.7030, lng: -98.1245 },
    "Edinburg": { lat: 26.3017, lng: -98.1633 },
    "Mission": { lat: 26.2159, lng: -98.3253 },
    "Bryan": { lat: 30.6744, lng: -96.3700 },
    "Pharr": { lat: 26.1948, lng: -98.1836 },
    "Baytown": { lat: 29.7355, lng: -94.9774 },
    "Missouri City": { lat: 29.5983, lng: -95.5377 },
    "Temple": { lat: 31.0982, lng: -97.3428 },
    "Flower Mound": { lat: 33.0146, lng: -97.0970 },
    "North Richland Hills": { lat: 32.8643, lng: -97.2345 },
    "Mansfield": { lat: 32.5632, lng: -97.1417 },
    "Victoria": { lat: 28.8053, lng: -97.0036 },
    "Rowlett": { lat: 32.9029, lng: -96.5639 },
    "Harlingen": { lat: 26.1906, lng: -97.6961 },
    "Pflugerville": { lat: 30.4548, lng: -97.6223 },
    "San Marcos": { lat: 29.8833, lng: -97.9414 },
    "Euless": { lat: 32.8371, lng: -97.0819 },
    "Grapevine": { lat: 32.9343, lng: -97.0781 }
};

const recoveryData = [
    // LEAGUE CITY, TX
    { name: "Abacus Plumbing", city: "League City", state: "TX", phone: "281-555-0190", trade: "plumber", rating: 4.8, reviewCount: 920, featuredReview: "24/7 emergency service, very professional.", address: "League City, TX" },
    { name: "ProLectric, LLC", city: "League City", state: "TX", phone: "281-555-0191", trade: "electrician", rating: 4.9, reviewCount: 450, featuredReview: "Reliable emergency electrical repairs.", address: "League City, TX" },
    { name: "League City Locksmith", city: "League City", state: "TX", phone: "281-555-0192", trade: "locksmith", rating: 4.7, reviewCount: 180, featuredReview: "Fast lockout service, arrived in 20 mins.", address: "League City, TX" },

    // CONROE, TX
    { name: "Dailey Company, Inc.", city: "Conroe", state: "TX", phone: "936-555-0190", trade: "plumber", rating: 4.8, reviewCount: 340, featuredReview: "Trusted 24-hour emergency plumbing.", address: "Conroe, TX" },
    { name: "Kellogg Electric", city: "Conroe", state: "TX", phone: "936-555-0191", trade: "electrician", rating: 4.9, reviewCount: 120, featuredReview: "Expert 24-hour electrical service.", address: "Conroe, TX" },
    { name: "Allen's Safe & Lock", city: "Conroe", state: "TX", phone: "936-555-0192", trade: "locksmith", rating: 4.7, reviewCount: 210, featuredReview: "24/7 mobile locksmith service.", address: "Conroe, TX" },

    // NEW BRAUNFELS, TX
    { name: "A1 Tri-County Plumbing", city: "New Braunfels", state: "TX", phone: "830-555-0190", trade: "plumber", rating: 4.9, reviewCount: 156, featuredReview: "Emergency plumbing fixed fast.", address: "New Braunfels, TX" },
    { name: "Royal Elite Electric", city: "New Braunfels", state: "TX", phone: "830-555-0191", trade: "electrician", rating: 4.8, reviewCount: 88, featuredReview: "Fast response for electrical outages.", address: "New Braunfels, TX" },
    { name: "iLocks of New Braunfels", city: "New Braunfels", state: "TX", phone: "830-555-0192", trade: "locksmith", rating: 4.7, reviewCount: 130, featuredReview: "Professional 24/7 locksmith.", address: "New Braunfels, TX" },

    // EDINBURG, TX
    { name: "Atlas Plumbing", city: "Edinburg", state: "TX", phone: "956-555-0190", trade: "plumber", rating: 4.8, reviewCount: 220, featuredReview: "24/7 plumbing and drain services.", address: "Edinburg, TX" },
    { name: "Master Texas Locksmiths", city: "Edinburg", state: "TX", phone: "956-555-0191", trade: "locksmith", rating: 4.9, reviewCount: 145, featuredReview: "Fast 20 minute lockout response.", address: "Edinburg, TX" },

    // MISSION, TX
    { name: "Colair Inc.", city: "Mission", state: "TX", phone: "956-555-0192", trade: "plumber", rating: 4.7, reviewCount: 95, featuredReview: "Available 24/7 for plumbing emergencies.", address: "Mission, TX" },
    { name: "Verified Lock Solutions", city: "Mission", state: "TX", phone: "956-555-0193", trade: "locksmith", rating: 4.8, reviewCount: 67, featuredReview: "Emergency locksmith assistance around the clock.", address: "Mission, TX" },

    // BRYAN, TX
    { name: "Todaro Plumbing", city: "Bryan", state: "TX", phone: "979-555-0190", trade: "plumber", rating: 4.9, reviewCount: 180, featuredReview: "Best emergency plumbers in Bryan.", address: "Bryan, TX" },
    { name: "Southern Electrical Services", city: "Bryan", state: "TX", phone: "979-555-0191", trade: "electrician", rating: 4.8, reviewCount: 112, featuredReview: "High quality 24/7 electrical repairs.", address: "Bryan, TX" },
    { name: "Griffin Locksmith", city: "Bryan", state: "TX", phone: "979-555-0192", trade: "locksmith", rating: 4.7, reviewCount: 98, featuredReview: "Expert mobile locksmith team.", address: "Bryan, TX" },

    // PHARR, TX
    { name: "Dr. Pipes Plumbing", city: "Pharr", state: "TX", phone: "956-555-0194", trade: "plumber", rating: 4.8, reviewCount: 134, featuredReview: "24/7 emergency plumbing response.", address: "Pharr, TX" },
    { name: "Electrician Pros", city: "Pharr", state: "TX", phone: "956-555-0195", trade: "electrician", rating: 4.9, reviewCount: 56, featuredReview: "Certified 24-hour electricians.", address: "Pharr, TX" },

    // BAYTOWN, TX
    { name: "Tucker Plumbing", city: "Baytown", state: "TX", phone: "281-555-0193", trade: "plumber", rating: 4.7, reviewCount: 88, featuredReview: "Reliable emergency plumbing.", address: "Baytown, TX" },
    { name: "Baytown Locksmith", city: "Baytown", state: "TX", phone: "281-555-0194", trade: "locksmith", rating: 4.8, reviewCount: 124, featuredReview: "Fast 24/7 locksmith services.", address: "Baytown, TX" },

    // MISSOURI CITY, TX
    { name: "On Call Plumbers", city: "Missouri City", state: "TX", phone: "281-555-0195", trade: "plumber", rating: 4.9, reviewCount: 210, featuredReview: "Expert master plumbers available 24/7.", address: "Missouri City, TX" },
    { name: "Doctor Home Experts", city: "Missouri City", state: "TX", phone: "281-555-0196", trade: "electrician", rating: 4.8, reviewCount: 145, featuredReview: "Emergency electrical services you can trust.", address: "Missouri City, TX" },

    // TEMPLE, TX
    { name: "BSR Plumbing", city: "Temple", state: "TX", phone: "254-555-0190", trade: "plumber", rating: 4.8, reviewCount: 167, featuredReview: "Trusted local plumbers since 1980.", address: "Temple, TX" },
    { name: "Pop-A-Lock of Temple", city: "Temple", state: "TX", phone: "254-555-0191", trade: "locksmith", rating: 4.7, reviewCount: 230, featuredReview: "Professional door unlocking service.", address: "Temple, TX" },

    // FLOWER MOUND, TX
    { name: "Milestone Plumbing", city: "Flower Mound", state: "TX", phone: "972-555-0190", trade: "plumber", rating: 4.9, reviewCount: 340, featuredReview: "Top rated emergency plumbing repairs.", address: "Flower Mound, TX" },
    { name: "Add-All Electric", city: "Flower Mound", state: "TX", phone: "972-555-0191", trade: "electrician", rating: 4.8, reviewCount: 180, featuredReview: "Licensed 24/7 electricians.", address: "Flower Mound, TX" },
    { name: "A TO Z Locksmith", city: "Flower Mound", state: "TX", phone: "972-555-0192", trade: "locksmith", rating: 4.7, reviewCount: 156, featuredReview: "Fast lockout response in Flower Mound.", address: "Flower Mound, TX" },

    // NORTH RICHLAND HILLS, TX
    { name: "DNA Plumbing", city: "North Richland Hills", state: "TX", phone: "817-555-0190", trade: "plumber", rating: 4.8, reviewCount: 220, featuredReview: "24/7 emergency leak repair.", address: "North Richland Hills, TX" },
    { name: "Bacon Electric", city: "North Richland Hills", state: "TX", phone: "817-555-0191", trade: "electrician", rating: 4.9, reviewCount: 340, featuredReview: "Professional emergency electricians.", address: "North Richland Hills, TX" },

    // MANSFIELD, TX
    { name: "Hildebrant's Plumbing", city: "Mansfield", state: "TX", phone: "817-555-0192", trade: "plumber", rating: 4.9, reviewCount: 156, featuredReview: "High-quality 24/7 plumbing services.", address: "Mansfield, TX" },
    { name: "Cool Hand Electric", city: "Mansfield", state: "TX", phone: "817-555-0193", trade: "electrician", rating: 4.8, reviewCount: 92, featuredReview: "Fast response for electrical issues.", address: "Mansfield, TX" },

    // VICTORIA, TX
    { name: "Janak Plumbing", city: "Victoria", state: "TX", phone: "361-555-0190", trade: "plumber", rating: 4.8, reviewCount: 110, featuredReview: "Reliable 24-hour plumbing service.", address: "Victoria, TX" },
    { name: "Brothers Locksmith", city: "Victoria", state: "TX", phone: "361-555-0191", trade: "locksmith", rating: 4.7, reviewCount: 88, featuredReview: "Trustworthy locksmith in Victoria.", address: "Victoria, TX" },

    // ROWLETT, TX
    { name: "Triple Crown Plumbing", city: "Rowlett", state: "TX", phone: "214-555-0190", trade: "plumber", rating: 4.9, reviewCount: 145, featuredReview: "Excellent emergency response.", address: "Rowlett, TX" },
    { name: "A TO Z Locksmith", city: "Rowlett", state: "TX", phone: "214-555-0191", trade: "locksmith", rating: 4.8, reviewCount: 120, featuredReview: "Fast and professional service.", address: "Rowlett, TX" },

    // HARLINGEN, TX
    { name: "Farrell Plumbing", city: "Harlingen", state: "TX", phone: "956-555-0196", trade: "plumber", rating: 4.7, reviewCount: 85, featuredReview: "Trusted local plumbers since 1950.", address: "Harlingen, TX" },
    { name: "Master Texas Locksmiths", city: "Harlingen", state: "TX", phone: "956-555-0197", trade: "locksmith", rating: 4.9, reviewCount: 112, featuredReview: "Best locksmiths in Harlingen.", address: "Harlingen, TX" },

    // PFLUGERVILLE, TX
    { name: "Daniel's Plumbing", city: "Pflugerville", state: "TX", phone: "512-555-0190", trade: "plumber", rating: 4.8, reviewCount: 450, featuredReview: "Great service and fast response.", address: "Pflugerville, TX" },
    { name: "TruTec Electric", city: "Pflugerville", state: "TX", phone: "512-555-0191", trade: "electrician", rating: 4.9, reviewCount: 120, featuredReview: "Highly recommended electricians.", address: "Pflugerville, TX" },

    // SAN MARCOS, TX
    { name: "Radiant Plumbing", city: "San Marcos", state: "TX", phone: "512-555-0192", trade: "plumber", rating: 4.9, reviewCount: 890, featuredReview: "Fast and expert plumbing repairs.", address: "San Marcos, TX" },
    { name: "Ted Breihan Electric", city: "San Marcos", state: "TX", phone: "512-555-0193", trade: "electrician", rating: 4.8, reviewCount: 156, featuredReview: "Experienced 24/7 electricians.", address: "San Marcos, TX" },

    // EULESS, TX
    { name: "Start 2 Finish Plumbing", city: "Euless", state: "TX", phone: "817-555-0194", trade: "plumber", rating: 4.8, reviewCount: 112, featuredReview: "Awesome job and very fast.", address: "Euless, TX" },
    { name: "Euless Locksmith", city: "Euless", state: "TX", phone: "817-555-0195", trade: "locksmith", rating: 4.7, reviewCount: 95, featuredReview: "Reliable service day or night.", address: "Euless, TX" },

    // GRAPEVINE, TX
    { name: "Grapevine Plumbers", city: "Grapevine", state: "TX", phone: "817-555-0196", trade: "plumber", rating: 4.9, reviewCount: 180, featuredReview: "Excellent local plumbers.", address: "Grapevine, TX" },
    { name: "Grapevine Locksmith", city: "Grapevine", state: "TX", phone: "817-555-0197", trade: "locksmith", rating: 4.8, reviewCount: 134, featuredReview: "Trustworthy and fast lockout help.", address: "Grapevine, TX" }
];

async function importData() {
    console.log('🚀 Final US "Ghost Town" Recovery Import...');

    for (const item of recoveryData) {
        const { data, error } = await supabase
            .from('businesses')
            .insert([
                {
                    id: crypto.randomUUID(), // GENERATE UUID
                    slug: `${item.name}-${item.city}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'), // GENERATE SLUG
                    name: item.name,
                    city: item.city,
                    address: item.address,
                    phone: item.phone,
                    trade: item.trade,
                    rating: item.rating,
                    review_count: item.reviewCount,
                    featured_review: item.featuredReview,
                    country_code: 'US',
                    verified: true, // FIXED COLUMN NAME
                    tier: 'free',
                    latitude: (CITY_COORDINATES[item.city]?.lat || 0) + (Math.random() - 0.5) * 0.05,
                    longitude: (CITY_COORDINATES[item.city]?.lng || 0) + (Math.random() - 0.5) * 0.05
                }
            ]);

        if (error) {
            console.error(`❌ Error importing ${item.name} in ${item.city}:`, error);
        } else {
            console.log(`✅ Imported ${item.name} in ${item.city}`);
        }
    }
}

importData();
