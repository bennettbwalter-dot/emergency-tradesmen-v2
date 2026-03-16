import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function bridgeGaps() {
    console.log('--- Bridging Content Gaps ---');
    
    // GAPS:
    // 1. emergency-drain-unblocking-guide -> create -gb and -us
    // 2. how-we-verify-tradespeople -> create -gb
    // 3. electrical-emergencies-every-homeowner-should-know -> create -gb
    // 4. find-reliable-tradesmen-contractors-fast -> create -us

    const gaps = [
        { original: 'emergency-drain-unblocking-guide', types: ['gb', 'us'] },
        { original: 'how-we-verify-tradespeople', types: ['gb'] },
        { original: 'electrical-emergencies-every-homeowner-should-know', types: ['gb'] },
        { original: 'find-reliable-tradesmen-contractors-fast', types: ['us'] }
    ];

    for (const gap of gaps) {
        const { data: original } = await supabase.from('posts').select('*').eq('slug', gap.original).single();
        if (!original) {
            console.error(`  [ERROR] Original not found: ${gap.original}`);
            continue;
        }

        for (const type of gap.types) {
            const newSlug = gap.original + '-' + type;
            const isUS = type === 'us';
            
            let title = original.title;
            if (isUS) {
                title = title.replace(/Tradesmen|tradesmen/g, 'Contractors')
                             .replace(/tradespeople/g, 'contractors')
                             .replace(/UK Guide|UK Edition/i, 'US Guide');
                if (!title.includes('US Guide')) title += ' (US Guide)';
            } else {
                title = title.replace(/Contractors|contractors/g, 'Tradesmen')
                             .replace(/US Guide|US Edition/i, 'UK Guide');
                if (!title.includes('UK Guide')) title += ' (UK Guide)';
            }

            let excerpt = original.excerpt || '';
            if (isUS) excerpt = excerpt.replace(/Tradesmen|tradesmen/g, 'Contractors');
            else excerpt = excerpt.replace(/Contractors|contractors/g, 'Tradesmen');

            const { id, ...rest } = original;
            const newPost = {
                ...rest,
                slug: newSlug,
                title,
                excerpt,
                published_at: new Date().toISOString()
            };

            const { error: upsertError } = await supabase.from('posts').upsert(newPost, { onConflict: 'slug' });
            if (upsertError) console.error(`  [ERROR] Failed to create ${newSlug}:`, upsertError.message);
            else console.log(`  [OK] Created ${newSlug}`);
        }
    }
}

bridgeGaps();
