
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
const PUBLIC_DIR = 'c:/Users/Nick/Downloads/hitmaker-2026/emergency-tradesmen/public';

async function checkMissingImages() {
    const { data, error } = await supabase
        .from('posts')
        .select('slug, title, cover_image')
        .order('id', { ascending: true });

    if (error) {
        console.error(error);
        return;
    }

    console.log('--- MISSING IMAGES ONLY ---');
    for (const post of data) {
        const dbPath = post.cover_image;
        if (!dbPath) {
            console.log(`❌ DB_NULL: [${post.slug}] "${post.title}"`);
            continue;
        }

        if (dbPath.startsWith('http')) {
            // Let's check these too, maybe they are broken
            console.log(`⚠️ URL_PATH: [${post.slug}] -> ${dbPath}`);
            continue;
        }

        const absolutePath = path.join(PUBLIC_DIR, dbPath);
        if (!fs.existsSync(absolutePath)) {
            console.log(`❌ FILE_MISSING: [${post.slug}] "${post.title}" (Path: ${dbPath})`);
        }
    }
}

checkMissingImages();
