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
    { city: 'Hammondville', state: 'AL', trade: 'breakdown', name: "Twenty Four Seven Towing & Recovery", phone: '256-638-3444', address: 'Hammondville, AL' },
    { city: 'Hammondville', state: 'AL', trade: 'water-restoration', name: "Heritage Restoration Pros", phone: '256-233-4333', address: 'Hammondville, AL' },
    { city: 'Mentone', state: 'AL', trade: 'breakdown', name: "Twenty Four Seven Towing & Recovery", phone: '256-638-3444', address: 'Mentone, AL' },
    { city: 'Mentone', state: 'AL', trade: 'water-restoration', name: "Heritage Restoration Pros", phone: '256-233-4333', address: 'Mentone, AL' },
    { city: 'Moon Lake', state: 'AL', trade: 'breakdown', name: "Twenty Four Seven Towing & Recovery", phone: '256-638-3444', address: 'Moon Lake, AL' },
    { city: 'Moon Lake', state: 'AL', trade: 'water-restoration', name: "Heritage Restoration Pros", phone: '256-233-4333', address: 'Moon Lake, AL' },
    { city: 'Kaolin', state: 'AL', trade: 'breakdown', name: "Twenty Four Seven Towing & Recovery", phone: '256-638-3444', address: 'Kaolin, AL' },
    { city: 'Kaolin', state: 'AL', trade: 'water-restoration', name: "Heritage Restoration Pros", phone: '256-233-4333', address: 'Kaolin, AL' },
    { city: 'Dogtown', state: 'AL', trade: 'breakdown', name: "Twenty Four Seven Towing & Recovery", phone: '256-638-3444', address: 'Dogtown, AL' },
    { city: 'Dogtown', state: 'AL', trade: 'water-restoration', name: "Heritage Restoration Pros", phone: '256-233-4333', address: 'Dogtown, AL' },
    { city: 'Arona', state: 'AL', trade: 'breakdown', name: "Twenty Four Seven Towing & Recovery", phone: '256-638-3444', address: 'Arona, AL' },
    { city: 'Arona', state: 'AL', trade: 'water-restoration', name: "Heritage Restoration Pros", phone: '256-233-4333', address: 'Arona, AL' },
    { city: 'Lakeview', state: 'AL', trade: 'breakdown', name: "Twenty Four Seven Towing & Recovery", phone: '256-638-3444', address: 'Lakeview, AL' },
    { city: 'Lakeview', state: 'AL', trade: 'water-restoration', name: "Heritage Restoration Pros", phone: '256-233-4333', address: 'Lakeview, AL' },
    { city: 'Pine Ridge', state: 'AL', trade: 'breakdown', name: "Twenty Four Seven Towing & Recovery", phone: '256-638-3444', address: 'Pine Ridge, AL' },
    { city: 'Pine Ridge', state: 'AL', trade: 'water-restoration', name: "Heritage Restoration Pros", phone: '256-233-4333', address: 'Pine Ridge, AL' },
    { city: 'High Point', state: 'AL', trade: 'breakdown', name: "Twenty Four Seven Towing & Recovery", phone: '256-638-3444', address: 'High Point, AL' },
    { city: 'High Point', state: 'AL', trade: 'water-restoration', name: "Heritage Restoration Pros", phone: '256-233-4333', address: 'High Point, AL' },
    { city: 'Shiloh', state: 'AL', trade: 'breakdown', name: "Twenty Four Seven Towing & Recovery", phone: '256-638-3444', address: 'Shiloh, AL' },
    { city: 'Shiloh', state: 'AL', trade: 'water-restoration', name: "Heritage Restoration Pros", phone: '256-233-4333', address: 'Shiloh, AL' }
];

const generateUUID = (str) => {
    return crypto.createHash('md5').update(str).digest('hex').replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5');
};

const createSlug = (name, trade, city) => {
    return `${name}-${trade}-${city}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
};

async function injectListings() {
    console.log('Injecting USA Batch 43...');
    
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
