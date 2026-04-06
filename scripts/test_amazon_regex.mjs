import posts from './all_posts.json' with { type: 'json' };

[17,25,32,35,36,43,46].forEach(idx => {
    const p = posts[idx];
    const c = p.content;
    console.log('=== ' + p.slug + ' ===');
    const buttonIdx = c.indexOf('Buy on Amazon');
    if (buttonIdx > -1) {
        const context = c.substring(Math.max(0, buttonIdx - 600), buttonIdx + 50);
        const hasFullAnchor = context.includes('<a href="https://www.amazon');
        console.log('Has full anchor tag:', hasFullAnchor);
        if (!hasFullAnchor) {
            console.log('MANGLED - snippet:');
            console.log(context.substring(context.length - 200));
        }
    } else {
        console.log('No Buy on Amazon text found');
    }
    console.log('');
});
