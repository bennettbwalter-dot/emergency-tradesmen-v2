/**
 * Find all images in refrigerant-leak-safety-gb
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
    const content = data[0].content;
    
    // Find all img tags
    const imgRegex = /<img[^>]+>/gi;
    const images = [...content.matchAll(imgRegex)];
    
    console.log('Total images found:', images.length);
    images.forEach((img, i) => {
        console.log(`\n--- Image ${i+1} ---`);
        console.log('Full tag:', img[0]);
        const idx = content.indexOf(img[0]);
        console.log('Position:', idx);
        console.log('Context after:', content.substring(idx + img[0].length, idx + img[0].length + 200));
    });
    
    // Find all product-image classes
    const productImgRegex = /class="product-image"/gi;
    const productImages = [...content.matchAll(productImgRegex)];
    console.log('\n\nProduct images found:', productImages.length);
    
    // Find all amazon-product-section
    const sectionRegex = /class="amazon-product-section"/gi;
    const sections = [...content.matchAll(sectionRegex)];
    console.log('Amazon product sections:', sections.length);
}

main().catch(console.error);
