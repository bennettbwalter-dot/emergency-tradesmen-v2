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
    if (fs.existsSync(path.join(PUBLIC_DIR, fixed))) {
        return fixed;
    }
    
    // Check if it's already a webp that doesn't exist? Try to find it.
    if (!fs.existsSync(path.join(PUBLIC_DIR, relPath))) {
        const filename = path.basename(relPath);
        // Look in blog and images/blog
        const searchDirs = [
            path.join(PUBLIC_DIR, 'blog'),
            path.join(PUBLIC_DIR, 'images', 'blog')
        ];
        for (const sd of searchDirs) {
            if (fs.existsSync(sd)) {
                const results = fs.readdirSync(sd, { recursive: true }).filter(f => f.toLowerCase().endsWith(filename.toLowerCase()) || f.toLowerCase().endsWith(filename.replace(/\..*$/, '.webp').toLowerCase()));
                if (results.length > 0) {
                    const found = path.join(sd, results[0]).replace(PUBLIC_DIR, '').replace(/\\/g, '/');
                    return found;
                }
            }
        }
    }

    return relPath;
}

async function fixFinal() {
    console.log('--- Final Surgical Image Fix (Non-Destructive) ---');
    const { data: posts, error } = await supabase.from('posts').select('*');
    if (error) return console.error(error);

    const toUpsert = [];

    for (const p of posts) {
        const slug = p.slug.toLowerCase();
        const isUK = slug.endsWith('-gb') || slug.endsWith('-uk') || p.title.toLowerCase().includes('tradesmen') || p.title.toLowerCase().includes('(uk guide)') || slug === 'shattered-windows-high-winds-board-up-glazing-guide';
        const isUS = slug.endsWith('-us') || slug.endsWith('-usa') || p.title.toLowerCase().includes('contractors') || p.title.toLowerCase().includes('(us guide)');

        if (isUK && !isUS) {
            console.log(`Processing UK Post: ${p.slug}`);
            let cover = fixPath(p.cover_image);
            let content = p.content;

            const imgRegex = /!\[.*?\]\((.*?)\)/g;
            content = content.replace(imgRegex, (match, p1) => {
                const fixed = fixPath(p1);
                return match.replace(p1, fixed);
            });

            let newSlug = p.slug;
            if (newSlug.endsWith('-uk')) newSlug = newSlug.replace(/-uk$/, '-gb');
            if (!newSlug.endsWith('-gb') && !newSlug.endsWith('-us')) newSlug = newSlug + '-gb';

            toUpsert.push({
                ...p,
                id: undefined, // Create NEW record if slug changed, else update
                slug: newSlug,
                cover_image: cover,
                content: content,
                title: p.title.replace(/Contractors/g, 'Tradesmen').replace(/contractors/g, 'tradesmen'),
                published: true
            });
        }
    }

    if (toUpsert.length > 0) {
        console.log(`Upserting ${toUpsert.length} UK posts...`);
        // We do it one by one to avoid constraint errors if possible or handle them
        for (const post of toUpsert) {
            const { error: upError } = await supabase.from('posts').upsert(post, { onConflict: 'slug' });
            if (upError) console.error(`Error with ${post.slug}:`, upError.message);
            else console.log(`✅ Success: ${post.slug}`);
        }
    }
}

fixFinal();
