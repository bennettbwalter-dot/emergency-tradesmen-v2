
import fs from 'fs';
import path from 'path';

const postsPath = path.resolve(process.cwd(), 'scripts', 'all_posts_fixed_headers.json');
const outputPath = path.resolve(process.cwd(), 'scripts', 'all_posts_expanded.json');

if (!fs.existsSync(postsPath)) {
    console.error('Source file not found.');
    process.exit(1);
}

const posts = JSON.parse(fs.readFileSync(postsPath, 'utf8'));

const contentMap = {
    'what-to-do-in-home-emergency-before-help-arrives': 'what-to-do-in-home-emergency-before-help-arrives.md',
    'emergency-at-home-guide': 'emergency-at-home-guide.md',
    'emergency-plumber-london-guide': 'emergency-plumber-london-guide.md',
    'structural-cracks-foundation-repair-us': 'structural-cracks-foundation-repair-us.md',
    'can-you-legally-stay-in-home-without-electricity': 'can-you-legally-stay-in-home-without-electricity.md',
    'electrical-emergencies-every-homeowner-should-know': 'electrical-emergencies-every-homeowner-should-know.md',
    'how-we-verify-tradespeople': 'how-we-verify-tradespeople.md',
    '5-signs-you-need-emergency-plumber': '5-signs-you-need-emergency-plumber.md',
    'water-damage-restoration-category-mold-us': 'water-damage-restoration-category-mold-us.md'
};

let updateCount = 0;
const updatedPosts = posts.map(post => {
    if (contentMap[post.slug]) {
        const filePath = path.resolve(process.cwd(), 'scripts', 'content', contentMap[post.slug]);
        if (fs.existsSync(filePath)) {
            console.log(`Updating content for: ${post.slug}`);
            const newContent = fs.readFileSync(filePath, 'utf8');
            updateCount++;
            return {
                ...post,
                content: newContent
            };
        } else {
            console.warn(`Content file not found for: ${post.slug} at ${filePath}`);
        }
    }
    return post;
});

fs.writeFileSync(outputPath, JSON.stringify(updatedPosts, null, 2));
console.log(`Updated content for ${updateCount} posts.`);
console.log(`Saved to ${outputPath}`);
