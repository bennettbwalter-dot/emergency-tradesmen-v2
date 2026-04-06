const https = require('https');

const SUPABASE_URL = 'xwqvhymkwuasotsgmarn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3cXZoeW1rd3Vhc290c2dtYXJuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTk5MDM0MywiZXhwIjoyMDgxNTY2MzQzfQ.ZJQXY5OzkfO4Ey2G5enTdPHx_shgDMGAUaTJAHKDKus';
const POST_ID = 'b8c662a9-c60a-40c8-bd65-375b52e1bfb4';

function makeRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: SUPABASE_URL,
      path: path,
      method: method,
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: data ? JSON.parse(data) : null });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function main() {
  console.log('Fetching blog post...');
  const { status, data } = await makeRequest(`/rest/v1/posts?id=eq.${POST_ID}&select=content`);
  
  if (status !== 200 || !data || !data[0]) {
    console.log('Failed to fetch post:', status, data);
    return;
  }

  let content = data[0].content;
  console.log('Original content length:', content.length);

  // Find the broken Amazon section - it starts with mazon-product-section
  const amazonSectionStart = content.indexOf('mazon-product-section');
  if (amazonSectionStart === -1) {
    console.log('No broken Amazon section found (already removed?)');
    return;
  }
  console.log('Amazon section starts at:', amazonSectionStart);
  
  // The section goes to end of content
  const sectionEnd = content.length;
  console.log('Amazon section ends at:', sectionEnd);
  console.log('Section content:', content.substring(amazonSectionStart));
  console.log('Amazon section ends at:', sectionEnd);
  const sectionToRemove = content.substring(amazonSectionStart, sectionEnd + 1);
  console.log('Section to remove length:', sectionToRemove.length);
  console.log('Section preview:', sectionToRemove.substring(0, 300));
  
  // Remove the section
  const newContent = content.substring(0, amazonSectionStart) + content.substring(sectionEnd + 1);
  console.log('New content length:', newContent.length);

  // Update Supabase
  console.log('Updating Supabase...');
  const updateResult = await makeRequest(`/rest/v1/posts?id=eq.${POST_ID}`, 'PATCH', { content: newContent });
  console.log('Update result:', updateResult.status);
  
  if (updateResult.status === 200 || updateResult.status === 204) {
    console.log('SUCCESS: Amazon HTML section removed from blog content');
  } else {
    console.log('Update failed:', updateResult.data);
  }
}

main().catch(console.error);
