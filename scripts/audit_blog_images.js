import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPaths() {
    const { data: posts, error } = await supabase
        .from('posts')
        .select('title, slug, cover_image')
        .order('published_at', { ascending: false });

    if (error) {
        console.error(error);
        return;
    }

    console.log('| Title | Slug | Cover Image Path |');
    console.log('|-------|------|------------------|');
    posts.forEach(post => {
        console.log(`| ${post.title} | ${post.slug} | ${post.cover_image} |`);
    });
}

checkPaths();
