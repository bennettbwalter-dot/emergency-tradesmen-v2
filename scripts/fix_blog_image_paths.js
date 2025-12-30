import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function updatePaths() {
    console.log('🔄 Updating blog cover image paths...');

    // 1. Update "The Domestic Electrical Interruption Protocol"
    const { error: err1 } = await supabase
        .from('posts')
        .update({ cover_image: '/blog/electrical-protocol-fusebox.png' })
        .eq('slug', 'domestic-electrical-interruption-protocol');

    if (err1) console.error('❌ Error updating protocol post:', err1.message);
    else console.log('✅ Updated protocol post image path.');

    // 2. Update "UK Emergency Tradesmen: Expert Repairs When You Need Them"
    const { error: err2 } = await supabase
        .from('posts')
        .update({ cover_image: '/visibility-showcase.png' })
        .eq('slug', 'expert-repairs-guide');

    if (err2) console.error('❌ Error updating expert repairs post:', err2.message);
    else console.log('✅ Updated expert repairs post image path.');

    console.log('🏁 Update complete!');
}

updatePaths();
