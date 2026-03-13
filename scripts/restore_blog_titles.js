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

async function restoreTitles() {
    console.log('Fetching all posts...');
    const { data, error } = await supabase.from('posts').select('id, title, content, slug');

    if (error) {
        console.error('Error fetching posts:', error);
        return;
    }

    console.log(`Found ${data.length} posts. Restoration and Hash removal in progress...`);

    for (const post of data) {
        const { id, title, content, slug } = post;
        
        let needsUpdate = false;
        let updatedContent = content;

        if (content) {
            // Case 1: Post still has the hash tag
            if (content.startsWith('# ')) {
                console.log(`Removing hash tag from: ${slug}`);
                updatedContent = content.replace(/^#\s*/, '');
                needsUpdate = true;
            } 
            // Case 2: Post had the entire header removed (it doesn't start with the title text)
            else if (!content.trim().startsWith(title.substring(0, 20))) {
                console.log(`Restoring title (without hash) to: ${slug}`);
                updatedContent = title + '\n\n' + content;
                needsUpdate = true;
            }
        }

        if (needsUpdate) {
            const { error: updateError } = await supabase
                .from('posts')
                .update({ content: updatedContent })
                .eq('id', id);
            
            if (updateError) {
                console.error(`Error updating post ${slug}:`, updateError);
            } else {
                console.log(`Successfully updated post: ${slug}`);
            }
        }
    }
    
    console.log('Cleanup complete.');
}

restoreTitles();
