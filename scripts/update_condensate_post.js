
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

const content = fs.readFileSync(path.resolve(process.cwd(), 'scripts/new_condensate_guide_gb.md'), 'utf-8');

const newPost = {
    slug: 'frozen-condensate-pipe-fix-gb',
    title: "How to Fix a Frozen Condensate Pipe: A 2025 Homeowner's Guide to Restoring Heat",
    excerpt: "Is your boiler showing a 'gurgling' sound or an EA/F1 error code during a sub-zero cold snap? Learn the safe 'Hot Water' method to thaw a frozen condensate pipe and get your heating back on.",
    cover_image: '/blog/boiler-frozen-fix/pouring-hot-water.jpg',
    published: true,
    published_at: new Date().toISOString(),
    content: content,
    author_id: null
};

async function uploadPost() {
    console.log(`Updating post: ${newPost.slug}`);

    const { data, error } = await supabase
        .from('posts')
        .upsert(newPost, { onConflict: 'slug' })
        .select();

    if (error) {
        console.error('Error updating post:', error);
    } else {
        console.log('Successfully updated post:', data);
    }
}

uploadPost();
