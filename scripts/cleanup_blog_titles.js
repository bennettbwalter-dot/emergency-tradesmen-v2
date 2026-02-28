
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

async function deepCleanup() {
    console.log('Fetching all posts for deep cleanup...');
    const { data: posts, error } = await supabase
        .from('posts')
        .select('id, title, content, cover_image');

    if (error) {
        console.error('Error fetching posts:', error);
        return;
    }

    console.log(`Checking ${posts.length} posts for duplicate elements and internal labels...`);
    let updateCount = 0;

    for (const post of posts) {
        if (!post.content) continue;

        let content = post.content;
        let updated = false;

        // 1. Strip H1 Title if present at the top
        const trimmedContent = content.trim();
        if (trimmedContent.startsWith('# ')) {
            const firstNewLine = trimmedContent.indexOf('\n');
            if (firstNewLine !== -1) {
                console.log(`[${post.title}] Stripping leading H1`);
                content = trimmedContent.slice(firstNewLine).trim();
                updated = true;
            } else {
                content = '';
                updated = true;
            }
        }

        // 2. Strip ALL Redundant Heroes GLOBAL
        if (post.cover_image) {
            const imgPath = post.cover_image.replace(/^\//, ''); // path without leading slash
            // Match markdown images containing this path
            // Escaping special characters in path for regex
            const escapedPath = imgPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const globalImageRegex = new RegExp(`!\\[.*?\\]\\(.*?${escapedPath}.*?\\)`, 'g');

            if (globalImageRegex.test(content)) {
                console.log(`[${post.title}] Removing redundant hero image usages of: ${post.cover_image}`);
                content = content.replace(globalImageRegex, '').trim();
                updated = true;
            }
        }

        // 3. Strip Internal SEO Labels
        const labelsToRemove = [
            /^Date:.*$/gmi,
            /^Primary Keyword:.*$/gmi,
            /^Secondary Keywords:.*$/gmi,
            /^Trade:.*$/gmi,
            /^Optimisation Notes:.*$/gmi,
            /^Notes:.*$/gmi
        ];

        let contentBeforeLabels = content;
        labelsToRemove.forEach(regex => {
            content = content.replace(regex, '');
        });

        if (content !== contentBeforeLabels) {
            console.log(`[${post.title}] Removed internal SEO labels`);
            content = content.trim();
            updated = true;
        }

        // Remove leading horizontal rules if they were separating metadata
        if (content.startsWith('---')) {
            content = content.replace(/^---\s*/, '').trim();
            updated = true;
        }

        if (updated) {
            console.log(`Updating post ID: ${post.id}`);
            const { error: updateError } = await supabase
                .from('posts')
                .update({ content: content })
                .eq('id', post.id);

            if (updateError) {
                console.error(`Error updating post ${post.id}:`, updateError);
            } else {
                updateCount++;
            }
        }
    }

    console.log(`Finished! Updated ${updateCount} posts.`);
}

deepCleanup();
