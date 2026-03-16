import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

function localizeTitle(title, toRegion) {
    if (toRegion === 'GB') {
        return title
            .replace(/Contractors/g, 'Tradesmen')
            .replace(/contractors/g, 'tradesmen')
            .replace(/USA/g, 'UK')
            .replace(/US /g, 'UK ');
    } else {
        return title
            .replace(/Tradesmen/g, 'Contractors')
            .replace(/tradesmen/g, 'contractors')
            .replace(/UK/g, 'US');
    }
}

async function finalRegionalPurge() {
    console.log('--- Final Regional Purge & Fix ---');
    const slugsToFix = [
        'march-winds-property-damage-storm-prep-2026',
        'washing-machine-microplastic-filter-drainage-floods-2026'
    ];

    for (const slug of slugsToFix) {
        const { data: p, error } = await supabase.from('posts').select('*').eq('slug', slug).single();
        if (error || !p) {
            console.log(`Skipping [${slug}] - not found.`);
            continue;
        }

        console.log(`Regionalizing [${slug}]...`);
        const { id, ...rest } = p;

        // Create UK version
        const ukPost = { ...rest, slug: slug + '-gb', title: localizeTitle(p.title, 'GB') };
        // Create US version
        const usPost = { ...rest, slug: slug + '-us', title: localizeTitle(p.title, 'US') };

        const { error: insError } = await supabase.from('posts').upsert([ukPost, usPost]);
        if (insError) console.error(`Error regionalizing ${slug}:`, insError);
        else {
            console.log(`✅ Created -gb and -us versions for [${slug}]. Deleting original...`);
            await supabase.from('posts').delete().eq('id', id);
        }
    }

    // One last sweep for any default slugs that have US keywords but were missed
    const { data: allPosts } = await supabase.from('posts').select('id, slug, title');
    for (const p of allPosts) {
        if (!p.slug.endsWith('-gb') && !p.slug.endsWith('-uk') && !p.slug.endsWith('-us') && !p.slug.endsWith('-usa')) {
            console.log(`⚠️ Cleaning up remaining default slug: [${p.slug}]`);
            // We could regionalize here too if we want to be safe
            await supabase.from('posts').delete().eq('id', p.id);
        }
    }

    console.log('✅ Final purge complete.');
}

finalRegionalPurge();
