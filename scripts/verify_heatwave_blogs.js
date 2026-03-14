import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function verify() {
    console.log('Verifying new AC Heatwave posts...');
    const slugs = ['ac-heatwave-preparation-signs-repair-uk-2026', 'ac-heatwave-preparation-signs-repair-us-2026'];
    
    const { data, error } = await supabase
        .from('posts')
        .select('slug, title, cover_image, published_at')
        .in('slug', slugs);

    if (error) {
        console.error('Error fetching posts:', error);
    } else {
        console.table(data);
        if (data.length === 2) {
            console.log('✅ Both posts successfully verified in database.');
        } else {
            console.error('❌ Missing posts. Expected 2, found', data.length);
        }
    }
}

verify();
