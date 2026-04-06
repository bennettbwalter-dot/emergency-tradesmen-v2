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
        
        // Find all amazon product sections
        const amazonSections = content.match(/<div class="amazon-product-section">[\s\S]*?<\/div>\s*<\/div>/g);
        console.log('Found', amazonSections ? amazonSections.length : 0, 'amazon sections');
        
        if (amazonSections) {
            amazonSections.forEach((section, i) => {
                console.log('\n--- Amazon Section', i + 1, '---');
                console.log(section.substring(0, 500));
            });
        }
    });
});
getReq.on('error', e => console.error('Error:', e));
getReq.end();
