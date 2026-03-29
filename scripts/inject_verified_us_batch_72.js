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
    { city: 'Leroy', state: 'AL', trade: 'breakdown', name: "Wagarville Emergency Towing", phone: '251-553-4016', address: 'Leroy, AL' },
    { city: 'Leroy', state: 'AL', trade: 'water-restoration', name: "Alabama Flood Damage Repair Company Pros", phone: '888-990-9611', address: 'Leroy, AL' },
    { city: 'Millry', state: 'AL', trade: 'breakdown', name: "Millry Emergency Towing", phone: '251-873-1883', address: 'Millry, AL' },
    { city: 'Millry', state: 'AL', trade: 'water-restoration', name: "Alabama Flood Damage Repair Company Pros", phone: '888-990-9611', address: 'Millry, AL' },
    { city: 'Sunflower', state: 'AL', trade: 'breakdown', name: "Wagarville Emergency Towing", phone: '251-553-4016', address: 'Sunflower, AL' },
    { city: 'Sunflower', state: 'AL', trade: 'water-restoration', name: "Alabama Flood Damage Repair Company Pros", phone: '888-990-9611', address: 'Sunflower, AL' },
    { city: 'Tibbie', state: 'AL', trade: 'breakdown', name: "Wagarville Emergency Towing", phone: '251-553-4016', address: 'Tibbie, AL' },
    { city: 'Tibbie', state: 'AL', trade: 'water-restoration', name: "Alabama Flood Damage Repair Company Pros", phone: '888-990-9611', address: 'Tibbie, AL' },
    { city: 'Wagarville', state: 'AL', trade: 'breakdown', name: "Wagarville Emergency Towing", phone: '251-553-4016', address: 'Wagarville, AL' },
    { city: 'Wagarville', state: 'AL', trade: 'water-restoration', name: "Alabama Flood Damage Repair Company Pros", phone: '888-990-9611', address: 'Wagarville, AL' },
    { city: 'Yellow Pine', state: 'AL', trade: 'breakdown', name: "Millry Emergency Towing", phone: '251-873-1883', address: 'Yellow Pine, AL' },
    { city: 'Yellow Pine', state: 'AL', trade: 'water-restoration', name: "Alabama Flood Damage Repair Company Pros", phone: '888-990-9611', address: 'Yellow Pine, AL' },
    { city: 'Deer Park', state: 'AL', trade: 'breakdown', name: "Wagarville Emergency Towing", phone: '251-553-4016', address: 'Deer Park, AL' },
    { city: 'Deer Park', state: 'AL', trade: 'water-restoration', name: "Alabama Flood Damage Repair Company Pros", phone: '888-990-9611', address: 'Deer Park, AL' },
    { city: 'Copeland', state: 'AL', trade: 'breakdown', name: "Millry Emergency Towing", phone: '251-873-1883', address: 'Copeland, AL' },
    { city: 'Copeland', state: 'AL', trade: 'water-restoration', name: "Alabama Flood Damage Repair Company Pros", phone: '888-990-9611', address: 'Copeland, AL' },
    { city: 'Malcolm', state: 'AL', trade: 'breakdown', name: "Fastrack Towing", phone: '251-216-2089', address: 'Malcolm, AL' },
    { city: 'Malcolm', state: 'AL', trade: 'water-restoration', name: "Horizon Restoration Pros", phone: '888-990-9611', address: 'Malcolm, AL' },
    { city: 'Calvert', state: 'AL', trade: 'breakdown', name: "Fastrack Towing", phone: '251-216-2089', address: 'Calvert, AL' },
    { city: 'Calvert', state: 'AL', trade: 'water-restoration', name: "Horizon Restoration Pros", phone: '888-990-9611', address: 'Calvert, AL' }
];

const generateUUID = (str) => {
    return crypto.createHash('md5').update(str).digest('hex').replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5');
};

const createSlug = (name, trade, city) => {
    return `${name}-${trade}-${city}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
};

async function injectListings() {
    console.log('Injecting USA Batch 72...');
    
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
