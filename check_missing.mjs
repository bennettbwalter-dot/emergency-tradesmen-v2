import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { existsSync } from 'fs';
import path from 'path';

dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkMissing() {
    const { data: posts, error } = await supabase
        .from('posts')
        .select('id, slug, title, cover_image, published')
        .eq('published', true);

    if (error) {
        console.error('Error fetching posts:', error);
        return;
    }

    console.log('=== MISSING/BROKEN COVER IMAGES ===');
    for (const post of posts) {
        const img = post.cover_image;
        let localPath = null;
        if (img) {
            if (img.startsWith('/images/blog/')) {
                localPath = path.join('public', img.replace('/', ''));
            } else if (img.startsWith('/blog/')) {
                localPath = path.join('public', img.replace('/', ''));
            } else {
                localPath = path.join('public', img);
            }
        }
        
        const fileExists = localPath ? existsSync(localPath) : false;
        
        if (!img || !fileExists) {
            console.log(`Title: "${post.title}"`);
            console.log(`Slug:  "${post.slug}"`);
            console.log(`Cover: "${img}"`);
            console.log(`Local: "${localPath}"`);
            console.log('----------------------------------------------------');
        }
    }
}

checkMissing().catch(console.error);
