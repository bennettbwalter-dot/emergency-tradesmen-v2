import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanupPosts() {
    console.log('Fetching all posts...');
    const { data, error } = await supabase.from('posts').select('id, title, content, slug');

    if (error) {
        console.error('Error fetching posts:', error);
        return;
    }

    console.log(`Found ${data.length} posts. Checking for leading H1 headers...`);

    for (const post of data) {
        const { id, title, content, slug } = post;
        
        if (content && content.startsWith('#')) {
            console.log(`Cleaning up post: ${slug}`);
            
            // Split content into lines
            const lines = content.split('\n');
            
            // Check if first line is H1
            if (lines[0].startsWith('# ')) {
                // Remove first line
                lines.shift();
                
                // Remove subsequent empty lines
                while (lines.length > 0 && lines[0].trim() === '') {
                    lines.shift();
                }
                
                const updatedContent = lines.join('\n');
                
                // Update post
                const { error: updateError } = await supabase
                    .from('posts')
                    .update({ content: updatedContent })
                    .eq('id', id);
                
                if (updateError) {
                    console.error(`Error updating post ${slug}:`, updateError);
                } else {
                    console.log(`Successfully cleaned up post: ${slug}`);
                }
            } else {
                console.log(`Skipping post ${slug}: Starts with # but not followed by space (likely a subheader or something else).`);
            }
        }
    }
    
    console.log('Cleanup complete.');
}

cleanupPosts();
