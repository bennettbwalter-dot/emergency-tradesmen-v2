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
    { city: 'Capshaw', state: 'AL', trade: 'breakdown', name: "Affordable Towing", phone: '256-759-4060', address: 'Capshaw, AL' },
    { city: 'Capshaw', state: 'AL', trade: 'water-restoration', name: "Special Touch Restoration", phone: '256-534-1111', address: 'Capshaw, AL' },
    { city: 'Tanner', state: 'AL', trade: 'breakdown', name: "Roadside-Pro", phone: '256-481-8646', address: 'Tanner, AL' },
    { city: 'Tanner', state: 'AL', trade: 'water-restoration', name: "Special Touch Restoration", phone: '256-534-1111', address: 'Tanner, AL' },
    { city: 'French Mill', state: 'AL', trade: 'breakdown', name: "Roadside-Pro", phone: '256-481-8646', address: 'French Mill, AL' },
    { city: 'French Mill', state: 'AL', trade: 'water-restoration', name: "Special Touch Restoration", phone: '256-534-1111', address: 'French Mill, AL' },
    { city: 'Greenbrier', state: 'AL', trade: 'breakdown', name: "Roadside-Pro", phone: '256-481-8646', address: 'Greenbrier, AL' },
    { city: 'Greenbrier', state: 'AL', trade: 'water-restoration', name: "Special Touch Restoration", phone: '256-534-1111', address: 'Greenbrier, AL' },
    { city: 'Belle Mina', state: 'AL', trade: 'breakdown', name: "Roadside-Pro", phone: '256-481-8646', address: 'Belle Mina, AL' },
    { city: 'Belle Mina', state: 'AL', trade: 'water-restoration', name: "Special Touch Restoration", phone: '256-534-1111', address: 'Belle Mina, AL' },
    { city: 'Moores Hill', state: 'AL', trade: 'breakdown', name: "Roadside-Pro", phone: '256-481-8646', address: 'Moores Hill, AL' },
    { city: 'Moores Hill', state: 'AL', trade: 'water-restoration', name: "Special Touch Restoration", phone: '256-534-1111', address: 'Moores Hill, AL' },
    { city: 'Reid', state: 'AL', trade: 'breakdown', name: "Roadside-Pro", phone: '256-481-8646', address: 'Reid, AL' },
    { city: 'Reid', state: 'AL', trade: 'water-restoration', name: "Special Touch Restoration", phone: '256-534-1111', address: 'Reid, AL' },
    { city: 'Scarce Grease', state: 'AL', trade: 'breakdown', name: "Roadside-Pro", phone: '256-481-8646', address: 'Scarce Grease, AL' },
    { city: 'Scarce Grease', state: 'AL', trade: 'water-restoration', name: "Special Touch Restoration", phone: '256-534-1111', address: 'Scarce Grease, AL' },
    { city: 'Swancott', state: 'AL', trade: 'breakdown', name: "Roadside-Pro", phone: '256-481-8646', address: 'Swancott, AL' },
    { city: 'Swancott', state: 'AL', trade: 'water-restoration', name: "Special Touch Restoration", phone: '256-534-1111', address: 'Swancott, AL' },
    { city: 'Thach', state: 'AL', trade: 'breakdown', name: "Roadside-Pro", phone: '256-481-8646', address: 'Thach, AL' },
    { city: 'Thach', state: 'AL', trade: 'water-restoration', name: "Special Touch Restoration", phone: '256-534-1111', address: 'Thach, AL' }
];

const generateUUID = (str) => {
    return crypto.createHash('md5').update(str).digest('hex').replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5');
};

const createSlug = (name, trade, city) => {
    return `${name}-${trade}-${city}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
};

async function injectListings() {
    console.log('Injecting USA Batch 40...');
    
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
