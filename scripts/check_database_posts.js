import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPosts() {
    const { data, error } = await supabase
        .from('posts')
        .select('id, slug, title')
        .ilike('title', '%Roadside Emergency%');

    if (error) {
        console.error('Error fetching posts:', error);
    } else {
        console.log('Found posts:', JSON.stringify(data, null, 2));
    }
}

checkPosts();
