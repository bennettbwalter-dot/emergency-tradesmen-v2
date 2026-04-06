import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanPost(slug) {
    const { data: post } = await supabase.from('posts').select('id, content, title').eq('slug', slug).single();
    if (!post) {
        console.log("Post not found:", slug);
        return;
    }
    
    let content = post.content;
    
    // Remove the title if it's the first line
    const titleHeader = `# ${post.title}`;
    if (content.startsWith(titleHeader)) {
        content = content.replace(titleHeader, '').trim();
    }
    
    // Also remove generic heading 1 if present at the top
    if (content.startsWith('# ')) {
        content = content.replace(/^#\s+[^\n]+/, '').trim();
    }

    // Remove <Audit_Report> and everything after it
    const auditIndex = content.indexOf('<Audit_Report>');
    if (auditIndex !== -1) {
        content = content.substring(0, auditIndex).trim();
    }

    const { error } = await supabase.from('posts').update({ content }).eq('id', post.id);
    if (error) {
        console.error("Error updating", slug, error);
    } else {
        console.log("Cleaned up post:", slug);
    }
}

async function main() {
    await cleanPost('5-hidden-warning-signs-of-attic-mold-rainy-spring');
    await cleanPost('7-ways-to-safe-proof-your-garden-electrics-spring-2026');
}

main();
