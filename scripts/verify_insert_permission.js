import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load env
const envPath = path.resolve(process.cwd(), '.env');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

const supabaseUrl = envConfig.VITE_SUPABASE_URL;
const supabaseKey = envConfig.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyInsert() {
    console.log("---------------------------------------------------");
    console.log("Verifying 'Strategy 2: Direct Insert' Permissions...");
    console.log("---------------------------------------------------");

    // 1. Create a random test user to ensure we are "Authenticated"
    const testEmail = `verify_user_${Date.now()}@gmail.com`;
    const testPassword = 'password123';

    console.log(`1. Creating temporary test user: ${testEmail}`);
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
    });

    if (authError) {
        console.error("❌ Auth Failed:", authError.message);
        return;
    }

    const userId = authData.user?.id;
    if (!userId) {
        console.error("❌ Auth succeeded but no User ID returned.");
        return;
    }
    console.log("✅ Authenticated as User ID:", userId);

    // 2. Attempt the Direct Insert (Strategy 2)
    console.log("\n2. Attempting Direct INSERT into 'businesses' table...");

    // This matches the frontend code exactly
    const businessId = `test-biz-${Date.now()}`;
    const insertPayload = {
        id: businessId,
        slug: `test-biz-${Date.now()}`,
        owner_user_id: userId, // The critical part: Matching the user
        name: "Test Strategy 2 Business",
        trade: "plumber",
        city: "London",
        email: testEmail,
        phone: "07700000000",
        is_premium: true,
        tier: 'paid',
        verified: true,
        hours: '24/7 Emergency Service',
        is_open_24_hours: true
    };

    const { data: insertData, error: insertError } = await supabase
        .from('businesses')
        .insert(insertPayload)
        .select()
        .single();

    if (insertError) {
        console.error("❌ INSERT FAILED:", insertError.message);
        if (insertError.message.includes("row-level security")) {
            console.error("\nCRITICAL: RLS Policy is BLOCKING the insert.");
            console.error("This means the 'master_reset_v2.sql' script did NOT apply correctly.");
        }
    } else {
        console.log("✅ INSERT SUCCESS!");
        console.log("Created Business:", insertData.id);
        console.log("\n---------------------------------------------------");
        console.log("🎉 CONCLUSION: The Backup Strategy WORKS.");
        console.log("The frontend will successfully create the profile.");
        console.log("---------------------------------------------------");

        // Cleanup (Nice to have)
        // Note: We can't easily delete the user with the anon key, but we can delete the business if we have permission!
        /*
        const { error: delError } = await supabase.from('businesses').delete().eq('id', businessId);
        if (!delError) console.log("Cleaned up test record.");
        */
    }
}

verifyInsert();
