import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function finalScrubDay39() {
    console.log('--- Auditing Day 39 Posts ---');
    
    const posts = [
        {
            slug: 'fuse-box-overloading-signs-uk',
            keywords: ['BS 7671', 'consumer unit', 'overloading', 'NICEIC', 'RCD', 'webp']
        },
        {
            slug: 'main-sewer-line-clog-causes-us',
            keywords: ['sewer line', 'clog', 'IPC', 'NASSCO', 'OSHA', 'webp']
        }
    ];

    for (const post of posts) {
        console.log(`\nAudit for: ${post.slug}`);
        const { data, error } = await supabase
            .from('posts')
            .select('content, cover_image')
            .eq('slug', post.slug)
            .single();

        if (error) {
            console.error(`Error fetching ${post.slug}:`, error);
            continue;
        }

        post.keywords.forEach(kw => {
            const count = (data.content.match(new RegExp(kw, 'gi')) || []).length;
            console.log(`Keyword "${kw}" found ${count} times.`);
        });
        
        console.log(`Cover Image Path: ${data.cover_image}`);
        
        const images = data.content.match(/!\[.*?\]\(.*?\)/g);
        console.log('Inline Image Tags:', JSON.stringify(images, null, 2));
    }
}

finalScrubDay39();
