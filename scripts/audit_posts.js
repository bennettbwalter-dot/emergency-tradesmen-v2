import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function audit() {
    console.log('--- Database Audit: Published Posts ---');
    const { data, error } = await supabase
        .from('posts')
        .select('slug, title, published')
        .eq('published', true)
        .order('published_at', { ascending: false });

    if (error) {
        console.error('Error:', error);
        return;
    }

    data.forEach((p, i) => {
        console.log(`${i.toString().padStart(3, ' ')} | ${p.slug.padEnd(60, ' ')} | ${p.title}`);
    });
    console.log(`\nTotal Published Posts: ${data.length}`);
}

audit();
