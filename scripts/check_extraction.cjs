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
        
        // Find footer tags
        const footerStart = content.indexOf('<footer');
        const footerEnd = content.indexOf('</footer>');
        console.log('footer start:', footerStart);
        console.log('footer end:', footerEnd);
        
        // Find amazon section
        const amazonIdx = content.indexOf('amazon-product-section');
        console.log('amazon section at:', amazonIdx);
        
        // Check if amazon is in footer
        if (footerStart > -1 && footerEnd > -1 && amazonIdx > -1) {
            console.log('Amazon in footer:', amazonIdx > footerStart && amazonIdx < footerEnd);
        }
        
        // Show what gets extracted
        const extracted = content
            .replace(/<html[^>]*>|<\/html>|<body[^>]*>|<\/body>|<head[^>]*>[\s\S]*?<\/head>|<meta[^>]*>|<title[^>]*>[\s\S]*?<\/title>|<header[^>]*>[\s\S]*?<\/header>|<\/header>|<footer[^>]*>[\s\S]*?<\/footer>|<\/footer>/gi, '');
        
        const imgInExtracted = (extracted.match(/<img/g) || []).length;
        console.log('\nImages in extracted content:', imgInExtracted);
        
        // Show last part of extracted content
        console.log('\nLast 500 chars of extracted:');
        console.log(extracted.substring(extracted.length - 500));
    });
});
getReq.on('error', e => console.error('Error:', e));
getReq.end();
