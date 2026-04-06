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
        
        // Find regulatory section and look for ALL product boxes
        const regulatoryIndex = content.indexOf('regulatory-citation');
        if (regulatoryIndex > -1) {
            const afterRegulatory = content.substring(regulatoryIndex);
            
            // Count product boxes
            const productBoxes = (afterRegulatory.match(/<div class="product-box">/g) || []).length;
            console.log('Product boxes in regulatory section:', productBoxes);
            
            // Find images
            const imgMatches = afterRegulatory.match(/<img[^>]+>/g);
            console.log('Images in regulatory section:', imgMatches);
            
            console.log('\nFull content after regulatory:');
            console.log(afterRegulatory.substring(0, 2000));
        }
    });
});
getReq.on('error', e => console.error('Error:', e));
getReq.end();
