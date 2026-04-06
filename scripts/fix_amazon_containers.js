/**
 * Chunk 5: Build proper Amazon product containers for 5 posts
 * that only have a raw button without product box structure
 */

const SUPABASE_URL = 'https://xwqvhymkwuasotsgmarn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3cXZoeW1rd3Vhc290c2dtYXJuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTk5MDM0MywiZXhwIjoyMDgxNTY2MzQzfQ.ZJQXY5OzkfO4Ey2G5enTdPHx_shgDMGAUaTJAHKDKus';

const PRODUCTS = {
    'radon-emergency-us': {
        name: 'Aranet Radon Detector (SAF Aranet Home)',
        desc: 'Professional-grade digital radon monitoring for 2026 US EPA compliance. Real-time readings with smartphone alerts.',
        image: '/images/blog/generated/aranet-radon-detector-us.png',
        url: 'https://www.amazon.com/Aranet-Radon-Detector-Home-Ink/dp/B0DK3CRP79?linkCode=ll2&tag=emergencytrad-20&linkId=5db248b5c277b8e78e79ba9b615ca2d2&language=en_US&ref_=as_li_ss_tl'
    },
    'portable-power-stations-home-backup-gb': {
        name: 'BLUETTI Portable Power Station AC180',
        desc: 'UK-approved emergency backup power for 2026. 1,152Wh capacity, pure sine wave output, ideal for essential home appliances during outages.',
        image: '/images/blog/generated/bluetti-ac180-gb.png',
        url: 'https://www.amazon.co.uk/BLUETTI-Portable-AC180-Generator-Off-grid/dp/B0C1SMJTDT?linkCode=ll2&tag=et0a8-21&linkId=de799f2916e37bdff865e5bebfb3579b&ref_=as_li_ss_tl'
    },
    'portable-power-stations-emergency-backup-us': {
        name: 'BLUETTI Portable Power Station AC180',
        desc: 'US-approved emergency backup power for 2026. 1,152Wh capacity, pure sine wave output, ideal for essential home appliances during grid instability.',
        image: '/images/blog/generated/bluetti-ac180-us.png',
        url: 'https://www.amazon.com/BLUETTI-Portable-AC180-Generator-Off-grid/dp/B0C1SMJTDT?linkCode=ll2&tag=emergencytrad-20&linkId=35e97d3caf51b17294501b87c3298638&language=en_US&ref_=as_li_ss_tl'
    },
    'smart-leak-detection-2026-gb': {
        name: 'X-Sense Smart Water Leak Detector (SWS54)',
        desc: 'UK-compliant smart leak detection with 10-year battery life. Instant smartphone alerts and loud 85dB alarm for early flood prevention.',
        image: '/images/blog/generated/xsense-leak-detector-us.png',
        url: 'https://www.amazon.co.uk/X-Sense-Transmission-Basements-Bathrooms-SWS54/dp/B0BJ6B1LPQ?linkCode=ll2&tag=et0a8-21&linkId=de799f2916e37bdff865e5bebfb3579b&ref_=as_li_ss_tl'
    },
    'refrigerant-leak-safety-us': {
        name: 'COSTWAY 6-in-1 Portable Air Conditioner',
        desc: 'Fully compliant with 2026 US safety standards for A2L refrigerants. 6-in-1 functionality (Cool, Heat, Dehumidify, Fan, Sleep, Auto) for full environmental control.',
        image: '/blog/ac-heatwave-preparation-signs-repair-us-2026/costway-6in1.webp',
        url: 'https://www.amazon.com/COSTWAY-Portable-Conditioners-Dehumidifier-Voice-Enabled/dp/B0B1VK8MPK?linkCode=ll2&tag=emergencytrad-20&linkId=ef9e4b1859351e3c750e3205983121e6&language=en_US&ref_=as_li_ss_tl'
    },
    'refrigerant-leak-safety-gb': {
        name: 'COSTWAY 6-in-1 Portable Air Conditioner',
        desc: 'UK-compliant portable climate control for 2026. 6-in-1 functionality (Cool, Heat, Dehumidify, Fan, Sleep, Auto) with energy-efficient operation.',
        image: '/blog/ac-heatwave-preparation-signs-repair-us-2026/costway-6in1.webp',
        url: 'https://www.amazon.co.uk/COSTWAY-Portable-Conditioner-Dehumidifier-Automatic/dp/B0D2W516B5?linkCode=ll2&tag=et0a8-21&linkId=6196e1b84afed702131bb76d77875625&ref_=as_li_ss_tl'
    }
};

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

function buildProductBox(product) {
    return `<div class="amazon-product-section">
<div class="product-box">
<div class="product-image-wrapper">
<img class="product-image" src="${product.image}" alt="${product.name}">
</div>
<div class="product-info">
<h3>${product.name}</h3>
<p>${product.desc}</p>
<a href="${product.url}" class="amazon-button" target="_blank" rel="noopener noreferrer">Buy on Amazon →</a>
</div>
</div>
</div>`;
}

function fixAmazonStructure(content, slug) {
    const product = PRODUCTS[slug];
    if (!product) return content;
    
    // Remove any existing inline-styled Amazon button
    const inlineBtnRegex = /<a\s+href="https:\/\/www\.amazon\.[^"]+"\s+[^>]*style="[^"]*background-color:\s*#f0c14b[^"]*"[^>]*>Buy on Amazon →<\/a>/gi;
    let fixed = content.replace(inlineBtnRegex, '');
    
    // Also remove the wrapper div if it's empty now
    fixed = fixed.replace(/<div\s+style="[^"]*text-align:\s*center[^"]*">\s*<br>\s*<\/div>/gi, '');
    fixed = fixed.replace(/<div\s+style="[^"]*text-align:\s*center[^"]*">\s*<\/div>/gi, '');
    
    // Remove any remaining orphaned style fragments from old buttons
    fixed = fixed.replace(/[^<]*#f0c14b[^>]*">[\s]*<\/a>/gi, '');
    
    // Find the section heading that mentions the product or "Emergency Hardware" or similar
    // Insert product box before the next h2 heading or at the end of the article
    const productBox = buildProductBox(product);
    
    // Try to find a good insertion point - before the last h2 or before FAQ section
    const faqIdx = fixed.toLowerCase().indexOf('frequently asked questions');
    const lastH2Idx = fixed.lastIndexOf('<h2');
    
    let insertIdx = -1;
    if (faqIdx > -1) {
        insertIdx = faqIdx;
    } else if (lastH2Idx > -1) {
        insertIdx = lastH2Idx;
    }
    
    if (insertIdx > -1) {
        fixed = fixed.slice(0, insertIdx) + productBox + '\n' + fixed.slice(insertIdx);
    } else {
        // Append before closing </main>
        const mainCloseIdx = fixed.indexOf('</main>');
        if (mainCloseIdx > -1) {
            fixed = fixed.slice(0, mainCloseIdx) + productBox + '\n' + fixed.slice(mainCloseIdx);
        }
    }
    
    return fixed;
}

async function main() {
    const slugs = Object.keys(PRODUCTS);
    
    for (const slug of slugs) {
        console.log(`\nProcessing: ${slug}`);
        const post = await fetchPost(slug);
        if (!post) {
            console.log('  ✗ Not found');
            continue;
        }
        
        const fixed = fixAmazonStructure(post.content, slug);
        if (fixed !== post.content) {
            const success = await updatePost(post.id, fixed);
            console.log(success ? '  ✓ Product container added' : '  ✗ Failed');
        } else {
            console.log('  - No changes needed');
        }
    }
    
    console.log('\n=== Done ===');
}

main().catch(console.error);
