import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const UPDATES = [
    {
        slug: 'blocked-drains-vs-flooded-sewers-danger-guide-gb',
        filePath: path.join(__dirname, 'expanded_drain_gb.md'),
        coverImage: '/blog/assets/sewer_backup_1.webp'
    },
    {
        slug: 'blocked-drains-vs-flooded-sewers-danger-guide-us',
        filePath: path.join(__dirname, 'expanded_drain_us.md'),
        coverImage: '/blog/assets/sewer_backup_1.webp'
    }
];

async function sync() {
    for (const update of UPDATES) {
        console.log(`Processing ${update.slug}...`);
        const content = fs.readFileSync(update.filePath, 'utf8');
        
        // Extract Title from H1
        const titleMatch = content.match(/^# (.*)/);
        const title = titleMatch ? titleMatch[1] : null;

        const { error } = await supabase
            .from('posts')
            .update({
                content,
                title: title || undefined,
                cover_image: update.coverImage,
                updated_at: new Date().toISOString()
            })
            .eq('slug', update.slug);

        if (error) {
            console.error(`Error updating ${update.slug}:`, error);
        } else {
            console.log(`Successfully updated ${update.slug}`);
        }
    }
}

sync();
