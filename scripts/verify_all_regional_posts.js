import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const targetSlugs = [
    // Batch 1 & 2 (Water, Power, Drains)
    'water-leaking-through-ceiling-first-steps-gb',
    'water-leaking-through-ceiling-first-steps-us',
    'domestic-electrical-interruption-protocol-gb',
    'domestic-electrical-interruption-protocol-us',
    'blocked-drains-vs-flooded-sewers-danger-guide-gb',
    'blocked-drains-vs-flooded-sewers-danger-guide-us',

    // Batch 3 (Locked Out, Roof, Gas)
    'emergency-locksmith-guide-gb',
    'emergency-locksmith-guide-us',
    'emergency-roof-leak-tarping-gb',
    'emergency-roof-leak-tarping-us',
    'smell-gas-what-to-do-safety-protocol-gb',
    'smell-gas-what-to-do-safety-protocol-us',

    // Batch 4 (Boiler, Sewage, Boarding)
    'furnace-blowing-cold-air-limit-switch-us',
    'boiler-pressure-dropping-filling-loop-gb',
    'sewage-smell-in-house-p-trap-us',
    'drain-smell-bathroom-soil-stack-gb',
    'emergency-boarding-up-plywood-us',
    'emergency-boarding-up-glazing-gb',

    // Batch 5 (Car, Cracks, Water)
    'car-wont-start-click-vs-crank-us',
    'car-wont-start-flat-battery-alternator-gb',
    'structural-cracks-foundation-repair-us',
    'structural-cracks-subsidence-survey-gb',
    'water-damage-restoration-category-mold-us',
    'water-damage-restoration-strip-out-gb',

    // Batch 6 (AC, Emergency, Signs)
    'ac-blowing-warm-air-capacitor-leak-us',
    'ac-heat-pump-not-cooling-troubleshooting-gb',
    'home-emergency-shut-off-protocol-us',
    'home-emergency-stopcock-fusebox-gb',
    '5-signs-emergency-plumber-needed-us',
    '5-signs-emergency-plumber-needed-gb'
];

async function verifyAllRegional() {
    console.log('--- Verifying All Regional Posts (Batches 1-6) ---');

    // Fetch all posts in one go
    const { data: posts, error } = await supabase
        .from('posts')
        .select('title, slug, content')
        .in('slug', targetSlugs);

    if (error) {
        console.error('Error fetching posts:', error);
        return;
    }

    if (!posts || posts.length === 0) {
        console.error('No posts found matching the slugs!');
        return;
    }

    let totalWords = 0;
    const foundSlugs = posts.map(p => p.slug);
    const missingSlugs = targetSlugs.filter(s => !foundSlugs.includes(s));

    posts.forEach(post => {
        const wordCount = post.content.split(/\s+/).length;
        totalWords += wordCount;
        console.log(`Title: ${post.title}`);
        console.log(`Slug: ${post.slug}`);
        console.log(`Word Count: ${wordCount}`);
        console.log('------------------------');
    });

    if (missingSlugs.length > 0) {
        console.error('⚠️ MISSING SLUGS:', missingSlugs);
    } else {
        console.log(`✅ All ${targetSlugs.length} Regional Slugs Found.`);
    }

    console.log(`Total Words Across ${posts.length} Posts: ${totalWords}`);
    console.log(`Average Word Count: ${Math.round(totalWords / posts.length)}`);
}

verifyAllRegional();
