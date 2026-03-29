
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

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
    console.log("Creating temp user...");
    const email = `import.system.${Date.now()}@example.com`;
    const { data, error } = await supabase.auth.admin.createUser({
        email: email,
        password: 'Password123!',
        email_confirm: true
    });

    if (error) {
        console.error("Error creating user:", error.message);
        return;
    }

    if (data.user) {
        console.log("CREATED_USER_ID:", data.user.id);
        console.log("CREATED_USER_EMAIL:", data.user.email);
        const { writeFileSync } = await import('fs');
        const outPath = path.join(path.dirname(fileURLToPath(import.meta.url)), 'temp_user_id.txt');
        writeFileSync(outPath, data.user.id);
        console.log("Written to:", outPath);
    } else {
        console.log("No user returned.", data);
    }
}

run();
