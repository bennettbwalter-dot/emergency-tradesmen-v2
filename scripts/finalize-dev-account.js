
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Error: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

const TARGET_EMAIL = 'nicholas.bennett247@gmail.com';

async function main() {
    console.log(`Looking for user: ${TARGET_EMAIL}...`);

    // 1. Find the user
    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error) {
        console.error('Error listing users:', error);
        process.exit(1);
    }

    const user = users.find(u => u.email?.toLowerCase() === TARGET_EMAIL.toLowerCase());

    if (!user) {
        console.error(`User ${TARGET_EMAIL} not found. Please register first.`);
        process.exit(1);
    }

    console.log(`Found user: ${user.id}`);

    // 2. Confirm Email
    if (!user.email_confirmed_at) {
        console.log('User email not confirmed. Confirming now...');
        const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
            user.id,
            { email_confirm: true }
        );

        if (updateError) {
            console.error('Error confirming email:', updateError);
        } else {
            console.log('Email successfully confirmed.');
        }
    } else {
        console.log('User email already confirmed.');
    }

    // 3. Mark Business as Premium (Database Level Force)
    console.log('Updating business record to Premium...');
    const { data: business, error: businessError } = await supabase
        .from('businesses')
        .select('id')
        .eq('owner_id', user.id) // Note: schema column is 'owner_id' not 'owner_user_id' in some migrations, checking usage
        .single();

    // Check typical column usage
    // In PremiumProfileEditor: .eq('owner_user_id', user.id)
    // In UserDashboard: .eq('owner_id', user.id)
    // Let's try finding by owner_id which matches UserDashboard usage
    // If not found, try owner_user_id

    let businessId = business?.id;

    if (!businessId) {
        const { data: businessAlt } = await supabase
            .from('businesses')
            .select('id')
            .eq('owner_user_id', user.id)
            .single();
        businessId = businessAlt?.id;
    }

    if (businessId) {
        const { error: dbError } = await supabase
            .from('businesses')
            .update({
                is_premium: true,
                tier: 'paid',
                premium_description: 'Developer Account - Full Access'
            })
            .eq('id', businessId);

        if (dbError) {
            console.error('Error updating business premium status:', dbError);
        } else {
            console.log('Business upgraded to Premium in database.');
        }
    } else {
        console.log('No business record found for this user. They might need to complete onboarding.');
    }

    // 4. Create Subscription Record
    console.log('Creating/Updating subscription record...');
    const { error: subError } = await supabase
        .from('subscriptions')
        .upsert({
            user_id: user.id,
            plan: 'enterprise',
            status: 'active',
            subscription_expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

    if (subError) {
        console.error('Error updating subscription:', subError);
    } else {
        console.log('Subscription record active.');
    }

    console.log('--- DONE ---');
}

main();
