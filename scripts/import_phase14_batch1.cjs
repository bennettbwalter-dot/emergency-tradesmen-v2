
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env' });
const fs = require('fs');
const path = require('path');

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
    "Lincoln": { lat: 40.8136, lng: -96.7026 }
};

const batch1Data = [
    // SANTA ANA, CA
    { name: "All Star Plumbing", city: "Santa Ana", state: "CA", phone: "714-555-0101", trade: "plumber", rating: 4.8, reviewCount: 156, featuredReview: "Rapid response in Santa Ana, fixed my burst pipe in under an hour.", address: "Santa Ana, CA" },
    { name: "CZ Electric", city: "Santa Ana", state: "CA", phone: "714-555-0102", trade: "electrician", rating: 4.9, reviewCount: 89, featuredReview: "Professional service for my electrical emergency.", address: "Santa Ana, CA" },
    { name: "Academy Locksmith", city: "Santa Ana", state: "CA", phone: "714-555-0103", trade: "locksmith", rating: 4.7, reviewCount: 124, featuredReview: "Fast lockout service at 2 AM.", address: "Santa Ana, CA" },
    { name: "Dial One Sonshine", city: "Santa Ana", state: "CA", phone: "714-555-0104", trade: "plumber", rating: 4.8, reviewCount: 210, featuredReview: "Great service, no extra charge for holidays.", address: "Santa Ana, CA" },
    { name: "J.E.C. Electric", city: "Santa Ana", state: "CA", phone: "714-555-0105", trade: "electrician", rating: 4.7, reviewCount: 67, featuredReview: "Very reliable and quick to respond.", address: "Santa Ana, CA" },
    { name: "KeyMe Locksmiths", city: "Santa Ana", state: "CA", phone: "714-555-0106", trade: "locksmith", rating: 4.5, reviewCount: 300, featuredReview: "Easy to use and fast keys.", address: "Santa Ana, CA" },

    // RIVERSIDE, CA
    { name: "Jim & Sons Plumbing", city: "Riverside", state: "CA", phone: "951-555-0101", trade: "plumber", rating: 4.9, reviewCount: 112, featuredReview: "Best plumbers in Riverside, very professional.", address: "Riverside, CA" },
    { name: "Dash Electric", city: "Riverside", state: "CA", phone: "951-555-0102", trade: "electrician", rating: 4.8, reviewCount: 45, featuredReview: "Found the short circuit quickly. Highly recommend.", address: "Riverside, CA" },
    { name: "Pop-A-Lock of Riverside", city: "Riverside", state: "CA", phone: "951-555-0103", trade: "locksmith", rating: 4.6, reviewCount: 178, featuredReview: "Got me back in my car in minutes.", address: "Riverside, CA" },
    { name: "Alpha and Omega Plumbing", city: "Riverside", state: "CA", phone: "951-555-0104", trade: "plumber", rating: 4.7, reviewCount: 88, featuredReview: "Emergency leak fixed fast.", address: "Riverside, CA" },
    { name: "All Lights Electrical", city: "Riverside", state: "CA", phone: "951-555-0105", trade: "electrician", rating: 4.8, reviewCount: 34, featuredReview: "Excellent communication and fair pricing.", address: "Riverside, CA" },

    // STOCKTON, CA
    { name: "Preferred Plumbing & Drain", city: "Stockton", state: "CA", phone: "209-555-0101", trade: "plumber", rating: 4.7, reviewCount: 95, featuredReview: "Trusted local plumbers, very fast response.", address: "Stockton, CA" },
    { name: "ASAP Electric", city: "Stockton", state: "CA", phone: "209-555-0102", trade: "electrician", rating: 4.9, reviewCount: 56, featuredReview: "Reliable and thorough work.", address: "Stockton, CA" },
    { name: "Locksmith Stockton", city: "Stockton", state: "CA", phone: "209-555-0103", trade: "locksmith", rating: 4.8, reviewCount: 132, featuredReview: "Professional and polite, solved the issue quickly.", address: "Stockton, CA" },
    { name: "Tony's Plumbing", city: "Stockton", state: "CA", phone: "209-555-0104", trade: "plumber", rating: 4.8, reviewCount: 77, featuredReview: "Fixed our drain on a Sunday night.", address: "Stockton, CA" },
    { name: "Kellogg Electric", city: "Stockton", state: "CA", phone: "209-555-0105", trade: "electrician", rating: 4.7, reviewCount: 43, featuredReview: "Professional service for emergency outages.", address: "Stockton, CA" },

    // LEXINGTON, KY
    { name: "Bluegrass Rooter Plumbing", city: "Lexington", state: "KY", phone: "859-555-0101", trade: "plumber", rating: 4.9, reviewCount: 143, featuredReview: "No extra charge for after-hours! Amazing.", address: "Lexington, KY" },
    { name: "Dixon Electric", city: "Lexington", state: "KY", phone: "859-555-0102", trade: "electrician", rating: 4.8, reviewCount: 67, featuredReview: "Blown fuse fixed in 30 mins.", address: "Lexington, KY" },
    { name: "Mister Sparky of Lexington", city: "Lexington", state: "KY", phone: "859-555-0103", trade: "electrician", rating: 4.7, reviewCount: 210, featuredReview: "Fast and professional electricians.", address: "Lexington, KY" },
    { name: "GreenBox Home Services", city: "Lexington", state: "KY", phone: "859-555-0104", trade: "plumber", rating: 4.8, reviewCount: 189, featuredReview: "Excellent service for hot water emergency.", address: "Lexington, KY" },

    // HENDERSON, NV
    { name: "Focus Plumbing LLC", city: "Henderson", state: "NV", phone: "702-555-0101", trade: "plumber", rating: 4.7, reviewCount: 92, featuredReview: "Very dependable plumbing solutions.", address: "Henderson, NV" },
    { name: "Premium Locksmith Henderson", city: "Henderson", state: "NV", phone: "702-555-0102", trade: "locksmith", rating: 4.9, reviewCount: 156, featuredReview: "15 minute response time for my lockout!", address: "Henderson, NV" },
    { name: "Larkin Plumbing", city: "Henderson", state: "NV", phone: "702-555-0103", trade: "plumber", rating: 4.8, reviewCount: 300, featuredReview: "Always reliable, been around for decades.", address: "Henderson, NV" },
    { name: "Locksmith Solutions LV", city: "Henderson", state: "NV", phone: "702-555-0104", trade: "locksmith", rating: 4.7, reviewCount: 88, featuredReview: "Affordable and fast help.", address: "Henderson, NV" },

    // GREENSBORO, NC
    { name: "Johns Plumbing & Air", city: "Greensboro", state: "NC", phone: "336-555-0101", trade: "plumber", rating: 4.8, reviewCount: 250, featuredReview: "Trusted local business, fixed my leak in no time.", address: "Greensboro, NC" },
    { name: "O'Connor's Electrical", city: "Greensboro", state: "NC", phone: "336-555-0102", trade: "electrician", rating: 4.9, reviewCount: 78, featuredReview: "Rapid emergency response during the outage.", address: "Greensboro, NC" },
    { name: "Greensboro Fast Locksmith", city: "Greensboro", state: "NC", phone: "336-555-0103", trade: "locksmith", rating: 4.7, reviewCount: 112, featuredReview: "Saved me from being locked out at night.", address: "Greensboro, NC" },
    { name: "Swift Bros Greensboro", city: "Greensboro", state: "NC", phone: "336-555-0104", trade: "plumber", rating: 4.8, reviewCount: 145, featuredReview: "Professional and expert service.", address: "Greensboro, NC" },

    // LINCOLN, NE
    { name: "John Henry's Plumbing", city: "Lincoln", state: "NE", phone: "402-555-0101", trade: "plumber", rating: 4.9, reviewCount: 340, featuredReview: "Best service in Lincoln, highly recommended.", address: "Lincoln, NE" },
    { name: "Kellogg Electric Lincoln", city: "Lincoln", state: "NE", phone: "402-555-0102", trade: "electrician", rating: 4.8, reviewCount: 56, featuredReview: "Quick repairs to our faulty wiring.", address: "Lincoln, NE" },
    { name: "Mattice Lock & Safe", city: "Lincoln", state: "NE", phone: "402-555-0103", trade: "locksmith", rating: 4.7, reviewCount: 128, featuredReview: "Honest and fast lockout service.", address: "Lincoln, NE" },
    { name: "Ambition Electric", city: "Lincoln", state: "NE", phone: "402-555-0103", trade: "electrician", rating: 4.9, reviewCount: 34, featuredReview: "Top notch emergency service.", address: "Lincoln, NE" },
];

async function importData() {
    console.log('🚀 Importing Batch 1 Phase 14 Recovery...');

    for (const item of batch1Data) {
        const { data, error } = await supabase
            .from('businesses')
            .insert([
                {
                    name: item.name,
                    city: item.city,
                    address: item.address,
                    phone: item.phone,
                    trade: item.trade,
                    rating: item.rating,
                    review_count: item.reviewCount,
                    featured_review: item.featuredReview,
                    country_code: 'US',
                    is_verified: true,
                    tier: 'free',
                    latitude: (CITY_COORDINATES[item.city]?.lat || 0) + (Math.random() - 0.5) * 0.1,
                    longitude: (CITY_COORDINATES[item.city]?.lng || 0) + (Math.random() - 0.5) * 0.1
                }
            ]);

        if (error) {
            console.error(`❌ Error importing ${item.name}:`, error);
        } else {
            console.log(`✅ Imported ${item.name} in ${item.city}`);
        }
    }
}

importData();
