import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://antqstrspkchkoylysqa.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const targetEmail = process.argv[2];

if (!supabaseKey) {
    console.error("Error: SUPABASE_SERVICE_ROLE_KEY is missing from .env");
    process.exit(1);
}

if (!targetEmail) {
    console.error("Usage: node scripts/make-premium.js <email>");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function makePremium() {
    console.log(`🔍 Finding user: ${targetEmail}...`);

    // 1. Get User ID from Auth (Admin API not available in client, so we search businesses by email if possible? 
    //    Actually, we can't search auth.users easily without service role access AND using the admin api.
    //    But we do have service role key.

    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();

    if (userError) {
        console.error("Error listing users:", userError);
        process.exit(1);
    }

    const user = users.find(u => u.email === targetEmail);

    if (!user) {
        console.error("User not found!");
        process.exit(1);
    }

    console.log(`✅ Found user ${user.id}`);

    // 2. Find Business
    const { data: business, error: busError } = await supabase
        .from('businesses')
        .select('id, name')
        .eq('owner_user_id', user.id)
        .single();

    if (busError) {
        console.error("Business not found for user:", busError.message);
        process.exit(1);
    }

    console.log(`✅ Found business: ${business.name} (${business.id})`);

    // 3. Update to Premium
    const { error: updateError } = await supabase
        .from('businesses')
        .update({
            is_premium: true,
            tier: 'paid',
            priority_score: 10
        })
        .eq('id', business.id);

    if (updateError) {
        console.error("Error updating business:", updateError.message);
        process.exit(1);
    }

    console.log("🎉 SUCCESS! Business upgraded to Premium.");
}

makePremium();
