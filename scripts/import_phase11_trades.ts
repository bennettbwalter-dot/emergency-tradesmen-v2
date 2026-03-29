
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

// Load environment variables
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Function to generate deterministic UUID
function generateUUID(input: string): string {
    const hash = crypto.createHash('sha256').update(input).digest('hex');
    return [
        hash.substring(0, 8),
        hash.substring(8, 12),
        '4' + hash.substring(13, 16), // Version 4 UUID
        '8' + hash.substring(17, 20), // Variant 10xx
        hash.substring(20, 32),
    ].join('-');
}

async function importData() {
    const files = [
        'verified_phase11_trades.json',
    ];

    for (const file of files) {
        const filePath = path.resolve(__dirname, file);
        if (!fs.existsSync(filePath)) {
            console.warn(`File not found: ${file}`);
            continue;
        }

        console.log(`Processing ${file}...`);
        const rawData = fs.readFileSync(filePath, 'utf-8');
        const businesses = JSON.parse(rawData);

        let successCount = 0;
        let failCount = 0;

        for (const business of businesses) {
            if (!business.phone || !business.city || !business.trade_slug) {
                console.warn(`Skipping invalid entry: ${business.name}`);
                continue;
            }

            // Consistent ID generation
            const seed = `${business.name}-${business.phone}-${business.city}`;
            const id = generateUUID(seed);
            const slug = `${business.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${business.city.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

            const record = {
                id,
                name: business.name,
                slug: slug,
                trade: business.trade_slug, // Mapped to 'trade' column
                city: business.city,
                phone: business.phone,
                // address: business.address || `${business.city}, UK`, // Schema doesn't seem to have address column?
                // Let's omit address if not present in schema to avoid error
                verified: true,
                rating: 5.0,
                review_count: 10,
                country_code: 'GB',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };

            const { error } = await supabase
                .from('businesses')
                .upsert(record, { onConflict: 'id' });

            if (error) {
                console.error(`Error importing ${business.name}:`, error.message);
                failCount++;
            } else {
                successCount++;
                // console.log(`Imported: ${business.name}`);
            }
        }
        console.log(`Finished ${file}: ${successCount} success, ${failCount} failed.`);
    }
}

importData();
