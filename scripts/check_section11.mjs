import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: process.cwd() + '/.env' });

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSection() {
    const { data } = await supabase.from('posts').select('content').eq('slug', 'refrigerant-leak-safety-us').single();
    if (data) {
        const h2s = data.content.match(/<h2[^>]*id="[^"]*"[^>]*>([^<]+)<\/h2>/g);
        console.log('All H2 headings:');
        if (h2s) {
            h2s.forEach((h, i) => console.log(i+1 + ':', h.replace(/<[^>]+>/g, '')));
        }
        
        // Find section 11
        if (h2s && h2s[10]) {
            console.log('\nSection 11:', h2s[10]);
        }
    }
}

checkSection();
