import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function simulateFilter(region) {
    console.log(`--- Simulating Blog Filter for [${region}] ---`);
    const { data: allData, error } = await supabase
        .from('posts')
        .select('id, title, slug, published')
        .eq('published', true);

    if (error) return console.error(error);

    const regionalData = allData.filter(p => {
        const slug = p.slug.toLowerCase();
        const isUSPost = slug.includes('-us-') || slug.endsWith('-us') || slug.includes('-usa-') || slug.endsWith('-usa');
        const isUKPost = slug.includes('-gb-') || slug.endsWith('-gb') || slug.includes('-uk-') || slug.endsWith('-uk');

        if (isUSPost) return region === 'US';
        if (isUKPost) return region === 'GB';
        
        const baseSlug = slug.replace(/-us$|-usa$|-gb$|-uk$|-us-2026$|-uk-2026$/, '');
        const hasRegionalVersion = allData.some(other => {
            const otherSlug = other.slug.toLowerCase();
            if (region === 'US') {
                return otherSlug.includes(`${baseSlug}-us`) || otherSlug.includes(`${baseSlug}-usa`);
            } else {
                return otherSlug.includes(`${baseSlug}-gb`) || otherSlug.includes(`${baseSlug}-uk`);
            }
        });
        return !hasRegionalVersion;
    });

    console.log(`Visible Posts (${regionalData.length}):`);
    regionalData.forEach(p => console.log(`- ${p.slug} | ${p.title}`));
}

simulateFilter('GB');
