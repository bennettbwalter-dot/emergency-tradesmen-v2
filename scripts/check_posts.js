
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
    const { data, error } = await supabase
        .from('posts')
        .select('id, title, slug, cover_image');

    if (error) {
        console.error('Error fetching posts:', error);
        return;
    }

    console.log('--- Posts in Database ---');
    data.forEach(post => {
        console.log(`ID: ${post.id}`);
        console.log(`Title: ${post.title}`);
        console.log(`Slug: ${post.slug}`);
        console.log(`Cover Image: ${post.cover_image}`);
        console.log('------------------------');
    });
}

checkPosts();
