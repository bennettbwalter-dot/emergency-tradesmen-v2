import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function deletePost() {
    const slugToDelete = 'what-to-do-if-electrics-go-off';
    console.log(`🚨 Deleting blog post with slug: ${slugToDelete}...`);

    const { error } = await supabase
        .from('posts')
        .delete()
        .eq('slug', slugToDelete);

    if (error) {
        console.error('❌ Error deleting post:', error.message);
    } else {
        console.log('✅ Successfully deleted the blog post.');
    }
}

deletePost();
