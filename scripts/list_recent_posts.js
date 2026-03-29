
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function listPosts() {
    console.log('Fetching last 10 posts...');
    const { data: posts, error } = await supabase
        .from('posts')
        .select('id, title, slug, published_at')
        .order('published_at', { ascending: false })
        .limit(10);

    if (error) {
        console.error('Error fetching posts:', error);
    } else {
        console.log('Last 10 Posts:', JSON.stringify(posts, null, 2));
    }
}

listPosts();
