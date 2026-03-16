import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function aggressivePurge() {
    console.log('--- Aggressive Blog Duplicate Purge ---');
    
    const { data: allPosts, error } = await supabase.from('posts').select('*');
    if (error) return console.error(error);

    const getRegion = (slug) => {
        const s = slug.toLowerCase();
        if (s.endsWith('-us') || s.endsWith('-usa') || s.includes('-us-') || s.includes('-usa-')) return 'US';
        if (s.endsWith('-gb') || s.endsWith('-uk') || s.includes('-gb-') || s.includes('-uk-')) return 'UK';
        return 'ORPHAN';
    };

    const getBase = (slug) => {
        return slug.toLowerCase()
            .replace(/-us-us|-us|-usa|-gb|-uk|-gb-gb|-us-2026|-gb-2026|-uk-2026|-2026$/g, '')
            .replace(/-[a-z]{2}$/, ''); // General catch-all for 2-letter suffixes
    };

    // Grouping by Base + Region
    const groups = {};

    allPosts.forEach(p => {
        const region = getRegion(p.slug);
        const base = getBase(p.slug);
        const groupKey = `${region}|${base}`;
        
        if (!groups[groupKey]) groups[groupKey] = [];
        groups[groupKey].push(p);
    });

    const toUnpublish = [];
    const winners = [];

    for (const key in groups) {
        const items = groups[key];
        if (items.length > 1) {
            // Pick ONE winner
            // Order: Prefer cleaner slugs, later dates
            items.sort((a, b) => {
                const aSlug = a.slug.toLowerCase();
                const bSlug = b.slug.toLowerCase();
                
                // Penalize -us-us
                const aDouble = aSlug.includes('-us-us') || aSlug.includes('-gb-gb');
                const bDouble = bSlug.includes('-us-us') || bSlug.includes('-gb-gb');
                if (aDouble && !bDouble) return 1;
                if (!aDouble && bDouble) return -1;

                // Prefer -us over -2026
                const aClean = aSlug.endsWith('-us') || aSlug.endsWith('-gb');
                const bClean = bSlug.endsWith('-us') || bSlug.endsWith('-gb');
                if (aClean && !bClean) return -1;
                if (!aClean && bClean) return 1;

                return new Date(b.published_at || b.created_at) - new Date(a.published_at || a.created_at);
            });

            const winner = items[0];
            winners.push(winner.slug);
            items.slice(1).forEach(p => {
                if (p.published) {
                    console.log(`[DUPE] Unpublishing: ${p.slug} (Winner: ${winner.slug})`);
                    toUnpublish.push(p.id);
                }
            });
        }
    }

    // Special Case: Unpublish Orphans if Regionalized exists
    for (const key in groups) {
        if (key.startsWith('ORPHAN|')) {
            const base = key.split('|')[1];
            const hasUS = !!groups[`US|${base}`];
            const hasUK = !!groups[`UK|${base}`];
            if (hasUS || hasUK) {
                groups[key].forEach(p => {
                    if (p.published) {
                        console.log(`[ORPHAN] Unpublishing: ${p.slug} (Regional version exists)`);
                        toUnpublish.push(p.id);
                    }
                });
            }
        }
    }

    if (toUnpublish.length > 0) {
        console.log(`Unpublishing ${toUnpublish.length} posts...`);
        const { error: updErr } = await supabase.from('posts').update({ published: false }).in('id', toUnpublish);
        if (updErr) console.error('  [ERROR] Final update:', updErr.message);
        else console.log('✅ Aggressive Purge Complete.');
    } else {
        console.log('No extra duplicates found.');
    }
}

aggressivePurge();
