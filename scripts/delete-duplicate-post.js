
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

const DUPLICATE_ID = 'd75fef07-6c12-4754-8da6-ce033ab29fa1';

async function deletePost() {
    console.log(`Deleting post with ID: ${DUPLICATE_ID}...`);
    const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', DUPLICATE_ID);

    if (error) {
        console.error('Error deleting post:', error);
    } else {
        console.log('Successfully deleted duplicate post.');
    }
}

deletePost();
