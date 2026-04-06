import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

function formatBlogContent(html) {
    let content = html;

    content = content.replace(/<p>\s*([A-Z][^<]{150,})/g, (match, text) => {
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
        if (sentences.length > 1) {
            return '<p>' + sentences.map(s => s.trim()).join('</p><p>') + '</p>';
        }
        return match;
    });

    content = content.replace(/<\/div>\s*<p>/g, '</div><p>');
    content = content.replace(/<\/p>\s*<h2/g, '</p><h2');
    content = content.replace(/<\/h2>\s*<p>/g, '</h2><p>');
    content = content.replace(/<\/ul>\s*<p>/g, '</ul><p>');
    content = content.replace(/<\/p>\s*<ul>/g, '</p><ul>');

    content = content.replace(/<h2/g, '<h2');
    content = content.replace(/<h3/g, '<h3');
    
    content = content.replace(/<ul>\s*/g, '<ul>');
    content = content.replace(/\s*<\/ul>/g, '</ul>');

    content = content.replace(/class="capsule-box"/g, 'class="capsule-box key-points"');
    
    content = content.replace(/<blockquote/g, '<blockquote class="callout-box"');
    
    content = content.replace(/(WARNING|CAUTION|DANGER|IMPORTANT):/gi, 
        '<span class="highlight-text">$1:</span>');

    return content;
}

async function processPosts() {
    console.log('Fetching all posts...');
    const { data: posts, error } = await supabase
        .from('posts')
        .select('id, title, slug, content')
        .eq('published', true);

    if (error) {
        console.error('Error fetching posts:', error);
        return;
    }

    console.log(`Found ${posts.length} posts to process`);

    let updated = 0;

    for (const post of posts) {
        if (!post.content || post.content.length < 500) continue;

        const originalContent = post.content;
        const reformatted = formatBlogContent(originalContent);

        if (reformatted !== originalContent) {
            const { error: updateError } = await supabase
                .from('posts')
                .update({ content: reformatted })
                .eq('id', post.id);

            if (updateError) {
                console.error(`Error updating ${post.slug}:`, updateError);
            } else {
                updated++;
                console.log(`Updated: ${post.slug}`);
            }
        }
    }

    console.log(`\nComplete! Updated ${updated} posts`);
}

processPosts();
