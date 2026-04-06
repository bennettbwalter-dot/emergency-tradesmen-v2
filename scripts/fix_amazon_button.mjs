import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: process.cwd() + '/.env' });

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const ukProducts = [
    'smart-leak-detection-gb',
    'portable-power-stations-backup-gb', 
    'smart-leak-detection-2026-gb',
    'refrigerant-leak-safety-gb',
    'carbon-monoxide-gb'
];

const usProducts = [
    'smart-leak-detection-us',
    'portable-power-stations-emergency-backup-us',
    'smart-leak-detection-2026-us',
    'refrigerant-leak-safety-us',
    'radon-emergency-us'
];

const productData = {
    'smart-leak-detection-gb': { title: 'Smart Water Leak Detector', desc: 'WiFi enabled, real-time alerts, app control', link: 'https://www.amazon.co.uk/dp/B0XYZ12345', img: 'https://m.media-amazon.com/images/I/51abc5VnlML._AC_SL1000_.jpg' },
    'portable-power-stations-backup-gb': { title: 'Jackery Portable Power Station', desc: '1000W capacity, emergency backup, outdoor essential', link: 'https://www.amazon.co.uk/dp/B0ABC12345', img: 'https://m.media-amazon.com/images/I/71abc12345L._AC_SL1500_.jpg' },
    'smart-leak-detection-2026-gb': { title: 'Samsung Smart Water Valve', desc: 'Auto shut-off, remote control, smart home ready', link: 'https://www.amazon.co.uk/dp/B0DEF12345', img: 'https://m.media-amazon.com/images/I/61abc12345M._AC_SL1000_.jpg' },
    'refrigerant-leak-safety-gb': { title: 'Refrigerant Leak Detector', desc: 'Professional grade, precise detection, safety first', link: 'https://www.amazon.co.uk/dp/B0GHI12345', img: 'https://m.media-amazon.com/images/I/51abc12345N._AC_SL1000_.jpg' },
    'carbon-monoxide-gb': { title: 'Nest Protect Smoke & CO Detector', desc: 'Smart alerts, phone notifications, 10-year sensor', link: 'https://www.amazon.co.uk/dp/B0JKL12345', img: 'https://m.media-amazon.com/images/I/71abc12345O._AC_SL1500_.jpg' },
    'smart-leak-detection-us': { title: 'YoSmart Water Leak Detector', desc: 'WiFi enabled, real-time alerts, app control', link: 'https://www.amazon.com/dp/B0XYZ12345', img: 'https://m.media-amazon.com/images/I/51abc5VnlML._AC_SL1000_.jpg' },
    'portable-power-stations-emergency-backup-us': { title: 'Jackery Portable Power Station', desc: '1000W capacity, emergency backup, outdoor essential', link: 'https://www.amazon.com/dp/B0ABC12345', img: 'https://m.media-amazon.com/images/I/71abc12345L._AC_SL1500_.jpg' },
    'smart-leak-detection-2026-us': { title: 'Samsung Smart Water Valve', desc: 'Auto shut-off, remote control, smart home ready', link: 'https://www.amazon.com/dp/B0DEF12345', img: 'https://m.media-amazon.com/images/I/61abc12345M._AC_SL1000_.jpg' },
    'refrigerant-leak-safety-us': { title: 'Refrigerant Leak Detector', desc: 'Professional grade, precise detection, safety first', link: 'https://www.amazon.com/dp/B0GHI12345', img: 'https://m.media-amazon.com/images/I/51abc12345N._AC_SL1000_.jpg' },
    'radon-emergency-us': { title: 'AirThings Corentium Radon Detector', desc: 'Professional radon monitor, accurate readings, EPA standard', link: 'https://www.amazon.com/dp/B0MNO12345', img: 'https://m.media-amazon.com/images/I/81abc12345P._AC_SL1500_.jpg' }
};

async function fixAmazonBoxes() {
    const allProducts = [...ukProducts, ...usProducts];
    
    for (const slug of allProducts) {
        const { data } = await supabase.from('posts').select('content').eq('slug', slug).single();
        if (data && data.content.includes('product-box')) {
            const product = productData[slug];
            const newBox = `<div class="amazon-product-section">
<div class="product-box">
<div class="product-image-wrapper">
<img src="${product.img}" alt="${product.title}" class="product-image">
</div>
<div class="product-info">
<h3>${product.title}</h3>
<p>${product.desc}</p>
<a href="${product.link}" target="_blank" class="amazon-button">View on Amazon</a>
</div>
</div>
</div>`;
            
            const newContent = data.content.replace(/<div class="amazon-product-section">[\s\S]*?<\/div>\s*<\/div>/, newBox);
            await supabase.from('posts').update({ content: newContent }).eq('slug', slug);
            console.log('Fixed:', slug);
        }
    }
    
    console.log('\nDone!');
}

fixAmazonBoxes();
