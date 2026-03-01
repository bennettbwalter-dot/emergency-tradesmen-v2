import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function auditPosts() {
    console.log('Fetching all posts from Supabase...');
    const { data: posts, error } = await supabase
        .from('posts')
        .select('id, title, slug, content');

    if (error) {
        console.error('Error fetching posts:', error);
        return;
    }

    console.log(`Found ${posts.length} posts.`);
    console.log('--------------------------------------------------');

    posts.forEach(post => {
        const imageMatches = post.content.match(/!\[.*?\]\(.*?\)/g) || [];
        const imageCount = imageMatches.length;
        console.log(`[${imageCount} images] ${post.slug}: ${post.title}`);

        if (imageCount < 3) {
            console.log(`   --> NEEDS ${3 - imageCount} MORE IMAGES`);
        }
    });

    console.log('--------------------------------------------------');
}

auditPosts();
