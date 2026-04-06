import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: process.cwd() + '/.env' });

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkHeadings() {
    const { data } = await supabase.from('posts').select('content').eq('slug', '5-hidden-warning-signs-of-attic-mold-rainy-spring-us').single();
    if (data) {
        const h2Match = data.content.match(/<h2[^>]*>[\s\S]*?<\/h2>/g);
        if (h2Match) {
            console.log('H2 Headings:');
            h2Match.forEach(h => console.log(h));
        }
    }
}

checkHeadings();
