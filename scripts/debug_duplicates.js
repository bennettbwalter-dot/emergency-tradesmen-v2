import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function debug() {
    const { data, error } = await supabase.from('posts').select('id, slug, title, published').eq('published', true);
    if (error) return console.error(error);

    const usData = data.filter(p => {
        const s = p.slug.toLowerCase();
        return s.endsWith('-us') || s.endsWith('-usa') || s.includes('-us-') || s.includes('-usa-');
    });

    console.log(`Found ${usData.length} published US posts:`);
    usData.sort((a,b) => a.title.localeCompare(b.title));
    usData.forEach(p => {
        console.log(`ID: ${p.id} | Slug: ${p.slug} | Title: ${p.title}`);
    });

    // Check for title duplicates
    const counts = {};
    usData.forEach(p => {
        counts[p.title] = (counts[p.title] || 0) + 1;
    });

    const dupes = Object.keys(counts).filter(t => counts[t] > 1);
    if (dupes.length > 0) {
        console.log('\nDUPLICATE TITLES FOUND:');
        dupes.forEach(t => console.log(`- "${t}" (${counts[t]} times)`));
    } else {
        console.log('\nNo duplicate titles found among published US posts.');
    }
}

debug();
