
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyPosts() {
    console.log('--- Verifying Batch 1 Regional Posts ---');
    const { data, error } = await supabase
        .from('posts')
        .select('title, slug, content');

    if (error) {
        console.error('Error fetching posts:', error);
        return;
    }

    data.forEach(post => {
        if (post.slug.endsWith('-us') || post.slug.endsWith('-gb')) {
            const wordCount = post.content.split(/\s+/).length;
            console.log(`Title: ${post.title}`);
            console.log(`Slug: ${post.slug}`);
            console.log(`Word Count: ${wordCount}`);
            console.log(`Total Characters: ${post.content.length}`);
            console.log(`Content Preview: ${post.content.substring(0, 100).replace(/\n/g, ' ')}...`);
            console.log('------------------------');
        }
    });
}

verifyPosts();
