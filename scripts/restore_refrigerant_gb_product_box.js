/**
 * Restore proper Amazon product box for refrigerant-leak-safety-gb
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

async function updatePost(id, content) {
    const url = `${SUPABASE_URL}/rest/v1/posts?id=eq.${id}`;
    const res = await fetch(url, {
        method: 'PATCH',
        headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ content })
    });
    return res.ok;
}

function restoreProductBox(content) {
    const productBox = `

<div class="amazon-product-section">
<div class="product-box">
<div class="product-image-wrapper">
<img class="product-image" src="/images/blog/generated/refrigerant-hero-gb.png" alt="COSTWAY 6-in-1 Portable Air Conditioner">
</div>
<div class="product-info">
<h3>COSTWAY 6-in-1 Portable Air Conditioner</h3>
<p>UK-compliant portable climate control for 2026. 6-in-1 functionality (Cool, Heat, Dehumidify, Fan, Sleep, Auto) with energy-efficient operation.</p>
<a href="https://www.amazon.co.uk/COSTWAY-Portable-Conditioner-Dehumidifier-Automatic/dp/B0D2W516B5?linkCode=ll2&tag=et0a8-21&linkId=6196e1b84afed702131bb76d77875625&ref_=as_li_ss_tl" class="amazon-button" target="_blank" rel="noopener noreferrer">Buy on Amazon →</a>
</div>
</div>
</div>
`;

    // Insert before "Frequently Asked Questions" or before </main>
    const faqIdx = content.toLowerCase().indexOf('frequently asked questions');
    if (faqIdx > -1) {
        return content.slice(0, faqIdx) + productBox + '\n' + content.slice(faqIdx);
    }
    
    const mainCloseIdx = content.indexOf('</main>');
    if (mainCloseIdx > -1) {
        return content.slice(0, mainCloseIdx) + productBox + '\n' + content.slice(mainCloseIdx);
    }
    
    return content + productBox;
}

async function main() {
    const post = await fetchPost('refrigerant-leak-safety-gb');
    if (!post) {
        console.log('Post not found');
        return;
    }

    const fixed = restoreProductBox(post.content);
    const imgCount = (fixed.match(/<img/g) || []).length;
    const btnCount = (fixed.match(/Buy on Amazon/g) || []).length;
    const boxCount = (fixed.match(/class="product-box"/g) || []).length;
    
    console.log(`After restore - Images: ${imgCount}, Buttons: ${btnCount}, Boxes: ${boxCount}`);
    
    const success = await updatePost(post.id, fixed);
    if (success) {
        console.log('✓ Product box restored');
    } else {
        console.log('✗ Failed to update');
    }
}

main().catch(console.error);
