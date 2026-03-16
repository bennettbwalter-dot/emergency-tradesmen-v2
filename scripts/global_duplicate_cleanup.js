import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function globalCleanup() {
    console.log('--- Global Duplicate Cleanup & Regionalization ---');
    
    const { data: allPosts, error } = await supabase.from('posts').select('*');
    if (error) return console.error(error);

    const usFilter = (slug) => slug.endsWith('-us') || slug.endsWith('-usa') || slug.includes('-us-') || slug.includes('-usa-');
    const ukFilter = (slug) => slug.endsWith('-gb') || slug.endsWith('-uk') || slug.includes('-gb-') || slug.includes('-uk-');

    // Grouping by "Base Slug"
    const groups = {};

    allPosts.forEach(p => {
        const slug = p.slug.toLowerCase();
        const base = slug.replace(/-us-us|-us|-usa|-gb|-uk|-us-2026|-gb-2026|-uk-2026|-2026$/g, '');
        if (!groups[base]) groups[base] = [];
        groups[base].push(p);
    });

    const toUpdate = [];

    for (const base in groups) {
        const posts = groups[base];
        
        // --- US SELECTION ---
        const usVariants = posts.filter(p => usFilter(p.slug.toLowerCase()));
        if (usVariants.length > 1) {
            // Sort by slug length (prefer shorter/cleaner like -us over -us-us) or ID, or date
            usVariants.sort((a, b) => {
                // Prefer -us over -us-us
                const aDouble = a.slug.includes('-us-us');
                const bDouble = b.slug.includes('-us-us');
                if (aDouble && !bDouble) return 1;
                if (!aDouble && bDouble) return -1;
                return new Date(b.published_at || b.created_at) - new Date(a.published_at || a.created_at);
            });
            
            // Keep the first, unpublish the rest
            const winner = usVariants[0];
            console.log(`[US] Winner for ${base}: ${winner.slug}`);
            
            usVariants.slice(1).forEach(p => {
                console.log(`  [UNPUBLISH DUPE] ${p.slug}`);
                toUpdate.push({ id: p.id, published: false });
            });
        }

        // --- UK SELECTION ---
        const ukVariants = posts.filter(p => ukFilter(p.slug.toLowerCase()));
        if (ukVariants.length > 1) {
            ukVariants.sort((a, b) => new Date(b.published_at || b.created_at) - new Date(a.published_at || a.created_at));
            const winner = ukVariants[0];
            console.log(`[UK] Winner for ${base}: ${winner.slug}`);
            ukVariants.slice(1).forEach(p => {
                console.log(`  [UNPUBLISH DUPE] ${p.slug}`);
                toUpdate.push({ id: p.id, published: false });
            });
        }

        // --- ORPHANS (Base posts without suffixes) ---
        const orphans = posts.filter(p => !usFilter(p.slug.toLowerCase()) && !ukFilter(p.slug.toLowerCase()));
        orphans.forEach(p => {
            // If we have a regional version, hide the orphan
            const hasRegional = usVariants.length > 0 || ukVariants.length > 0;
            if (hasRegional) {
                console.log(`  [UNPUBLISH ORPHAN] ${p.slug} (Regionalized version exists)`);
                toUpdate.push({ id: p.id, published: false });
            }
        });
    }

    if (toUpdate.length > 0) {
        console.log(`Applying ${toUpdate.length} updates...`);
        for (const item of toUpdate) {
            const { error: updErr } = await supabase.from('posts').update({ published: item.published }).eq('id', item.id);
            if (updErr) console.error(`  [ERROR] ${item.id}:`, updErr.message);
        }
        console.log('✅ Cleanup Complete.');
    } else {
        console.log('No duplicates found needing unpublishing.');
    }

    // --- REGIONAL TITLE SYNC ---
    console.log('Synchronizing Titles (Contractors vs Tradesmen)...');
    const { data: activePosts } = await supabase.from('posts').select('*').eq('published', true);
    for (const p of activePosts) {
        const isUS = usFilter(p.slug.toLowerCase());
        const isUK = ukFilter(p.slug.toLowerCase());
        let newTitle = p.title;
        let changed = false;

        if (isUS && p.title.includes('Tradesmen')) {
            newTitle = p.title.replace(/Tradesmen|tradesmen/g, 'Contractors');
            changed = true;
        } else if (isUK && p.title.includes('Contractors')) {
            newTitle = p.title.replace(/Contractors|contractors/g, 'Tradesmen');
            changed = true;
        }

        if (changed) {
            console.log(`  [TITLE FIX] ${p.slug} -> ${newTitle}`);
            await supabase.from('posts').update({ title: newTitle }).eq('id', p.id);
        }
    }
    console.log('✅ Title Sync Complete.');
}

globalCleanup();
