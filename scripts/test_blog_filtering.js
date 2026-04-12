import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

async function testBlogFiltering() {
    console.log('=== TESTING BLOG FILTERING FOR US (port 3001) ===\n');

    // Simulate what BlogPage does
    const url = `${supabaseUrl}/rest/v1/posts?select=id,title,slug,excerpt,cover_image,published_at,created_at&published=eq.true&order=published_at.desc&limit=20`;

    const response = await fetch(url, {
        headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'count=exact'
        }
    });

    const data = await response.json();
    console.log(`Total posts returned from API (limit 20): ${data.length}\n`);

    // US filtering logic (from BlogPage.tsx)
    const regionalData = data.filter(post => {
        if (!post) return false;
        const slug = (post.slug || "").toString().toLowerCase();
        const isUS = slug.endsWith('-us') || slug.endsWith('-usa') || slug.includes('-us-') || slug.includes('-usa-');
        const isUK = slug.endsWith('-gb') || slug.endsWith('-uk') || slug.includes('-gb-') || slug.includes('-uk-');

        // For US: show US posts OR shared posts (not UK)
        return isUS || !isUK;
    });

    console.log(`Posts after US regional filtering: ${regionalData.length}`);
    regionalData.forEach((p, i) => {
        console.log(`${i + 1}. ${p.slug}`);
    });

    // Deduplication logic (from BlogPage.tsx)
    const uniquePosts = [];
    const seenTitles = new Set();
    const seenImages = new Set();
    
    for (const post of regionalData) {
        const title = (post.title || "").toString().toLowerCase().trim();
        const image = post.cover_image;
        if (!seenTitles.has(title) && (!image || !seenImages.has(image))) {
            seenTitles.add(title);
            if (image) seenImages.add(image);
            uniquePosts.push(post);
        }
    }

    console.log(`\nPosts after deduplication: ${uniquePosts.length}`);
    uniquePosts.forEach((p, i) => {
        console.log(`${i + 1}. ${p.slug} | Title: "${p.title.substring(0, 50)}..."`);
    });

    console.log('\n\n=== NOW TEST WITH HIGHER LIMIT ===\n');

    // Test with limit=100
    const url2 = `${supabaseUrl}/rest/v1/posts?select=id,title,slug,excerpt,cover_image,published_at,created_at&published=eq.true&order=published_at.desc&limit=100`;
    const response2 = await fetch(url2, {
        headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'count=exact'
        }
    });

    const data2 = await response2.json();
    console.log(`Total posts returned from API (limit 100): ${data2.length}\n`);

    const regionalData2 = data2.filter(post => {
        if (!post) return false;
        const slug = (post.slug || "").toString().toLowerCase();
        const isUS = slug.endsWith('-us') || slug.endsWith('-usa') || slug.includes('-us-') || slug.includes('-usa-');
        const isUK = slug.endsWith('-gb') || slug.endsWith('-uk') || slug.includes('-gb-') || slug.includes('-uk-');
        return isUS || !isUK;
    });

    console.log(`Posts after US regional filtering: ${regionalData2.length}`);

    const uniquePosts2 = [];
    const seenTitles2 = new Set();
    const seenImages2 = new Set();
    
    for (const post of regionalData2) {
        const title = (post.title || "").toString().toLowerCase().trim();
        const image = post.cover_image;
        if (!seenTitles2.has(title) && (!image || !seenImages2.has(image))) {
            seenTitles2.add(title);
            if (image) seenImages2.add(image);
            uniquePosts2.push(post);
        }
    }

    console.log(`Posts after deduplication: ${uniquePosts2.length}\n`);
    uniquePosts2.forEach((p, i) => {
        console.log(`${i + 1}. ${p.slug}`);
    });
}

testBlogFiltering().catch(console.error);
