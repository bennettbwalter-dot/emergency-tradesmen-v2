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
        if (p.content.includes('id="in-this-article"') && p.content.includes('href="#') && p.content.length > 5000) {
            const clean = p.content
                .replace(/<div class="toc-box"[^>]*>[\s\S]*?<\/div>/, (match) => {
                    const lines = match.split('\n').filter(l => l.includes('<li><a href'));
                    return `<div class="toc-box" id="in-this-article">
<p>In This Article</p>
<ul>
${lines.join('\n')}
</ul>
</div>`;
                });
            
            if (clean !== p.content) {
                await supabase.from('posts').update({ content: clean }).eq('id', p.id);
                console.log('Fixed:', p.slug);
                fixed++;
            }
        }
    }
    
    console.log('\nDone! Fixed', fixed, 'blogs');
}

fixAllBlogs();
