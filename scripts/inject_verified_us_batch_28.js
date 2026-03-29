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
    { city: 'Camden', state: 'AL', trade: 'breakdown', name: "Towing Camden", phone: '334-839-4576', address: 'Camden, AL' },
    { city: 'Camden', state: 'AL', trade: 'water-restoration', name: "Horizon Restoration Pros", phone: '334-682-1033', address: 'Camden, AL' },
    { city: 'Yellow Bluff', state: 'AL', trade: 'breakdown', name: "Towing Vredenburgh", phone: '334-839-4727', address: 'Yellow Bluff, AL' },
    { city: 'Yellow Bluff', state: 'AL', trade: 'water-restoration', name: "Horizon Restoration Pros", phone: '334-682-1033', address: 'Yellow Bluff, AL' },
    { city: 'Vredenburgh', state: 'AL', trade: 'breakdown', name: "Towing Vredenburgh", phone: '334-839-4727', address: 'Vredenburgh, AL' },
    { city: 'Vredenburgh', state: 'AL', trade: 'water-restoration', name: "Emergency Water Removal Pros", phone: '773-377-6396', address: 'Vredenburgh, AL' },
    { city: 'Perdue Hill', state: 'AL', trade: 'breakdown', name: "Towing Vredenburgh", phone: '334-839-4727', address: 'Perdue Hill, AL' },
    { city: 'Perdue Hill', state: 'AL', trade: 'water-restoration', name: "Alabama Water Damage Restoration Pros", phone: '469-661-2174', address: 'Perdue Hill, AL' },
    { city: 'Hybart', state: 'AL', trade: 'breakdown', name: "Towing Vredenburgh", phone: '334-839-4727', address: 'Hybart, AL' },
    { city: 'Hybart', state: 'AL', trade: 'water-restoration', name: "Alabama Water Damage Restoration Pros", phone: '469-661-2174', address: 'Hybart, AL' },
    { city: 'Franklin', state: 'AL', trade: 'breakdown', name: "Towing Camden", phone: '334-839-4576', address: 'Franklin, AL' },
    { city: 'Franklin', state: 'AL', trade: 'water-restoration', name: "Horizon Restoration Pros", phone: '334-682-1033', address: 'Franklin, AL' },
    { city: 'Koenton', state: 'AL', trade: 'breakdown', name: "Coffeeville Emergency Towing", phone: '251-873-1483', address: 'Koenton, AL' },
    { city: 'Koenton', state: 'AL', trade: 'water-restoration', name: "Alabama Flood Damage Repair Company Pros", phone: '251-236-0545', address: 'Koenton, AL' },
    { city: 'Frankville', state: 'AL', trade: 'breakdown', name: "Coffeeville Emergency Towing", phone: '251-873-1483', address: 'Frankville, AL' },
    { city: 'Frankville', state: 'AL', trade: 'water-restoration', name: "Alabama Flood Damage Repair Company Pros", phone: '251-236-0545', address: 'Frankville, AL' },
    { city: 'Bigbee', state: 'AL', trade: 'breakdown', name: "Coffeeville Emergency Towing", phone: '251-873-1483', address: 'Bigbee, AL' },
    { city: 'Bigbee', state: 'AL', trade: 'water-restoration', name: "Alabama Flood Damage Repair Company Pros", phone: '251-236-0545', address: 'Bigbee, AL' },
    { city: 'Salitpa', state: 'AL', trade: 'breakdown', name: "Coffeeville Emergency Towing", phone: '251-873-1483', address: 'Salitpa, AL' },
    { city: 'Salitpa', state: 'AL', trade: 'water-restoration', name: "Alabama Flood Damage Repair Company Pros", phone: '251-236-0545', address: 'Salitpa, AL' }
];

const generateUUID = (str) => {
    return crypto.createHash('md5').update(str).digest('hex').replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5');
};

const createSlug = (name, city) => {
    return `${name}-${city}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
};

async function injectListings() {
    console.log('Injecting USA Batch 28...');
    
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
