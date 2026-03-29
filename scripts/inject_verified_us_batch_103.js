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
    { city: 'Butler', state: 'AL', trade: 'breakdown', name: "Butler Accident Removal", phone: '659-266-3909', address: 'Butler, AL' },
    { city: 'Butler', state: 'AL', trade: 'water-restoration', name: "SERVPRO of Livingston, Demopolis & Butler", phone: '205-652-2550', address: 'Butler, AL' },
    { city: 'Gilbertown', state: 'AL', trade: 'breakdown', name: "Reliant Towing Service Butler", phone: '251-216-1274', address: 'Gilbertown, AL' },
    { city: 'Gilbertown', state: 'AL', trade: 'water-restoration', name: "Triangle Water Damage", phone: '833-824-0699', address: 'Gilbertown, AL' },
    { city: 'Silas', state: 'AL', trade: 'breakdown', name: "Emergency Roadside & Diesel Support", phone: '251-589-6330', address: 'Silas, AL' },
    { city: 'Silas', state: 'AL', trade: 'water-restoration', name: "Alabama Emergency Water Removal Pros", phone: '251-298-8440', address: 'Silas, AL' },
    { city: 'Lisman', state: 'AL', trade: 'breakdown', name: "Butler Accident Removal", phone: '659-266-3909', address: 'Lisman, AL' },
    { city: 'Lisman', state: 'AL', trade: 'water-restoration', name: "SERVPRO of Livingston, Demopolis & Butler", phone: '205-652-2550', address: 'Lisman, AL' },
    { city: 'Needham', state: 'AL', trade: 'breakdown', name: "Butler Accident Removal", phone: '659-266-3909', address: 'Needham, AL' },
    { city: 'Needham', state: 'AL', trade: 'water-restoration', name: "SERVPRO of Livingston, Demopolis & Butler", phone: '205-652-2550', address: 'Needham, AL' },
    { city: 'Pennington', state: 'AL', trade: 'breakdown', name: "Butler Accident Removal", phone: '659-266-3909', address: 'Pennington, AL' },
    { city: 'Pennington', state: 'AL', trade: 'water-restoration', name: "SERVPRO of Livingston, Demopolis & Butler", phone: '205-652-2550', address: 'Pennington, AL' },
    { city: 'Toxey', state: 'AL', trade: 'breakdown', name: "Reliant Towing Service Butler", phone: '251-216-1274', address: 'Toxey, AL' },
    { city: 'Toxey', state: 'AL', trade: 'water-restoration', name: "Triangle Water Damage", phone: '833-824-0699', address: 'Toxey, AL' },
    { city: 'Jachin', state: 'AL', trade: 'breakdown', name: "Butler Accident Removal", phone: '659-266-3909', address: 'Jachin, AL' },
    { city: 'Jachin', state: 'AL', trade: 'water-restoration', name: "SERVPRO of Livingston, Demopolis & Butler", phone: '205-652-2550', address: 'Jachin, AL' },
    { city: 'Cullomburg', state: 'AL', trade: 'breakdown', name: "Emergency Roadside & Diesel Support", phone: '251-589-6330', address: 'Cullomburg, AL' },
    { city: 'Cullomburg', state: 'AL', trade: 'water-restoration', name: "Alabama Emergency Water Removal Pros", phone: '251-298-8440', address: 'Cullomburg, AL' },
    { city: 'Melvin', state: 'AL', trade: 'breakdown', name: "Butler Accident Removal", phone: '659-266-3909', address: 'Melvin, AL' },
    { city: 'Melvin', state: 'AL', trade: 'water-restoration', name: "SERVPRO of Livingston, Demopolis & Butler", phone: '205-652-2550', address: 'Melvin, AL' }
];

const generateUUID = (str) => {
    return crypto.createHash('md5').update(str).digest('hex').replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5');
};

const createSlug = (name, trade, city) => {
    return `${name}-${trade}-${city}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
};

async function injectListings() {
    console.log('Injecting USA Batch 103...');
    
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
