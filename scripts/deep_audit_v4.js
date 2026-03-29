import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const US_KEYWORDS = [
    'chicago', 'new york', 'nyc', 'los angeles', 'miami', '911', '9-1-1', 'hvac', 'furnace', 
    'us homeowner', 'usa', 'federal', 'state laws', 'contractor', 'f-gas', 'freon', 'epa'
];

const UK_KEYWORDS = [
    'london', 'manchester', 'birmingham', 'uk homeowner', '0800', 'tradesmen', 'boiler', 
    'gas safe', 'ciphe', 'niceic', 'british standard', 'stopcock', 'consumer unit'
];

async function deepAudit() {
    console.log('--- Deep Regional Audit ---');
    const { data: posts, error } = await supabase.from('posts').select('*');
    if (error) return console.error(error);

    let leaks = 0;
    const report = [];

    posts.forEach(p => {
        const slug = p.slug.toLowerCase();
        const content = (p.title + ' ' + (p.content || '')).toLowerCase();
        
        const isUSSlug = slug.endsWith('-us') || slug.endsWith('-usa') || slug.includes('-us-2026');
        const isUKSlug = slug.endsWith('-gb') || slug.endsWith('-uk') || slug.includes('-uk-2026');
        const isDefault = !isUSSlug && !isUKSlug;

        const hasUS = US_KEYWORDS.some(k => content.includes(k.toLowerCase()));
        const hasUK = UK_KEYWORDS.some(k => content.includes(k.toLowerCase()));

        let issue = null;
        if (isUKSlug && hasUS && !hasUK) issue = 'UK Slug but US Content';
        if (isUSSlug && hasUK && !hasUS) issue = 'US Slug but UK Content';
        if (isDefault && (hasUS || hasUK)) issue = `Default Slug with ${hasUS ? 'US' : 'UK'} Content`;

        if (issue) {
            leaks++;
            report.push(`[${issue}] ${p.slug} | ${p.title}`);
        }
    });

    console.log(report.join('\n'));
    console.log(`\nTotal Anomalies Found: ${leaks}`);
}

deepAudit();
