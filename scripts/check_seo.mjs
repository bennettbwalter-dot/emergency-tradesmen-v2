import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkBlogs() {
    const { data: posts } = await supabase
        .from('posts')
        .select('slug, content')
        .eq('published', true);

    let toc = 0, faq = 0, reg = 0;
    
    for (const p of posts) {
        if (p.content.includes('id="in-this-article"')) toc++;
        if (p.content.includes('Frequently Asked Questions')) faq++;
        if (p.content.includes('regulatory-citation')) reg++;
    }

    console.log(`\n=== SEO Elements Check ===`);
    console.log(`Total blogs: ${posts.length}`);
    console.log(`TOC: ${toc}`);
    console.log(`FAQ: ${faq}`);
    console.log(`Regulatory: ${reg}`);
}

checkBlogs();
