
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Deleting the one from the standalone script which triggered the duplication
// Slug: 5-signs-you-need-emergency-plumber-immediately
const DUPLICATE_SLUG = '5-signs-you-need-emergency-plumber-immediately';

async function deletePost() {
    console.log(`Deleting post with slug: ${DUPLICATE_SLUG}...`);
    const { error } = await supabase
        .from('posts')
        .delete()
        .eq('slug', DUPLICATE_SLUG);

    if (error) {
        console.error('Error deleting post:', error);
    } else {
        console.log('Successfully deleted duplicate post.');
    }
}

deletePost();
