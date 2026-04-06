/**
 * Check refrigerant-leak-safety-gb for duplicate Amazon content
 */

const SUPABASE_URL = 'https://xwqvhymkwuasotsgmarn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3cXZoeW1rd3Vhc290c2dtYXJuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTk5MDM0MywiZXhwIjoyMDgxNTY2MzQzfQ.ZJQXY5OzkfO4Ey2G5enTdPHx_shgDMGAUaTJAHKDKus';

async function fetchPost(slug) {
    const url = `${SUPABASE_URL}/rest/v1/posts?select=*&slug=eq.${encodeURIComponent(slug)}`;
    const res = await fetch(url, {
        headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json'
        }
    });
    const data = await res.json();
    return data[0];
}

async function main() {
    const post = await fetchPost('refrigerant-leak-safety-gb');
    if (!post) {
        console.log('Post not found');
        return;
    }

    const content = post.content;
    
    // Count Amazon elements
    const amazonBtnCount = (content.match(/Buy on Amazon/g) || []).length;
    const amazonLinkCount = (content.match(/amazon\.[a-z.]+/g) || []).length;
    const productBoxCount = (content.match(/class="product-box"/g) || []).length;
    const productImageCount = (content.match(/class="product-image"/g) || []).length;
    const costwayCount = (content.match(/COSTWAY/gi) || []).length;
    
    console.log('=== refrigerant-leak-safety-gb Amazon Audit ===');
    console.log('Buy on Amazon buttons:', amazonBtnCount);
    console.log('Amazon links:', amazonLinkCount);
    console.log('Product boxes:', productBoxCount);
    console.log('Product images:', productImageCount);
    console.log('COSTWAY mentions:', costwayCount);
    
    // Show all Amazon product sections
    const sections = content.match(/<div class="amazon-product-section">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/gi) || [];
    console.log('\nAmazon product sections found:', sections.length);
    sections.forEach((s, i) => {
        console.log(`\n--- Section ${i+1} (${s.length} chars) ---`);
        console.log(s.substring(0, 500));
    });
    
    // Show context around each "Buy on Amazon"
    let idx = 0;
    let btnNum = 1;
    while ((idx = content.indexOf('Buy on Amazon', idx)) !== -1) {
        console.log(`\n--- Button ${btnNum} at position ${idx} ---`);
        console.log(content.substring(Math.max(0, idx - 200), idx + 50));
        idx += 1;
        btnNum++;
    }
}

main().catch(console.error);
