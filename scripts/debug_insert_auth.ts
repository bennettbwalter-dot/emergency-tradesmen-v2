
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

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuthInsert() {
    console.log('--- Debug: Auth & Insert ---');

    // 1. Sign Up / Sign In
    const email = `importer_${Date.now()}@example.com`;
    const password = 'Password123!';

    console.log(`Creating temp user: ${email}`);
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
    });

    if (authError) {
        console.error('Auth Failed:', authError.message);
        return;
    }

    const user = authData.user;
    if (!user) {
        console.error('No user returned from signup (maybe email confirmation required?)');
        return;
    }

    console.log(`User created: ${user.id}`);

    // 2. Insert with owner_user_id
    const dummy = {
        id: randomUUID(),
        name: 'DEBUG_AUTH_TEST_BUSINESS',
        trade: 'plumber',
        city: 'London',
        country_code: 'UK',
        verified: true, // Testing if we can set verified
        owner_user_id: user.id
    };

    console.log('Attempting insert with authenticated user...');

    // Create a client with the user's session is typically handled by the single client instance 
    // if we process it sequentially, Supabase JS client maintains state. 
    // But purely in this script context, 'supabase' client should have the session now?
    // Let's verify session.
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        console.log('Client does not have session automatically?');
        // In node env sometimes it doesn't persist.
        // But signUp returns session if auto confirm is on.
    } else {
        console.log('Session active.');
    }

    // Explicitly allowing RLS might require the session token? 
    // The client usually sends the token if it has it.

    const { data, error } = await supabase
        .from('businesses')
        .insert([dummy])
        .select();

    if (error) {
        console.error('INSERT FAILED:', JSON.stringify(error, null, 2));
    } else {
        console.log('INSERT SUCCESS!');
        console.log(data);

        // Clean up if we can (might be blocked if delete policy is strict)
        await supabase.from('businesses').delete().eq('id', dummy.id);
    }
}

testAuthInsert();
