import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPostContent() {
    const { data, error } = await supabase
        .from('posts')
        .select('content')
        .eq('slug', 'highway-breakdown-safety-protocols-us')
        .single();

    if (error) {
        console.error('Error fetching post content:', error);
    } else {
        console.log('Post content contains "Driver waving white cloth":', data.content.includes('Driver waving white cloth'));
        console.log('Post content contains "Driver activating hazard lights":', data.content.includes('Driver activating hazard lights'));
    }
}

checkPostContent();
