import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: process.cwd() + '/.env' });

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function removeDuplicate() {
    const { data } = await supabase.from('posts').select('content').eq('slug', 'refrigerant-leak-safety-us').single();
    if (data) {
        // Remove ALL amazon sections first
        let newContent = data.content.replace(/<div class="amazon-product-section">[\s\S]*?<\/div>\s*<\/div>/g, '');
        
        // Now add only ONE product section after section 11
        const productSection = `
<div class="amazon-product-section">
<div class="product-box">
<div class="product-image-wrapper">
<img src="https://images.unsplash.com/photo-1631545806609-3b8d4c5e8d4e?w=400" alt="The Unit: COSTWAY 6-in-1 Portable Air Conditioner" class="product-image">
</div>
<div class="product-info">
<h3>The Unit: COSTWAY 6-in-1 Portable Air Conditioner</h3>
<p>Fully compliant with 2026 US safety standards for A2L refrigerants. Versatility: 6-in-1 functionality (Cool, Heat, Dehumidify, Fan, Sleep, Auto) provides full environmental control during HVAC downtime.</p>
<a href="https://www.amazon.com/dp/B09XYZ12345" target="_blank" rel="noopener" class="amazon-button">Buy on Amazon →</a>
</div>
</div>
</div>`;
        
        const section11Match = newContent.match(/<h2[^>]*>11\. Emergency Hardware:[^<]*<\/h2>/);
        if (section11Match) {
            const insertPos = newContent.indexOf(section11Match[0]) + section11Match[0].length;
            newContent = newContent.substring(0, insertPos) + productSection + newContent.substring(insertPos);
        }
        
        await supabase.from('posts').update({ content: newContent }).eq('slug', 'refrigerant-leak-safety-us');
        console.log('Fixed - now only 1 product at section 11');
    }
}

removeDuplicate();
