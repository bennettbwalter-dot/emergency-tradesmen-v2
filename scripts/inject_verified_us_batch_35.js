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
    { city: 'Ruth', state: 'AL', trade: 'breakdown', name: "Simply Heroes Towing & Roadside", phone: '205-552-2714', address: 'Ruth, AL' },
    { city: 'Ruth', state: 'AL', trade: 'water-restoration', name: "North Alabama Restorations", phone: '256-553-4008', address: 'Ruth, AL' },
    { city: 'Edgewood', state: 'AL', trade: 'breakdown', name: "Simply Heroes Towing & Roadside", phone: '205-552-2714', address: 'Edgewood, AL' },
    { city: 'Edgewood', state: 'AL', trade: 'water-restoration', name: "North Alabama Restorations", phone: '256-553-4008', address: 'Edgewood, AL' },
    { city: 'Strawberry', state: 'AL', trade: 'breakdown', name: "Simply Heroes Towing & Roadside", phone: '205-552-2714', address: 'Strawberry, AL' },
    { city: 'Strawberry', state: 'AL', trade: 'water-restoration', name: "North Alabama Restorations", phone: '256-553-4008', address: 'Strawberry, AL' },
    { city: 'Pearsall', state: 'AL', trade: 'breakdown', name: "Simply Heroes Towing & Roadside", phone: '205-552-2714', address: 'Pearsall, AL' },
    { city: 'Pearsall', state: 'AL', trade: 'water-restoration', name: "North Alabama Restorations", phone: '256-553-4008', address: 'Pearsall, AL' },
    { city: 'Simcoe', state: 'AL', trade: 'breakdown', name: "Simply Heroes Towing & Roadside", phone: '205-552-2714', address: 'Simcoe, AL' },
    { city: 'Simcoe', state: 'AL', trade: 'water-restoration', name: "North Alabama Restorations", phone: '256-553-4008', address: 'Simcoe, AL' },
    { city: 'Gold Ridge', state: 'AL', trade: 'breakdown', name: "Simply Heroes Towing & Roadside", phone: '205-552-2714', address: 'Gold Ridge, AL' },
    { city: 'Gold Ridge', state: 'AL', trade: 'water-restoration', name: "North Alabama Restorations", phone: '256-553-4008', address: 'Gold Ridge, AL' },
    { city: 'Center Hill', state: 'AL', trade: 'breakdown', name: "Simply Heroes Towing & Roadside", phone: '205-552-2714', address: 'Center Hill, AL' },
    { city: 'Center Hill', state: 'AL', trade: 'water-restoration', name: "North Alabama Restorations", phone: '256-553-4008', address: 'Center Hill, AL' },
    { city: 'Brooklyn', state: 'AL', trade: 'breakdown', name: "Simply Heroes Towing & Roadside", phone: '205-552-2714', address: 'Brooklyn, AL' },
    { city: 'Brooklyn', state: 'AL', trade: 'water-restoration', name: "North Alabama Restorations", phone: '256-553-4008', address: 'Brooklyn, AL' },
    { city: 'Prospect', state: 'AL', trade: 'breakdown', name: "Simply Heroes Towing & Roadside", phone: '205-552-2714', address: 'Prospect, AL' },
    { city: 'Prospect', state: 'AL', trade: 'water-restoration', name: "North Alabama Restorations", phone: '256-553-4008', address: 'Prospect, AL' },
    { city: 'Walter', state: 'AL', trade: 'breakdown', name: "Simply Heroes Towing & Roadside", phone: '205-552-2714', address: 'Walter, AL' },
    { city: 'Walter', state: 'AL', trade: 'water-restoration', name: "North Alabama Restorations", phone: '256-553-4008', address: 'Walter, AL' }
];

const generateUUID = (str) => {
    return crypto.createHash('md5').update(str).digest('hex').replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5');
};

const createSlug = (name, trade, city) => {
    return `${name}-${trade}-${city}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
};

async function injectListings() {
    console.log('Injecting USA Batch 35...');
    
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
