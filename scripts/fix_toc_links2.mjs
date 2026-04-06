import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, serviceRoleKey);

function fixTOCLinks(content) {
    const headingPattern = /(\d+)\.\s*([^<\n]+)(?=<)/g;
    const headings = [];
    let match;
    
    while ((match = headingPattern.exec(content)) !== null) {
        const num = match[1];
        const title = match[2].trim();
        if (title.length > 3 && !title.startsWith('http')) {
            headings.push({ num, title });
        }
    }
    
    if (headings.length === 0) return content;
    
    const tocItems = headings.map(h => {
        const anchor = h.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        return `<li><a href="#${anchor}">${h.num}. ${h.title}</a></li>`;
    }).join('\n');
    
    const newToc = `<div class="toc-box" id="in-this-article">
<p>In This Article</p>
<ul>${tocItems}</ul>
</div>`;
    
    content = content.replace(/<div class="toc-box"[^>]*>[\s\S]*?<\/div>/, newToc);
    
    headings.forEach(h => {
        const anchor = h.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        const oldPattern = h.num + '. ' + h.title;
        content = content.replace(
            oldPattern,
            `<h2 id="${anchor}">${oldPattern}</h2>`
        );
    });
    
    return content;
}

async function fixMissingTOC() {
    const { data: posts } = await supabase
        .from('posts')
        .select('id, slug, content')
        .eq('published', true);

    let fixed = 0;
    
    for (const p of posts) {
        if (!p.content.includes('<li><a href="#')) {
            const newContent = fixTOCLinks(p.content);
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
