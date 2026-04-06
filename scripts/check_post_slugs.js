import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

(async () => {
    // Find the recent posts
    const { data, error } = await supabase
        .from('posts')
        .select('id, title, slug, published_at, cover_image')
        .eq('published', true)
        .order('published_at', { ascending: false })
        .limit(6);

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log('\nTop 6 posts:');
    data.forEach(p => {
        const slug = (p.slug || '').toString();
        const isUS = slug.endsWith('-us') || slug.endsWith('-usa') || slug.includes('-us-') || slug.includes('-usa-');
        const isUK = slug.endsWith('-gb') || slug.endsWith('-uk') || slug.includes('-gb-') || slug.includes('-uk-');
        const tag = isUS ? '[US]' : isUK ? '[UK]' : '[UNTAGGED]';
        console.log(`  ${tag} id=${p.id} slug="${slug}" date=${p.published_at?.substring(0, 10)}`);
    });

    // Find all posts with no regional suffix 
    const { data: all, error: allError } = await supabase
        .from('posts')
        .select('id, title, slug, published_at')
        .eq('published', true)
        .order('published_at', { ascending: false });

    if (!allError && all) {
        const untagged = all.filter(p => {
            const slug = (p.slug || '').toString().toLowerCase();
            const isUS = slug.endsWith('-us') || slug.endsWith('-usa') || slug.includes('-us-') || slug.includes('-usa-');
            const isUK = slug.endsWith('-gb') || slug.endsWith('-uk') || slug.includes('-gb-') || slug.includes('-uk-');
            return !isUS && !isUK;
        });
        console.log(`\nUntagged posts (show on BOTH UK and US): ${untagged.length}`);
        untagged.forEach(p => console.log(`  id=${p.id} slug="${p.slug}" date=${p.published_at?.substring(0, 10)}`));
    }
})();
