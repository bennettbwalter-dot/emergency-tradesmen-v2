import fs from 'fs';

const buf = fs.readFileSync('scripts/all_posts_content.json');
console.log('Buffer length:', buf.length);
console.log('First 10 bytes:', buf.slice(0, 10).toString('hex'));
console.log('First 10 bytes (utf8):', buf.slice(0, 10).toString('utf8'));
console.log('First 10 bytes (utf16le):', buf.slice(0, 10).toString('utf16le'));
