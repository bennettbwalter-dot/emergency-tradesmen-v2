import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function finalCleanup() {
    const slug = 'fastest-response-emergency-contractors-network-us';
    console.log(`Final cleanup for ${slug}...`);

    const { data: post, error: fetchError } = await supabase
        .from('posts')
        .select('content')
        .eq('slug', slug)
        .single();

    if (fetchError || !post) {
        console.error('Error fetching post:', fetchError);
        return;
    }

    let content = post.content;

    // Fix specific typos/remnants
    content = content
        .replace(/contractor network network/gi, 'contractor network')
        .replace(/available contractors/gi, 'available contractor')
        .replace(/bank holidays/gi, 'public holidays')
        .replace(/nationwide/gi, 'coast-to-coast')
        .replace(/US' fastest/gi, 'USA\'s fastest');

    const { error: updateError } = await supabase
        .from('posts')
        .update({ content })
        .eq('slug', slug);

    if (updateError) {
        console.error('Error updating post:', updateError);
    } else {
        console.log('Successfully cleaned up US post content.');
    }
}

finalCleanup();
