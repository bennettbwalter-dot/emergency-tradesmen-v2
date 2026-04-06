import posts from './all_posts.json' with { type: 'json' };

const p = posts.find(x => x.slug === 'security-audit-us');
if (!p) {
    console.log('Post not found');
    process.exit();
}

const c = p.content;

// Find all div containers that look like image placeholders (no img tag inside)
const divRegex = /<div[^>]*class="[^"]*relative[^"]*"[^>]*>[\s\S]*?<\/div>\s*<\/div>/gi;
const matches = [...c.matchAll(divRegex)];

console.log('Total relative divs found:', matches.length);

matches.forEach((m, i) => {
    const hasImg = m[0].includes('<img');
    const hasGradient = m[0].includes('bg-gradient');
    const hasPointerEvents = m[0].includes('pointer-events-none');
    console.log(`\n--- Div ${i+1} ---`);
    console.log('Has img:', hasImg);
    console.log('Has gradient:', hasGradient);
    console.log('Has pointer-events-none:', hasPointerEvents);
    console.log('Preview:', m[0].substring(0, 300));
});

// Also search for empty containers with aspect-video or similar
const emptyContainers = c.match(/<div[^>]*aspect-video[^>]*>(?!.*<img)[\s\S]*?<\/div>/gi);
console.log('\n\nEmpty aspect-video containers:', emptyContainers ? emptyContainers.length : 0);

// Search for any container with bg-gradient but no img
const gradientContainers = c.match(/<div[^>]*bg-gradient[^>]*>[\s\S]*?<\/div>/gi);
console.log('Gradient containers:', gradientContainers ? gradientContainers.length : 0);
if (gradientContainers) {
    gradientContainers.forEach((gc, i) => {
        console.log(`\nGradient ${i+1}:`, gc.substring(0, 200));
    });
}
