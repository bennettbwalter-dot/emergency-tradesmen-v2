import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: process.cwd() + '/.env' });

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const products = {
    'smart-leak-detection-gb': {
        title: 'YoSmart WiFi Water Leak Detector',
        desc: 'Smart home water sensor with app alerts. Detect leaks before they become floods.',
        img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
        link: 'https://www.amazon.co.uk/s?k=water+leak+detector+wifi'
    },
    'portable-power-stations-backup-gb': {
        title: 'Portable Power Station 1000W',
        desc: 'Emergency backup power for home outages. Portable camping battery with multiple outlets.',
        img: 'https://images.unsplash.com/photo-1622470953794-aa9c70b0fb9a?w=400',
        link: 'https://www.amazon.co.uk/s?k=portable+power+station'
    },
    'smart-leak-detection-2026-gb': {
        title: 'Smart Water Shut Off Valve',
        desc: 'Automatic water shutoff valve with smart home integration. Prevent water damage.',
        img: 'https://images.unsplash.com/photo-1585771724684-38269d6639e9?w=400',
        link: 'https://www.amazon.co.uk/s?k=water+shut+off+valve+smart'
    },
    'refrigerant-leak-safety-gb': {
        title: 'Digital Refrigerant Leak Detector',
        desc: 'Professional HVAC leak detector. Accurate detection for all refrigerants.',
        img: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400',
        link: 'https://www.amazon.co.uk/s?k=refrigerant+leak+detector'
    },
    'carbon-monoxide-gb': {
        title: 'Nest Protect Smoke & CO Detector',
        desc: 'Smart smoke and carbon monoxide alarm with phone alerts. 10-year sensor life.',
        img: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400',
        link: 'https://www.amazon.co.uk/s?k=nest+protect+smoke+co+detector'
    },
    'smart-leak-detection-us': {
        title: 'YoSmart WiFi Water Leak Detector',
        desc: 'Smart home water sensor with app alerts. Detect leaks before they become floods.',
        img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
        link: 'https://www.amazon.com/s?k=water+leak+detector+wifi'
    },
    'portable-power-stations-emergency-backup-us': {
        title: 'Portable Power Station 1000W',
        desc: 'Emergency backup power for home outages. Portable camping battery with multiple outlets.',
        img: 'https://images.unsplash.com/photo-1622470953794-aa9c70b0fb9a?w=400',
        link: 'https://www.amazon.com/s?k=portable+power+station'
    },
    'smart-leak-detection-2026-us': {
        title: 'Smart Water Shut Off Valve',
        desc: 'Automatic water shutoff valve with smart home integration. Prevent water damage.',
        img: 'https://images.unsplash.com/photo-1585771724684-38269d6639e9?w=400',
        link: 'https://www.amazon.com/s?k=water+shut+off+valve+smart'
    },
    'refrigerant-leak-safety-us': {
        title: 'Digital Refrigerant Leak Detector',
        desc: 'Professional HVAC leak detector. Accurate detection for all refrigerants.',
        img: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400',
        link: 'https://www.amazon.com/s?k=refrigerant+leak+detector'
    },
    'radon-emergency-us': {
        title: 'AirThings Corentium Radon Detector',
        desc: 'Professional radon gas monitor. Accurate readings, EPA standards compliant.',
        img: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400',
        link: 'https://www.amazon.com/s?k=radon+detector'
    }
};

async function fixAllAmazon() {
    for (const [slug, product] of Object.entries(products)) {
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
<a href="${product.link}" target="_blank" rel="noopener" class="amazon-button">View on Amazon</a>
</div>
</div>
</div>`;
            
            let newContent = data.content;
            if (newContent.includes('amazon-product-section')) {
                newContent = newContent.replace(/<div class="amazon-product-section">[\s\S]*?<\/div>\s*<\/div>/, section);
            } else {
                const insertPos = newContent.indexOf('<h2');
                if (insertPos > -1) {
                    newContent = newContent.substring(0, insertPos) + section + newContent.substring(insertPos);
                }
            }
            
            await supabase.from('posts').update({ content: newContent }).eq('slug', slug);
            console.log('Fixed:', slug);
        }
    }
    
    console.log('\nDone!');
}

fixAllAmazon();
