import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const targetSlugs = [
    'water-leaking-through-ceiling-first-steps-gb',
    'water-leaking-through-ceiling-first-steps-us',
    'domestic-electrical-interruption-protocol-gb',
    'domestic-electrical-interruption-protocol-us',
    'blocked-drains-vs-flooded-sewers-danger-guide-gb',
    'blocked-drains-vs-flooded-sewers-danger-guide-us'
];

async function verifyBatch2() {
    console.log('--- Verifying Batch 2 Regional Posts ---');

    const { data: posts, error } = await supabase
        .from('posts')
        .select('*')
        .in('slug', targetSlugs);

    if (error) {
        console.error('Error fetching posts:', error);
        return;
    }

    posts.forEach(post => {
        const wordCount = post.content.split(/\s+/).length;
        console.log(`Title: ${post.title}`);
        console.log(`Slug: ${post.slug}`);
        console.log(`Word Count: ${wordCount}`);
        console.log(`Total Characters: ${post.content.length}`);
        console.log(`Content Preview: ${post.content.substring(0, 100)}...`);
        console.log('------------------------');
    });
}

verifyBatch2();
