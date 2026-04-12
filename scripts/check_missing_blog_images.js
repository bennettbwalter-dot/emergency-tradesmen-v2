import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { existsSync } from 'fs';
import path from 'path';

dotenv.config({ path: '.env' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkMissingImages() {
    const { data: posts } = await supabase
        .from('posts')
        .select('slug, title, cover_image')
        .eq('published', true);

    console.log('=== CHECKING BLOG IMAGE FILES EXIST ===\n');
    
    let missingCount = 0;
    const missing = [];

    for (const post of posts) {
        const img = post.cover_image;
        if (!img) {
            console.log(`❌ ${post.slug} → NO IMAGE SET`);
            missing.push(post.slug);
            missingCount++;
            continue;
        }

        // Convert URL path to local file path
        const localPath = img.startsWith('/images/blog/') 
            ? path.join('public', img.replace('/', ''))
            : null;

        if (localPath && !existsSync(localPath)) {
            console.log(`❌ ${post.slug}`);
            console.log(`   Image: ${img}`);
            console.log(`   File missing: ${localPath}\n`);
            missing.push(post.slug);
            missingCount++;
        }
    }

    console.log(`\n=== SUMMARY ===`);
    console.log(`Total blogs: ${posts.length}`);
    console.log(`Missing/broken images: ${missingCount}`);
    
    if (missingCount > 0) {
        console.log('\nBlogs needing new color block images:');
        missing.forEach(s => console.log(`  - ${s}`));
    } else {
        console.log('✅ All blog images exist and are accessible!');
    }
}

checkMissingImages().catch(console.error);
