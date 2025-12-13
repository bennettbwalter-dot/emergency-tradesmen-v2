import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const DEV_EMAIL = 'bennett.b.walter@gmail.com';

async function main() {
    console.log('🔍 Looking for user:', DEV_EMAIL);

    // Get current user (must be authenticated)
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        console.error('❌ Not authenticated. Please login first at http://localhost:3003/login');
        console.log('Then run this script again.');
        process.exit(1);
    }

    if (user.email.toLowerCase() !== DEV_EMAIL.toLowerCase()) {
        console.error(`❌ Wrong user. Expected ${DEV_EMAIL}, got ${user.email}`);
        console.log('Please login with bennett.b.walter@gmail.com');
        process.exit(1);
    }

    console.log('✅ User authenticated:', user.email);

    // Check if business already exists
    const { data: existing } = await supabase
        .from('businesses')
        .select('id, name')
        .eq('owner_user_id', user.id)
        .maybeSingle();

    if (existing) {
        console.log('✅ Business already exists:', existing.name);
        console.log('Business ID:', existing.id);
        console.log('\n🎉 You can now access /premium-profile');
        process.exit(0);
    }

    // Create minimal business with ONLY required fields
    console.log('📝 Creating test business...');

    const businessId = `dev-${Date.now()}`;
    const { data: newBusiness, error: createError } = await supabase
        .from('businesses')
        .insert({
            id: businessId,
            slug: `dev-business-${Date.now()}`,
            name: 'Developer Test Business',
            trade: 'electrician',
            city: 'London',
            owner_user_id: user.id,
            is_premium: true,
            tier: 'paid'
        })
        .select()
        .single();

    if (createError) {
        console.error('❌ Failed to create business:', createError.message);
        console.error('Full error:', createError);
        process.exit(1);
    }

    console.log('✅ Business created successfully!');
    console.log('Business ID:', newBusiness.id);
    console.log('Business Name:', newBusiness.name);
    console.log('\n🎉 Success! Now visit: http://localhost:3003/premium-profile');
}

main();
