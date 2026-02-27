import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixTimestamps() {
    console.log('Fetching posts with null published_at...');
    const { data: posts, error } = await supabase
        .from('posts')
        .select('id, created_at, title, slug')
        .is('published_at', null);

    if (error) {
        console.error('Error fetching posts:', error.message);
        return;
    }

    console.log(`Found ${posts?.length || 0} posts with null published_at.`);

    if (posts && posts.length > 0) {
        for (const post of posts) {
            console.log(`Updating ${post.slug}...`);
            const { error: updateError } = await supabase
                .from('posts')
                .update({ published_at: post.created_at })
                .eq('id', post.id);

            if (updateError) {
                console.error(`Error updating ${post.slug}:`, updateError.message);
            } else {
                console.log(`Fixed ${post.slug}`);
            }
        }
    }

    // Finally, ensure the new posts have a very fresh timestamp
    const now = new Date().toISOString();
    console.log('Ensuring new posts have the latest timestamp...');
    const { error: finalError } = await supabase
        .from('posts')
        .update({ published_at: now })
        .in('slug', ['blocked-drain-pest-ingress-gb', 'blocked-drain-pest-ingress-us']);

    if (finalError) {
        console.error('Error updating final timestamps:', finalError.message);
    } else {
        console.log('New posts timestamps updated to now.');
    }
}

fixTimestamps();
