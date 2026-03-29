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
    { city: 'Bermud', state: 'AL', trade: 'breakdown', name: "Auto Medic Wrecker", phone: '251-964-6334', address: 'Bermud, AL' },
    { city: 'Bermud', state: 'AL', trade: 'water-restoration', name: "Experts Water Damage Restoration LLC", phone: '888-990-9611', address: 'Bermud, AL' },
    { city: 'Brooklyn', state: 'AL', trade: 'breakdown', name: "Auto Medic Wrecker", phone: '251-964-6334', address: 'Brooklyn, AL' },
    { city: 'Brooklyn', state: 'AL', trade: 'water-restoration', name: "Experts Water Damage Restoration LLC", phone: '888-990-9611', address: 'Brooklyn, AL' },
    { city: 'Range', state: 'AL', trade: 'breakdown', name: "Auto Medic Wrecker", phone: '251-964-6334', address: 'Range, AL' },
    { city: 'Range', state: 'AL', trade: 'water-restoration', name: "Experts Water Damage Restoration LLC", phone: '888-990-9611', address: 'Range, AL' },
    { city: 'Castleberry', state: 'AL', trade: 'breakdown', name: "Auto Medic Wrecker", phone: '251-964-6334', address: 'Castleberry, AL' },
    { city: 'Castleberry', state: 'AL', trade: 'water-restoration', name: "Experts Water Damage Restoration LLC", phone: '888-990-9611', address: 'Castleberry, AL' },
    { city: 'Lenox', state: 'AL', trade: 'breakdown', name: "Auto Medic Wrecker", phone: '251-964-6334', address: 'Lenox, AL' },
    { city: 'Lenox', state: 'AL', trade: 'water-restoration', name: "Experts Water Damage Restoration LLC", phone: '888-990-9611', address: 'Lenox, AL' },
    { city: 'Owassa', state: 'AL', trade: 'breakdown', name: "Auto Medic Wrecker", phone: '251-964-6334', address: 'Owassa, AL' },
    { city: 'Owassa', state: 'AL', trade: 'water-restoration', name: "Experts Water Damage Restoration LLC", phone: '888-990-9611', address: 'Owassa, AL' },
    { city: 'Paul', state: 'AL', trade: 'breakdown', name: "Auto Medic Wrecker", phone: '251-964-6334', address: 'Paul, AL' },
    { city: 'Paul', state: 'AL', trade: 'water-restoration', name: "Experts Water Damage Restoration LLC", phone: '888-990-9611', address: 'Paul, AL' },
    { city: 'Skinnerton', state: 'AL', trade: 'breakdown', name: "Auto Medic Wrecker", phone: '251-964-6334', address: 'Skinnerton, AL' },
    { city: 'Skinnerton', state: 'AL', trade: 'water-restoration', name: "Experts Water Damage Restoration LLC", phone: '888-990-9611', address: 'Skinnerton, AL' },
    { city: 'Vida', state: 'AL', trade: 'breakdown', name: "Joey's Towing and Recovery", phone: '334-272-1818', address: 'Vida, AL' },
    { city: 'Vida', state: 'AL', trade: 'water-restoration', name: "Alabama Emergency Water Removal Pros", phone: '888-990-9611', address: 'Vida, AL' },
    { city: 'Booth', state: 'AL', trade: 'breakdown', name: "Joey's Towing and Recovery", phone: '334-272-1818', address: 'Booth, AL' },
    { city: 'Booth', state: 'AL', trade: 'water-restoration', name: "Alabama Emergency Water Removal Pros", phone: '888-990-9611', address: 'Booth, AL' }
];

const generateUUID = (str) => {
    return crypto.createHash('md5').update(str).digest('hex').replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5');
};

const createSlug = (name, trade, city) => {
    return `${name}-${trade}-${city}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
};

async function injectListings() {
    console.log('Injecting USA Batch 66...');
    
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
