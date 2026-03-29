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
    { city: 'Oak Grove', state: 'AL', trade: 'breakdown', name: "Quality Mobile Towing LLC", phone: '251-219-0904', address: 'Oak Grove, AL' },
    { city: 'Oak Grove', state: 'AL', trade: 'water-restoration', name: "Mobile AL Damage Restoration Pros", phone: '888-990-9611', address: 'Oak Grove, AL' },
    { city: 'Toulminville', state: 'AL', trade: 'breakdown', name: "Quality Mobile Towing LLC", phone: '251-219-0904', address: 'Toulminville, AL' },
    { city: 'Toulminville', state: 'AL', trade: 'water-restoration', name: "Mobile AL Damage Restoration Pros", phone: '888-990-9611', address: 'Toulminville, AL' },
    { city: 'Happy Hill', state: 'AL', trade: 'breakdown', name: "Quality Mobile Towing LLC", phone: '251-219-0904', address: 'Happy Hill, AL' },
    { city: 'Happy Hill', state: 'AL', trade: 'water-restoration', name: "Mobile AL Damage Restoration Pros", phone: '888-990-9611', address: 'Happy Hill, AL' },
    { city: 'Plateau', state: 'AL', trade: 'breakdown', name: "Quality Mobile Towing LLC", phone: '251-219-0904', address: 'Plateau, AL' },
    { city: 'Plateau', state: 'AL', trade: 'water-restoration', name: "Mobile AL Damage Restoration Pros", phone: '888-990-9611', address: 'Plateau, AL' },
    { city: 'Magazine', state: 'AL', trade: 'breakdown', name: "Quality Mobile Towing LLC", phone: '251-219-0904', address: 'Magazine, AL' },
    { city: 'Magazine', state: 'AL', trade: 'water-restoration', name: "Mobile AL Damage Restoration Pros", phone: '888-990-9611', address: 'Magazine, AL' },
    { city: 'Africatown', state: 'AL', trade: 'breakdown', name: "Quality Mobile Towing LLC", phone: '251-219-0904', address: 'Africatown, AL' },
    { city: 'Africatown', state: 'AL', trade: 'water-restoration', name: "Mobile AL Damage Restoration Pros", phone: '888-990-9611', address: 'Africatown, AL' },
    { city: 'Neely', state: 'AL', trade: 'breakdown', name: "Quality Mobile Towing LLC", phone: '251-219-0904', address: 'Neely, AL' },
    { city: 'Neely', state: 'AL', trade: 'water-restoration', name: "Mobile AL Damage Restoration Pros", phone: '888-990-9611', address: 'Neely, AL' },
    { city: 'Sibert', state: 'AL', trade: 'breakdown', name: "Quality Mobile Towing LLC", phone: '251-219-0904', address: 'Sibert, AL' },
    { city: 'Sibert', state: 'AL', trade: 'water-restoration', name: "Mobile AL Damage Restoration Pros", phone: '888-990-9611', address: 'Sibert, AL' },
    { city: 'Trinity Gardens', state: 'AL', trade: 'breakdown', name: "Quality Mobile Towing LLC", phone: '251-219-0904', address: 'Trinity Gardens, AL' },
    { city: 'Trinity Gardens', state: 'AL', trade: 'water-restoration', name: "Mobile AL Damage Restoration Pros", phone: '888-990-9611', address: 'Trinity Gardens, AL' },
    { city: 'Crichton', state: 'AL', trade: 'breakdown', name: "Quality Mobile Towing LLC", phone: '251-219-0904', address: 'Crichton, AL' },
    { city: 'Crichton', state: 'AL', trade: 'water-restoration', name: "Mobile AL Damage Restoration Pros", phone: '888-990-9611', address: 'Crichton, AL' }
];

const generateUUID = (str) => {
    return crypto.createHash('md5').update(str).digest('hex').replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5');
};

const createSlug = (name, trade, city) => {
    return `${name}-${trade}-${city}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
};

async function injectListings() {
    console.log('Injecting USA Batch 75...');
    
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
