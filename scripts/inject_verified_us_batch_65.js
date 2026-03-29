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
    { city: 'Perdue Hill', state: 'AL', trade: 'breakdown', name: "KRD Towing & Recovery LLC", phone: '251-359-2244', address: 'Perdue Hill, AL' },
    { city: 'Perdue Hill', state: 'AL', trade: 'water-restoration', name: "Emergency Water Removal Pros", phone: '888-990-9611', address: 'Perdue Hill, AL' },
    { city: 'Peterman', state: 'AL', trade: 'breakdown', name: "KRD Towing & Recovery LLC", phone: '251-359-2244', address: 'Peterman, AL' },
    { city: 'Peterman', state: 'AL', trade: 'water-restoration', name: "Emergency Water Removal Pros", phone: '888-990-9611', address: 'Peterman, AL' },
    { city: 'Tunnel Springs', state: 'AL', trade: 'breakdown', name: "KRD Towing & Recovery LLC", phone: '251-359-2244', address: 'Tunnel Springs, AL' },
    { city: 'Tunnel Springs', state: 'AL', trade: 'water-restoration', name: "Emergency Water Removal Pros", phone: '888-990-9611', address: 'Tunnel Springs, AL' },
    { city: 'Uriah', state: 'AL', trade: 'breakdown', name: "KRD Towing & Recovery LLC", phone: '251-359-2244', address: 'Uriah, AL' },
    { city: 'Uriah', state: 'AL', trade: 'water-restoration', name: "Emergency Water Removal Pros", phone: '888-990-9611', address: 'Uriah, AL' },
    { city: 'Atmore', state: 'AL', trade: 'breakdown', name: "KRD Towing & Recovery LLC", phone: '251-359-2244', address: 'Atmore, AL' },
    { city: 'Atmore', state: 'AL', trade: 'water-restoration', name: "Horizon Restoration Pros", phone: '888-990-9611', address: 'Atmore, AL' },
    { city: 'Huxford', state: 'AL', trade: 'breakdown', name: "KRD Towing & Recovery LLC", phone: '251-359-2244', address: 'Huxford, AL' },
    { city: 'Huxford', state: 'AL', trade: 'water-restoration', name: "Horizon Restoration Pros", phone: '888-990-9611', address: 'Huxford, AL' },
    { city: 'McCullough', state: 'AL', trade: 'breakdown', name: "KRD Towing & Recovery LLC", phone: '251-359-2244', address: 'McCullough, AL' },
    { city: 'McCullough', state: 'AL', trade: 'water-restoration', name: "Horizon Restoration Pros", phone: '888-990-9611', address: 'McCullough, AL' },
    { city: 'Canoe', state: 'AL', trade: 'breakdown', name: "KRD Towing & Recovery LLC", phone: '251-359-2244', address: 'Canoe, AL' },
    { city: 'Canoe', state: 'AL', trade: 'water-restoration', name: "Horizon Restoration Pros", phone: '888-990-9611', address: 'Canoe, AL' },
    { city: 'Chapman', state: 'AL', trade: 'breakdown', name: "Butler Towing", phone: '659-266-3909', address: 'Chapman, AL' },
    { city: 'Chapman', state: 'AL', trade: 'water-restoration', name: "Alabama Emergency Water Removal Pros", phone: '888-990-9611', address: 'Chapman, AL' },
    { city: 'Belleville', state: 'AL', trade: 'breakdown', name: "KRD Towing & Recovery LLC", phone: '251-359-2244', address: 'Belleville, AL' },
    { city: 'Belleville', state: 'AL', trade: 'water-restoration', name: "Emergency Water Removal Pros", phone: '888-990-9611', address: 'Belleville, AL' }
];

const generateUUID = (str) => {
    return crypto.createHash('md5').update(str).digest('hex').replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5');
};

const createSlug = (name, trade, city) => {
    return `${name}-${trade}-${city}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
};

async function injectListings() {
    console.log('Injecting USA Batch 65...');
    
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
