const https = require('https');

const apikey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3cXZoeW1rd3Vhc290c2dtYXJuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTk5MDM0MywiZXhwIjoyMDgxNTY2MzQzfQ.ZJQXY5OzkfO4Ey2G5enTdPHx_shgDMGAUaTJAHKDKus';
const postId = 'b8c662a9-c60a-40c8-bd65-375b52e1bfb4';

const getReq = https.request({
    hostname: 'xwqvhymkwuasotsgmarn.supabase.co',
    path: `/rest/v1/posts?select=content&id=eq.${postId}`,
    method: 'GET',
    headers: { 'apikey': apikey, 'Authorization': `Bearer ${apikey}` }
}, (res) => {
    let d = '';
    res.on('data', c => d += c);
    res.on('end', () => {
        const posts = JSON.parse(d);
        if (posts.length === 0) { console.log('Post not found'); return; }
        const content = posts[0].content;
        
        // Find all img tags
        const imgMatches = content.match(/<img[^>]+>/g);
        console.log('Total images:', imgMatches ? imgMatches.length : 0);
        if (imgMatches) {
            imgMatches.forEach((img, i) => {
                console.log('\n--- Image', i + 1, '---');
                console.log(img);
            });
        }
        
        // Find all product sections
        const productMatches = content.match(/product-box[^>]*>[\s\S]{1,300}?(?=<div class="amazon|<div class="regulatory|$)/g);
        console.log('\nProduct boxes found:', productMatches ? productMatches.length : 0);
    });
});
getReq.on('error', e => console.error('Error:', e));
getReq.end();
