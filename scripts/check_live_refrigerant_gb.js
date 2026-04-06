/**
 * Check live data for remaining duplicate buttons
 */

const SUPABASE_URL = 'https://xwqvhymkwuasotsgmarn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3cXZoeW1rd3Vhc290c2dtYXJuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTk5MDM0MywiZXhwIjoyMDgxNTY2MzQzfQ.ZJQXY5OzkfO4Ey2G5enTdPHx_shgDMGAUaTJAHKDKus';

async function main() {
    const url = `${SUPABASE_URL}/rest/v1/posts?select=*&slug=eq.refrigerant-leak-safety-gb`;
    const res = await fetch(url, {
        headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json'
        }
    });
    const data = await res.json();
    const post = data[0];
    const content = post.content;
    
    const btnCount = (content.match(/Buy on Amazon/g) || []).length;
    const boxCount = (content.match(/class="product-box"/g) || []).length;
    const sectionCount = (content.match(/class="amazon-product-section"/g) || []).length;
    
    console.log('Live data check:');
    console.log('Amazon buttons:', btnCount);
    console.log('Product boxes:', boxCount);
    console.log('Product sections:', sectionCount);
    
    // Show context around each button
    let idx = 0;
    let n = 1;
    while ((idx = content.indexOf('Buy on Amazon', idx)) !== -1) {
        console.log(`\n--- Button ${n} at ${idx} ---`);
        console.log(content.substring(Math.max(0, idx - 200), idx + 100));
        idx++;
        n++;
    }
}

main().catch(console.error);
