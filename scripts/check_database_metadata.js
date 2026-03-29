import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkMetadata() {
    const { data, error } = await supabase
        .from('posts')
        .select('excerpt, cover_image')
        .eq('slug', 'highway-breakdown-safety-protocols-us')
        .single();

    if (error) {
        console.error('Error fetching post metadata:', error);
    } else {
        console.log('Post Metadata:', JSON.stringify(data, null, 2));
    }
}

checkMetadata();
