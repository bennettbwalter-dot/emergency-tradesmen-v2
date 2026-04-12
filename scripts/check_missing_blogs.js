import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';

dotenv.config({ path: '.env' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

function extractSlugsFromSitemap(filePath) {
    const xml = readFileSync(filePath, 'utf-8');
    // Extract all <loc> tags and get the slug from the URL
    const locRegex = /<loc>https?:\/\/[^\/]+\/blog\/([^<]+)<\/loc>/g;
    const slugs = [];
    let match;

    while ((match = locRegex.exec(xml)) !== null) {
        slugs.push(match[1]);
    }

    return slugs;
}

async function main() {
    console.log('=== BLOG MISSING AUDIT ===\n');

    // Get all slugs from database
    const { data: dbPosts, error } = await supabase
        .from('posts')
        .select('slug, title, published')
        .eq('published', true);

    if (error) {
        console.error('Error fetching posts:', error);
        return;
    }

    const dbSlugs = new Set(dbPosts.map(p => p.slug));

    // UK Sitemap
    console.log('--- UK SITEMAP CHECK ---');
    const ukSitemapSlugs = extractSlugsFromSitemap('public/sitemap-blog-uk.xml');
    const missingUkBlogs = ukSitemapSlugs.filter(slug => !dbSlugs.has(slug));

    console.log(`UK Sitemap has ${ukSitemapSlugs.length} blogs`);
    console.log(`Database has ${dbPosts.filter(p => p.slug.includes('-gb') || p.slug.includes('-uk')).length} UK blogs`);
    console.log(`Missing UK blogs: ${missingUkBlogs.length}\n`);

    if (missingUkBlogs.length > 0) {
        console.log('Missing UK blogs:');
        missingUkBlogs.forEach(slug => console.log(`  - ${slug}`));
        console.log('');
    }

    // US Sitemap
    console.log('--- US SITEMAP CHECK ---');
    const usSitemapSlugs = extractSlugsFromSitemap('public/sitemap-blog-us.xml');
    const missingUsBlogs = usSitemapSlugs.filter(slug => !dbSlugs.has(slug));

    console.log(`US Sitemap has ${usSitemapSlugs.length} blogs`);
    console.log(`Database has ${dbPosts.filter(p => p.slug.includes('-us') || p.slug.includes('-usa')).length} US blogs`);
    console.log(`Missing US blogs: ${missingUsBlogs.length}\n`);

    if (missingUsBlogs.length > 0) {
        console.log('Missing US blogs:');
        missingUsBlogs.forEach(slug => console.log(`  - ${slug}`));
        console.log('');
    }

    // Summary
    console.log('=== SUMMARY ===');
    console.log(`Total missing: ${missingUkBlogs.length + missingUsBlogs.length} blogs`);

    if (missingUkBlogs.length === 0 && missingUsBlogs.length === 0) {
        console.log('✅ All blogs from sitemaps are present in the database!');
    }
}

main().catch(console.error);
