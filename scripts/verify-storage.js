import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://antqstrspkchkoylysqa.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
    console.error("Error: SUPABASE_SERVICE_ROLE_KEY is missing from .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStorage() {
    console.log("Checking storage buckets...");
    const { data, error } = await supabase.storage.listBuckets();

    if (error) {
        console.error("Error listing buckets:", error.message);
        process.exit(1);
    }

    const bucket = data.find(b => b.name === 'business-assets');
    if (bucket) {
        console.log("✅ 'business-assets' bucket found.");
        console.log("   Public:", bucket.public);
        console.log("   Created at:", bucket.created_at);
    } else {
        console.error("❌ 'business-assets' bucket NOT found.");
        console.log("Found buckets:", data.map(b => b.name));
    }
}

checkStorage();
