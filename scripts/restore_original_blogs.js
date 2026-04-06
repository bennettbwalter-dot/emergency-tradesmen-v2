import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

const posts = JSON.parse(fs.readFileSync('./scripts/all_posts.json', 'utf-8'));

async function restorePosts() {
    console.log(`Restoring ${posts.length} posts to original content...`);

    let restored = 0;

    for (const post of posts) {
        const { error } = await supabase
            .from('posts')
            .update({ content: post.content })
            .eq('id', post.id);

        if (error) {
            console.error(`Error restoring ${post.slug}:`, error);
        } else {
            restored++;
            console.log(`Restored: ${post.slug}`);
        }
    }

    console.log(`\nDone! Restored ${restored} posts`);
}

restorePosts();
