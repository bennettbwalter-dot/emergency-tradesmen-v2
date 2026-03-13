import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function insertPost() {
    const blogPath = 'c:/Users/Nick/OneDrive/protection/OneDrive/content-assistant/brain/memory/allmemories/blog_day32_running_toilet_fix.md';
    const content = fs.readFileSync(blogPath, 'utf8');
    
    const slug = 'toilet-wont-stop-running-five-minute-fix';
    const title = 'Toilet Won’t Stop Running? The 2026 Emergency Guide to the 5-Minute Fix';
    const excerpt = 'A running toilet can waste 750 litres per day! Learn the 5-minute fix to save water and money before calling an emergency plumber in 2026.';
    const cover_image = '/blog/running_toilet_fix_cover.png';

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
                excerpt,
                published_at: new Date('2026-03-11').toISOString(),
                cover_image
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
                published_at: new Date('2026-03-11').toISOString(),
                cover_image
            });

        if (error) console.error('Error inserting:', error);
        else console.log('Successfully inserted post');
    }
}

insertPost();
