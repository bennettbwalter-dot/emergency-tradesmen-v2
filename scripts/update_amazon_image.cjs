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
        let content = posts[0].content;
        
        // Replace the Unsplash image with local image
        const oldSrc = 'https://images.unsplash.com/photo-1622470953794-aa9c70b0fb9a?w=400';
        const newSrc = '/images/blog/generated/portable-power-stations-1.png';
        
        if (!content.includes(oldSrc)) {
            console.log('Old image src not found');
            const match = content.match(/amazon-product-section[\s\S]{1,300}/);
            console.log(match ? match[0] : 'Section not found');
            return;
        }
        
        content = content.replace(oldSrc, newSrc);
        console.log('Image replaced');
        
        const payload = JSON.stringify({ content, updated_at: new Date().toISOString() });
        const req = https.request({
            hostname: 'xwqvhymkwuasotsgmarn.supabase.co',
            path: `/rest/v1/posts?id=eq.${postId}`,
            method: 'PATCH',
            headers: {
                'apikey': apikey,
                'Authorization': `Bearer ${apikey}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload),
                'Prefer': 'return=representation'
            }
        }, (updateRes) => {
            let d2 = '';
            updateRes.on('data', c => d2 += c);
            updateRes.on('end', () => {
                console.log('Update status:', updateRes.statusCode);
                const result = JSON.parse(d2);
                if (result && result[0] && result[0].content.includes(newSrc)) {
                    console.log('Image updated successfully');
                }
            });
        });
        req.on('error', e => console.error('Error:', e));
        req.write(payload);
        req.end();
    });
});
getReq.on('error', e => console.error('Error:', e));
getReq.end();
