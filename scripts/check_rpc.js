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

async function checkRpc() {
    console.log(`Checking RPC function at ${supabaseUrl}...`);

    // We try to call it. Even if we lack auth, we want to see if it's "Function not found" (404/500) vs "Auth required" (401/403) or success.
    // We pass dummy data.
    const { data, error } = await supabase.rpc('create_initial_business_v2', {
        owner_id: '00000000-0000-0000-0000-000000000000',
        user_email: 'test@example.com',
        phone_number: '07700000000'
    });

    if (error) {
        console.log("RPC Call Error:", error);

        if (error.message && error.message.includes("Could not find the function")) {
            console.error("❌ FAILURE: Function 'create_initial_business_v2' DOES NOT EXIST on the API.");
            console.error("The SQL script has NOT been run or the Cache has NOT been reloaded.");
        } else {
            // If it's an auth error or database error, the function likely EXISTS but we just can't run it (which is expected for anon).
            console.log("✅ SUCCESS (Partial): The API recognized the function name.");
            console.log("Error details (Likely Auth/RLS, which means function exists):", error.message);
        }
    } else {
        console.log("✅ SUCCESS: Function called successfully (Unexpected for dummy data, but function exists).");
    }
}

checkRpc();
