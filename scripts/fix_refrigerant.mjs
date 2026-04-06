import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: process.cwd() + '/.env' });

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const fixedProducts = {
    'refrigerant-leak-safety-us': {
        title: 'The Unit: COSTWAY 6-in-1 Portable Air Conditioner',
        desc: 'Fully compliant with 2026 US safety standards for A2L refrigerants. Versatility: 6-in-1 functionality (Cool, Heat, Dehumidify, Fan, Sleep, Auto) provides full environmental control during HVAC downtime.',
        img: 'https://images.unsplash.com/photo-1631545806609-3b8d4c5e8d4e?w=400',
        link: 'https://www.amazon.com/dp/B09XYZ12345'
    }
};

async function fixProduct() {
    for (const [slug, product] of Object.entries(fixedProducts)) {
        const { data } = await supabase.from('posts').select('content').eq('slug', slug).single();
        if (data) {
            const section = `
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
            
            let newContent = data.content;
            if (newContent.includes('amazon-product-section')) {
                newContent = newContent.replace(/<div class="amazon-product-section">[\s\S]*?<\/div>\s*<\/div>/, section);
            }
            
            await supabase.from('posts').update({ content: newContent }).eq('slug', slug);
            console.log('Fixed:', slug);
        }
    }
}

fixProduct();
