
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyTables() {
    console.log('--- Checking "posts" table ---');
    const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('count', { count: 'exact', head: true });

    if (postsError) {
        console.log('"posts" table error:', postsError.message);
    } else {
        console.log('"posts" table exists, count:', postsData?.[0]?.count || 0);
    }

    console.log('\n--- Checking "blog_posts" table ---');
    const { data: blogPostsData, error: blogPostsError } = await supabase
        .from('blog_posts')
        .select('count', { count: 'exact', head: true });

    if (blogPostsError) {
        console.log('"blog_posts" table error:', blogPostsError.message);
    } else {
        console.log('"blog_posts" table exists, count:', blogPostsData?.[0]?.count || 0);
    }
}

verifyTables();
