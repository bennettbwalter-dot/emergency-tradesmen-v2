import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const blogPath = 'c:/Users/Nick/OneDrive/protection/OneDrive/content-assistant/brain/memory/allmemories/blog_day30_burglar_proof_door.md';
const content = fs.readFileSync(blogPath, 'utf8');

async function insertPost() {
    const slug = 'beyond-the-deadbolt-structural-door-security-2026';
    const title = 'Beyond the Deadbolt: 7 Structural Door Upgrades Burglars Hope You Ignore';
    const excerpt = 'Locks are just one part of the entry. Learn how to reinforce your door frame, hinges, and letterbox to stop forced entry in 2026.';

    // Check if post exists
    const { data: existingPost } = await supabase
        .from('posts')
        .select('id')
        .eq('slug', slug)
        .single();

    if (existingPost) {
        console.log('Post already exists, updating...');
        const { error } = await supabase
            .from('posts')
            .update({
                title,
                content,
                published_at: new Date().toISOString(),
                cover_image: '/blog/structural-security-2026/splintered-frame.jpg',
                published: true,
                excerpt
            })
            .eq('slug', slug);

        if (error) console.error('Error updating:', error);
        else console.log('Successfully updated post');
    } else {
        console.log('Inserting new post...');
        const { error } = await supabase
            .from('posts')
            .insert({
                title,
                slug,
                content,
                excerpt,
                published_at: new Date().toISOString(),
                cover_image: '/blog/locksmith/front-door-security.webp',
                published: true
            });

        if (error) console.error('Error inserting:', error);
        else console.log('Successfully inserted post');
    }
}

insertPost();
