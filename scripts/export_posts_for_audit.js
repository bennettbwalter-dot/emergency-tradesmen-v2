
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function exportPosts() {
    const { data: posts, error } = await supabase
        .from('posts')
        .select('*');

    if (error) {
        console.error(error);
        return;
    }

    fs.writeFileSync('all_posts_audit.json', JSON.stringify(posts, null, 2));
    console.log(`Exported ${posts.length} posts to all_posts_audit.json`);
}

exportPosts();
