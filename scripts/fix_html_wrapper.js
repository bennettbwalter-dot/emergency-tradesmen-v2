import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, serviceRoleKey);

function addHtmlWrapper(content, title) {
    if (content.trim().startsWith('<!DOCTYPE') || content.trim().startsWith('<html')) {
        return content;
    }
    
    const lang = title.toLowerCase().includes('us') ? 'en-US' : 'en-GB';
    
    const wrapped = `<!DOCTYPE html> <html lang="${lang}"> <head> <meta charset="UTF-8"> <title>${title}</title> <meta name="description" content="${title} - Expert guide from Emergency Tradesmen"> </head> <body> <header> <h1>${title}</h1> <div class="meta-bar"> <span class="author">By Emergency Tradesmen Team</span> <span class="date-updated">Updated: March 21, 2026</span> <span class="rating">⭐⭐⭐⭐⭐ 5-Star Service</span> </div> </header> <main> ${content} </main> </body> </html>`;
    
    return wrapped;
}

async function fixAllBlogs() {
    console.log('Fetching posts...');
    const { data: posts, error } = await supabase
        .from('posts')
        .select('id, title, slug, content')
        .eq('published', true);

    if (error) {
        console.error('Error fetching:', error);
        return;
    }

    console.log(`Found ${posts.length} posts`);
    
    let fixed = 0;
    let skipped = 0;

    for (const post of posts) {
        const content = post.content || '';
        
        if (content.trim().startsWith('<!DOCTYPE') || content.trim().startsWith('<html')) {
            skipped++;
            continue;
        }
        
        const title = post.title || '';
        const newContent = addHtmlWrapper(content, title);
        
        const { error: updateError } = await supabase
            .from('posts')
            .update({ content: newContent })
            .eq('id', post.id);

        if (updateError) {
            console.error(`Error updating ${post.slug}:`, updateError);
        } else {
            fixed++;
            console.log(`Fixed: ${post.slug}`);
        }
    }

    console.log(`\nDone! Fixed: ${fixed}, Already OK: ${skipped}`);
}

fixAllBlogs();
