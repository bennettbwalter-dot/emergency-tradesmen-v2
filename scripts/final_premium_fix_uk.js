import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
const PUBLIC_DIR = path.resolve(process.cwd(), 'public');

function fixPath(relPath) {
    if (!relPath) return null;
    let fixed = relPath;
    
    // Convert .png/.jpg to .webp
    fixed = fixed.replace(/\.png$|\.jpg$|\.jpeg$/, '.webp');
    
    // Ensure it exists
    if (!fs.existsSync(path.join(PUBLIC_DIR, fixed))) {
        // Fallback to original if we can't find the webp
        if (!fs.existsSync(path.join(PUBLIC_DIR, relPath))) {
            console.log(`[STILL MISSING] ${relPath}`);
            return relPath;
        }
        return relPath;
    }
    return fixed;
}

async function fixUKPremium() {
    console.log('--- Final Premium Fix: UK Region ---');
    const { data: posts, error } = await supabase.from('posts').select('*');
    if (error) return console.error(error);

    const toUpsert = [];

    posts.forEach(p => {
        const slug = p.slug.toLowerCase();
        
        // Target: UK posts OR Default posts being shown on UK site
        // A post is shown on UK if it's -gb, -uk, OR (default and no -gb exists)
        // To be safe, we'll fix ALL posts that look like they belong in the UK
        
        const isUK = slug.endsWith('-gb') || slug.endsWith('-uk') || p.title.includes('(UK') || p.title.includes('UK ') || p.title.toLowerCase().includes('tradesmen');
        const isUS = slug.endsWith('-us') || slug.endsWith('-usa') || p.title.includes('(US') || p.title.includes('USA');

        if (isUK && !isUS) {
            console.log(`Targeting UK Post: ${p.slug}`);
            let changed = false;
            let cover = fixPath(p.cover_image);
            if (cover !== p.cover_image) changed = true;

            const imgRegex = /!\[.*?\]\((.*?)\)/g;
            const content = p.content.replace(imgRegex, (match, p1) => {
                const fixed = fixPath(p1);
                if (fixed !== p1) {
                    changed = true;
                    return match.replace(p1, fixed);
                }
                return match;
            });

            let newSlug = p.slug;
            if (newSlug.endsWith('-uk')) {
                newSlug = newSlug.replace(/-uk$/, '-gb');
                changed = true;
            }
            if (!newSlug.endsWith('-gb') && !newSlug.endsWith('-us') && !newSlug.endsWith('-usa')) {
                // If it's a default slug but looks UK, make it -gb
                newSlug = newSlug + '-gb';
                changed = true;
            }

            if (changed) {
                const { id, ...rest } = p;
                toUpsert.push({ ...rest, slug: newSlug, cover_image: cover, content });
            }
        }
    });

    if (toUpsert.length > 0) {
        console.log(`Upserting ${toUpsert.length} UK posts...`);
        const { error: upsertError } = await supabase.from('posts').upsert(toUpsert);
        if (upsertError) console.error('Upsert Error:', upsertError);
        else console.log('✅ UK Premium Fix Complete.');
    } else {
        console.log('No UK posts needed fixing.');
    }
}

fixUKPremium();
