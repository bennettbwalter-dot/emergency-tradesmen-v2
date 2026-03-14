import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function verify() {
    const slugs = ['ac-heatwave-preparation-signs-repair-uk-2026', 'ac-heatwave-preparation-signs-repair-us-2026'];
    
    for (const slug of slugs) {
        console.log(`--- Content for ${slug} ---`);
        const { data, error } = await supabase
            .from('posts')
            .select('content')
            .eq('slug', slug)
            .single();

        if (error) {
            console.error(`Error fetching ${slug}:`, error);
        } else {
            console.log(data.content.substring(0, 500));
        }
    }
}

verify();
