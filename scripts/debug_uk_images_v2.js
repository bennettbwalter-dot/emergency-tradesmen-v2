import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
const PUBLIC_DIR = path.resolve(process.cwd(), 'public');

async function debugUKImages() {
    console.log('--- Deep Audit: UK Blog Images ---');
    const { data: posts, error } = await supabase
        .from('posts')
        .select('slug, title, cover_image, content')
        .or('slug.ilike.%-gb%,slug.ilike.%-uk%');

    if (error) return console.error(error);

    for (const p of posts) {
        console.log(`\nPost: ${p.slug}`);
        
        // Check Cover
        if (p.cover_image) {
            const abs = path.join(PUBLIC_DIR, p.cover_image);
            const exists = fs.existsSync(abs);
            console.log(`  Cover: ${p.cover_image} | Exists: ${exists}`);
            if (!exists) {
                // Search for it
                const filename = path.basename(p.cover_image);
                console.log(`    Searching for [${filename}] in public/...`);
                // Simple search in blog and images/blog
                const searchPaths = [
                    path.join(PUBLIC_DIR, 'blog'),
                    path.join(PUBLIC_DIR, 'images', 'blog')
                ];
                let found = false;
                for (const sp of searchPaths) {
                    const results = fs.readdirSync(sp, { recursive: true }).filter(f => f.endsWith(filename));
                    if (results.length > 0) {
                        console.log(`    FOUND at: ${path.join(sp, results[0])}`);
                        found = true;
                    }
                }
                if (!found) console.log(`    NOT FOUND ANYWHERE.`);
            }
        } else {
            console.log('  Cover: MISSING');
        }
    }
}

debugUKImages();
