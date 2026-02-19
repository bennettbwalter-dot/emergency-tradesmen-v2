
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

const content = fs.readFileSync(path.resolve(process.cwd(), 'scripts/new_drainage_guide.md'), 'utf-8');

const newPost = {
    slug: 'emergency-drain-unblocking-guide',
    title: 'The Ultimate Guide to Emergency Drain Unblocking: DIY Fixes, Main Line Failures, and the Truth About Fatbergs',
    excerpt: "A blocked drain often starts as a minor irritation—a slow-draining sink or a gurgling sound in the pipes. But left unchecked, it can escalate into a full-scale emergency. This is the master guide to emergency drain unblocking.",
    cover_image: '/blog/emergency-drain-unblocking/hero-worker.jpg',
    published: true,
    published_at: new Date().toISOString(),
    content: content,
    author_id: null
};

async function uploadPost() {
    console.log(`Uploading post: ${newPost.slug}`);

    const { data, error } = await supabase
        .from('posts')
        .upsert(newPost, { onConflict: 'slug' })
        .select();

    if (error) {
        console.error('Error uploading post:', error);
    } else {
        console.log('Successfully uploaded post:', data);
    }
}

uploadPost();
