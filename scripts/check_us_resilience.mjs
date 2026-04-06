import posts from './all_posts.json' with { type: 'json' };

const p = posts.find(x => x.slug === 'ultimate-us-emergency-home-resilience-2026');
if (!p) {
    console.log('Post not found');
    process.exit();
}

console.log('Title:', p.title);
console.log('Cover image:', p.cover_image);

const c = p.content;

// Find empty image containers (same pattern as UK blog)
const emptyContainerRegex = /<div class="relative w-full my-14 overflow-hidden rounded-2xl shadow-\[020px50px-12pxrgba\(0,0,0,0\.3\)\] border border-white\/5 ring-1 ring-blue-500\/10 group aspect-video transition-all duration-300 hover:shadow-\[020px50px-12pxrgba\(59,130,246,0\.25\)\]">[\s\S]*?<\/div>[\s\S]*?<\/div>/g;
const emptyContainers = [...c.matchAll(emptyContainerRegex)];

console.log('\nEmpty containers found:', emptyContainers.length);
emptyContainers.forEach((ec, i) => {
    console.log('\n--- Container ' + (i+1) + ' ---');
    console.log('Has img tag:', ec[0].includes('<img'));
    console.log('Preview:', ec[0].substring(0, 300));
});

// Show context around each empty container
emptyContainers.forEach((ec, i) => {
    const idx = c.indexOf(ec[0]);
    const before = c.substring(Math.max(0, idx - 200), idx);
    const after = c.substring(idx + ec[0].length, idx + ec[0].length + 200);
    console.log('\n--- Context Container ' + (i+1) + ' ---');
    console.log('Before:', before.substring(before.length - 150));
    console.log('After:', after.substring(0, 150));
});
