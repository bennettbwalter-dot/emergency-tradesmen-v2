import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: process.cwd() + '/.env' });

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function getContent() {
    const { data } = await supabase.from('posts').select('content').eq('slug', '5-hidden-warning-signs-of-attic-mold-rainy-spring-us').single();
    if (data) {
        console.log('Content length:', data.content.length);
        console.log('\n--- First 3000 chars ---');
        console.log(data.content.substring(0, 3000));
    }
}

getContent();
