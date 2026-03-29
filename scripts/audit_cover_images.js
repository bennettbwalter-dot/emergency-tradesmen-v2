
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkImages() {
    const slugs = [
        'furnace-blowing-cold-air-limit-switch-us',
        'boiler-pressure-dropping-filling-loop-gb',
        'sewage-smell-in-house-p-trap-us',
        'drain-smell-bathroom-soil-stack-gb',
        'car-wont-start-click-vs-crank-us',
        'car-wont-start-flat-battery-alternator-gb',
        'structural-cracks-foundation-repair-us',
        'structural-cracks-subsidence-survey-gb',
        'water-damage-restoration-category-mold-us',
        'water-damage-restoration-strip-out-gb'
    ];

    const { data, error } = await supabase
        .from('posts')
        .select('slug, cover_image')
        .in('slug', slugs);

    if (error) {
        console.error(error);
        return;
    }

    console.log('--- Database Cover Image Audit ---');
    data.forEach(post => {
        console.log(`Slug: ${post.slug} -> Image: ${post.cover_image}`);
    });
}

checkImages();
