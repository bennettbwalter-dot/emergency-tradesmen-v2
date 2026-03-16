import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
const PUBLIC_DIR = path.resolve(process.cwd(), 'public');

function verifyImagePath(relPath) {
    if (!relPath) return null;
    const absPath = path.join(PUBLIC_DIR, relPath);
    if (fs.existsSync(absPath)) return relPath;

    // Try webp alternative
    const webpPath = relPath.replace(/\.png$|\.jpg$|\.jpeg$/, '.webp');
    if (fs.existsSync(path.join(PUBLIC_DIR, webpPath))) return webpPath;

    // Try png alternative
    const pngPath = relPath.replace(/\.webp$|\.jpg$|\.jpeg$/, '.png');
    if (fs.existsSync(path.join(PUBLIC_DIR, pngPath))) return pngPath;

    return relPath; // Fallback to original if nothing found
}

async function fixUSImages() {
    console.log('--- Surgical Fix: US Blog Images & Regionalization ---');
    const { data: posts, error } = await supabase
        .from('posts')
        .select('*');

    if (error) return console.error(error);
    
    const toUpsert = [];

    for (const p of posts) {
        const slug = p.slug.toLowerCase();
        const title = p.title.toLowerCase();
        
        // Is it US? (-us, -usa, or US Guide, or Contractors)
        const isUSExplicit = slug.endsWith('-us') || slug.endsWith('-usa') || slug.includes('-us-') || slug.includes('-usa-');
        const isUKExplicit = slug.endsWith('-gb') || slug.endsWith('-uk') || slug.includes('-gb-') || slug.includes('-uk-');
        
        const isUSContent = isUSExplicit || title.includes('(us guide)') || title.includes('usa') || title.includes('contractor') || title.includes('911');
        const isUKContent = isUKExplicit || title.includes('(uk guide)') || title.includes('london') || title.includes('tradesmen') || title.includes('0800');

        if (isUSContent && !isUKContent) {
            console.log(`Processing US Post: ${p.slug}`);
            let changed = false;
            let cover = verifyImagePath(p.cover_image);
            if (cover !== p.cover_image) {
                console.log(`  [FIX COVER] ${cover}`);
                changed = true;
            }

            let content = p.content;
            const imgRegex = /!\[.*?\]\((.*?)\)/g;
            const fixedContent = content.replace(imgRegex, (match, p1) => {
                const fixed = verifyImagePath(p1);
                if (fixed !== p1) {
                    changed = true;
                    return match.replace(p1, fixed);
                }
                return match;
            });
            content = fixedContent;

            let newSlug = p.slug;
            if (!newSlug.endsWith('-us') && !newSlug.endsWith('-usa')) {
                // Check if it ends in -2026
                if (newSlug.endsWith('-2026')) {
                    newSlug = newSlug.replace(/-2026$/, '-us-2026');
                } else {
                    newSlug = newSlug + '-us';
                }
                changed = true;
            }

            if (changed) {
                const { id, ...rest } = p;
                toUpsert.push({ ...rest, slug: newSlug, cover_image: cover, content });
            }
        }
    }

    if (toUpsert.length > 0) {
        console.log(`Upserting ${toUpsert.length} US fixed posts...`);
        // Upsert one by one to avoid constraint errors or handle them
        for (const post of toUpsert) {
            const { error: upsertError } = await supabase.from('posts').upsert(post, { onConflict: 'slug' });
            if (upsertError) console.error(`  [ERROR] ${post.slug}:`, upsertError.message);
            else console.log(`  [OK] ${post.slug}`);
        }
        console.log('✅ US Image & Region Fix Complete.');
    } else {
        console.log('No fixes needed for US posts.');
    }
}

fixUSImages();
