
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Force load env from current directory
dotenv.config({ path: path.join(process.cwd(), '.env') });

const url = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
// Try all common variations of the service key
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

console.log("--- ENV CHECK ---");
console.log(`URL: ${url ? 'OK' : 'MISSING'}`);
console.log(`ANON: ${anonKey ? 'OK' : 'MISSING'}`);
console.log(`SERVICE: ${serviceKey ? 'OK' : 'MISSING'}`);

if (!url || !anonKey || !serviceKey) {
    console.error("❌ CRITICAL: Missing Env Vars. Cannot run diagnostic.");
    process.exit(1);
}

const anonClient = createClient(url, anonKey);
const adminClient = createClient(url, serviceKey);

async function diagnose() {
    console.log("\n--- DIAGNOSTIC START ---");

    // 1. Check with Admin (Service Role) - Should Bypass RLS
    console.log("1. Checking with SERVICE ROLE (Admin)...");
    try {
        const { count: adminCount, error: adminError } = await adminClient
            .from('locations')
            .select('*', { count: 'exact', head: true });

        if (adminError) {
            console.error("   ❌ Admin Error:", adminError.message);
            console.log("   --> Suspicion: Table does not exist or Schema Cache is stale.");
        } else {
            console.log(`   ✅ Admin sees ${adminCount} rows.`);
        }

        // 2. Check with Anon (Frontend) - Subject to RLS
        console.log("\n2. Checking with ANON KEY (Frontend)...");
        const { count: anonCount, error: anonError } = await anonClient
            .from('locations')
            .select('*', { count: 'exact', head: true });

        if (anonError) {
            console.error("   ❌ Anon Error:", anonError.message);
        } else {
            if (anonCount === null) console.log("   ⚠️  Anon sees NULL count (RLS Blocked)");
            else console.log(`   ✅ Anon sees ${anonCount} rows.`);
        }

        // 3. Conclusion
        console.log("\n--- CONCLUSION ---");
        if (adminError) {
            console.log("👉 FIX: The table 'locations' likely does not exist or API cache is broken.");
        } else if (adminCount === 0) {
            console.log("👉 FIX: Table exists but is EMPTY. You need to run the SEED command again.");
        } else if (adminCount > 0 && (anonCount === null || anonCount === 0)) {
            console.log("👉 FIX: Data exists, but RLS is blocking Frontend. Run the RLS Fix SQL.");
        } else {
            console.log("👉 SUCCESS: Everything looks correct! If UI is blank, check browser console.");
        }

    } catch (e) {
        console.error("Diagnostic crashed:", e);
    }
}

diagnose();
