const posts = require('./scripts/all_posts.json');

console.log('Checking first 5 blogs:\n');

for (let i = 0; i < 5; i++) {
    const p = posts[i];
    console.log('=== ' + p.slug + ' ===');
    console.log('  TOC:', p.content.includes('id="in-this-article"') ? 'YES' : 'NO');
    console.log('  FAQ:', p.content.includes('Frequently Asked Questions') ? 'YES' : 'NO');
    console.log('  Regulatory:', p.content.includes('regulatory-citation') ? 'YES' : 'NO');
    console.log('');
}
