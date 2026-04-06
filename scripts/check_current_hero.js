import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

(async () => {
    const { data, error } = await supabase
        .from('posts')
        .select('title, slug, cover_image')
        .eq('slug', '7-ways-to-safe-proof-your-garden-electrics-spring-2026-gb')
        .single();
    
    console.log('Current Cover Image:', data?.cover_image);
})();
