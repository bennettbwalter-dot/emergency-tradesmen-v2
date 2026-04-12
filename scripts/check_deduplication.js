import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

async function checkDeduplication() {
    console.log('=== CHECKING DEDUPLICATION ISSUES ===\n');

    const url = `${supabaseUrl}/rest/v1/posts?select=id,title,slug,cover_image,published_at&published=eq.true&order=published_at.desc&limit=200`;
    const response = await fetch(url, {
        headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'count=exact'
        }
    });

    const data = await response.json();

    // US blogs
    const usBlogs = data.filter(post => {
        const slug = (post.slug || "").toString().toLowerCase();
        const isUS = slug.endsWith('-us') || slug.endsWith('-usa');
        const isUK = slug.endsWith('-gb') || slug.endsWith('-uk');
        return isUS || !isUK;
    });

    console.log('--- US BLOGS BEING DEDUPLICATED ---');
    const usTitleMap = {};
    const usImageMap = {};
    
    usBlogs.forEach(post => {
        const title = (post.title || "").toString().toLowerCase().trim();
        const image = post.cover_image;
        
        if (!usTitleMap[title]) usTitleMap[title] = [];
        usTitleMap[title].push(post.slug);
        
        if (image) {
            if (!usImageMap[image]) usImageMap[image] = [];
            usImageMap[image].push(post.slug);
        }
    });

    console.log('\nDuplicate titles:');
    Object.entries(usTitleMap).forEach(([title, slugs]) => {
        if (slugs.length > 1) {
            console.log(`  Title: "${title.substring(0, 60)}..."`);
            slugs.forEach(slug => console.log(`    - ${slug}`));
        }
    });

    console.log('\nDuplicate images:');
    Object.entries(usImageMap).forEach(([image, slugs]) => {
        if (slugs.length > 1) {
            console.log(`  Image: ${image}`);
            slugs.forEach(slug => console.log(`    - ${slug}`));
        }
    });

    // UK blogs
    const ukBlogs = data.filter(post => {
        const slug = (post.slug || "").toString().toLowerCase();
        const isUS = slug.endsWith('-us') || slug.endsWith('-usa');
        const isUK = slug.endsWith('-gb') || slug.endsWith('-uk');
        return isUK || !isUS;
    });

    console.log('\n\n--- UK BLOGS BEING DEDUPLICATED ---');
    const ukTitleMap = {};
    const ukImageMap = {};
    
    ukBlogs.forEach(post => {
        const title = (post.title || "").toString().toLowerCase().trim();
        const image = post.cover_image;
        
        if (!ukTitleMap[title]) ukTitleMap[title] = [];
        ukTitleMap[title].push(post.slug);
        
        if (image) {
            if (!ukImageMap[image]) ukImageMap[image] = [];
            ukImageMap[image].push(post.slug);
        }
    });

    console.log('\nDuplicate titles:');
    Object.entries(ukTitleMap).forEach(([title, slugs]) => {
        if (slugs.length > 1) {
            console.log(`  Title: "${title.substring(0, 60)}..."`);
            slugs.forEach(slug => console.log(`    - ${slug}`));
        }
    });

    console.log('\nDuplicate images:');
    Object.entries(ukImageMap).forEach(([image, slugs]) => {
        if (slugs.length > 1) {
            console.log(`  Image: ${image}`);
            slugs.forEach(slug => console.log(`    - ${slug}`));
        }
    });
}

checkDeduplication().catch(console.error);
