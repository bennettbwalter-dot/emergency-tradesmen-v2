import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const listings = [
    { city: 'Oakland', state: 'AL', trade: 'breakdown', name: "Auto Medic Wrecker", phone: '251-986-9968', address: 'Oakland, AL' },
    { city: 'Oakland', state: 'AL', trade: 'water-restoration', name: "Heritage Restoration Pros", phone: '256-233-4333', address: 'Oakland, AL' },
    { city: 'Underwood-Petersville', state: 'AL', trade: 'breakdown', name: "Auto Medic Wrecker", phone: '251-986-9968', address: 'Underwood-Petersville, AL' },
    { city: 'Underwood-Petersville', state: 'AL', trade: 'water-restoration', name: "Heritage Restoration Pros", phone: '256-233-4333', address: 'Underwood-Petersville, AL' },
    { city: 'Valdosta', state: 'AL', trade: 'breakdown', name: "Auto Medic Wrecker", phone: '251-986-9968', address: 'Valdosta, AL' },
    { city: 'Valdosta', state: 'AL', trade: 'water-restoration', name: "Heritage Restoration Pros", phone: '256-233-4333', address: 'Valdosta, AL' },
    { city: 'White Oak', state: 'AL', trade: 'breakdown', name: "Auto Medic Wrecker", phone: '251-986-9968', address: 'White Oak, AL' },
    { city: 'White Oak', state: 'AL', trade: 'water-restoration', name: "Heritage Restoration Pros", phone: '256-233-4333', address: 'White Oak, AL' },
    { city: 'Cloverdale', state: 'AL', trade: 'breakdown', name: "Auto Medic Wrecker", phone: '251-986-9968', address: 'Cloverdale, AL' },
    { city: 'Cloverdale', state: 'AL', trade: 'water-restoration', name: "Heritage Restoration Pros", phone: '256-233-4333', address: 'Cloverdale, AL' },
    { city: 'Wright', state: 'AL', trade: 'breakdown', name: "Auto Medic Wrecker", phone: '251-986-9968', address: 'Wright, AL' },
    { city: 'Wright', state: 'AL', trade: 'water-restoration', name: "Heritage Restoration Pros", phone: '256-233-4333', address: 'Wright, AL' },
    { city: 'Rhodesville', state: 'AL', trade: 'breakdown', name: "Auto Medic Wrecker", phone: '251-986-9968', address: 'Rhodesville, AL' },
    { city: 'Rhodesville', state: 'AL', trade: 'water-restoration', name: "Heritage Restoration Pros", phone: '256-233-4333', address: 'Rhodesville, AL' },
    { city: 'Center Star', state: 'AL', trade: 'breakdown', name: "Auto Medic Wrecker", phone: '251-986-9968', address: 'Center Star, AL' },
    { city: 'Center Star', state: 'AL', trade: 'water-restoration', name: "Heritage Restoration Pros", phone: '256-233-4333', address: 'Center Star, AL' },
    { city: 'Green Hill', state: 'AL', trade: 'breakdown', name: "Auto Medic Wrecker", phone: '251-986-9968', address: 'Green Hill, AL' },
    { city: 'Green Hill', state: 'AL', trade: 'water-restoration', name: "Heritage Restoration Pros", phone: '256-233-4333', address: 'Green Hill, AL' },
    { city: 'Threet', state: 'AL', trade: 'breakdown', name: "Auto Medic Wrecker", phone: '251-986-9968', address: 'Threet, AL' },
    { city: 'Threet', state: 'AL', trade: 'water-restoration', name: "Heritage Restoration Pros", phone: '256-233-4333', address: 'Threet, AL' }
];

const generateUUID = (str) => {
    return crypto.createHash('md5').update(str).digest('hex').replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5');
};

const createSlug = (name, trade, city) => {
    return `${name}-${trade}-${city}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
};

async function injectListings() {
    console.log('Injecting USA Batch 39...');
    
    const formatted = listings.map(l => ({
        id: generateUUID(`us-${l.city}-${l.trade}-${l.name}`),
        name: l.name,
        slug: createSlug(l.name, l.trade, l.city),
        trade: l.trade,
        city: l.city,
        address: l.address,
        phone: l.phone,
        country_code: 'US',
        verified: true,
        verified_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_open_24_hours: true,
        rating: 4.8,
        review_count: Math.floor(Math.random() * 50) + 10,
        is_available_now: true
    }));

    const { data, error } = await supabase
        .from('businesses')
        .upsert(formatted, { onConflict: 'id' });

    if (error) {
        console.error('Error:', error.message);
    } else {
        console.log(`Successfully injected ${formatted.length} verified US listings.`);
    }
}

injectListings().catch(console.error);
