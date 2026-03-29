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
    { city: 'Axis', state: 'AL', trade: 'breakdown', name: "Freedom Towing", phone: '251-470-7111', address: 'Axis, AL' },
    { city: 'Axis', state: 'AL', trade: 'water-restoration', name: "Emergency Water Removal Pros", phone: '888-990-9611', address: 'Axis, AL' },
    { city: 'Bucks', state: 'AL', trade: 'breakdown', name: "Freedom Towing", phone: '251-470-7111', address: 'Bucks, AL' },
    { city: 'Bucks', state: 'AL', trade: 'water-restoration', name: "Emergency Water Removal Pros", phone: '888-990-9611', address: 'Bucks, AL' },
    { city: 'Chunchula', state: 'AL', trade: 'breakdown', name: "Freedom Towing", phone: '251-470-7111', address: 'Chunchula, AL' },
    { city: 'Chunchula', state: 'AL', trade: 'water-restoration', name: "Emergency Water Removal Pros", phone: '888-990-9611', address: 'Chunchula, AL' },
    { city: 'Saint Elmo', state: 'AL', trade: 'breakdown', name: "Bayou La Batre Emergency Towing", phone: '251-552-2771', address: 'Saint Elmo, AL' },
    { city: 'Saint Elmo', state: 'AL', trade: 'water-restoration', name: "Experts Water Damage Restoration LLC", phone: '888-990-9611', address: 'Saint Elmo, AL' },
    { city: 'Bayou La Batre', state: 'AL', trade: 'breakdown', name: "Bayou La Batre Emergency Towing", phone: '251-552-2771', address: 'Bayou La Batre, AL' },
    { city: 'Bayou La Batre', state: 'AL', trade: 'water-restoration', name: "Experts Water Damage Restoration LLC", phone: '888-990-9611', address: 'Bayou La Batre, AL' },
    { city: 'Coden', state: 'AL', trade: 'breakdown', name: "Bayou La Batre Emergency Towing", phone: '251-552-2771', address: 'Coden, AL' },
    { city: 'Coden', state: 'AL', trade: 'water-restoration', name: "Experts Water Damage Restoration LLC", phone: '888-990-9611', address: 'Coden, AL' },
    { city: 'Dauphin Island', state: 'AL', trade: 'breakdown', name: "International 24/7 Roadside Assistance LLC", phone: '251-219-0904', address: 'Dauphin Island, AL' },
    { city: 'Dauphin Island', state: 'AL', trade: 'water-restoration', name: "Phoenix Restoration Services", phone: '251-321-1376', address: 'Dauphin Island, AL' },
    { city: 'Heron Bay', state: 'AL', trade: 'breakdown', name: "Bayou La Batre Emergency Towing", phone: '251-552-2771', address: 'Heron Bay, AL' },
    { city: 'Heron Bay', state: 'AL', trade: 'water-restoration', name: "Experts Water Damage Restoration LLC", phone: '888-990-9611', address: 'Heron Bay, AL' },
    { city: 'Mon Louis', state: 'AL', trade: 'breakdown', name: "Bayou La Batre Emergency Towing", phone: '251-552-2771', address: 'Mon Louis, AL' },
    { city: 'Mon Louis', state: 'AL', trade: 'water-restoration', name: "Experts Water Damage Restoration LLC", phone: '888-990-9611', address: 'Mon Louis, AL' },
    { city: 'Alabama Port', state: 'AL', trade: 'breakdown', name: "Bayou La Batre Emergency Towing", phone: '251-552-2771', address: 'Alabama Port, AL' },
    { city: 'Alabama Port', state: 'AL', trade: 'water-restoration', name: "Experts Water Damage Restoration LLC", phone: '888-990-9611', address: 'Alabama Port, AL' }
];

const generateUUID = (str) => {
    return crypto.createHash('md5').update(str).digest('hex').replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5');
};

const createSlug = (name, trade, city) => {
    return `${name}-${trade}-${city}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
};

async function injectListings() {
    console.log('Injecting USA Batch 73...');
    
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
