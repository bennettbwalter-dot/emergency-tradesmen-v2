import fs from 'fs';
import path from 'path';

const posts = JSON.parse(fs.readFileSync('scripts/all_posts.json', 'utf8'));

const labels = [
    'Primary Keyword:',
    'Secondary Keywords:',
    'Date:',
    'Trade:',
    'Word Count:',
    'Optimisation Notes:',
    'Structural Markers:'
];

const results = [];

posts.forEach(post => {
    const content = post.content || '';
    const lines = content.split('\n');

    // Check for the problematic labels
    const hasLabels = labels.some(label => content.toLowerCase().includes(label.split(':')[0].toLowerCase()));

    if (hasLabels) {
        // Find the index of the first separator '---' if it exists in the first 25 lines
        const separatorIndex = lines.slice(0, 25).findIndex(line => line.trim() === '---');

        results.push({
            id: post.id,
            slug: post.slug,
            title: post.title,
            hasSeparator: separatorIndex !== -1,
            separatorLine: separatorIndex, // 0-indexed
            // Capture the lines that actually match the labels
            matchedLines: lines.slice(0, 25).filter(line =>
                labels.some(label => line.toLowerCase().includes(label.split(':')[0].toLowerCase()))
            )
        });
    }
});

fs.writeFileSync('scripts/cleanup_plans.json', JSON.stringify(results, null, 2));
console.log(`Total posts found needing cleanup: ${results.length}`);
console.log(`Plans saved to scripts/cleanup_plans.json`);
