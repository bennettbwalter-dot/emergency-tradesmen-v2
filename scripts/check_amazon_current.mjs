import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: process.cwd() + '/.env' });

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkAmazon() {
    const { data } = await supabase.from('posts').select('content').eq('slug', 'smart-leak-detection-us').single();
    if (data) {
        const match = data.content.match(/<div class="amazon-product-section"[^>]*>[\s\S]*?<\/div>\s*<\/div>/);
        console.log('Current Amazon section:');
        console.log(match ? match[0] : 'NO SECTION FOUND');
    }
}

checkAmazon();
