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

async function testUpdate() {
    console.log("=== Testing Profile Update ===\n");

    // Get the most recent premium business
    const { data: businesses, error: fetchError } = await supabase
        .from('businesses')
        .select('*')
        .eq('is_premium', true)
        .order('created_at', { ascending: false })
        .limit(1);

    if (fetchError || !businesses || businesses.length === 0) {
        console.error("Error fetching business:", fetchError);
        return;
    }

    const business = businesses[0];
    console.log("Found business:", business.id);
    console.log("Current name:", business.name);
    console.log("\nAttempting to update with test data...\n");

    // Try to update it
    const { data: updated, error: updateError } = await supabase
        .from('businesses')
        .update({
            name: "TEST BUSINESS NAME",
            premium_description: "This is a test description",
            services_offered: ["Emergency Callouts", "24/7 Availability"],
            logo_url: "https://example.com/test-logo.png"
        })
        .eq('id', business.id)
        .select();

    if (updateError) {
        console.error("❌ UPDATE FAILED:");
        console.error(updateError);
        return;
    }

    console.log("✅ UPDATE SUCCESSFUL!");
    console.log("\nUpdated business:");
    console.log("Name:", updated[0].name);
    console.log("Description:", updated[0].premium_description);
    console.log("Services:", updated[0].services_offered);
    console.log("Logo:", updated[0].logo_url);
}

testUpdate();
