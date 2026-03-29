import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const labelsToRemove = [
    'Primary Keyword:',
    'Secondary Keywords:',
    'Date:',
    'Trade:',
    'Word Count:',
    'Optimisation Notes:',
    'Structural Markers:',
    'Market Demand:',
    'Search Intent:',
    'Content Strategy:'
];

async function cleanupBlogs() {
    console.log('Fetching all posts for cleanup...');
    const { data: posts, error } = await supabase
        .from('posts')
        .select('id, slug, content, title');

    if (error) {
        console.error('Error fetching posts:', error.message);
        return;
    }

    console.log(`Analyzing ${posts.length} posts...`);
    let updatedCount = 0;

    for (const post of posts) {
        if (!post.content) continue;

        const lines = post.content.split('\n');
        let isModified = false;

        // Filter out lines that start with or contain the problematic labels
        const cleanedLines = lines.filter(line => {
            const lowerLine = line.trim().toLowerCase();
            const shouldRemove = labelsToRemove.some(label =>
                lowerLine.startsWith(label.toLowerCase()) ||
                // Handle bold versions like **Primary Keyword:**
                lowerLine.startsWith('**' + label.toLowerCase())
            );

            if (shouldRemove) {
                isModified = true;
                return false;
            }
            return true;
        });

        // If we found and removed metadata, we might also want to remove a leading '---' 
        // if it's now at the top of the content or follows a removal.
        // Let's refine: if the first non-empty lines were metadata and now there's a '---', remove it.
        while (cleanedLines.length > 0 && (cleanedLines[0].trim() === '' || cleanedLines[0].trim() === '---')) {
            if (cleanedLines[0].trim() === '---') {
                cleanedLines.shift();
                isModified = true;
                break; // Only remove the first separator
            }
            cleanedLines.shift();
        }

        if (isModified) {
            console.log(`Cleaning up ${post.slug}...`);
            const finalContent = cleanedLines.join('\n').trim();

            const { error: updateError } = await supabase
                .from('posts')
                .update({ content: finalContent })
                .eq('id', post.id);

            if (updateError) {
                console.error(`Error updating ${post.slug}:`, updateError.message);
            } else {
                updatedCount++;
            }
        }
    }

    console.log(`Cleanup complete. Updated ${updatedCount} posts.`);
}

cleanupBlogs();
