
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const content = fs.readFileSync(path.resolve(process.cwd(), 'scripts/new_condensate_guide_us.md'), 'utf-8');

const newPost = {
    slug: 'frozen-condensate-pipe-fix-us',
    title: "How to Fix a Frozen Condensate Pipe: A 2025 Homeowner's Guide to Restoring Heat",
    excerpt: "Is your furnace or boiler showing a 'gurgling' sound or a lockout error during a deep freeze? Learn the safe 'Hot Water' method to thaw a frozen condensate pipe and get your heating back on safely.",
    cover_image: '/blog/boiler-frozen-fix/pouring-hot-water.jpg',
    published: true,
    published_at: new Date().toISOString(),
    content: content,
    author_id: null
};

async function uploadPost() {
    console.log(`Uploading US regional post: ${newPost.slug}`);

    const { data, error } = await supabase
        .from('posts')
        .upsert(newPost, { onConflict: 'slug' })
        .select();

    if (error) {
        console.error('Error uploading US post:', error);
    } else {
        console.log('Successfully uploaded US post:', data);
    }
}

uploadPost();
