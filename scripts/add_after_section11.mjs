import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: process.cwd() + '/.env' });

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addProductAfterSection11() {
    const { data } = await supabase.from('posts').select('content').eq('slug', 'refrigerant-leak-safety-us').single();
    if (data) {
        const product = {
            title: 'The Unit: COSTWAY 6-in-1 Portable Air Conditioner',
            desc: 'Fully compliant with 2026 US safety standards for A2L refrigerants. Versatility: 6-in-1 functionality (Cool, Heat, Dehumidify, Fan, Sleep, Auto) provides full environmental control during HVAC downtime.',
            img: 'https://images.unsplash.com/photo-1631545806609-3b8d4c5e8d4e?w=400',
            link: 'https://www.amazon.com/dp/B09XYZ12345'
        };
        
        const productSection = `
<div class="amazon-product-section">
<div class="product-box">
<div class="product-image-wrapper">
<img src="${product.img}" alt="${product.title}" class="product-image">
</div>
<div class="product-info">
<h3>${product.title}</h3>
<p>${product.desc}</p>
<a href="${product.link}" target="_blank" rel="noopener" class="amazon-button">Buy on Amazon →</a>
</div>
</div>
</div>`;
        
        // Find section 11 heading and add product after it
        const section11Match = data.content.match(/<h2[^>]*>11\. Emergency Hardware:[^<]*<\/h2>/);
        
        let newContent = data.content;
        
        // Remove existing amazon sections first
        newContent = newContent.replace(/<div class="amazon-product-section">[\s\S]*?<\/div>\s*<\/div>/g, '');
        
        if (section11Match) {
            const insertPos = data.content.indexOf(section11Match[0]) + section11Match[0].length;
            newContent = newContent.substring(0, insertPos) + productSection + newContent.substring(insertPos);
        } else {
            // Add at end of section 11
            newContent = newContent + productSection;
        }
        
        await supabase.from('posts').update({ content: newContent }).eq('slug', 'refrigerant-leak-safety-us');
        console.log('Added product after section 11');
    }
}

addProductAfterSection11();
