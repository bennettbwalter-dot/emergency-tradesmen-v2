import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

async function testFinalFix() {
    console.log('=== TESTING FINAL BLOG FIX (limit=200 + slug dedup) ===\n');

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

    // US filtering
    const usRegionalData = data.filter(post => {
        const slug = (post.slug || "").toString().toLowerCase();
        const isUS = slug.endsWith('-us') || slug.endsWith('-usa');
        const isUK = slug.endsWith('-gb') || slug.endsWith('-uk');
        return isUS || !isUK;
    });

    // Slug-based dedup
    const usUniquePosts = [];
    const usSeenSlugs = new Set();
    for (const post of usRegionalData) {
        const slug = (post.slug || "").toString().toLowerCase().trim();
        if (!usSeenSlugs.has(slug)) {
            usSeenSlugs.add(slug);
            usUniquePosts.push(post);
        }
    }

    // UK filtering
    const ukRegionalData = data.filter(post => {
        const slug = (post.slug || "").toString().toLowerCase();
        const isUS = slug.endsWith('-us') || slug.endsWith('-usa');
        const isUK = slug.endsWith('-gb') || slug.endsWith('-uk');
        return isUK || !isUS;
    });

    // Slug-based dedup
    const ukUniquePosts = [];
    const ukSeenSlugs = new Set();
    for (const post of ukRegionalData) {
        const slug = (post.slug || "").toString().toLowerCase().trim();
        if (!ukSeenSlugs.has(slug)) {
            ukSeenSlugs.add(slug);
            ukUniquePosts.push(post);
        }
    }

    console.log('=== FINAL RESULTS ===');
    console.log(`✅ US blogs showing: ${usUniquePosts.length} (was 12)`);
    console.log(`✅ UK blogs showing: ${ukUniquePosts.length} (was ~12)`);
    console.log('\n--- ALL US BLOGS ---');
    usUniquePosts.forEach((p, i) => console.log(`${i + 1}. ${p.slug}`));
    console.log('\n--- ALL UK BLOGS ---');
    ukUniquePosts.forEach((p, i) => console.log(`${i + 1}. ${p.slug}`));
}

testFinalFix().catch(console.error);
