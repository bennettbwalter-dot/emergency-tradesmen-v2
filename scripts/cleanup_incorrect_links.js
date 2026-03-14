import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function scanAndClean() {
    console.log('Scanning all blog posts for emergencycontractors.net...');
    
    const { data: posts, error } = await supabase
        .from('posts')
        .select('id, slug, content');

    if (error) {
        console.error('Error fetching posts:', error);
        return;
    }

    const matches = posts.filter(p => p.content && (
        /emergencycontractors/i.test(p.content) || 
        /emergencytradesmen\.net\/usa/i.test(p.content)
    ));

    if (matches.length === 0) {
        console.log('✅ No occurrences of incorrect or non-standard links found in the database.');
        return;
    }

    console.log(`Found ${matches.length} posts with incorrect or non-standard links. Cleaning...`);

    for (const post of matches) {
        let cleanedContent = post.content;
        
        // 1. Remove the completely foreign domain (case-insensitive)
        cleanedContent = cleanedContent.replace(/https?:\/\/(www\.)?emergencycontractors\.net\/usa/gi, 'https://emergencytradesmen.net/us');
        cleanedContent = cleanedContent.replace(/emergencycontractors\.net/gi, 'emergencytradesmen.net');
        
        // 2. Standardize /usa to /us (case-insensitive)
        cleanedContent = cleanedContent.replace(/emergencytradesmen\.net\/usa/gi, 'emergencytradesmen.net/us');
        
        const { error: updateError } = await supabase
            .from('posts')
            .update({ content: cleanedContent })
            .eq('id', post.id);

        if (updateError) {
            console.error(`Error updating post ${post.slug}:`, updateError);
        } else {
            console.log(`✅ Cleaned post: ${post.slug}`);
        }
    }

    console.log('Cleanup complete.');
}

scanAndClean();
