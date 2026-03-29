import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Manual-Listing Background Orchestrator (US)
 * This script is used to batch-insert verified listings identified via manual search/verification.
 * Strictly for emergencycontractors.net (US).
 */
async function insertUSBusinesses(batch) {
    console.log(`🚀 Processing batch of ${batch.length} US listings...`);
    
    for (const biz of batch) {
        if (!biz.name || !biz.phone || !biz.city || !biz.state || !biz.trade) {
            console.error("❌ Missing required fields for business:", biz.name);
            continue;
        }

        const slug = biz.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + crypto.randomBytes(4).toString('hex');
        
        // Exact phone check for the same trade to avoid duplicates
        const { data: existing } = await supabase.from('businesses')
            .select('id')
            .eq('phone', biz.phone)
            .eq('trade', biz.trade)
            .eq('country_code', 'US');
            
        if (existing && existing.length > 0) {
            console.log(`ℹ️ Already exists: ${biz.name} (${biz.trade})`);
            continue;
        }

        const { error } = await supabase.from('businesses').insert({
            id: crypto.randomUUID(),
            name: biz.name,
            slug: slug,
            trade: biz.trade,
            city: biz.city,
            country_code: "US",
            phone: biz.phone,
            address: biz.address || `${biz.city}, ${biz.state}`,
            verified: true,
            tier: "standard",
            website: biz.website || null,
            created_at: new Date().toISOString(),
            rating: biz.rating || null,
            review_count: biz.review_count || 0
        });

        if (error) {
            console.error(`❌ Error inserting ${biz.name}:`, error.message);
        } else {
            console.log(`✅ Success: ${biz.name} in ${biz.city}, ${biz.state}`);
        }
    }
}

// Example usage:
// const batch = [{ name: "Plumber X", phone: "...", city: "...", state: "...", trade: "..." }];
// insertUSBusinesses(batch);

export { insertUSBusinesses };
