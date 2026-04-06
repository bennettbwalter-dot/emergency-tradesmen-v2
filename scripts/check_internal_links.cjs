const https = require('https');

const url = 'https://xwqvhymkwuasotsgmarn.supabase.co/rest/v1/posts?select=slug,content,excerpt&published=eq.true&limit=1';
const apikey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3cXZoeW1rd3Vhc290c2dtYXJuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTk5MDM0MywiZXhwIjoyMDgxNTY2MzQzfQ.ZJQXY5OzkfO4Ey2G5enTdPHx_shgDMGAUaTJAHKDKus';

const req = https.request(url, {
    headers: { apikey, 'Content-Type': 'application/json' }
}, (res) => {
    let d = '';
    res.on('data', c => d += c);
    res.on('end', () => {
        const posts = JSON.parse(d);
        const post = posts[0];
        if (!post) { console.log('No posts found'); return; }
        console.log('Slug:', post.slug);
        // Find internal links (relative paths starting with /)
        const internalLinks = post.content && post.content.match(/href=['"](\/[^'"]+)['"]/g);
        console.log('Internal links found:', internalLinks ? internalLinks.length : 0);
        if (internalLinks) console.log('Examples:', internalLinks.slice(0, 10));
        // Check for links to key pages
        const keyPages = ['/about', '/contact', '/pricing', '/faq', '/emergency-', '/blog/'];
        keyPages.forEach(kp => {
            const count = post.content && post.content.match(new RegExp('href=["\']' + kp, 'g'));
            console.log(`${kp}: ${count ? count.length : 0} links`);
        });
    });
});
req.end();
