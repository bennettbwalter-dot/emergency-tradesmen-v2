
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

/**
 * Parse markdown content into semantic blocks.
 * Each block is either a paragraph, header, list, table, image, or horizontal rule.
 */
function parseBlocks(content) {
    const rawBlocks = content.split(/\n\s*\n/);
    return rawBlocks.map(block => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        const isImage = /^!\[.*?\]\(.*?\)$/.test(trimmed);
        const isHeader = /^#{1,6}\s/.test(trimmed);
        const isHR = /^---+$/.test(trimmed);
        const wordCount = trimmed.split(/\s+/).filter(w => w.length > 0).length;

        return {
            text: trimmed,
            type: isImage ? 'image' : isHeader ? 'header' : isHR ? 'hr' : 'body',
            wordCount,
        };
    }).filter(Boolean);
}

/**
 * Count words in an array of blocks (excluding images).
 */
function countWords(blocks) {
    return blocks.reduce((sum, b) => b.type !== 'image' ? sum + b.wordCount : sum, 0);
}

/**
 * Redistribute images evenly throughout the content.
 * 
 * Strategy:
 * 1. Separate images from content blocks.
 * 2. Calculate ideal spacing (totalWords / numImages).
 * 3. Walk through content blocks, tracking cumulative word count.
 * 4. Insert each image at the nearest anchor after its ideal word position.
 * 5. Enforce minimum gap of MIN_GAP_WORDS between any two images.
 */
const MIN_GAP_WORDS = 150; // Minimum words between two images

function redistribute(blocks) {
    const images = blocks.filter(b => b.type === 'image');
    const contentBlocks = blocks.filter(b => b.type !== 'image');

    if (images.length === 0) return blocks; // Nothing to do
    if (contentBlocks.length === 0) return blocks; // Only images, unlikely

    const totalWords = countWords(contentBlocks);
    const idealGap = Math.max(MIN_GAP_WORDS, Math.floor(totalWords / (images.length + 1)));

    const result = [];
    let imageIndex = 0;
    let wordsSinceLastImage = 0;
    let cumulativeWords = 0;

    for (let i = 0; i < contentBlocks.length; i++) {
        const block = contentBlocks[i];
        result.push(block);
        cumulativeWords += block.wordCount;
        wordsSinceLastImage += block.wordCount;

        // Check if we should insert an image after this block
        if (imageIndex < images.length) {
            const idealPosition = idealGap * (imageIndex + 1);
            const isAtOrPastIdeal = cumulativeWords >= idealPosition;
            const hasEnoughGap = wordsSinceLastImage >= MIN_GAP_WORDS;
            const isGoodAnchor = block.type === 'header' || block.type === 'body';

            // Insert if we've passed the ideal position AND have enough gap AND we're at a good anchor
            if (isAtOrPastIdeal && hasEnoughGap && isGoodAnchor) {
                result.push(images[imageIndex]);
                imageIndex++;
                wordsSinceLastImage = 0;
            }
        }
    }

    // Append any remaining images at the end, spaced by at least one content block
    while (imageIndex < images.length) {
        result.push(images[imageIndex]);
        imageIndex++;
    }

    return result;
}

async function main() {
    console.log('Fetching all posts for image redistribution...');
    const { data: posts, error } = await supabase
        .from('posts')
        .select('id, title, content');

    if (error) {
        console.error('Error fetching posts:', error);
        return;
    }

    console.log(`Processing ${posts.length} posts...\n`);
    let updateCount = 0;

    for (const post of posts) {
        if (!post.content) continue;

        const blocks = parseBlocks(post.content);
        const images = blocks.filter(b => b.type === 'image');

        if (images.length < 2) continue; // No redistribution needed for 0–1 images

        // Check if any images are clustered
        let hasClusters = false;
        let wordsBetween = 0;
        let lastWasImage = false;
        for (const block of blocks) {
            if (block.type === 'image') {
                if (lastWasImage || (wordsBetween < MIN_GAP_WORDS && lastWasImage === false && wordsBetween > 0)) {
                    hasClusters = true;
                    break;
                }
                lastWasImage = true;
                wordsBetween = 0;
            } else {
                wordsBetween += block.wordCount;
                if (lastWasImage && wordsBetween >= MIN_GAP_WORDS) {
                    lastWasImage = false;
                }
            }
        }

        // Simple cluster detection: check line-based gaps
        const lines = post.content.split('\n');
        const imgLineIndices = [];
        lines.forEach((line, idx) => {
            if (line.match(/!\[.*?\]\(.*?\)/)) imgLineIndices.push(idx);
        });

        for (let i = 0; i < imgLineIndices.length - 1; i++) {
            if (imgLineIndices[i + 1] - imgLineIndices[i] < 15) {
                hasClusters = true;
                break;
            }
        }

        if (!hasClusters) {
            console.log(`[${post.title}] Images already well-spaced. Skipping.`);
            continue;
        }

        console.log(`[${post.title}] Redistributing ${images.length} images...`);
        const redistributed = redistribute(blocks);
        const newContent = redistributed.map(b => b.text).join('\n\n');

        if (newContent.trim() !== post.content.trim()) {
            const { error: updateError } = await supabase
                .from('posts')
                .update({ content: newContent })
                .eq('id', post.id);

            if (updateError) {
                console.error(`  Error updating post ${post.id}:`, updateError);
            } else {
                updateCount++;
                console.log(`  ✓ Updated successfully.`);
            }
        } else {
            console.log(`  No change needed.`);
        }
    }

    console.log(`\nFinished! Updated ${updateCount} posts.`);
}

main();
