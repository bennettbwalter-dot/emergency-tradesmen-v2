const posts = require('./scripts/all_posts.json');
[17,25,32,35,36,43,46].forEach(idx => {
    const p = posts[idx];
    const c = p.content;
    console.log('=== ' + p.slug + ' ===');
    
    const btnMatch = c.match(/Buy on Amazon|Order on Amazon|Get.*Amazon|Check.*Amazon/gi);
    console.log('Button text found:', btnMatch);
    
    const amazonLinkMatch = c.match(/<a[^>]*href="https:\/\/www\.amazon\.[^"]+"[^>]*>[^<]*<\/a>/gi);
    console.log('Full <a> tags:', amazonLinkMatch ? amazonLinkMatch.length : 0);
    
    const mangledMatch = c.match(/#f0c14b[^>]*">[^<]*Amazon[^<]*<\/a>/gi);
    console.log('Mangled fragments:', mangledMatch ? mangledMatch.length : 0);
    
    // Show the actual button HTML
    const buttonIdx = c.indexOf('Buy on Amazon');
    if (buttonIdx > -1) {
        const context = c.substring(Math.max(0, buttonIdx - 600), buttonIdx + 50);
        const hasFullAnchor = context.includes('<a href="https://www.amazon');
        console.log('Has full <a> tag:', hasFullAnchor);
        if (!hasFullAnchor) {
            console.log('MANGLED - last 200 chars before button text:');
            console.log(context.substring(context.length - 200));
        }
    }
    console.log('');
});
