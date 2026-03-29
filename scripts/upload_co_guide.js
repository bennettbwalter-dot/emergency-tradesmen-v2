const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function uploadPost(filePath, postData) {
    const content = fs.readFileSync(path.resolve(process.cwd(), filePath), 'utf-8');
    const finalPost = { ...postData, content };

    console.log(`Uploading post: ${finalPost.slug}`);

    const { data, error } = await supabase
        .from('posts')
        .upsert(finalPost, { onConflict: 'slug' })
        .select();

    if (error) {
        console.error(`Error uploading ${finalPost.slug}:`, error);
    } else {
        console.log(`Successfully uploaded ${finalPost.slug}:`, data?.[0]?.id);
    }
}

async function main() {
    // UK Version
    await uploadPost('scripts/carbon_monoxide_gb.md', {
        slug: 'carbon-monoxide-gb',
        title: 'The "Silent Killer" in Your Boiler – A Friendly Guide to Staying Safe (UK)',
        excerpt: 'Is Your Boiler Secretly Making You Sick? The Invisible Threat of Carbon Monoxide and how to stay safe.',
        cover_image: '/images/blog/co-safety/silent-killer-infographic.jpg',
        published: true,
        published_at: new Date().toISOString(),
        author_id: null
    });

    // US Version
    await uploadPost('scripts/carbon_monoxide_us.md', {
        slug: 'carbon-monoxide-us',
        title: 'The Invisible Threat in Your HVAC – A Friendly Guide to Staying Safe in the USA',
        excerpt: 'Is Your Furnace Red Tagged? The Hidden Danger in Your Walls: A Guide to CO Leaks and Electrical Safety.',
        cover_image: '/blog/emergency-at-home/gas-emergency.jpg',
        published: true,
        published_at: new Date().toISOString(),
        author_id: null
    });
}

main();
