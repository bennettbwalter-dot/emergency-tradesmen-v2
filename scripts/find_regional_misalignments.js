import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function findDupes() {
    console.log('--- Searching for Identical Titles and Misaligned Content ---');
    const { data: posts, error } = await supabase
        .from('posts')
        .select('slug, title')
        .eq('published', true);

    if (error) {
        console.error(error);
        return;
    }

    // Group by title to find duplicates
    const titleMap = {};
    posts.forEach(p => {
        if (!titleMap[p.title]) titleMap[p.title] = [];
        titleMap[p.title].push(p.slug);
    });

    console.log('\n--- Duplicate Titles ---');
    Object.keys(titleMap).forEach(title => {
        if (titleMap[title].length > 1) {
            console.log(`Title: ${title}`);
            console.log(`Slugs: ${titleMap[title].join(', ')}`);
        }
    });

    console.log('\n--- US-Centric Items likely appearing on UK Site ---');
    posts.forEach(p => {
        const slug = p.slug.toLowerCase();
        const title = p.title.toLowerCase();
        const isUSSlug = slug.endsWith('-us') || slug.endsWith('-usa') || slug.includes('-us-2026');
        const isUKSlug = slug.endsWith('-gb') || slug.endsWith('-uk') || slug.includes('-uk-2026');
        const isDefaultSlug = !isUSSlug && !isUKSlug;

        const hasUSKeywords = title.includes('us guide') || title.includes('us edition') || title.includes('911') || title.includes('usa') || title.includes('chicago') || title.includes('nyc') || title.includes('us homeowner') || title.includes('us driver');
        const hasFurnace = title.includes('furnace') && !title.includes('boiler');

        if ((isUKSlug || isDefaultSlug) && (hasUSKeywords || hasFurnace)) {
             console.log(`ILLEGAL: [${p.slug}] ${p.title}`);
        }
    });
}

findDupes();
