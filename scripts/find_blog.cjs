const https = require('https');

const apikey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3cXZoeW1rd3Vhc290c2dtYXJuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTk5MDM0MywiZXhwIjoyMDgxNTY2MzQzfQ.ZJQXY5OzkfO4Ey2G5enTdPHx_shgDMGAUaTJAHKDKus';
const url = 'https://xwqvhymkwuasotsgmarn.supabase.co/rest/v1/posts?select=id,slug,title,cover_image&slug=eq.portable-power-stations-backup-gb';

const req = https.request(url, {
    headers: { apikey, 'Content-Type': 'application/json' }
}, (res) => {
    let d = '';
    res.on('data', c => d += c);
    res.on('end', () => {
        const posts = JSON.parse(d);
        if (posts.length > 0) {
            console.log('Post:', JSON.stringify(posts[0], null, 2));
        } else {
            console.log('Post not found');
        }
    });
});
req.end();
