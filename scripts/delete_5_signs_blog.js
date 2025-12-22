import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const SLUG_TO_DELETE = '5-signs-you-need-emergency-plumber-immediately';

async function deletePost() {
    console.log(`Attempting to delete post with slug: ${SLUG_TO_DELETE}`);

    const { data, error } = await supabase
        .from('posts')
        .delete()
        .eq('slug', SLUG_TO_DELETE)
        .select();

    if (error) {
        console.error('Error deleting post:', error);
    } else {
        if (data && data.length > 0) {
            console.log('Successfully deleted post:', data[0].title);
        } else {
            console.log('No post found with that slug to delete.');
        }
    }
}

deletePost();
