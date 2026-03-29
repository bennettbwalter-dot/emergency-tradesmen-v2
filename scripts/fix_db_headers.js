
import fs from 'fs';
import path from 'path';

const postsPath = path.resolve(process.cwd(), 'scripts', 'all_posts.json');
const outputPath = path.resolve(process.cwd(), 'scripts', 'all_posts_fixed_headers.json');

if (!fs.existsSync(postsPath)) {
    console.error('all_posts.json not found. Run fetch_all_blogs.js first.');
    process.exit(1);
}

const posts = JSON.parse(fs.readFileSync(postsPath, 'utf8'));
let fixedCount = 0;

const fixedPosts = posts.map(post => {
    let content = post.content || '';
    let changed = false;

    // Fix H4 -> H2
    if (content.match(/^#### /gm)) {
        content = content.replace(/^#### /gm, '## ');
        changed = true;
    }

    // Fix H5 -> H3
    if (content.match(/^##### /gm)) {
        content = content.replace(/^##### /gm, '### ');
        changed = true;
    }

    if (changed) {
        fixedCount++;
    }

    return {
        ...post,
        content: content
    };
});

fs.writeFileSync(outputPath, JSON.stringify(fixedPosts, null, 2));
console.log(`Normalized headers for ${fixedCount} posts.`);
console.log(`Saved fixed posts to ${outputPath}`);
