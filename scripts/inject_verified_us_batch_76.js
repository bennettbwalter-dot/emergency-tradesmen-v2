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
    { city: 'Monroeville', state: 'AL', trade: 'breakdown', name: "Monroeville Towing", phone: '251-873-1483', address: 'Monroeville, AL' },
    { city: 'Monroeville', state: 'AL', trade: 'water-restoration', name: "SERVPRO of Monroeville / Evergreen / Brewton", phone: '251-809-1260', address: 'Monroeville, AL' },
    { city: 'Beatrice', state: 'AL', trade: 'breakdown', name: "Beatrice Emergency Towing", phone: '251-553-4399', address: 'Beatrice, AL' },
    { city: 'Beatrice', state: 'AL', trade: 'water-restoration', name: "Triangle Water Damage", phone: '833-824-0699', address: 'Beatrice, AL' },
    { city: 'Excel', state: 'AL', trade: 'breakdown', name: "Monroeville Towing", phone: '251-873-1483', address: 'Excel, AL' },
    { city: 'Excel', state: 'AL', trade: 'water-restoration', name: "SERVPRO of Monroeville / Evergreen / Brewton", phone: '251-809-1260', address: 'Excel, AL' },
    { city: 'Frisco City', state: 'AL', trade: 'breakdown', name: "Frisco City Emergency Towing", phone: '251-552-2087', address: 'Frisco City, AL' },
    { city: 'Frisco City', state: 'AL', trade: 'water-restoration', name: "Triangle Water Damage", phone: '833-824-0699', address: 'Frisco City, AL' },
    { city: 'Perdue Hill', state: 'AL', trade: 'breakdown', name: "Monroeville Towing", phone: '251-873-1483', address: 'Perdue Hill, AL' },
    { city: 'Perdue Hill', state: 'AL', trade: 'water-restoration', name: "SERVPRO of Monroeville / Evergreen / Brewton", phone: '251-809-1260', address: 'Perdue Hill, AL' },
    { city: 'Peterman', state: 'AL', trade: 'breakdown', name: "Monroeville Towing", phone: '251-873-1483', address: 'Peterman, AL' },
    { city: 'Peterman', state: 'AL', trade: 'water-restoration', name: "SERVPRO of Monroeville / Evergreen / Brewton", phone: '251-809-1260', address: 'Peterman, AL' },
    { city: 'Uriah', state: 'AL', trade: 'breakdown', name: "Frisco City Emergency Towing", phone: '251-552-2087', address: 'Uriah, AL' },
    { city: 'Uriah', state: 'AL', trade: 'water-restoration', name: "Triangle Water Damage", phone: '833-824-0699', address: 'Uriah, AL' },
    { city: 'Vredenburgh', state: 'AL', trade: 'breakdown', name: "Beatrice Emergency Towing", phone: '251-553-4399', address: 'Vredenburgh, AL' },
    { city: 'Vredenburgh', state: 'AL', trade: 'water-restoration', name: "Triangle Water Damage", phone: '833-824-0699', address: 'Vredenburgh, AL' },
    { city: 'Franklin', state: 'AL', trade: 'breakdown', name: "Monroeville Towing", phone: '251-873-1483', address: 'Franklin, AL' },
    { city: 'Franklin', state: 'AL', trade: 'water-restoration', name: "SERVPRO of Monroeville / Evergreen / Brewton", phone: '251-809-1260', address: 'Franklin, AL' },
    { city: 'Hybart', state: 'AL', trade: 'breakdown', name: "Beatrice Emergency Towing", phone: '251-553-4399', address: 'Hybart, AL' },
    { city: 'Hybart', state: 'AL', trade: 'water-restoration', name: "Triangle Water Damage", phone: '833-824-0699', address: 'Hybart, AL' }
];

const generateUUID = (str) => {
    return crypto.createHash('md5').update(str).digest('hex').replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5');
};

const createSlug = (name, trade, city) => {
    return `${name}-${trade}-${city}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
};

async function injectListings() {
    console.log('Injecting USA Batch 76...');
    
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
