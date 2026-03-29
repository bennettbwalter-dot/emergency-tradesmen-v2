
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';
import path from 'path';

console.log('SCRIPT STARTED - Group B');
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabaseData = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

const DATA_FILE = join(__dirname, 'data', 'uk_phase12_group_b_data.json');

async function importData() {
    try {
        const rawData = fs.readFileSync(DATA_FILE, 'utf-8');
        const businesses = JSON.parse(rawData);

        console.log(`Found ${businesses.length} businesses to import for Phase 12 Group B.`);

        // Hardcoded System User ID
        const targetUserId = "bef3b95e-b361-478a-9899-7016d9edc21b";
        console.log(`✅ Assigning businesses to System User ID: ${targetUserId}`);

        let successCount = 0;
        let failCount = 0;
        let skipCount = 0;

        for (const biz of businesses) {
            // Check if listing exists
            const { data: existing } = await supabaseData
                .from('businesses')
                .select('id')
                .eq('name', biz.business_name) // Map business_name to name
                .eq('city', biz.city)
                .maybeSingle();

            if (existing) {
                console.log(`Skipping duplicate: ${biz.business_name} in ${biz.city}`);
                skipCount++;
                continue;
            }

            const { error } = await supabaseData.from('businesses').insert({
                id: randomUUID(),
                owner_user_id: targetUserId,
                slug: `${biz.business_name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${String(Date.now()).slice(-6)}`,
                name: biz.business_name,
                trade: biz.trade,
                phone: biz.phone,
                city: biz.city,
                country_code: 'UK', // Correct column
                verified: true,
                created_at: new Date().toISOString()
            });

            if (error) {
                console.error(`Error importing ${biz.business_name}:`, error.message);
                failCount++;
            } else {
                console.log(`Imported: ${biz.business_name} (${biz.city} - ${biz.trade})`);
                successCount++;
            }
        }

        console.log('\nImport Summary:');
        console.log(`Total processed: ${businesses.length}`);
        console.log(`Successfully imported: ${successCount}`);
        console.log(`Skipped (duplicates): ${skipCount}`);
        console.log(`Failed: ${failCount}`);

    } catch (error) {
        console.error('Critical error:', error);
    }
}

importData();
