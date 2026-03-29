
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteDuplicatePosts() {
    const slugsToDelete = [
        'spring-thaw-pipe-burst-warning',
        'spring-thaw-pipe-burst-prevention'
    ];

    console.log(`Attempting to delete posts with slugs: ${slugsToDelete.join(', ')}`);

    const { data, error } = await supabase
        .from('posts')
        .delete()
        .in('slug', slugsToDelete);

    if (error) {
        console.error('Error deleting posts:', error);
        return;
    }

    console.log('Successfully deleted the duplicate/redundant posts from Supabase.');
}

deleteDuplicatePosts();
