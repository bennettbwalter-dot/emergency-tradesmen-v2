
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';
import * as crypto from 'crypto';

// Load environment variables
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY; // Using Anon key for RLS policies if allowed, or Service Role if needed. Data import usually needs Service Role potentially if RLS is strict. Let's try Anon first as per previous scripts.

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

// Deterministic UUID generator similar to previous scripts
function generateUUID(name: string, city: string, trade: string): string {
    const input = `${name}-${city}-${trade}`.toLowerCase().replace(/[^a-z0-9]/g, '');
    const hash = crypto.createHash('md5').update(input).digest('hex');
    return `${hash.substring(0, 8)}-${hash.substring(8, 12)}-${hash.substring(12, 16)}-${hash.substring(16, 20)}-${hash.substring(20, 32)}`;
}

async function importBusinesses() {
    const jsonPath = path.join(__dirname, 'verified_locksmiths_uk.json');

    if (!fs.existsSync(jsonPath)) {
        console.error(`File not found: ${jsonPath}`);
        process.exit(1);
    }

    const rawData = fs.readFileSync(jsonPath, 'utf-8');
    let businesses: Business[] = [];

    try {
        businesses = JSON.parse(rawData);
    } catch (error) {
        console.error('Error parsing JSON:', error);
        process.exit(1);
    }

    console.log(`Found ${businesses.length} verified businesses to import.`);

    let successCount = 0;
    let failCount = 0;

    for (const business of businesses) {
        const slug = `${business.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${business.city.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
        const id = generateUUID(business.name, business.city, business.trade);

        const record = {
            id: id,
            name: business.name,
            slug: slug,
            trade: business.trade.toLowerCase(),
            city: business.city, // Keep original case (London, Birmingham)
            phone: business.phone,
            hours: business.hours,
            is_open_24_hours: business.is_open_24_hours,
            rating: business.rating,
            review_count: business.review_count,
            verified: business.verified,
            tier: business.tier,
            country_code: 'GB', // EXPLICITLY SET AS UK
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        const { error } = await supabase
            .from('businesses')
            .upsert(record, { onConflict: 'id' });

        if (error) {
            console.error(`Failed to import ${business.name}:`, error.message);
            failCount++;
        } else {
            console.log(`Imported: ${business.name} (${business.city})`);
            successCount++;
        }
    }

    console.log(`\nImport Summary:`);
    console.log(`Success: ${successCount}`);
    console.log(`Failed: ${failCount}`);
}

importBusinesses();
