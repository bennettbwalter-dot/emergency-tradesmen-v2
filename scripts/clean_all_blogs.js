import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function cleanContent(content) {
    if (!content) return content;
    
    let cleaned = content;
    
    cleaned = cleaned.replace(/^#+\s*/gm, '');
    
    cleaned = cleaned.replace(/\*\*(.*?)\*\*/g, '$1');
    cleaned = cleaned.replace(/\*(.*?)\*/g, '$1');
    cleaned = cleaned.replace(/\_([^\_]+)\_/g, '$1');
    
    cleaned = cleaned.replace(/^[-*]\s+/gm, '');
    
    cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
    
    cleaned = cleaned.replace(/^>\s*/gm, '');
    
    cleaned = cleaned.replace(/^(\d+)\.\s*/gm, '$1. ');
    
    cleaned = cleaned.replace(/!\[([^\]]*)\]\([^)]+\)/g, '');
    
    cleaned = cleaned.replace(/\s*[-=]{3,}\s*/g, ' ');
    
    cleaned = cleaned.replace(/\|/g, ' ');
    
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    return cleaned;
}

async function cleanBlogs() {
    console.log('Fetching all posts...');
    const { data: posts, error: fetchError } = await supabase
        .from('posts')
        .select('id, slug, content');
    
    if (fetchError) {
        console.error('Error fetching posts:', fetchError);
        return;
    }
    
    console.log(`Found ${posts.length} posts`);
    
    let updated = 0;
    let skipped = 0;
    
    for (const post of posts) {
        const originalContent = post.content;
        
        if (!originalContent) {
            skipped++;
            continue;
        }
        
        const cleanedContent = cleanContent(originalContent);
        
        if (cleanedContent !== originalContent) {
            const { error: updateError } = await supabase
                .from('posts')
                .update({ content: cleanedContent })
                .eq('id', post.id);
            
            if (updateError) {
                console.error(`Error updating ${post.slug}:`, updateError);
            } else {
                updated++;
                console.log(`Cleaned: ${post.slug}`);
            }
        } else {
            skipped++;
        }
    }
    
    console.log(`\nDone! Updated: ${updated}, Skipped: ${skipped}`);
}

cleanBlogs();