
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteSecondPost() {
    const id = '3f769b56-9d57-4b73-885a-732cf2d1788a';
    console.log(`Deleting post with ID: ${id}`);

    const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting post:', error);
    } else {
        console.log('Successfully deleted the second post.');
    }
}

deleteSecondPost();
