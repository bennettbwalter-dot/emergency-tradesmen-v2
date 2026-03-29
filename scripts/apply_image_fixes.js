import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
const publicDir = path.resolve(process.cwd(), 'public');

function exists(testP) {
    if (!testP) return false;
    let cleanSrc = testP.split(' ')[0].replace(/^"|"$/g, '');
    const rel = cleanSrc.startsWith('/') ? cleanSrc.substring(1) : cleanSrc;
    const abs = path.join(publicDir, rel);
    return fs.existsSync(abs);
}

function getFixedPath(p) {
    if (!p) return p;
    
    // Handle markdown title/alt part
    const parts = p.split(' ');
    let cleanSrc = parts[0].replace(/^"|"$/g, '');
    const titlePart = parts.slice(1).join(' ');

    if (exists(cleanSrc)) return p;
    
    const visited = new Set([cleanSrc]);
    const queue = [cleanSrc];
    
    const swaps = [
        ['contractor', 'tradesman'],
        ['contractors', 'tradesmen'],
        ['tradesman', 'contractor'],
        ['tradesmen', 'contractors'],
        ['plumber-boiler-check-logo', 'boiler-check-logo'],
        ['plumber-furnace-check-logo', 'boiler-check-logo'],
        ['HVAC-frozen-fix', 'boiler-frozen-fix'],
        ['furnace-upgrade-2026', 'boiler-upgrade-2026'],
        ['reliable-contractors', 'reliable-tradesmen'],
        ['furnace-vs-heatpump-blueprint', 'boiler-vs-heatpump-blueprint'],
        ['furnace', 'boiler'] // Filename level
    ];
    
    let i = 0;
    while (queue.length > 0 && i < 300) {
        i++;
        const current = queue.shift();
        
        // 1. Swaps
        for (const [from, to] of swaps) {
            if (current.includes(from)) {
                const v = current.replace(from, to);
                if (!visited.has(v)) {
                    if (exists(v)) return v + (titlePart ? ' ' + titlePart : '');
                    visited.add(v);
                    queue.push(v);
                }
            }
        }

        // 2. Extensions
        const b = current.replace(/\.[^.]+$/, '');
        for (const ext of ['.webp', '.png', '.jpg', '.jpeg']) {
            const v = b + ext;
            if (!visited.has(v)) {
                if (exists(v)) return v + (titlePart ? ' ' + titlePart : '');
                visited.add(v);
                queue.push(v);
            }
        }
        
        // 3. Directory shifts
        if (current.startsWith('/blog/')) {
            const v = '/images' + current;
            if (!visited.has(v)) {
                if (exists(v)) return v + (titlePart ? ' ' + titlePart : '');
                visited.add(v);
                queue.push(v);
            }
        } else if (current.startsWith('/images/blog/')) {
            const v = current.replace('/images/blog/', '/blog/');
            if (!visited.has(v)) {
                if (exists(v)) return v + (titlePart ? ' ' + titlePart : '');
                visited.add(v);
                queue.push(v);
            }
        }
    }

    return null; // No fix found
}

async function run() {
    console.log('--- Applying Supabase Image Fixes ---');
    const { data: dbPosts, error } = await supabase.from('posts').select('*');
    if (error) {
        console.error('Error fetching posts:', error);
        return;
    }

    for (const post of dbPosts) {
        let changed = false;
        let newCover = post.cover_image;
        let newContent = post.content;

        // Fix cover image
        const fixedCover = getFixedPath(post.cover_image);
        if (fixedCover && fixedCover !== post.cover_image) {
            console.log(`[FIX COVER] ${post.slug}: ${post.cover_image} -> ${fixedCover}`);
            newCover = fixedCover;
            changed = true;
        }

        // Fix content images
        const imgRegex = /!\[.*?\]\((.*?)\)/g;
        newContent = post.content.replace(imgRegex, (match, src) => {
            if (src.startsWith('http')) return match;
            const fixed = getFixedPath(src);
            if (fixed && fixed !== src) {
                console.log(`[FIX CONTENT] ${post.slug}: ${src} -> ${fixed}`);
                changed = true;
                return match.replace(src, fixed);
            }
            return match;
        });

        if (changed) {
            console.log(`Updating post ${post.slug}...`);
            const { error: updateError } = await supabase
                .from('posts')
                .update({ cover_image: newCover, content: newContent })
                .eq('id', post.id);
            
            if (updateError) {
                console.error(`Error updating post ${post.slug}:`, updateError);
            } else {
                console.log(`Successfully updated ${post.slug}`);
            }
        }
    }
    console.log('--- Finished Image Fix ---');
}

run();
