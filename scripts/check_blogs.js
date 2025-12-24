
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

async function checkPosts() {
    console.log('Checking posts table for published posts...');
    const { data, error } = await supabase
        .from('posts')
        .select('title, slug, published, content');

    if (error) {
        console.error('Error fetching posts:', error);
    } else {
        data.forEach(post => {
            console.log(`Title: ${post.title}`);
            console.log(`Content Start: ${post.content ? post.content.substring(0, 100) : 'NO CONTENT'}`);
            console.log('---');
        });
    }
}

checkPosts();
