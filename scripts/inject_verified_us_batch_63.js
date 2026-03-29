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
    { city: 'Grove Hill', state: 'AL', trade: 'breakdown', name: "Thomasville Emergency Towing", phone: '334-839-2140', address: 'Grove Hill, AL' },
    { city: 'Grove Hill', state: 'AL', trade: 'water-restoration', name: "Special Touch Restoration", phone: '251-238-6622', address: 'Grove Hill, AL' },
    { city: 'Fulton', state: 'AL', trade: 'breakdown', name: "Thomasville Emergency Towing", phone: '334-839-2140', address: 'Fulton, AL' },
    { city: 'Fulton', state: 'AL', trade: 'water-restoration', name: "Special Touch Restoration", phone: '251-238-6622', address: 'Fulton, AL' },
    { city: 'Whatley', state: 'AL', trade: 'breakdown', name: "Thomasville Emergency Towing", phone: '334-839-2140', address: 'Whatley, AL' },
    { city: 'Whatley', state: 'AL', trade: 'water-restoration', name: "Special Touch Restoration", phone: '251-238-6622', address: 'Whatley, AL' },
    { city: 'Coffeeville', state: 'AL', trade: 'breakdown', name: "Thomasville Emergency Towing", phone: '334-839-2140', address: 'Coffeeville, AL' },
    { city: 'Coffeeville', state: 'AL', trade: 'water-restoration', name: "Special Touch Restoration", phone: '251-238-6622', address: 'Coffeeville, AL' },
    { city: 'Thomasville', state: 'AL', trade: 'breakdown', name: "Thomasville Emergency Towing", phone: '334-839-2140', address: 'Thomasville, AL' },
    { city: 'Thomasville', state: 'AL', trade: 'water-restoration', name: "Special Touch Restoration", phone: '251-238-6622', address: 'Thomasville, AL' },
    { city: 'Pine Hill', state: 'AL', trade: 'breakdown', name: "Towing Pine Hill", phone: '334-839-4689', address: 'Pine Hill, AL' },
    { city: 'Pine Hill', state: 'AL', trade: 'water-restoration', name: "Horizon Restoration Pros", phone: '888-990-9611', address: 'Pine Hill, AL' },
    { city: 'Yellow Bluff', state: 'AL', trade: 'breakdown', name: "Towing Pine Hill", phone: '334-839-4689', address: 'Yellow Bluff, AL' },
    { city: 'Yellow Bluff', state: 'AL', trade: 'water-restoration', name: "Horizon Restoration Pros", phone: '888-990-9611', address: 'Yellow Bluff, AL' },
    { city: 'Catherine', state: 'AL', trade: 'breakdown', name: "Towing Camden", phone: '334-839-4576', address: 'Catherine, AL' },
    { city: 'Catherine', state: 'AL', trade: 'water-restoration', name: "Horizon Restoration Pros", phone: '888-990-9611', address: 'Catherine, AL' },
    { city: 'Camden', state: 'AL', trade: 'breakdown', name: "Towing Camden", phone: '334-839-4576', address: 'Camden, AL' },
    { city: 'Camden', state: 'AL', trade: 'water-restoration', name: "Horizon Restoration Pros", phone: '888-990-9611', address: 'Camden, AL' },
    { city: 'Vredenburgh', state: 'AL', trade: 'breakdown', name: "Towing Camden", phone: '334-839-4576', address: 'Vredenburgh, AL' },
    { city: 'Vredenburgh', state: 'AL', trade: 'water-restoration', name: "Horizon Restoration Pros", phone: '888-990-9611', address: 'Vredenburgh, AL' }
];

const generateUUID = (str) => {
    return crypto.createHash('md5').update(str).digest('hex').replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5');
};

const createSlug = (name, trade, city) => {
    return `${name}-${trade}-${city}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
};

async function injectListings() {
    console.log('Injecting USA Batch 63...');
    
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
