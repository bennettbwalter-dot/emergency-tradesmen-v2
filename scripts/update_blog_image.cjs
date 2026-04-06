const https = require('https');

const apikey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3cXZoeW1rd3Vhc290c2dtYXJuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTk5MDM0MywiZXhwIjoyMDgxNTY2MzQzfQ.ZJQXY5OzkfO4Ey2G5enTdPHx_shgDMGAUaTJAHKDKus';
const postId = 'b8c662a9-c60a-40c8-bd65-375b52e1bfb4';
const newImage = '/images/blog/generated/portable-power-stations.png';

const payload = JSON.stringify({ cover_image: newImage });

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
}, (res) => {
    let d = '';
    res.on('data', c => d += c);
    res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Response:', d);
    });
});
req.on('error', (e) => console.error('Error:', e));
req.write(payload);
req.end();
