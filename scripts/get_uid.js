
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load env explicitly
const envPath = path.resolve(__dirname, '../.env');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

const url = envConfig.VITE_SUPABASE_URL;
const key = envConfig.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
    console.error("Missing credentials");
    process.exit(1);
}

const supabase = createClient(url, key, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function run() {
    console.log("Fetching users...");
    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error) {
        console.error("Error listing users:", error.message);
        return;
    }

    console.log(`Found ${users.length} users.`);
    // Filter for a likely 'real' user
    const realUsers = users.filter(u => !u.email?.includes('verify_user') && !u.email?.includes('test.auto'));
    // Prefer 'nick'
    const target = realUsers.find(u => u.email?.toLowerCase().includes('nick')) || realUsers[0] || users[0];

    if (target) {
        console.log("TARGET_USER_ID:", target.id);
        fs.writeFileSync(path.join(__dirname, 'temp_user_id.txt'), target.id);
        console.log("Written to temp_user_id.txt");
    } else {
        console.error("No users found.");
    }
}

run();
