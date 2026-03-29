import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function audit() {
    const { data, error } = await supabase
        .from('posts')
        .select('slug, title, cover_image, published')
        .order('published_at', { ascending: false });

    if (error) { console.error(error); return; }

    // Separate UK and US posts
    const usPosts = data.filter(p => p.slug.endsWith('-us'));
    const ukPosts = data.filter(p => !p.slug.endsWith('-us'));

    console.log(`\n=== TOTAL: ${data.length} posts (${ukPosts.length} UK, ${usPosts.length} US) ===\n`);

    console.log('--- UK POSTS ---');
    ukPosts.forEach(p => {
        const hasUs = usPosts.some(u => u.slug === p.slug + '-us');
        const imgFormat = p.cover_image?.match(/\.(webp|jpg|png)$/)?.[1] || '?';
        console.log(`${hasUs ? '✅' : '❌'} US | ${imgFormat.padEnd(4)} | ${p.slug}`);
    });

    console.log('\n--- US POSTS ---');
    usPosts.forEach(p => {
        const imgFormat = p.cover_image?.match(/\.(webp|jpg|png)$/)?.[1] || '?';
        console.log(`${imgFormat.padEnd(4)} | ${p.slug}`);
    });

    // Check for non-webp cover images
    const nonWebp = data.filter(p => p.cover_image && !p.cover_image.endsWith('.webp'));
    if (nonWebp.length > 0) {
        console.log(`\n--- NON-WEBP COVER IMAGES (${nonWebp.length}) ---`);
        nonWebp.forEach(p => console.log(`  ${p.cover_image} | ${p.slug}`));
    }
}

audit();
