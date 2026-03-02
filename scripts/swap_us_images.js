import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function swapUSImages() {
    console.log('Swapping URL image references for US blog posts...');
    const { data: posts, error } = await supabase
        .from('posts')
        .select('id, slug, content')
        .ilike('slug', '%-us');

    if (error) {
        console.error('Error fetching posts:', error);
        return;
    }

    const imageMap = {
        '/blog/boiler/pressure-gauge.png': '/blog/generated/us-hvac-system.webp',
        '/blog/boiler-frozen-fix/pouring-hot-water.jpg': '/blog/generated/us-hvac-system.webp',
        '/blog/electrical-protocol-fusebox.png': '/blog/generated/us-breaker-panel.webp',
        '/blog/emergency-at-home/gas-emergency.jpg': '/blog/generated/us-gas-meter.webp',
        '/blog/gas-leak/meter-shutoff.png': '/blog/generated/us-gas-meter.webp',
    };

    for (const post of posts) {
        let content = post.content || '';
        let changed = false;

        for (const [oldImg, newImg] of Object.entries(imageMap)) {
            if (content.includes(oldImg)) {
                content = content.split(oldImg).join(newImg);
                changed = true;
                console.log(`Matching ${oldImg} -> ${newImg} in ${post.slug}`);
            }
        }

        if (changed) {
            console.log(`Updating ${post.slug}...`);
            const { error: updateError } = await supabase
                .from('posts')
                .update({ content })
                .eq('id', post.id);

            if (updateError) {
                console.error(`Error updating ${post.slug}:`, updateError);
            } else {
                console.log(`Successfully updated images for ${post.slug}`);
            }
        }
    }
}

swapUSImages();
