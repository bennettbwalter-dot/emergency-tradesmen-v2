import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function inspectPost(slug) {
    console.log(`Inspecting post: ${slug}`);
    const { data, error } = await supabase
        .from('posts')
        .select('content')
        .eq('slug', slug)
        .single();
    
    if (error) {
        console.error('Error:', error);
        return;
    }
    
    console.log('--- CONTENT START ---');
    // Look specifically for the Amazon link part
    const amazonPart = data.content.match(/\[Order Yours Now.*?\]\(.*?\)/s);
    if (amazonPart) {
        console.log('Found Amazon Link Line:', amazonPart[0]);
    } else {
        console.log('Amazon link match failed. Search for broken brackets:');
        const brokenPart = data.content.match(/\[Order Yours Now.*/);
        if (brokenPart) console.log(brokenPart[0].substring(0, 500));
    }
    console.log('--- CONTENT END ---');
}

inspectPost('toilet-wont-stop-running-2026-fix-gb');
