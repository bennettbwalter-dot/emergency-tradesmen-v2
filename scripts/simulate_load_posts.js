import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function simulate() {
    const countryCode = 'US'; // Testing US

    const { data, error } = await supabase
        .from('posts')
        .select('id, title, slug, excerpt, cover_image, published_at, created_at')
        .eq('published', true)
        .order('published_at', { ascending: false });

    if (error || !data) {
        return console.error(error);
    }

    // Strict Regional Filtering: Only show posts that match the current country code suffix
    const regionalData = data.filter(post => {
        const slug = post.slug.toLowerCase();
        if (countryCode === 'US') {
            // Only US suffixes
            return slug.endsWith('-us') || slug.endsWith('-usa') || slug.includes('-us-') || slug.includes('-usa-');
        } else {
            // Only UK suffixes
            return slug.endsWith('-gb') || slug.endsWith('-uk') || slug.includes('-gb-') || slug.includes('-uk-');
        }
    });

    console.log(`Simulated loadPosts for ${countryCode}: ${regionalData.length} posts`);
    
    const ids = regionalData.map(p => p.id);
    const idCounts = {};
    ids.forEach(id => { idCounts[id] = (idCounts[id] || 0) + 1; });

    const dupeIds = Object.keys(idCounts).filter(id => idCounts[id] > 1);
    if (dupeIds.length > 0) {
        console.log('DUPLICATE IDS FOUND IN FILTERED DATA:');
        dupeIds.forEach(id => {
            const p = regionalData.find(x => x.id === id);
            console.log(`- ${id} | ${p.slug} | ${p.title} (${idCounts[id]} times)`);
        });
    } else {
        console.log('No duplicate IDs in filtered data.');
    }

    // Check for Duplicate TITLES
    const titleCounts = {};
    regionalData.forEach(p => { titleCounts[p.title] = (titleCounts[p.title] || 0) + 1; });
    const dupeTitles = Object.keys(titleCounts).filter(t => titleCounts[t] > 1);
    if (dupeTitles.length > 0) {
        console.log('\nDUPLICATE TITLES FOUND:');
        dupeTitles.forEach(t => {
            const matches = regionalData.filter(x => x.title === t);
            console.log(`- "${t}" (${titleCounts[t]} times)`);
            matches.forEach(m => console.log(`    Slug: ${m.slug} | ID: ${m.id}`));
        });
    } else {
        console.log('\nNo duplicate titles found.');
    }
}

simulate();
