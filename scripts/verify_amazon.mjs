import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: process.cwd() + '/.env' });

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verify() {
    const { data: posts } = await supabase.from('posts').select('slug, content').eq('published', true);
    
    for (const p of posts) {
        if (p.content.includes('amazon-product-section')) {
            const hasImage = p.content.includes('<img');
            const hasDesc = p.content.includes('<p>') && p.content.includes('desc');
            const hasLink = p.content.includes('amazon-button');
            console.log(p.slug + ': image=' + hasImage + ', desc=' + hasDesc + ', link=' + hasLink);
        }
    }
}

verify();
