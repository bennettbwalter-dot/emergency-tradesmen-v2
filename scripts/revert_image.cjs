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
        
        // Replace picsum with local image
        content = content.replace('src="https://picsum.photos/280/280"', 'src="/images/blog/generated/portable-power-stations.png"');
        console.log('Reverted to local image');
        
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
            });
        });
        req.on('error', e => console.error('Error:', e));
        req.write(payload);
        req.end();
    });
});
getReq.on('error', e => console.error('Error:', e));
getReq.end();
