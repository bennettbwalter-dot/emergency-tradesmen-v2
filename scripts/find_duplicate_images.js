import fs from 'fs';

const filePath = 'c:\\Users\\Nick\\Downloads\\hitmaker-2026\\emergency-tradesmen\\src\\pages\\BlogPostPageFix.tsx';
const content = fs.readFileSync(filePath, 'utf-8');

// Use a simpler string-based split
const postBlocks = content.split("else if (slug === '");
const duplicates = [];

postBlocks.forEach((block, index) => {
    if (index === 0) return; // Skip the first part before the first post

    const slugEndIndex = block.indexOf("'");
    if (slugEndIndex === -1) return;
    const slug = block.substring(0, slugEndIndex);

    // Find all images in this block
    const imageRegex = /!\[.*?\]\((.*?)\)/g;
    const images = [];
    let match;
    while ((match = imageRegex.exec(block)) !== null) {
        images.push(match[1].split(' ')[0]); // Get just the path
    }

    const seen = new Set();
    images.forEach(img => {
        if (seen.has(img)) {
            duplicates.push(`Slug: ${slug}, Duplicate Image: ${img}`);
        }
        seen.add(img);
    });
});

if (duplicates.length > 0) {
    console.log('Duplicate Images Found:');
    duplicates.forEach(d => console.log(d));
} else {
    console.log('No Duplicate Images Found.');
}
