import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const UK_IMAGE_MAP = {
    "ac-heat-pump-not-cooling-troubleshooting-gb": "/blog/hvac/ac-heatwave-uk.webp",
    "carbon-monoxide-gb": "/blog/boiler-emergency-call.webp",
    "5-signs-you-need-emergency-plumber-gb": "/blog/plumbing/leaking-radiator.webp",
    "electrical-fire-warning-signs-gb": "/blog/electrical-fire-warning-signs.webp"
};

async function restoreUKImages() {
    console.log('--- Emergency UK Image Restoration (V2) ---');
    
    const { data: posts, error } = await supabase.from('posts').select('id, slug, cover_image, title').ilike('slug', '%-gb%');
    if (error) return console.error(error);

    const publicDir = path.resolve(process.cwd(), 'public');

    for (const post of posts) {
        let needsFix = false;
        let finalImage = post.cover_image;

        // 1. Check if the current image exists
        if (post.cover_image) {
            const imgPath = path.join(publicDir, post.cover_image.startsWith('/') ? post.cover_image.slice(1) : post.cover_image);
            if (!fs.existsSync(imgPath)) {
                needsFix = true;
                console.log(`[MISSING] ${post.slug}: ${post.cover_image}`);
            }
        } else {
            needsFix = true;
            console.log(`[NULL] ${post.slug}`);
        }

        // 2. Try to assign a fallback if broken
        if (needsFix) {
            if (UK_IMAGE_MAP[post.slug]) {
                finalImage = UK_IMAGE_MAP[post.slug];
            } else {
                // Generic fallback logic based on trade keywords
                const t = post.title.toLowerCase();
                if (t.includes('electric')) finalImage = "/blog/electrical-fire-warning-signs.webp";
                else if (t.includes('plumb') || t.includes('leak') || t.includes('flood')) finalImage = "/blog/plumbing/leaking-radiator.webp";
                else if (t.includes('boiler') || t.includes('heat')) finalImage = "/blog/boiler-emergency-call.webp";
                else finalImage = "/blog/generated/fast-response-stopwatch.webp";
            }
            
            console.log(`  -> Restoring to: ${finalImage}`);
            await supabase.from('posts').update({ 
                cover_image: finalImage,
                // Also fix encoding in title if present
                title: post.title.replace(/ÔÇô/g, '–').replace(/ÔÇö/g, '—').replace(/ÔÇÖ/g, "'")
            }).eq('id', post.id);
        } else {
            // Even if image is fine, clean the encoding in title
            const cleanTitle = post.title.replace(/ÔÇô/g, '–').replace(/ÔÇö/g, '—').replace(/ÔÇÖ/g, "'");
            if (cleanTitle !== post.title) {
                console.log(`[CLEAN TITLE] ${post.slug}`);
                await supabase.from('posts').update({ title: cleanTitle }).eq('id', post.id);
            }
        }
    }

    console.log('✅ UK Restoration Complete.');
}

restoreUKImages();
