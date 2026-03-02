import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function deduplicateAndFix() {
    const slugs = [
        'fastest-response-emergency-tradesmen-network-gb',
        'fastest-response-emergency-contractors-network-us'
    ];

    for (const slug of slugs) {
        console.log(`Processing ${slug}...`);
        const { data: post, error: fetchError } = await supabase
            .from('posts')
            .select('content')
            .eq('slug', slug)
            .single();

        if (fetchError || !post) {
            console.error(`Error fetching ${slug}:`, fetchError);
            continue;
        }

        let content = post.content;

        // Remove the first markdown image if it appears at the start of the content
        // The pattern matches: ![alt](/blog/generated/fast-response-stopwatch.webp)\n*caption*\n\n
        const imagePattern = /!\[.*?\]\(\/blog\/generated\/fast-response-stopwatch\.webp\)\s*\n\*.*?\*\s*\n\n/g;

        if (content.match(imagePattern)) {
            console.log(`Found duplicate image in ${slug}, removing...`);
            content = content.replace(imagePattern, '');

            const { error: updateError } = await supabase
                .from('posts')
                .update({ content })
                .eq('slug', slug);

            if (updateError) {
                console.error(`Error updating ${slug}:`, updateError);
            } else {
                console.log(`Successfully deduplicated ${slug}`);
            }
        } else {
            console.log(`No duplicate image found in ${slug}`);
        }
    }
}

deduplicateAndFix();
