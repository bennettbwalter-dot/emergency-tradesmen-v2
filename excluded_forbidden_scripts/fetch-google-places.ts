import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';

// Types for Google Places API
interface PlaceResult {
    place_id: string;
    name: string;
    formatted_address: string;
    geometry: {
        location: {
            lat: number;
            lng: number;
        };
    };
    types: string[];
    rating?: number;
    user_ratings_total?: number;
    photos?: {
        photo_reference: string;
    }[];
    formatted_phone_number?: string;
    website?: string;
    opening_hours?: {
        open_now: boolean;
        periods?: any[];
        weekday_text?: string[];
    };
    address_components?: {
        long_name: string;
        short_name: string;
        types: string[];
    }[];
}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GOOGLE_MAPS_API_KEY = process.env.VITE_GOOGLE_MAPS_API_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !GOOGLE_MAPS_API_KEY) {
    console.error('Missing required environment variables (VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, VITE_GOOGLE_MAPS_API_KEY)');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const TRADES = ['plumber', 'electrician', 'locksmith', 'gas engineer'];
const CITIES = [
    { name: 'London', lat: 51.5074, lng: -0.1278, radius: 5000 },
    { name: 'Manchester', lat: 53.4808, lng: -2.2426, radius: 3000 },
    { name: 'Birmingham', lat: 52.4862, lng: -1.8904, radius: 3000 },
    { name: 'Leeds', lat: 53.8008, lng: -1.5491, radius: 3000 }
];

async function fetchPlaces(query: string, location: { lat: number, lng: number }, radius: number): Promise<PlaceResult[]> {
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&location=${location.lat},${location.lng}&radius=${radius}&key=${GOOGLE_MAPS_API_KEY}`;

    try {
        const res = await fetch(url);
        const data: any = await res.json();

        if (data.status !== 'OK') {
            console.warn(`Google API returned status: ${data.status} for query: ${query}`);
            return [];
        }

        // Fetch details for each place to get phone, website, hours
        // Note: Text Search returns basic info. Place Details returns more. 
        // BUT fetching details for ALL results is expensive (pricing).
        // Text Search already returns formatted_address, name, rating, types.
        // It DOES NOT return phone number or website usually in the basic list, unless using Nearby Search?
        // Actually TextSearch *does* return some info but often limited.
        // Let's stick to what we get or do a details request if strictly needed.
        // Wait, Text Search results don't guarantee phone number.
        // Strategy: Use the results, but maybe limit detail fetches to top X.

        return data.results;
    } catch (err) {
        console.error(`Failed to fetch places for ${query}:`, err);
        return [];
    }
}

async function getPlaceDetails(placeId: string): Promise<Partial<PlaceResult> | null> {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,formatted_phone_number,website,opening_hours,address_components,geometry&key=${GOOGLE_MAPS_API_KEY}`;
    try {
        const res = await fetch(url);
        const data: any = await res.json();
        if (data.status === 'OK') {
            return data.result;
        }
        return null;
    } catch (e) {
        console.error(`Error details for ${placeId}:`, e);
        return null;
    }
}

async function run() {
    console.log('Starting Google Places Fetch...');

    let allBusinesses: any[] = [];

    for (const city of CITIES) {
        for (const trade of TRADES) {
            const query = `${trade} in ${city.name}`;
            console.log(`Fetching: ${query}...`);

            const results = await fetchPlaces(query, city, city.radius);
            console.log(`Found ${results.length} results.`);

            for (const place of results) {
                // Enriched details
                const details = await getPlaceDetails(place.place_id);
                if (!details) continue;

                const business = {
                    name: details.name,
                    trade: trade, // normalized
                    city: city.name,
                    address: details.formatted_address,
                    phone: details.formatted_phone_number,
                    website: details.website,
                    lat: details.geometry?.location?.lat,
                    lng: details.geometry?.location?.lng,
                    rating: place.rating,
                    review_count: place.user_ratings_total,
                    google_place_id: place.place_id,
                    is_open_24_hours: details.opening_hours?.open_now // Simplified, really need to parse periods
                };

                allBusinesses.push(business);

                // Rate limiting precaution
                await new Promise(resolve => setTimeout(resolve, 200));
            }
        }
    }

    console.log(`Total businesses fetched: ${allBusinesses.length}`);

    // Save to file for review first
    await fs.writeFile('discovered_businesses.json', JSON.stringify(allBusinesses, null, 2));
    console.log('Saved to discovered_businesses.json');
}

run().catch(console.error);
