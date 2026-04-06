import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkTOC() {
    const { data: posts } = await supabase
        .from('posts')
        .select('slug, content')
        .eq('published', true);

    console.log('Checking TOC links in each blog:\n');
    
    for (const p of posts) {
        const hasTocBox = p.content.includes('class="toc-box"') || p.content.includes('id="in-this-article"');
        const hasLi = p.content.includes('<li><a href="#');
        
        console.log(p.slug + ':');
        console.log('  TOC box: ' + (hasTocBox ? 'YES' : 'NO'));
        console.log('  TOC links: ' + (hasLi ? 'YES' : 'NO'));
    }
}

checkTOC();
