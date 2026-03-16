import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const PUBLIC_DIR = path.resolve(process.cwd(), 'public');

function checkFile(relPath) {
    if (!relPath) return null;
    const absPath = path.join(PUBLIC_DIR, relPath);
    if (fs.existsSync(absPath)) return relPath;
    
    // Try alternates
    const alternates = [
        relPath.replace(/\.png$|\.jpg$|\.jpeg$/, '.webp'),
        relPath.replace(/\.webp$|\.jpg$|\.jpeg$/, '.png'),
        relPath.replace(/^\/blog\//, '/images/blog/'),
        relPath.replace(/^\/images\/blog\//, '/blog/')
    ];

    for (const alt of alternates) {
        if (fs.existsSync(path.join(PUBLIC_DIR, alt))) return alt;
    }

    return null;
}

async function fixAllPosts() {
    console.log('--- Deep Fix & Global Audit ---');
    const { data: posts, error } = await supabase.from('posts').select('*');
    if (error) return console.error(error);

    const toUpsert = [];

    for (const p of posts) {
        let changed = false;
        let cover = p.cover_image;
        let content = p.content;
        let slug = p.slug;

        // 1. Fix Cover Image
        const verifiedCover = checkFile(cover);
        if (verifiedCover && verifiedCover !== cover) {
            console.log(`[FIX COVER] ${slug}: ${cover} -> ${verifiedCover}`);
            cover = verifiedCover;
            changed = true;
        } else if (!verifiedCover && cover) {
            console.warn(`[MISSING COVER] ${slug}: ${cover}`);
        }

        // 2. Fix Internal Images in Markdown
        const imgRegex = /!\[.*?\]\((.*?)\)/g;
        let match;
        const newContent = content.replace(imgRegex, (match, p1) => {
            const verified = checkFile(p1);
            if (verified && verified !== p1) {
                console.log(`[FIX CONTENT IMG] ${slug}: ${p1} -> ${verified}`);
                changed = true;
                return match.replace(p1, verified);
            }
            return match;
        });
        content = newContent;

        // 3. Fix Slugs (Standardize)
        // Convert -uk to -gb for consistency
        if (slug.endsWith('-uk')) {
            slug = slug.replace(/-uk$/, '-gb');
            changed = true;
        }
        if (slug.includes('-uk-2026')) {
            slug = slug.replace(/-uk-2026$/, '-gb'); // Moving away from -2026 for now or just -gb?
            changed = true;
        }
        if (slug.includes('-us-2026')) {
            slug = slug.replace(/-us-2026$/, '-us');
            changed = true;
        }

        if (changed) {
            const { id, ...rest } = p;
            toUpsert.push({ ...rest, slug, cover_image: cover, content });
        }
    }

    if (toUpsert.length > 0) {
        console.log(`Updating ${toUpsert.length} posts...`);
        const { error: upError } = await supabase.from('posts').upsert(toUpsert);
        if (upError) console.error('Upsert Error:', upError);
        else console.log('✅ Global fix complete.');
    } else {
        console.log('No fixes needed.');
    }
}

fixAllPosts();
