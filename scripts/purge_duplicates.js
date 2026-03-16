import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function purgeDuplicates() {
    console.log('--- Purging Duplicate Slugs ---');
    const { data: posts, error } = await supabase.from('posts').select('id, slug, created_at').order('created_at', { ascending: false });
    if (error) return console.error(error);

    const seen = new Set();
    const toDelete = [];

    posts.forEach(p => {
        if (seen.has(p.slug)) {
            toDelete.push(p.id);
        } else {
            seen.add(p.slug);
        }
    });

    if (toDelete.length > 0) {
        console.log(`Deleting ${toDelete.length} duplicates...`);
        const { error: delError } = await supabase.from('posts').delete().in('id', toDelete);
        if (delError) console.error('Delete Error:', delError);
        else console.log('✅ Duplicates purged.');
    } else {
        console.log('No duplicates found.');
    }
}

purgeDuplicates();
