import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function findUsaPaths() {
    console.log('Searching for any remaining /usa paths in blog posts...');
    
    const { data: posts, error } = await supabase
        .from('posts')
        .select('id, slug, content');

    if (error) {
        console.error('Error fetching posts:', error);
        return;
    }

    const matches = posts.filter(p => p.content && /\/usa(?!\w)/i.test(p.content));

    if (matches.length === 0) {
        console.log('✅ No remaining /usa paths found.');
    } else {
        console.log(`Found ${matches.length} posts with /usa paths:`);
        matches.forEach(m => console.log(`- ${m.slug}`));
    }
}

findUsaPaths();
