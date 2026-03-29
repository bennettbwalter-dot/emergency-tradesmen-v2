import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function finalSurgicalAudit() {
    console.log('--- Final Surgical Regional Audit ---');
    const { data: posts, error } = await supabase.from('posts').select('*');
    if (error) return console.error(error);

    const report = [];

    posts.forEach(p => {
        const slug = p.slug.toLowerCase();
        const title = p.title.toLowerCase();
        
        const isUKSlug = slug.endsWith('-gb') || slug.endsWith('-uk') || slug.includes('-uk-2026');
        const isUSSlug = slug.endsWith('-us') || slug.endsWith('-usa') || slug.includes('-us-2026');

        // Check for misaligned titles
        if (isUKSlug) {
            if (title.includes('us ') || title.includes('usa') || title.includes('911') || title.includes('nyc') || title.includes('chicago')) {
                report.push(`[BAD UK TITLE] ${p.slug} | ${p.title}`);
            }
        }
        if (isUSSlug) {
            if (title.includes('uk ') || title.includes('london') || title.includes('0800') || title.includes('tradesmen')) {
                report.push(`[BAD US TITLE] ${p.slug} | ${p.title}`);
            }
        }
    });

    // Check for duplicate slugs
    const slugCounts = {};
    posts.forEach(p => {
        slugCounts[p.slug] = (slugCounts[p.slug] || 0) + 1;
    });
    Object.keys(slugCounts).forEach(slug => {
        if (slugCounts[slug] > 1) {
            report.push(`[DUPLICATE SLUG] ${slug} (Count: ${slugCounts[slug]})`);
        }
    });

    console.log(report.join('\n'));
    console.log(`\nTotal Anomalies: ${report.length}`);
}

finalSurgicalAudit();
