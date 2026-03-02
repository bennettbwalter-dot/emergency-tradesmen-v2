import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function regionalizeUSBlogs() {
    console.log('Starting full regionalization of US blog posts...');
    const { data: posts, error } = await supabase
        .from('posts')
        .select('id, slug, content')
        .ilike('slug', '%-us');

    if (error) {
        console.error('Error fetching posts:', error);
        return;
    }

    const replacements = [
        { find: /Tradesmen/g, replace: 'Contractors' },
        { find: /tradespeople/g, replace: 'contractors' },
        { find: /Gas Safe/g, replace: 'State Licensed' },
        { find: /NICEIC/g, replace: 'Licensed' },
        { find: /£/g, replace: '$' },
        { find: /vetted-pro-badge\.webp/g, replace: 'us-certification-badge.webp' },
        // Handle Boilers in US context
        { find: /boiler repair/gi, replace: 'HVAC and heating repair' },
        { find: /boiler/gi, replace: 'HVAC' }
    ];

    for (const post of posts) {
        let content = post.content;
        let changed = false;

        replacements.forEach(r => {
            if (content.match(r.find)) {
                content = content.replace(r.find, r.replace);
                changed = true;
            }
        });

        if (changed) {
            console.log(`Updating ${post.slug}...`);
            const { error: updateError } = await supabase
                .from('posts')
                .update({ content })
                .eq('id', post.id);

            if (updateError) {
                console.error(`Error updating ${post.slug}:`, updateError);
            } else {
                console.log(`Successfully regionalized ${post.slug}`);
            }
        }
    }
}

regionalizeUSBlogs();
