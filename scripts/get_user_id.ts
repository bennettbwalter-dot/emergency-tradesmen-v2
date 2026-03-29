
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function run() {
    console.log("Fetching users...");
    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error) {
        console.error("Error:", error.message);
        return;
    }

    console.log(`Found ${users.length} users.`);
    const realUsers = users.filter(u => !u.email?.includes('verify_user') && !u.email?.includes('test.auto'));
    const target = realUsers.find(u => u.email?.includes('nick')) || realUsers[0] || users[0];

    if (target) {
        console.log("TARGET_USER_ID:", target.id);
        const outPath = path.join(__dirname, 'temp_user_id.txt');
        fs.writeFileSync(outPath, target.id.trim());
        console.log("ID written to:", outPath);
    } else {
        console.log("No usage found.");
    }
}

run();
