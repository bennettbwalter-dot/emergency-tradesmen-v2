import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const US_KEYWORDS = [
    'us guide', 'us edition', 'usa ', ' chicago', 'new york', 'nyc', 'us homeowner', 
    'us driver', '911', 'federal', 'hvac', 'furnace', '9-1-1'
];

const UK_KEYWORDS = [
    'uk guide', 'uk edition', 'london', ' tradesmen', '0800', 'uk homeowner', 'boiler', 'ciphe'
];

function isUSContent(title, content) {
    const text = (title + ' ' + (content || '')).toLowerCase();
    return US_KEYWORDS.some(k => text.includes(k));
}

function isUKContent(title, content) {
    const text = (title + ' ' + (content || '')).toLowerCase();
    return UK_KEYWORDS.some(k => text.includes(k));
}

function localizeTitle(title, toRegion) {
    if (toRegion === 'GB') {
        return title
            .replace(/Contractors/g, 'Tradesmen')
            .replace(/contractors/g, 'tradesmen')
            .replace(/US Guide/g, 'UK Guide')
            .replace(/US Edition/g, 'UK Edition')
            .replace(/USA/g, 'UK')
            .replace(/US /g, 'UK ');
    } else {
        return title
            .replace(/Tradesmen/g, 'Contractors')
            .replace(/tradesmen/g, 'contractors')
            .replace(/UK Guide/g, 'US Guide')
            .replace(/UK Edition/g, 'US Edition')
            .replace(/UK/g, 'US');
    }
}

async function surgicalCleanup() {
    console.log('--- Final Surgical Regional Cleanup ---');
    const { data: posts, error } = await supabase
        .from('posts')
        .select('*');

    if (error) return console.error(error);

    const existingSlugs = new Set(posts.map(p => p.slug));
    const toDelete = [];
    const toUpsert = [];

    posts.forEach(p => {
        const slug = p.slug.toLowerCase();
        const base = slug.replace(/-us$|-usa$|-gb$|-uk$|-us-2026$|-uk-2026$/, '');
        
        const isUKSlug = slug.endsWith('-gb') || slug.endsWith('-uk') || slug.includes('-uk-2026');
        const isUSSlug = slug.endsWith('-us') || slug.endsWith('-usa') || slug.includes('-us-2026');
        const isDefaultSlug = !isUKSlug && !isUSSlug;

        const hasUS = isUSContent(p.title, p.content);
        const hasUK = isUKContent(p.title, p.content);

        // CASE 1: UK Slug with US Content
        if (isUKSlug && hasUS && !hasUK) {
            console.log(`[MISALIGN] UK Slug [${slug}] has US content.`);
            const targetSlug = base + (slug.includes('-2026') ? '-us-2026' : '-us');
            if (!existingSlugs.has(targetSlug)) {
                console.log(` -> RESTORING to US side as [${targetSlug}]`);
                const { id, ...rest } = p;
                toUpsert.push({ ...rest, slug: targetSlug, title: localizeTitle(p.title, 'US') });
            }
            toDelete.push(p.id);
        }

        // CASE 2: US Slug with UK Content
        if (isUSSlug && hasUK && !hasUS) {
            console.log(`[MISALIGN] US Slug [${slug}] has UK content.`);
            const targetSlug = base + (slug.includes('-2026') ? '-uk-2026' : '-gb');
            if (!existingSlugs.has(targetSlug)) {
                console.log(` -> RESTORING to UK side as [${targetSlug}]`);
                const { id, ...rest } = p;
                toUpsert.push({ ...rest, slug: targetSlug, title: localizeTitle(p.title, 'GB') });
            }
            toDelete.push(p.id);
        }

        // CASE 3: Default Slug with regional content
        if (isDefaultSlug) {
            if (hasUS) {
                const targetSlug = base + '-us';
                if (!existingSlugs.has(targetSlug)) {
                    console.log(`[DEFAULT->US] Creating [${targetSlug}] from [${slug}]`);
                    const { id, ...rest } = p;
                    toUpsert.push({ ...rest, slug: targetSlug, title: localizeTitle(p.title, 'US') });
                }
                toDelete.push(p.id);
            } else if (hasUK) {
                const targetSlug = base + '-gb';
                if (!existingSlugs.has(targetSlug)) {
                    console.log(`[DEFAULT->UK] Creating [${targetSlug}] from [${slug}]`);
                    const { id, ...rest } = p;
                    toUpsert.push({ ...rest, slug: targetSlug, title: localizeTitle(p.title, 'GB') });
                }
                toDelete.push(p.id);
            }
        }
    });

    if (toUpsert.length > 0) {
        console.log(`Upserting ${toUpsert.length} corrected posts...`);
        const { error: upsertError } = await supabase.from('posts').upsert(toUpsert);
        if (upsertError) console.error('Upsert Error:', upsertError);
    }

    if (toDelete.length > 0) {
        console.log(`Deleting ${toDelete.length} misaligned posts...`);
        const { error: delError } = await supabase.from('posts').delete().in('id', toDelete);
        if (delError) console.error('Delete Error:', delError);
    }

    console.log('✅ Surgical cleanup complete.');
}

surgicalCleanup();
