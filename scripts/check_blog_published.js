import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkPublished() {
    const { data, error } = await supabase
        .from('posts')
        .select('slug, title, published, published_at')
        .order('published_at', { ascending: false });

    if (error) { console.error('Query error:', error); return; }

    const publishedPosts = data.filter(p => p.published === true);
    const unpublishedPosts = data.filter(p => p.published !== true);
    
    console.log(`\n=== TOTAL: ${data.length} posts ===`);
    console.log(`Published: ${publishedPosts.length}`);
    console.log(`Unpublished: ${unpublishedPosts.length}\n`);

    // UK posts that are published
    const ukPublished = publishedPosts.filter(p => p.slug.endsWith('-gb') || p.slug.endsWith('-uk') || (!p.slug.endsWith('-us') && !p.slug.endsWith('-usa')));
    console.log(`=== UK Published: ${ukPublished.length} ===`);
    ukPublished.forEach(p => console.log(`  ✅ ${p.slug} | published_at: ${p.published_at}`));

    // UK posts that are NOT published
    const ukUnpublished = unpublishedPosts.filter(p => p.slug.endsWith('-gb') || p.slug.endsWith('-uk') || (!p.slug.endsWith('-us') && !p.slug.endsWith('-usa')));
    console.log(`\n=== UK Unpublished: ${ukUnpublished.length} ===`);
    ukUnpublished.forEach(p => console.log(`  ❌ ${p.slug} | published: ${p.published}`));
}

checkPublished();
