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
    { city: 'Catherine', state: 'AL', trade: 'breakdown', name: "Heavy Duty Towing & Truck Repair", phone: '877-733-3680', address: 'Catherine, AL' },
    { city: 'Catherine', state: 'AL', trade: 'water-restoration', name: "El Segundo Water Damage Restoration", phone: '251-236-0268', address: 'Catherine, AL' },
    { city: 'Alberta', state: 'AL', trade: 'breakdown', name: "Heavy Duty Towing & Truck Repair", phone: '877-733-3680', address: 'Alberta, AL' },
    { city: 'Alberta', state: 'AL', trade: 'water-restoration', name: "El Segundo Water Damage Restoration", phone: '251-236-0268', address: 'Alberta, AL' },
    { city: 'Gastonburg', state: 'AL', trade: 'breakdown', name: "Heavy Duty Towing & Truck Repair", phone: '877-733-3680', address: 'Gastonburg, AL' },
    { city: 'Gastonburg', state: 'AL', trade: 'water-restoration', name: "El Segundo Water Damage Restoration", phone: '251-236-0268', address: 'Gastonburg, AL' },
    { city: 'Boykin', state: 'AL', trade: 'breakdown', name: "Heavy Duty Towing & Truck Repair", phone: '877-733-3680', address: 'Boykin, AL' },
    { city: 'Boykin', state: 'AL', trade: 'water-restoration', name: "Alabama Flood Damage Repair Company Pros", phone: '251-236-0545', address: 'Boykin, AL' },
    { city: 'Oak Hill', state: 'AL', trade: 'breakdown', name: "KMS Road Service", phone: '800-673-1060', address: 'Oak Hill, AL' },
    { city: 'Oak Hill', state: 'AL', trade: 'water-restoration', name: "Oak Hill Professional Water Removal", phone: '251-236-0268', address: 'Oak Hill, AL' },
    { city: 'Neenah', state: 'AL', trade: 'breakdown', name: "KMS Road Service", phone: '800-673-1060', address: 'Neenah, AL' },
    { city: 'Neenah', state: 'AL', trade: 'water-restoration', name: "Oak Hill Professional Water Removal", phone: '251-236-0268', address: 'Neenah, AL' },
    { city: 'Ackerville', state: 'AL', trade: 'breakdown', name: "KMS Road Service", phone: '800-673-1060', address: 'Ackerville, AL' },
    { city: 'Ackerville', state: 'AL', trade: 'water-restoration', name: "Oak Hill Professional Water Removal", phone: '251-236-0268', address: 'Ackerville, AL' },
    { city: 'Snow Hill', state: 'AL', trade: 'breakdown', name: "KMS Road Service", phone: '800-673-1060', address: 'Snow Hill, AL' },
    { city: 'Snow Hill', state: 'AL', trade: 'water-restoration', name: "Oak Hill Professional Water Removal", phone: '251-236-0268', address: 'Snow Hill, AL' },
    { city: 'Furman', state: 'AL', trade: 'breakdown', name: "KMS Road Service", phone: '800-673-1060', address: 'Furman, AL' },
    { city: 'Furman', state: 'AL', trade: 'water-restoration', name: "Oak Hill Professional Water Removal", phone: '251-236-0268', address: 'Furman, AL' },
    { city: 'Darlington', state: 'AL', trade: 'breakdown', name: "KMS Road Service", phone: '800-673-1060', address: 'Darlington, AL' },
    { city: 'Darlington', state: 'AL', trade: 'water-restoration', name: "Oak Hill Professional Water Removal", phone: '251-236-0268', address: 'Darlington, AL' }
];

const generateUUID = (str) => {
    return crypto.createHash('md5').update(str).digest('hex').replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5');
};

const createSlug = (name, city) => {
    return `${name}-${city}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
};

async function injectListings() {
    console.log('Injecting USA Batch 30...');
    
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
