import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function simulateFilter(countryCode) {
    console.log(`--- Simulating BlogPage Filter for [${countryCode}] ---`);
    const { data: allData, error } = await supabase
        .from('posts')
        .select('slug, title')
        .eq('published', true)
        .order('published_at', { ascending: false });

    if (error) {
        console.error(error);
        return;
    }

    const visiblePosts = allData.filter(p => {
        const slug = p.slug.toLowerCase();
        // EXACT LOGIC FROM BlogPage.tsx
        const isUSPost = slug.includes('-us-') || slug.endsWith('-us') || slug.includes('-usa-') || slug.endsWith('-usa');
        const isUKPost = slug.includes('-gb-') || slug.endsWith('-gb') || slug.includes('-uk-') || slug.endsWith('-uk');

        if (isUSPost) return countryCode === 'US';
        if (isUKPost) return countryCode === 'GB';
        
        const baseSlug = slug.replace(/-us$|-usa$|-gb$|-uk$|-us-2026$|-uk-2026$/, '');
        const hasRegionalVersion = allData.some(other => {
            const otherSlug = other.slug.toLowerCase();
            if (countryCode === 'US') {
                return otherSlug.includes(`${baseSlug}-us`) || otherSlug.includes(`${baseSlug}-usa`);
            } else {
                return otherSlug.includes(`${baseSlug}-gb`) || otherSlug.includes(`${baseSlug}-uk`);
            }
        });
        return !hasRegionalVersion;
    });

    console.log(`Visible posts on ${countryCode} site: ${visiblePosts.length}`);
    visiblePosts.forEach((p, i) => {
        const isUSKeywords = p.title.toLowerCase().includes('us guide') || p.title.toLowerCase().includes('usa') || p.title.toLowerCase().includes('chicago');
        const label = isUSKeywords ? '⚠️ [US CONTENT?]' : '   ';
        console.log(`${i.toString().padStart(3, ' ')} | ${label} | ${p.slug.padEnd(60, ' ')} | ${p.title}`);
    });
}

async function run() {
    await simulateFilter('GB');
    console.log('\n');
    await simulateFilter('US');
}

run();
