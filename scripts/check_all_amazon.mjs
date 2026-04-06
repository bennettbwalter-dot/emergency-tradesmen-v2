import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: process.cwd() + '/.env' });

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkAll() {
    const { data: posts } = await supabase.from('posts').select('slug, content').eq('published', true);
    
    for (const p of posts) {
        if (p.content.includes('amazon-button')) {
            const amazonMatch = p.content.match(/class="amazon-button"[^>]*>[^<]+/);
            console.log(p.slug + ': ' + (amazonMatch ? amazonMatch[0] : 'NO BUTTON'));
        }
    }
}

checkAll();
