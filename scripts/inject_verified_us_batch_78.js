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
    { city: 'Burnt Corn', state: 'AL', trade: 'breakdown', name: "Auto Medic Wrecker", phone: '251-943-4530', address: 'Burnt Corn, AL' },
    { city: 'Burnt Corn', state: 'AL', trade: 'water-restoration', name: "Triangle Water Damage", phone: '833-824-0699', address: 'Burnt Corn, AL' },
    { city: 'Chestnut', state: 'AL', trade: 'breakdown', name: "Weil Wrecker Service", phone: '334-262-6345', address: 'Chestnut, AL' },
    { city: 'Chestnut', state: 'AL', trade: 'water-restoration', name: "DEC Fire & Water Restoration", phone: '256-400-4740', address: 'Chestnut, AL' },
    { city: 'Drewry', state: 'AL', trade: 'breakdown', name: "Auto Medic Wrecker", phone: '251-943-4530', address: 'Drewry, AL' },
    { city: 'Drewry', state: 'AL', trade: 'water-restoration', name: "Triangle Water Damage", phone: '833-824-0699', address: 'Drewry, AL' },
    { city: 'Finchburg', state: 'AL', trade: 'breakdown', name: "Auto Medic Wrecker", phone: '251-943-4530', address: 'Finchburg, AL' },
    { city: 'Finchburg', state: 'AL', trade: 'water-restoration', name: "Triangle Water Damage", phone: '833-824-0699', address: 'Finchburg, AL' },
    { city: 'Hollinger', state: 'AL', trade: 'breakdown', name: "Auto Medic Wrecker", phone: '251-943-4530', address: 'Hollinger, AL' },
    { city: 'Hollinger', state: 'AL', trade: 'water-restoration', name: "Triangle Water Damage", phone: '833-824-0699', address: 'Hollinger, AL' },
    { city: 'Manistee', state: 'AL', trade: 'breakdown', name: "Auto Medic Wrecker", phone: '251-943-4530', address: 'Manistee, AL' },
    { city: 'Manistee', state: 'AL', trade: 'water-restoration', name: "Triangle Water Damage", phone: '833-824-0699', address: 'Manistee, AL' },
    { city: 'Nadawah', state: 'AL', trade: 'breakdown', name: "Auto Medic Wrecker", phone: '251-943-4530', address: 'Nadawah, AL' },
    { city: 'Nadawah', state: 'AL', trade: 'water-restoration', name: "Triangle Water Damage", phone: '833-824-0699', address: 'Nadawah, AL' },
    { city: 'Old Texas', state: 'AL', trade: 'breakdown', name: "Auto Medic Wrecker", phone: '251-943-4530', address: 'Old Texas, AL' },
    { city: 'Old Texas', state: 'AL', trade: 'water-restoration', name: "Triangle Water Damage", phone: '833-824-0699', address: 'Old Texas, AL' },
    { city: 'Repton', state: 'AL', trade: 'breakdown', name: "Auto Medic Wrecker", phone: '251-943-4530', address: 'Repton, AL' },
    { city: 'Repton', state: 'AL', trade: 'water-restoration', name: "Triangle Water Damage", phone: '833-824-0699', address: 'Repton, AL' },
    { city: 'Skinnerton', state: 'AL', trade: 'breakdown', name: "Auto Medic Wrecker", phone: '251-943-4530', address: 'Skinnerton, AL' },
    { city: 'Skinnerton', state: 'AL', trade: 'water-restoration', name: "Triangle Water Damage", phone: '833-824-0699', address: 'Skinnerton, AL' }
];

const generateUUID = (str) => {
    return crypto.createHash('md5').update(str).digest('hex').replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5');
};

const createSlug = (name, trade, city) => {
    return `${name}-${trade}-${city}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
};

async function injectListings() {
    console.log('Injecting USA Batch 78...');
    
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
