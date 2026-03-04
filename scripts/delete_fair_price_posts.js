import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const slugs = [
    'emergency-trade-fair-price-calculator-2026-gb',
    'emergency-trade-fair-price-calculator-2026-us'
];

async function deletePosts() {
    for (const slug of slugs) {
        const { error } = await supabase.from('posts').delete().eq('slug', slug);
        if (error) console.error(`Error deleting ${slug}:`, error);
        else console.log(`Deleted: ${slug}`);
    }
}

deletePosts();
