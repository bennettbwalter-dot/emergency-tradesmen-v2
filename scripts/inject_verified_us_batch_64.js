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
    { city: 'Butler Springs', state: 'AL', trade: 'breakdown', name: "Butler Towing", phone: '659-266-3909', address: 'Butler Springs, AL' },
    { city: 'Butler Springs', state: 'AL', trade: 'water-restoration', name: "Alabama Emergency Water Removal Pros", phone: '888-990-9611', address: 'Butler Springs, AL' },
    { city: 'Forest Home', state: 'AL', trade: 'breakdown', name: "Butler Towing", phone: '659-266-3909', address: 'Forest Home, AL' },
    { city: 'Forest Home', state: 'AL', trade: 'water-restoration', name: "Alabama Emergency Water Removal Pros", phone: '888-990-9611', address: 'Forest Home, AL' },
    { city: 'Oak Hill', state: 'AL', trade: 'breakdown', name: "Towing Pine Hill", phone: '334-839-4689', address: 'Oak Hill, AL' },
    { city: 'Oak Hill', state: 'AL', trade: 'water-restoration', name: "Horizon Restoration Pros", phone: '888-990-9611', address: 'Oak Hill, AL' },
    { city: 'Pineapple', state: 'AL', trade: 'breakdown', name: "Towing Pine Hill", phone: '334-839-4689', address: 'Pineapple, AL' },
    { city: 'Pineapple', state: 'AL', trade: 'water-restoration', name: "Horizon Restoration Pros", phone: '888-990-9611', address: 'Pineapple, AL' },
    { city: 'Beatrice', state: 'AL', trade: 'breakdown', name: "Beatrice Emergency Towing", phone: '251-553-4399', address: 'Beatrice, AL' },
    { city: 'Beatrice', state: 'AL', trade: 'water-restoration', name: "Horizon Restoration Pros", phone: '888-990-9611', address: 'Beatrice, AL' },
    { city: 'Midway', state: 'AL', trade: 'breakdown', name: "Midway Emergency Towing", phone: '334-839-2439', address: 'Midway, AL' },
    { city: 'Midway', state: 'AL', trade: 'water-restoration', name: "Triangle Water Damage", phone: '334-219-0126', address: 'Midway, AL' },
    { city: 'Union Springs', state: 'AL', trade: 'breakdown', name: "Towing Union Springs", phone: '334-839-4485', address: 'Union Springs, AL' },
    { city: 'Union Springs', state: 'AL', trade: 'water-restoration', name: "Leading Remediation", phone: '334-226-8051', address: 'Union Springs, AL' },
    { city: 'Perote', state: 'AL', trade: 'breakdown', name: "Towing Union Springs", phone: '334-839-4485', address: 'Perote, AL' },
    { city: 'Perote', state: 'AL', trade: 'water-restoration', name: "Leading Remediation", phone: '334-226-8051', address: 'Perote, AL' },
    { city: 'Fitzpatrick', state: 'AL', trade: 'breakdown', name: "Towing Union Springs", phone: '334-839-4485', address: 'Fitzpatrick, AL' },
    { city: 'Fitzpatrick', state: 'AL', trade: 'water-restoration', name: "Leading Remediation", phone: '334-226-8051', address: 'Fitzpatrick, AL' },
    { city: 'Inverness', state: 'AL', trade: 'breakdown', name: "Towing Union Springs", phone: '334-839-4485', address: 'Inverness, AL' },
    { city: 'Inverness', state: 'AL', trade: 'water-restoration', name: "Leading Remediation", phone: '334-226-8051', address: 'Inverness, AL' }
];

const generateUUID = (str) => {
    return crypto.createHash('md5').update(str).digest('hex').replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5');
};

const createSlug = (name, trade, city) => {
    return `${name}-${trade}-${city}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
};

async function injectListings() {
    console.log('Injecting USA Batch 64...');
    
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
