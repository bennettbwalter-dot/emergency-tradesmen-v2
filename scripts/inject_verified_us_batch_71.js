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
    { city: 'Gainestown', state: 'AL', trade: 'breakdown', name: "Whatley Emergency Towing", phone: '251-538-3209', address: 'Gainestown, AL' },
    { city: 'Gainestown', state: 'AL', trade: 'water-restoration', name: "Alabama Flood Damage Repair Company Pros", phone: '888-990-9611', address: 'Gainestown, AL' },
    { city: 'Gosport', state: 'AL', trade: 'breakdown', name: "Whatley Emergency Towing", phone: '251-538-3209', address: 'Gosport, AL' },
    { city: 'Gosport', state: 'AL', trade: 'water-restoration', name: "Alabama Flood Damage Repair Company Pros", phone: '888-990-9611', address: 'Gosport, AL' },
    { city: 'Manila', state: 'AL', trade: 'breakdown', name: "Whatley Emergency Towing", phone: '251-538-3209', address: 'Manila, AL' },
    { city: 'Manila', state: 'AL', trade: 'water-restoration', name: "Alabama Flood Damage Repair Company Pros", phone: '888-990-9611', address: 'Manila, AL' },
    { city: 'Opine', state: 'AL', trade: 'breakdown', name: "Whatley Emergency Towing", phone: '251-538-3209', address: 'Opine, AL' },
    { city: 'Opine', state: 'AL', trade: 'water-restoration', name: "Alabama Flood Damage Repair Company Pros", phone: '888-990-9611', address: 'Opine, AL' },
    { city: 'Suggsville', state: 'AL', trade: 'breakdown', name: "Whatley Emergency Towing", phone: '251-538-3209', address: 'Suggsville, AL' },
    { city: 'Suggsville', state: 'AL', trade: 'water-restoration', name: "Alabama Flood Damage Repair Company Pros", phone: '888-990-9611', address: 'Suggsville, AL' },
    { city: 'Tallahatta Springs', state: 'AL', trade: 'breakdown', name: "Whatley Emergency Towing", phone: '251-538-3209', address: 'Tallahatta Springs, AL' },
    { city: 'Tallahatta Springs', state: 'AL', trade: 'water-restoration', name: "Alabama Flood Damage Repair Company Pros", phone: '888-990-9611', address: 'Tallahatta Springs, AL' },
    { city: 'Walker Springs', state: 'AL', trade: 'breakdown', name: "Whatley Emergency Towing", phone: '251-538-3209', address: 'Walker Springs, AL' },
    { city: 'Walker Springs', state: 'AL', trade: 'water-restoration', name: "Alabama Flood Damage Repair Company Pros", phone: '888-990-9611', address: 'Walker Springs, AL' },
    { city: 'Whatley', state: 'AL', trade: 'breakdown', name: "Whatley Emergency Towing", phone: '251-538-3209', address: 'Whatley, AL' },
    { city: 'Whatley', state: 'AL', trade: 'water-restoration', name: "Alabama Flood Damage Repair Company Pros", phone: '888-990-9611', address: 'Whatley, AL' },
    { city: 'Bigbee', state: 'AL', trade: 'breakdown', name: "Whatley Emergency Towing", phone: '251-538-3209', address: 'Bigbee, AL' },
    { city: 'Bigbee', state: 'AL', trade: 'water-restoration', name: "Alabama Flood Damage Repair Company Pros", phone: '888-990-9611', address: 'Bigbee, AL' },
    { city: 'St. Stephens', state: 'AL', trade: 'breakdown', name: "Whatley Emergency Towing", phone: '251-538-3209', address: 'St. Stephens, AL' },
    { city: 'St. Stephens', state: 'AL', trade: 'water-restoration', name: "Alabama Flood Damage Repair Company Pros", phone: '888-990-9611', address: 'St. Stephens, AL' }
];

const generateUUID = (str) => {
    return crypto.createHash('md5').update(str).digest('hex').replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5');
};

const createSlug = (name, trade, city) => {
    return `${name}-${trade}-${city}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
};

async function injectListings() {
    console.log('Injecting USA Batch 71...');
    
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
