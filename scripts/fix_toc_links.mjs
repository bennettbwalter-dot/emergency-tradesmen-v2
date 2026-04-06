import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, serviceRoleKey);

function addTOCLinks(content) {
    const h2Regex = /<h2>([^<]+)<\/h2>/gi;
    const headings = [];
    let match;
    
    while ((match = h2Regex.exec(content)) !== null) {
        headings.push(match[1]);
    }
    
    if (headings.length === 0) return content;
    
    const tocItems = headings.map(h => {
        const anchor = h.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        return `<li><a href="#${anchor}">${h}</a></li>`;
    }).join('\n');
    
    const newToc = `<div class="toc-box" id="in-this-article">
<p>In This Article</p>
<ul>${tocItems}</ul>
</div>`;
    
    content = content.replace(/<div class="toc-box"[^>]*>[\s\S]*?<\/div>/, newToc);
    
    let result = content;
    result = result.replace(/<h2>([^<]+)<\/h2>/gi, (m, title) => {
        const anchor = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        return `<h2 id="${anchor}">${title}</h2>`;
    });
    
    return result;
}

async function fixMissingTOC() {
    const { data: posts } = await supabase
        .from('posts')
        .select('id, slug, content')
        .eq('published', true);

    let fixed = 0;
    
    for (const p of posts) {
        if (!p.content.includes('<li><a href="#')) {
            const newContent = addTOCLinks(p.content);
            if (newContent !== p.content) {
                await supabase.from('posts').update({ content: newContent }).eq('id', p.id);
                console.log('Fixed:', p.slug);
                fixed++;
            }
        }
    }
    
    console.log('\nDone! Fixed', fixed, 'blogs');
}

fixMissingTOC();
