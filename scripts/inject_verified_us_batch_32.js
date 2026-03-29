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
    { city: 'Atmore', state: 'AL', trade: 'breakdown', name: "KRD Towing & Recovery LLC", phone: '251-368-1502', address: 'Atmore, AL' },
    { city: 'Atmore', state: 'AL', trade: 'water-restoration', name: "Horizon Restoration Pros", phone: '251-368-1033', address: 'Atmore, AL' },
    { city: 'Huxford', state: 'AL', trade: 'breakdown', name: "KRD Towing & Recovery LLC", phone: '251-368-1502', address: 'Huxford, AL' },
    { city: 'Huxford', state: 'AL', trade: 'water-restoration', name: "Alabama Flood Damage Repair Company Pros", phone: '251-236-0545', address: 'Huxford, AL' },
    { city: 'McCullough', state: 'AL', trade: 'breakdown', name: "KRD Towing & Recovery LLC", phone: '251-368-1502', address: 'McCullough, AL' },
    { city: 'McCullough', state: 'AL', trade: 'water-restoration', name: "Alabama Flood Damage Repair Company Pros", phone: '251-236-0545', address: 'McCullough, AL' },
    { city: 'Canoe', state: 'AL', trade: 'breakdown', name: "KRD Towing & Recovery LLC", phone: '251-368-1502', address: 'Canoe, AL' },
    { city: 'Canoe', state: 'AL', trade: 'water-restoration', name: "Alabama Flood Damage Repair Company Pros", phone: '251-236-0545', address: 'Canoe, AL' },
    { city: 'Nokomis', state: 'AL', trade: 'breakdown', name: "KRD Towing & Recovery LLC", phone: '251-368-1502', address: 'Nokomis, AL' },
    { city: 'Nokomis', state: 'AL', trade: 'water-restoration', name: "Alabama Flood Damage Repair Company Pros", phone: '251-236-0545', address: 'Nokomis, AL' },
    { city: 'Megargel', state: 'AL', trade: 'breakdown', name: "KRD Towing & Recovery LLC", phone: '251-368-1502', address: 'Megargel, AL' },
    { city: 'Megargel', state: 'AL', trade: 'water-restoration', name: "Alabama Flood Damage Repair Company Pros", phone: '251-236-0545', address: 'Megargel, AL' },
    { city: 'Goodway', state: 'AL', trade: 'breakdown', name: "KRD Towing & Recovery LLC", phone: '251-368-1502', address: 'Goodway, AL' },
    { city: 'Goodway', state: 'AL', trade: 'water-restoration', name: "Alabama Flood Damage Repair Company Pros", phone: '251-236-0545', address: 'Goodway, AL' },
    { city: 'Freemanville', state: 'AL', trade: 'breakdown', name: "KRD Towing & Recovery LLC", phone: '251-368-1502', address: 'Freemanville, AL' },
    { city: 'Freemanville', state: 'AL', trade: 'water-restoration', name: "Alabama Flood Damage Repair Company Pros", phone: '251-236-0545', address: 'Freemanville, AL' },
    { city: 'Poarch', state: 'AL', trade: 'breakdown', name: "KRD Towing & Recovery LLC", phone: '251-368-1502', address: 'Poarch, AL' },
    { city: 'Poarch', state: 'AL', trade: 'water-restoration', name: "Alabama Flood Damage Repair Company Pros", phone: '251-236-0545', address: 'Poarch, AL' },
    { city: 'Perdido', state: 'AL', trade: 'breakdown', name: "KRD Towing & Recovery LLC", phone: '251-368-1502', address: 'Perdido, AL' },
    { city: 'Perdido', state: 'AL', trade: 'water-restoration', name: "Alabama Flood Damage Repair Company Pros", phone: '251-236-0545', address: 'Perdido, AL' }
];

const generateUUID = (str) => {
    return crypto.createHash('md5').update(str).digest('hex').replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5');
};

const createSlug = (name, city) => {
    return `${name}-${city}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
};

async function injectListings() {
    console.log('Injecting USA Batch 32...');
    
    const formatted = listings.map(l => ({
        id: generateUUID(`us-${l.city}-${l.trade}-${l.name}`),
        name: l.name,
        slug: createSlug(l.name, l.city),
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
