import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    const { data: posts } = await supabase
        .from('posts')
        .select('id, title, slug, content, cover_image');

    const needs = posts.filter(p => {
        const inlineImages = (p.content.match(/!\[.*?\]\(.*?\)/g) || []).length;
        const total = inlineImages + (p.cover_image ? 1 : 0);
        return total < 3;
    });

    const batch = needs.slice(0, 10);
    fs.writeFileSync('/tmp/posts_to_update.json', JSON.stringify(batch, null, 2));
    console.log(`Saved ${batch.length} posts to /tmp/posts_to_update.json`);
}

main();
