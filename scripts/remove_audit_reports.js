import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
    console.log('--- Removing Audit Reports ---');
    const { data: dbPosts, error } = await supabase.from('posts').select('*');
    if (error) {
        console.error('Error fetching posts:', error);
        return;
    }

    const auditRegex = /<Audit_Report>[\s\S]*?<\/Audit_Report>/g;

    for (const post of dbPosts) {
        if (auditRegex.test(post.content)) {
            console.log(`Scrubbing audit report from ${post.slug}...`);
            const cleanedContent = post.content.replace(auditRegex, '').trim();
            
            const { error: updateError } = await supabase
                .from('posts')
                .update({ content: cleanedContent })
                .eq('id', post.id);
            
            if (updateError) {
                console.error(`Error updating post ${post.slug}:`, updateError);
            } else {
                console.log(`Successfully scrubbed ${post.slug}`);
            }
        }
    }
    
    // Sync local all_posts.json
    console.log('Syncing all_posts.json...');
    const { data: updatedPosts } = await supabase.from('posts').select('*');
    fs.writeFileSync('scripts/all_posts.json', JSON.stringify(updatedPosts, null, 2));
    
    console.log('--- Finished Scrub ---');
}

run();
