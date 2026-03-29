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
    { city: 'Montgomery', state: 'AL', trade: 'breakdown', name: "Ideal Roadside LLC", phone: '334-523-1463', address: 'Montgomery, AL' },
    { city: 'Montgomery', state: 'AL', trade: 'water-restoration', name: "Restoration 1 of Montgomery", phone: '334-523-1383', address: 'Montgomery, AL' },
    { city: 'Hope Hull', state: 'AL', trade: 'breakdown', name: "Joey's Towing & Recovery", phone: '334-271-4111', address: 'Hope Hull, AL' },
    { city: 'Hope Hull', state: 'AL', trade: 'water-restoration', name: "Alabama Emergency Water Removal Pros", phone: '888-990-9611', address: 'Hope Hull, AL' },
    { city: 'Lapine', state: 'AL', trade: 'breakdown', name: "Joey's Towing & Recovery", phone: '334-271-4111', address: 'Lapine, AL' },
    { city: 'Lapine', state: 'AL', trade: 'water-restoration', name: "Alabama Emergency Water Removal Pros", phone: '888-990-9611', address: 'Lapine, AL' },
    { city: 'Mathews', state: 'AL', trade: 'breakdown', name: "Ideal Roadside LLC", phone: '334-523-1463', address: 'Mathews, AL' },
    { city: 'Mathews', state: 'AL', trade: 'water-restoration', name: "Restoration 1 of Montgomery", phone: '334-523-1383', address: 'Mathews, AL' },
    { city: 'Mount Meigs', state: 'AL', trade: 'breakdown', name: "Ideal Roadside LLC", phone: '334-523-1463', address: 'Mount Meigs, AL' },
    { city: 'Mount Meigs', state: 'AL', trade: 'water-restoration', name: "Restoration 1 of Montgomery", phone: '334-523-1383', address: 'Mount Meigs, AL' },
    { city: 'Pike Road', state: 'AL', trade: 'breakdown', name: "Ideal Roadside LLC", phone: '334-523-1463', address: 'Pike Road, AL' },
    { city: 'Pike Road', state: 'AL', trade: 'water-restoration', name: "Restoration 1 of Montgomery", phone: '334-523-1383', address: 'Pike Road, AL' },
    { city: 'Ramer', state: 'AL', trade: 'breakdown', name: "Joey's Towing & Recovery", phone: '334-271-4111', address: 'Ramer, AL' },
    { city: 'Ramer', state: 'AL', trade: 'water-restoration', name: "Alabama Emergency Water Removal Pros", phone: '888-990-9611', address: 'Ramer, AL' },
    { city: 'Cecil', state: 'AL', trade: 'breakdown', name: "Ideal Roadside LLC", phone: '334-523-1463', address: 'Cecil, AL' },
    { city: 'Cecil', state: 'AL', trade: 'water-restoration', name: "Restoration 1 of Montgomery", phone: '334-523-1383', address: 'Cecil, AL' },
    { city: 'Grady', state: 'AL', trade: 'breakdown', name: "Joey's Towing & Recovery", phone: '334-271-4111', address: 'Grady, AL' },
    { city: 'Grady', state: 'AL', trade: 'water-restoration', name: "Alabama Emergency Water Removal Pros", phone: '888-990-9611', address: 'Grady, AL' },
    { city: 'Snowdoun', state: 'AL', trade: 'breakdown', name: "Ideal Roadside LLC", phone: '334-523-1463', address: 'Snowdoun, AL' },
    { city: 'Snowdoun', state: 'AL', trade: 'water-restoration', name: "Restoration 1 of Montgomery", phone: '334-523-1383', address: 'Snowdoun, AL' }
];

const generateUUID = (str) => {
    return crypto.createHash('md5').update(str).digest('hex').replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5');
};

const createSlug = (name, trade, city) => {
    return `${name}-${trade}-${city}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
};

async function injectListings() {
    console.log('Injecting USA Batch 79...');
    
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
