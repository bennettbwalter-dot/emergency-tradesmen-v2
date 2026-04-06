import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: process.cwd() + '/.env' });

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTOC() {
    const { data } = await supabase.from('posts').select('content').eq('slug', '5-hidden-warning-signs-of-attic-mold-rainy-spring-us').single();
    if (data) {
        const match = data.content.match(/<div class="toc-box"[^>]*>[\s\S]*?<\/div>/);
        console.log('TOC found:', match ? match[0].substring(0, 600) : 'NO');
    }
}

checkTOC();
