import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const labelsToRemove = [
    'Primary Keyword',
    'Secondary Keyword',
    'Date:',
    'Trade:',
    'Word Count:',
    'Optimisation Note',
    'Structural Marker',
    'Market Demand',
    'Search Intent',
    'Content Strategy'
];

async function deepCleanup() {
    console.log('Fetching all posts for deep sweep...');
    const { data: posts, error } = await supabase
        .from('posts')
        .select('id, slug, content');

    if (error) {
        console.error('Error fetching posts:', error.message);
        return;
    }

    console.log(`Analyzing ${posts.length} posts for hidden metadata...`);
    let totalUpdated = 0;

    for (const post of posts) {
        if (!post.content) continue;

        const lines = post.content.split('\n');
        let isModified = false;

        const cleanedLines = lines.filter(line => {
            const lowerLine = line.trim().toLowerCase();
            const shouldRemove = labelsToRemove.some(label => {
                const lowerLabel = label.toLowerCase();
                // Match "Primary Keyword:", "**Primary Keyword:**", "Primary Keywords:", etc.
                return lowerLine.includes(lowerLabel) && (lowerLine.startsWith(lowerLabel) || lowerLine.startsWith('**' + lowerLabel));
            });

            if (shouldRemove) {
                isModified = true;
                return false;
            }
            return true;
        });

        // Remove leading separator or whitespace
        while (cleanedLines.length > 0 && (cleanedLines[0].trim() === '' || cleanedLines[0].trim() === '---')) {
            if (cleanedLines[0].trim() === '---') {
                cleanedLines.shift();
                isModified = true;
                break;
            }
            cleanedLines.shift();
        }

        if (isModified) {
            console.log(`Deep cleaning ${post.slug}...`);
            const finalContent = cleanedLines.join('\n').trim();

            const { error: updateError } = await supabase
                .from('posts')
                .update({ content: finalContent })
                .eq('id', post.id);

            if (updateError) {
                console.error(`Error updating ${post.slug}:`, updateError.message);
            } else {
                totalUpdated++;
            }
        }
    }

    console.log(`Deep sweep complete. Updated ${totalUpdated} additional/re-verified posts.`);
}

deepCleanup();
