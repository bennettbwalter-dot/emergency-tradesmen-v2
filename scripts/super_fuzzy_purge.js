import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function superPurge() {
    console.log('--- Super Purge: Fuzzy Duplicate Cleanup ---');
    
    const { data: allPosts, error } = await supabase.from('posts').select('*').eq('published', true);
    if (error) return console.error(error);

    const fuzzyTitle = (t) => {
        return t.toLowerCase()
            .replace(/&/g, 'and')
            .replace(/mould/g, 'mold')
            .replace(/tradesmen|tradespeople/g, 'contractors')
            .replace(/hvac system|boiler/g, 'furnace') // Fuzzy match heater types
            .replace(/2026|2025/g, '')
            .replace(/\(us guide\)|\(uk guide\)|\(us edition\)|\(uk edition\)/g, '')
            .replace(/usa|us/g, '')
            .replace(/[^a-z0-9]/g, '')
            .trim();
    };

    const getRegion = (slug) => {
        const s = slug.toLowerCase();
        if (s.endsWith('-us') || s.endsWith('-usa') || s.includes('-us-') || s.includes('-usa-')) return 'US';
        if (s.endsWith('-gb') || s.endsWith('-uk') || s.includes('-gb-') || s.includes('-uk-')) return 'UK';
        return 'ORPHAN';
    };

    const groups = {};

    allPosts.forEach(p => {
        const fTitle = fuzzyTitle(p.title);
        const region = getRegion(p.slug);
        const key = `${region}|${fTitle}`;
        
        if (!groups[key]) groups[key] = [];
        groups[key].push(p);
    });

    const toUnpublish = [];

    for (const key in groups) {
        const items = groups[key];
        if (items.length > 1) {
            // Keep the best one
            items.sort((a, b) => {
                const aSlug = a.slug.toLowerCase();
                const bSlug = b.slug.toLowerCase();
                
                // Penalize double suffixes
                const aDouble = aSlug.includes('-us-us') || aSlug.includes('-gb-gb');
                const bDouble = bSlug.includes('-us-us') || bSlug.includes('-gb-gb');
                if (aDouble && !bDouble) return 1;
                if (!aDouble && bDouble) return -1;

                // Prefer -us or -gb at the end
                const aClean = aSlug.endsWith('-us') || aSlug.endsWith('-gb');
                const bClean = bSlug.endsWith('-us') || bSlug.endsWith('-gb');
                if (aClean && !bClean) return -1;
                if (!aClean && bClean) return 1;

                return new Date(b.published_at || b.created_at) - new Date(a.published_at || a.created_at);
            });

            const winner = items[0];
            console.log(`[GROUP] ${key} -> Winner: ${winner.slug}`);
            items.slice(1).forEach(p => {
                console.log(`  [UNPUBLISH] ${p.slug}`);
                toUnpublish.push(p.id);
            });
        }
    }

    if (toUnpublish.length > 0) {
        console.log(`Unpublishing ${toUnpublish.length} fuzzy duplicates...`);
        for (const id of toUnpublish) {
            await supabase.from('posts').update({ published: false }).eq('id', id);
        }
        console.log('✅ Super Purge Complete.');
    } else {
        console.log('No fuzzy duplicates found.');
    }
}

superPurge();
