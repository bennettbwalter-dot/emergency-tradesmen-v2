import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, serviceRoleKey);

function extractTextContent(html) {
    return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function extractFirst100Words(html) {
    const text = extractTextContent(html);
    const words = text.split(/\s+/).slice(0, 100);
    return words.join(' ');
}

function extractHeadings(content) {
    const h2Matches = content.match(/<h2[^>]*>([^<]+)<\/h2>/gi) || [];
    const h3Matches = content.match(/<h3[^>]*>([^<]+)<\/h3>/gi) || [];
    return {
        h2: h2Matches.map(m => m.replace(/<[^>]+>/g, '')),
        h3: h3Matches.map(m => m.replace(/<[^>]+>/g, ''))
    };
}

function extractTitle(content) {
    const match = content.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    return match ? match[1] : '';
}

function addHtmlWrapper(content, title) {
    if (content.trim().startsWith('<!DOCTYPE') || content.trim().startsWith('<html')) {
        return content;
    }
    
    const lang = title.toLowerCase().includes('us') ? 'en-US' : 'en-GB';
    const slug = title.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 60);
    
    const wrapped = `<!DOCTYPE html> <html lang="${lang}"> <head> <meta charset="UTF-8"> <title>${title}</title> <meta name="description" content="${extractTextContent(content).substring(0, 160)}"> </head> <body> <header> <h1>${title}</h1> <div class="meta-bar"> <span class="author">By Emergency Tradesmen Team</span> <span class="date-updated">Updated: March 21, 2026</span> <span class="rating">⭐⭐⭐⭐⭐ 5-Star Service</span> </div> </header> <main> ${content} </main> </body> </html>`;
    
    return wrapped;
}

async function processBlog(post) {
    let content = post.content;
    const title = post.title || extractTitle(content);
    
    if (!content.trim().startsWith('<!DOCTYPE') && !content.trim().startsWith('<html')) {
        content = addHtmlWrapper(content, title);
    }
    
    const { headings } = extractHeadings(content);
    const first100Words = extractFirst100Words(content);
    
    console.log(`\n=== ${post.slug} ===`);
    console.log(`Title: ${title}`);
    console.log(`H2 headings: ${headings.h2.length}`);
    console.log(`First 100 words: ${first100Words.substring(0, 100)}...`);
    
    return { ...post, content, title, headings };
}

async function main() {
    console.log('Fetching posts...');
    const { data: posts, error } = await supabase
        .from('posts')
        .select('id, title, slug, content')
        .eq('published', true);

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log(`Found ${posts.length} posts`);

    for (const post of posts) {
        try {
            const processed = await processBlog(post);
            
            await supabase
                .from('posts')
                .update({ content: processed.content })
                .eq('id', post.id);
                
            console.log(`Updated: ${post.slug}`);
        } catch (err) {
            console.error(`Error processing ${post.slug}:`, err.message);
        }
    }

    console.log('\nDone!');
}

main();
