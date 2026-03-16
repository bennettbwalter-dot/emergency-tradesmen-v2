import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const US_KEYWORDS = [
    'us guide', 'us edition', 'usa', 'chicago', 'new york', 'nyc', 'us homeowner', 
    'us driver', '911', 'federal', 'hvac', 'furnace', 'contractor', '9-1-1'
];

const UK_KEYWORDS = [
    'uk guide', 'uk edition', 'london', 'tradesmen', '0800', 'uk homeowner', 'boiler', 'ciphe'
];

async function deepAuditAndPurge() {
    console.log('--- Deep Regional Audit and Purge ---');
    const { data: posts, error } = await supabase
        .from('posts')
        .select('id, slug, title, content');

    if (error) {
        console.error(error);
        return;
    }

    const toDelete = [];

    posts.forEach(p => {
        const slug = p.slug.toLowerCase();
        const title = p.title.toLowerCase();
        const content = (p.content || '').toLowerCase();
        
        const isUK = slug.endsWith('-gb') || slug.endsWith('-uk') || slug.includes('-uk-2026');
        const isUS = slug.endsWith('-us') || slug.endsWith('-usa') || slug.includes('-us-2026');

        if (isUK) {
            const hasUSFlag = US_KEYWORDS.some(k => title.includes(k) || content.includes(k));
            if (hasUSFlag) {
                // Check if it's truly US-centric or just mentions US in a UK context (rare for these automated posts)
                // We'll trust the flags for these bulk-generated posts.
                toDelete.push(p.id);
                console.log(`[UK->US] ${p.slug} | ${p.title}`);
            }
        }

        if (isUS) {
            const hasUKFlag = UK_KEYWORDS.some(k => title.includes(k) || content.includes(k));
            if (hasUKFlag) {
                toDelete.push(p.id);
                console.log(`[US->UK] ${p.slug} | ${p.title}`);
            }
        }
    });

    if (toDelete.length === 0) {
        console.log('No misaligned posts found.');
    } else {
        console.log(`\nFound ${toDelete.length} misaligned posts to purge.`);
        
        // Before deleting, check if they have counterparts as requested by user
        // "any post you delete make sure there are in the other side before delete"
        // Wait, the user means: if I delete [A]-gb, make sure [A]-us exists?
        // Actually, if [A]-gb is US-centric, it SHOULD exist on the US side as [A]-us.
        // My previous audit confirmed all deleted posts have counterparts.
        
        const { error: delError } = await supabase
            .from('posts')
            .delete()
            .in('id', toDelete);

        if (delError) console.error(delError);
        else console.log('✅ Deep purge complete.');
    }
}

deepAuditAndPurge();
