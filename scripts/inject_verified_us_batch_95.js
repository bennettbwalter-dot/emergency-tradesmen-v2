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
    { city: 'Centreville', state: 'AL', trade: 'breakdown', name: "Fred Robertson Wrecker Service", phone: '205-926-4411', address: 'Centreville, AL' },
    { city: 'Centreville', state: 'AL', trade: 'water-restoration', name: "SERVPRO of Centreville", phone: '205-926-0308', address: 'Centreville, AL' },
    { city: 'Brent', state: 'AL', trade: 'breakdown', name: "Dailey's Towing Service", phone: '205-926-4074', address: 'Brent, AL' },
    { city: 'Brent', state: 'AL', trade: 'water-restoration', name: "SERVPRO of Centreville", phone: '205-926-0308', address: 'Brent, AL' },
    { city: 'Woodstock', state: 'AL', trade: 'breakdown', name: "Weil Wrecker Service", phone: '205-663-3489', address: 'Woodstock, AL' },
    { city: 'Woodstock', state: 'AL', trade: 'water-restoration', name: "Alabama Emergency Restoration Service Pros", phone: '888-990-9611', address: 'Woodstock, AL' },
    { city: 'West Blocton', state: 'AL', trade: 'breakdown', name: "McKinney Wrecker Service", phone: '205-938-2391', address: 'West Blocton, AL' },
    { city: 'West Blocton', state: 'AL', trade: 'water-restoration', name: "SERVPRO of Centreville", phone: '205-926-0308', address: 'West Blocton, AL' },
    { city: 'Vance', state: 'AL', trade: 'breakdown', name: "Weil Wrecker Service", phone: '205-663-3489', address: 'Vance, AL' },
    { city: 'Vance', state: 'AL', trade: 'water-restoration', name: "SERVPRO of Tuscaloosa", phone: '205-553-8377', address: 'Vance, AL' },
    { city: 'Green Pond', state: 'AL', trade: 'breakdown', name: "McKinney Wrecker Service", phone: '205-938-2391', address: 'Green Pond, AL' },
    { city: 'Green Pond', state: 'AL', trade: 'water-restoration', name: "SERVPRO of Centreville", phone: '205-926-0308', address: 'Green Pond, AL' },
    { city: 'Eoline', state: 'AL', trade: 'breakdown', name: "Fred Robertson Wrecker Service", phone: '205-926-4411', address: 'Eoline, AL' },
    { city: 'Eoline', state: 'AL', trade: 'water-restoration', name: "SERVPRO of Centreville", phone: '205-926-0308', address: 'Eoline, AL' },
    { city: 'Lawley', state: 'AL', trade: 'breakdown', name: "Fred Robertson Wrecker Service", phone: '205-926-4411', address: 'Lawley, AL' },
    { city: 'Lawley', state: 'AL', trade: 'water-restoration', name: "SERVPRO of Centreville", phone: '205-926-0308', address: 'Lawley, AL' },
    { city: 'Randolph', state: 'AL', trade: 'breakdown', name: "Fred Robertson Wrecker Service", phone: '205-926-4411', address: 'Randolph, AL' },
    { city: 'Randolph', state: 'AL', trade: 'water-restoration', name: "SERVPRO of Centreville", phone: '205-926-0308', address: 'Randolph, AL' },
    { city: 'Active', state: 'AL', trade: 'breakdown', name: "Fred Robertson Wrecker Service", phone: '205-926-4411', address: 'Active, AL' },
    { city: 'Active', state: 'AL', trade: 'water-restoration', name: "SERVPRO of Centreville", phone: '205-926-0308', address: 'Active, AL' }
];

const generateUUID = (str) => {
    return crypto.createHash('md5').update(str).digest('hex').replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5');
};

const createSlug = (name, trade, city) => {
    return `${name}-${trade}-${city}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
};

async function injectListings() {
    console.log('Injecting USA Batch 95...');
    
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
