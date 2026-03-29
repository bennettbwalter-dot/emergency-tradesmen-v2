import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function globalSwapUSImages() {
    console.log('Swapping URL image references (incl. cover_image) for US blog posts...');
    const { data: posts, error } = await supabase
        .from('posts')
        .select('id, slug, content, cover_image')
        .ilike('slug', '%-us');

    if (error) {
        console.error('Error fetching posts:', error);
        return;
    }

    const imageMap = {
        '/blog/boiler/pressure-gauge.png': '/images/blog/generated/us-hvac-system.webp',
        '/blog/boiler-frozen-fix/pouring-hot-water.jpg': '/images/blog/generated/us-hvac-system.webp',
        '/blog/electrical-protocol-fusebox.png': '/images/blog/generated/us-breaker-panel.webp',
        '/blog/emergency-at-home/gas-emergency.jpg': '/images/blog/generated/us-gas-meter.webp',
        '/blog/gas-leak/meter-shutoff.png': '/images/blog/generated/us-gas-meter.webp',
        '/blog/electrical/warm-outlet.jpg': '/blog/electrical/warm-outlet.jpg', // No change but tracked
    };

    for (const post of posts) {
        let content = post.content || '';
        let cover_image = post.cover_image || '';
        let changed = false;

        for (const [oldImg, newImg] of Object.entries(imageMap)) {
            if (content.includes(oldImg)) {
                content = content.split(oldImg).join(newImg);
                changed = true;
                console.log(`Content match ${oldImg} -> ${newImg} in ${post.slug}`);
            }
            if (cover_image === oldImg || cover_image.includes(oldImg)) {
                cover_image = cover_image.replace(oldImg, newImg);
                changed = true;
                console.log(`Cover image match ${oldImg} -> ${newImg} in ${post.slug}`);
            }
        }

        if (changed) {
            console.log(`Updating ${post.slug}...`);
            const { error: updateError } = await supabase
                .from('posts')
                .update({ content, cover_image })
                .eq('id', post.id);

            if (updateError) {
                console.error(`Error updating ${post.slug}:`, updateError);
            } else {
                console.log(`Successfully updated images for ${post.slug}`);
            }
        }
    }
}

globalSwapUSImages();
