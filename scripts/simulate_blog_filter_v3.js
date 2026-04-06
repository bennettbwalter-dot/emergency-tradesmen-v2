import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function simulateBlogPage() {
    console.log('Simulating BlogPage query...\n');

    const { data, error } = await supabase
        .from('posts')
        .select('id, title, slug, excerpt, cover_image, published_at, created_at')
        .eq('published', true)
        .order('published_at', { ascending: false });

    if (error || !data) {
        console.log('Query failed:', error);
        return;
    }

    console.log(`Total published posts returned: ${data.length}\n`);

    // Simulate UK filtering
    const countryCode = 'GB';
    const regionalData = data.filter(post => {
        if (!post) return false;
        try {
            const slug = (post.slug || "").toString().toLowerCase();
            const isUS = slug.endsWith('-us') || slug.endsWith('-usa') || slug.includes('-us-') || slug.includes('-usa-');
            const isUK = slug.endsWith('-gb') || slug.endsWith('-uk') || slug.includes('-gb-') || slug.includes('-uk-');
            
            if (countryCode === 'US') {
                return isUS || !isUK;
            } else {
                return isUK || !isUS;
            }
        } catch (err) {
            console.error('Filter error for post:', post, err);
            return false;
        }
    });

    console.log(`UK filtered posts: ${regionalData.length}\n`);
    regionalData.forEach(p => console.log(`  ${p.slug}`));

    // Deduplication
    const uniquePosts = [];
    const seenTitles = new Set();
    const seenImages = new Set();
    for (const post of regionalData) {
        try {
            const title = (post.title || "").toString().toLowerCase().trim();
            const image = post.cover_image;
            if (!seenTitles.has(title) && (!image || !seenImages.has(image))) {
                seenTitles.add(title);
                if (image) seenImages.add(image);
                uniquePosts.push(post);
            }
        } catch (err) {
            console.error('Deduplication error for post:', post, err);
        }
    }

    console.log(`\nAfter deduplication: ${uniquePosts.length}`);
    uniquePosts.forEach(p => console.log(`  ${p.slug}`));
}

simulateBlogPage();
