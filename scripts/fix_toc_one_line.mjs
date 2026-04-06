import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, serviceRoleKey);

function fixTOConOneLine(content) {
    const tocMatch = content.match(/<div class="toc-box"[^>]*>[\s\S]*?<\/div>/);
    if (!tocMatch) return content;
    
    const oldToc = tocMatch[0];
    
    const liMatch = oldToc.match(/<li><a href="[^"]*">([^<]+)<\/a><\/li>/g);
    if (!liMatch) return content;
    
    const newTocItems = liMatch.join('\n');
    
    const newToc = `<div class="toc-box" id="in-this-article">
<p>In This Article</p>
<ul>
${newTocItems}
</ul>
</div>`;
    
    return content.replace(oldToc, newToc);
}

async function fixAllTOC() {
    const { data: posts } = await supabase
        .from('posts')
        .select('id, slug, content')
        .eq('published', true);

    let fixed = 0;
    
    for (const p of posts) {
        const newContent = fixTOConOneLine(p.content);
        if (newContent !== p.content) {
            await supabase.from('posts').update({ content: newContent }).eq('id', p.id);
            console.log('Fixed:', p.slug);
            fixed++;
        }
    }
    
    console.log('\nDone! Fixed', fixed, 'blogs');
}

fixAllTOC();
