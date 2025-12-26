
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function listPosts() {
    const { data: posts, error } = await supabase
        .from('posts')
        .select('id, title, slug, created_at');

    if (error) {
        console.error('Error fetching posts:', error);
        return;
    }

    console.log('--- Database Posts ---');
    posts.forEach(post => {
        console.log(`[${post.id}] ${post.slug} : ${post.title}`);
    });
    console.log('----------------------');
}

listPosts();
