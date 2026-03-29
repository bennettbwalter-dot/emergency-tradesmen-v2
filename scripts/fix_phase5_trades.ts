
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';
import * as crypto from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface Business {
    name: string;
    phone: string;
    city: string;
    trade: string;
    rating: number;
    review_count: number;
    hours: string;
    is_open_24_hours: boolean;
    verified: boolean;
    tier: string;
}

function generateUUID(name: string, city: string, trade: string): string {
    const input = `${name}-${city}-${trade}`.toLowerCase().replace(/[^a-z0-9]/g, '');
    const hash = crypto.createHash('md5').update(input).digest('hex');
    return `${hash.substring(0, 8)}-${hash.substring(8, 12)}-${hash.substring(12, 16)}-${hash.substring(16, 20)}-${hash.substring(20, 32)}`;
}

async function fixPhase5() {
    const jsonPath = path.join(__dirname, 'verified_phase5_trades.json');

    if (!fs.existsSync(jsonPath)) {
        console.error(`File not found: ${jsonPath}`);
        return;
    }

    const rawData = fs.readFileSync(jsonPath, 'utf-8');
    const businesses: Business[] = JSON.parse(rawData);

    console.log(`Fixing ${businesses.length} businesses from phase 5...`);

    let deletedCount = 0;
    let insertedCount = 0;

    for (const business of businesses) {
        // 1. Calculate the "bad" ID (with spaces)
        // If trade is "gas-engineer", the bad version was "gas engineer"
        let badTrade = business.trade;
        if (business.trade === 'gas-engineer') badTrade = 'gas engineer';
        if (business.trade === 'drain-specialist') badTrade = 'drain specialist';

        // Only if we suspect a bad version exists (i.e. if we changed it)
        if (badTrade !== business.trade) {
            const badId = generateUUID(business.name, business.city, badTrade);
            // Delete the bad record
            const { error: delError } = await supabase.from('businesses').delete().eq('id', badId);
            if (!delError) deletedCount++;
        }

        // 2. Insert the "good" record
        const slug = `${business.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${business.city.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
        const id = generateUUID(business.name, business.city, business.trade);

        const record = {
            id: id,
            name: business.name,
            slug: slug,
            trade: business.trade.toLowerCase(),
            city: business.city,
            phone: business.phone,
            hours: business.hours,
            is_open_24_hours: business.is_open_24_hours,
            rating: business.rating,
            review_count: business.review_count,
            verified: business.verified,
            tier: business.tier,
            country_code: 'GB',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        const { error: insertError } = await supabase
            .from('businesses')
            .upsert(record, { onConflict: 'id' });

        if (insertError) {
            console.error(`Failed to upsert ${business.name}:`, insertError.message);
        } else {
            insertedCount++;
        }
    }

    console.log(`Finished Fix: ${deletedCount} bad records deleted (maybe), ${insertedCount} correct records upserted.`);
}

fixPhase5();
