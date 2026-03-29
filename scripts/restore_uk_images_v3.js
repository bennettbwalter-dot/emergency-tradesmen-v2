import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const DEFINITIVE_UK_IMAGE_MAP = {
    "electrical-fire-warning-signs-gb": "/blog/emergency-at-home/electrical-fire.webp",
    "ac-heatwave-preparation-signs-repair-uk-2026-gb": "/blog/hvac/ac-heatwave-uk.webp",
    "car-wont-start-flat-battery-alternator-gb": "/blog/auto/frosty-car.webp",
    "drain-smell-bathroom-soil-stack-gb": "/blog/plumbing/soil-stack.webp",
    "sunday-emergency-plumber-fees-uk-2026-gb": "/blog/plumber/ceiling-leak.webp",
    "carbon-monoxide-gb": "/blog/boiler-emergency-call.webp",
    "5-signs-you-need-emergency-plumber-gb": "/blog/plumbing/leaking-radiator.webp",
    "shattered-windows-high-winds-board-up-glazing-guide-gb": "/blog/windows/storm-shattered-window.webp"
};

async function restoreUKImagesDefinitive() {
    console.log('--- DEFINITIVE UK Image Restoration (V3) ---');
    
    // Fetch only UK posts
    const { data: posts, error } = await supabase.from('posts').select('id, slug, cover_image, title, content').ilike('slug', '%-gb%');
    if (error) return console.error(error);

    const publicDir = path.resolve(process.cwd(), 'public');

    for (const post of posts) {
        let needsUpdate = false;
        let finalImage = post.cover_image;

        // 1. Mandatory mapping for specific ones
        if (DEFINITIVE_UK_IMAGE_MAP[post.slug]) {
            if (post.cover_image !== DEFINITIVE_UK_IMAGE_MAP[post.slug]) {
                finalImage = DEFINITIVE_UK_IMAGE_MAP[post.slug];
                needsUpdate = true;
                console.log(`[MAP] ${post.slug} -> ${finalImage}`);
            }
        }

        // 2. Verified check for current image if not mapped
        if (!needsUpdate && post.cover_image) {
            const imgPath = path.join(publicDir, post.cover_image.startsWith('/') ? post.cover_image.slice(1) : post.cover_image);
            if (!fs.existsSync(imgPath)) {
                console.log(`[MISSING] ${post.slug}: ${post.cover_image}`);
                // Generic fallback logic
                const t = post.title.toLowerCase();
                if (t.includes('electric')) finalImage = "/blog/emergency-at-home/electrical-fire.webp";
                else if (t.includes('plumb') || t.includes('leak') || t.includes('flood')) finalImage = "/blog/plumbing/leaking-radiator.webp";
                else if (t.includes('boiler') || t.includes('heat')) finalImage = "/blog/boiler-emergency-call.webp";
                else finalImage = "/images/blog/generated/fast-response-stopwatch.webp";
                
                needsUpdate = true;
                console.log(`  -> Restoring fallback: ${finalImage}`);
            }
        } else if (!post.cover_image) {
            // Null case
            const t = post.title.toLowerCase();
            if (t.includes('electric')) finalImage = "/blog/emergency-at-home/electrical-fire.webp";
            else if (t.includes('plumb') || t.includes('leak') || t.includes('flood')) finalImage = "/blog/plumbing/leaking-radiator.webp";
            else if (t.includes('boiler') || t.includes('heat')) finalImage = "/blog/boiler-emergency-call.webp";
            else finalImage = "/images/blog/generated/fast-response-stopwatch.webp";
            
            needsUpdate = true;
            console.log(`[NULL] ${post.slug} -> Restoring fallback: ${finalImage}`);
        }

        // 3. Clean encoding in title and content
        const cleanTitle = post.title.replace(/ÔÇô/g, '–').replace(/ÔÇö/g, '—').replace(/ÔÇÖ/g, "'").replace(/DonÔÇÖt/g, "Don't");
        const cleanContent = post.content ? post.content.replace(/ÔÇô/g, '–').replace(/ÔÇö/g, '—').replace(/ÔÇÖ/g, "'").replace(/DonÔÇÖt/g, "Don't") : null;

        if (cleanTitle !== post.title || (post.content && cleanContent !== post.content)) {
            needsUpdate = true;
            console.log(`[CLEAN ENCODING] ${post.slug}`);
        }

        if (needsUpdate) {
            const updateObj = {
                cover_image: finalImage,
                title: cleanTitle
            };
            if (cleanContent) updateObj.content = cleanContent;

            const { error: updateError } = await supabase.from('posts').update(updateObj).eq('id', post.id);
            if (updateError) console.error(`Error updating ${post.slug}:`, updateError);
        }
    }

    console.log('✅ Definitive UK Restoration Complete.');
}

restoreUKImagesDefinitive();
