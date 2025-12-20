import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
    console.error("Missing Supabase credentials");
    process.exit(1);
}

const supabase = createClient(url, key);

async function testProfileSave() {
    console.log("=== Testing Premium Profile Save ===\n");

    // 1. Check if there are any premium businesses
    const { data: premiumBusinesses, error: fetchError } = await supabase
        .from('businesses')
        .select('*')
        .eq('is_premium', true)
        .order('created_at', { ascending: false })
        .limit(5);

    if (fetchError) {
        console.error("Error fetching premium businesses:", fetchError);
        return;
    }

    console.log(`Found ${premiumBusinesses?.length || 0} premium businesses\n`);

    if (premiumBusinesses && premiumBusinesses.length > 0) {
        console.log("Most recent premium businesses:");
        premiumBusinesses.forEach((biz, i) => {
            console.log(`\n${i + 1}. ${biz.name}`);
            console.log(`   ID: ${biz.id}`);
            console.log(`   Trade: ${biz.trade}`);
            console.log(`   City: ${biz.city}`);
            console.log(`   Logo: ${biz.logo_url || 'Not set'}`);
            console.log(`   Services: ${JSON.stringify(biz.services_offered || [])}`);
            console.log(`   Description: ${biz.premium_description || 'Not set'}`);
            console.log(`   Verified: ${biz.verified}`);
            console.log(`   Owner: ${biz.owner_user_id}`);
        });
    }

    // 2. Test what happens when we query for London plumbers
    console.log("\n\n=== Testing London Plumber Query ===");
    const { data: londonPlumbers, error: queryError } = await supabase
        .from('businesses')
        .select('*')
        .eq('trade', 'plumber')
        .eq('city', 'London')
        .eq('verified', true);

    if (queryError) {
        console.error("Error querying London plumbers:", queryError);
        return;
    }

    console.log(`\nFound ${londonPlumbers?.length || 0} verified plumbers in London from database`);

    if (londonPlumbers && londonPlumbers.length > 0) {
        const premiumOnes = londonPlumbers.filter(b => b.is_premium || b.tier === 'paid');
        console.log(`  - ${premiumOnes.length} are premium`);
        console.log(`  - ${londonPlumbers.length - premiumOnes.length} are standard`);

        if (premiumOnes.length > 0) {
            console.log("\nPremium London Plumbers:");
            premiumOnes.forEach(biz => {
                console.log(`  • ${biz.name} (${biz.id})`);
            });
        }
    }
}

testProfileSave();
