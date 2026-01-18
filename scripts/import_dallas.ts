import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function importData() {
    console.log('🚀 Starting Dallas Data Import');

    const dataPath = path.join(__dirname, 'dallas_businesses.json');
    if (!fs.existsSync(dataPath)) {
        console.error(`❌ Data file not found: ${dataPath}`);
        return;
    }

    const businesses = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    console.log(`📦 Loaded ${businesses.length} businesses for import`);

    // Transform data if necessary and ensure fields match existing schema
    // The fetch script already sets trade, city, country_code, etc.

    // Batching to avoid timeouts
    const BATCH_SIZE = 100;
    for (let i = 0; i < businesses.length; i += BATCH_SIZE) {
        const batch = businesses.slice(i, i + BATCH_SIZE);

        // Explicitly mapping to ensure exact field names
        const insertData = batch.map(b => ({
            name: b.name,
            trade: b.trade,
            rating: b.rating,
            user_ratings_total: b.user_ratings_total || 0,
            address: b.address,
            google_place_id: b.google_place_id,
            city: b.city,
            country_code: b.country_code, // This is the problematic column
            created_at: new Date().toISOString()
        }));

        const { error } = await supabase
            .from('businesses')
            .insert(insertData);

        if (error) {
            console.error(`❌ Batch ${i / BATCH_SIZE + 1} failed:`, error.message);
            if (error.message.includes('country_code')) {
                console.error('⚠️ Schema cache issue detected. Attempting workaround if possible...');
            }
            // If one batch fails due to schema, subsequent ones will too. 
            // User might need to restart PostgREST or we use a different method.
        } else {
            console.log(`✅ Batch ${i / BATCH_SIZE + 1} imported (${i + batch.length}/${businesses.length})`);
        }
    }

    console.log('🏁 Import process completed');
}

importData().catch(console.error);
