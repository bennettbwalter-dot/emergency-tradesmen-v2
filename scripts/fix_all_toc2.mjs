import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: process.cwd() + '/.env' });

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixAllBlogs() {
    const { data: posts } = await supabase.from('posts').select('id, slug, content').eq('published', true);
    
    let fixed = 0;
    
    for (const p of posts) {
        let content = p.content;
        let changed = false;
        
        if (content.includes('id="in-this-article"') && content.includes('href="#1-')) {
            const hasProperTOC = content.match(/<div class="toc-box"[^>]*>[\s\S]*?<ul>[\s\S]*?<li><a href="#\d+-/);
            if (!hasProperTOC) {
                const h2s = content.match(/<h2[^>]*id="(\d+-[^"]*)"[^>]*>([^<]+)<\/h2>/g);
                if (h2s && h2s.length > 0) {
                    const newTOC = '<div class="toc-box" id="in-this-article">\n<p>In This Article</p>\n<ul>\n' + 
                        h2s.map(h => {
                            const idMatch = h.match(/id="(\d+-[^"]*)"/);
                            const textMatch = h.match(/>([^<]+)<\/h2>/);
                            if (idMatch && textMatch) {
                                return '<li><a href="#' + idMatch[1] + '">' + textMatch[1] + '</a></li>';
                            }
                            return '';
                        }).join('\n') +
                        '\n</ul>\n</div>';
                    
                    content = content.replace(/<div class="toc-box"[^>]*>[\s\S]*?<\/div>/, newTOC);
                    changed = true;
                }
            }
        }
        
        if (changed) {
            await supabase.from('posts').update({ content }).eq('id', p.id);
            console.log('Fixed:', p.slug);
            fixed++;
        }
    }
    
    console.log('\nDone! Fixed', fixed, 'blogs');
}

fixAllBlogs();
