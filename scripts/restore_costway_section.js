/**
 * Restore a clean Amazon product section for refrigerant-leak-safety-us
 * with image, description, and styled button
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

async function main() {
    const post = await fetchPost('refrigerant-leak-safety-us');
    if (!post) {
        console.log('Post not found');
        return;
    }

    const content = post.content;

    // Check if section 11 heading still exists in TOC
    if (!content.includes('#11-emergency-hardware-the-2026-portable-ac-standard')) {
        console.log('Section 11 TOC entry not found - nothing to restore');
        return;
    }

    // Check if the actual section 11 h2 heading exists in the body
    const hasSection11Heading = content.includes('<h2 id="11-emergency-hardware-the-2026-portable-ac-standard">');
    
    if (hasSection11Heading) {
        console.log('Section 11 heading still exists - already restored or never removed');
        return;
    }

    // Insert the clean section 11 before section 12's h2
    const section12Heading = '<h2 id="12-24-7-response-connecting-with-epa-certified-us-resilience-experts">';
    const section12Idx = content.indexOf(section12Heading);
    
    if (section12Idx === -1) {
        console.log('Section 12 heading not found');
        return;
    }

    const cleanSection11 = `<h2 id="11-emergency-hardware-the-2026-portable-ac-standard">11. Emergency Hardware: The 2026 Portable AC Standard</h2>
<div class="amazon-product-section">
<div class="product-box">
<div class="product-image-wrapper">
<img class="product-image" src="/blog/ac-heatwave-preparation-signs-repair-us-2026/costway-6in1.webp" alt="COSTWAY 6-in-1 Portable Air Conditioner">
</div>
<div class="product-info">
<h3>COSTWAY 6-in-1 Portable Air Conditioner</h3>
<p>Fully compliant with 2026 US safety standards for A2L refrigerants. Versatility: 6-in-1 functionality (Cool, Heat, Dehumidify, Fan, Sleep, Auto) provides full environmental control during HVAC downtime.</p>
<a href="https://www.amazon.com/COSTWAY-Portable-Conditioners-Dehumidifier-Voice-Enabled/dp/B0B1VK8MPK?linkCode=ll2&tag=emergencytrad-20&linkId=ef9e4b1859351e3c750e3205983121e6&language=en_US&ref_=as_li_ss_tl" class="amazon-button" target="_blank" rel="noopener noreferrer">Buy on Amazon →</a>
</div>
</div>
</div>
`;

    const fixed = content.slice(0, section12Idx) + cleanSection11 + content.slice(section12Idx);

    const success = await updatePost(post.id, fixed);
    if (success) {
        console.log('✓ Clean section 11 restored with image, description, and button');
    } else {
        console.log('✗ Failed to update');
    }
}

main().catch(console.error);
