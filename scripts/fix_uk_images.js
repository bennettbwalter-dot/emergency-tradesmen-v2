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

async function fixUKImages() {
    console.log('--- Surgical Fix: UK Blog Images ---');
    const { data: posts, error } = await supabase
        .from('posts')
        .select('*')
        .or('slug.ilike.%-gb%,slug.ilike.%-uk%');

    if (error) return console.error(error);
    console.log(`Found ${posts.length} UK posts to check.`);

    const toUpsert = [];

    for (const p of posts) {
        let changed = false;
        let cover = p.cover_image;
        let content = p.content;

        const fixedCover = verifyImagePath(cover);
        if (fixedCover !== cover) {
            console.log(`[FIX COVER] ${p.slug}: ${cover} -> ${fixedCover}`);
            cover = fixedCover;
            changed = true;
        }

        const imgRegex = /!\[.*?\]\((.*?)\)/g;
        const fixedContent = content.replace(imgRegex, (match, p1) => {
            const fixed = verifyImagePath(p1);
            if (fixed !== p1) {
                console.log(`[FIX CONTENT IMG] ${p.slug}: ${p1} -> ${fixed}`);
                changed = true;
                return match.replace(p1, fixed);
            }
            return match;
        });
        content = fixedContent;

        if (changed) {
            toUpsert.push({ ...p, cover_image: cover, content });
        }
    }

    if (toUpsert.length > 0) {
        console.log(`Upserting ${toUpsert.length} fixed UK posts...`);
        const { error: upsertError } = await supabase.from('posts').upsert(toUpsert);
        if (upsertError) console.error('Upsert Error:', upsertError);
        else console.log('✅ UK Image Fix Complete.');
    } else {
        console.log('No image fixes needed for UK posts.');
    }
}

fixUKImages();
