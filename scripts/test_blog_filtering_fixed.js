import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

async function testBlogFilteringFixed() {
    console.log('=== TESTING BLOG FILTERING AFTER FIX (limit=200) ===\n');

    // Simulate what BlogPage does AFTER FIX
    const url = `${supabaseUrl}/rest/v1/posts?select=id,title,slug,excerpt,cover_image,published_at,created_at&published=eq.true&order=published_at.desc&limit=200`;

    const response = await fetch(url, {
        headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'count=exact'
        }
    });

    const data = await response.json();
    console.log(`Total posts returned from API (limit 200): ${data.length}\n`);

    // US filtering logic
    console.log('--- US REGIONAL FILTER (port 3001) ---');
    const usRegionalData = data.filter(post => {
        if (!post) return false;
        const slug = (post.slug || "").toString().toLowerCase();
        const isUS = slug.endsWith('-us') || slug.endsWith('-usa') || slug.includes('-us-') || slug.includes('-usa-');
        const isUK = slug.endsWith('-gb') || slug.endsWith('-uk') || slug.includes('-gb-') || slug.includes('-uk-');
        return isUS || !isUK;
    });

    console.log(`Posts after US regional filtering: ${usRegionalData.length}`);

    const usUniquePosts = [];
    const usSeenTitles = new Set();
    const usSeenImages = new Set();
    
    for (const post of usRegionalData) {
        const title = (post.title || "").toString().toLowerCase().trim();
        const image = post.cover_image;
        if (!usSeenTitles.has(title) && (!image || !usSeenImages.has(image))) {
            usSeenTitles.add(title);
            if (image) usSeenImages.add(image);
            usUniquePosts.push(post);
        }
    }

    console.log(`Posts after US deduplication: ${usUniquePosts.length}\n`);

    // UK filtering logic
    console.log('--- UK REGIONAL FILTER (port 3000) ---');
    const ukRegionalData = data.filter(post => {
        if (!post) return false;
        const slug = (post.slug || "").toString().toLowerCase();
        const isUS = slug.endsWith('-us') || slug.endsWith('-usa') || slug.includes('-us-') || slug.includes('-usa-');
        const isUK = slug.endsWith('-gb') || slug.endsWith('-uk') || slug.includes('-gb-') || slug.includes('-uk-');
        return isUK || !isUS;
    });

    console.log(`Posts after UK regional filtering: ${ukRegionalData.length}`);

    const ukUniquePosts = [];
    const ukSeenTitles = new Set();
    const ukSeenImages = new Set();
    
    for (const post of ukRegionalData) {
        const title = (post.title || "").toString().toLowerCase().trim();
        const image = post.cover_image;
        if (!ukSeenTitles.has(title) && (!image || !ukSeenImages.has(image))) {
            ukSeenTitles.add(title);
            if (image) ukSeenImages.add(image);
            ukUniquePosts.push(post);
        }
    }

    console.log(`Posts after UK deduplication: ${ukUniquePosts.length}\n`);

    console.log('=== SUMMARY ===');
    console.log(`✅ US blogs showing: ${usUniquePosts.length}`);
    console.log(`✅ UK blogs showing: ${ukUniquePosts.length}`);
}

testBlogFilteringFixed().catch(console.error);
