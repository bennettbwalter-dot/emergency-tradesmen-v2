
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { randomUUID } from 'crypto';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function testInsert() {
    console.log('Attempting to list users...');
    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error) {
        console.error('Error listing users:', error);
        return;
    }

    console.log(`Found ${users.length} users.`);
    const realUsers = users.filter(u => !u.email?.includes('verify_user') && !u.email?.includes('test.auto'));
    const target = realUsers.find(u => u.email?.toLowerCase().includes('nick')) || realUsers[0] || users[0];

    if (target) {
        console.log(`TARGET_USER_ID: ${target.id}`);
    } else {

        testInsert();
