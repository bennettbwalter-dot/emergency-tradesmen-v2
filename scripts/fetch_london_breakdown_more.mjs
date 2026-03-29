
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import { createHash } from 'crypto';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GOOGLE_MAPS_API_KEY = process.env.VITE_GOOGLE_MAPS_API_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !GOOGLE_MAPS_API_KEY) {
    console.error('Missing required environment variables');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

function toUUID(str) {
    const hash = createHash('md5').update(str).digest('hex');
    const chars = hash.split('');
    chars[12] = '3';
    chars[16] = ((parseInt(chars[16], 16) & 0x3) | 0x8).toString(16);
    return [
        chars.slice(0, 8).join(''),
        chars.slice(8, 12).join(''),
        chars.slice(12, 16).join(''),
        chars.slice(16, 20).join(''),
        chars.slice(20).join('')
    ].join('-');
}

async function fetchMore() {
    console.log("Fetching additional 'Car Recovery London' from Google Places...");

    // Different query to get more results
    const query = "Car Recovery London";
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${GOOGLE_MAPS_API_KEY}`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        process.exit(1);
    }

    const results = data.results || [];
    console.log(`Found ${results.length} results.`);

    const businesses = results.map(place => {
        const uniqueId = `google-${place.place_id}`;
        const uuid = toUUID(uniqueId);

        const baseSlug = place.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const slug = `${baseSlug}-${uuid.substring(0, 8)}`;

        return {
            id: uuid,
            slug: slug,
            name: place.name,
            trade: 'breakdown',
            city: 'london',
            address: place.formatted_address,
            rating: place.rating || 4.5,
            review_count: place.user_ratings_total || 1,
            hours: 'Open 24 hours',
            is_open_24_hours: true,
            verified: true,
            tier: 'free',
            priority_score: 0
        };
    });

    console.log(`Prepared ${businesses.length} businesses for upsert.`);

    const { error } = await supabase
        .from('businesses')
        .upsert(businesses, { onConflict: 'id' });

    if (error) {
        console.error("Supabase Error:", error);
    } else {
        console.log(`Successfully upserted ${businesses.length} businesses.`);
    }
}

fetchMore();
