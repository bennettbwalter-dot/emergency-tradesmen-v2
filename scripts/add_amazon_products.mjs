import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: process.cwd() + '/.env' });

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const ukProducts = {
    'smart-leak-detection-gb': {
        title: 'Yo智能漏水探测器',
        desc: 'WiFi连接，实时报警，手机APP控制',
        image: 'https://m.media-amazon.com/images/I/51abc5VnlML._AC_SL1000_.jpg',
        link: 'https://www.amazon.co.uk/dp/B0XYZ12345'
    },
    'portable-power-stations-backup-gb': {
        title: 'Jackery Portable Power Station',
        desc: '1000W大容量，应急电源，户外旅行必备',
        image: 'https://m.media-amazon.com/images/I/71abc12345L._AC_SL1500_.jpg',
        link: 'https://www.amazon.co.uk/dp/B0ABC12345'
    },
    'smart-leak-detection-2026-gb': {
        title: '三星智能水阀',
        desc: '自动关阀，远程控制，智能家居集成',
        image: 'https://m.media-amazon.com/images/I/61abc12345M._AC_SL1000_.jpg',
        link: 'https://www.amazon.co.uk/dp/B0DEF12345'
    },
    'refrigerant-leak-safety-gb': {
        title: 'Refrigerant Leak Detector',
        desc: '专业冷媒检漏仪，精准定位，安全保障',
        image: 'https://m.media-amazon.com/images/I/51abc12345N._AC_SL1000_.jpg',
        link: 'https://www.amazon.co.uk/dp/B0GHI12345'
    },
    'carbon-monoxide-gb': {
        title: 'Google Nest Protect Smoke & CO Detector',
        desc: '智能烟雾报警器，手机提醒，英国标准',
        image: 'https://m.media-amazon.com/images/I/71abc12345O._AC_SL1500_.jpg',
        link: 'https://www.amazon.co.uk/dp/B0JKL12345'
    }
};

const usProducts = {
    'smart-leak-detection-us': {
        title: 'YoSmart Water Leak Detector',
        desc: 'WiFi Enabled, Real-time Alerts, App Control',
        image: 'https://m.media-amazon.com/images/I/51abc5VnlML._AC_SL1000_.jpg',
        link: 'https://www.amazon.com/dp/B0XYZ12345'
    },
    'portable-power-stations-emergency-backup-us': {
        title: 'Jackery Portable Power Station',
        desc: '1000W Capacity, Emergency Backup, Outdoor Essential',
        image: 'https://m.media-amazon.com/images/I/71abc12345L._AC_SL1500_.jpg',
        link: 'https://www.amazon.com/dp/B0ABC12345'
    },
    'smart-leak-detection-2026-us': {
        title: 'Samsung Smart Water Valve',
        desc: 'Auto Shut-Off, Remote Control, Smart Home Ready',
        image: 'https://m.media-amazon.com/images/I/61abc12345M._AC_SL1000_.jpg',
        link: 'https://www.amazon.com/dp/B0DEF12345'
    },
    'refrigerant-leak-safety-us': {
        title: 'Refrigerant Leak Detector',
        desc: 'Professional Grade, Precise Detection, Safety First',
        image: 'https://m.media-amazon.com/images/I/51abc12345N._AC_SL1000_.jpg',
        link: 'https://www.amazon.com/dp/B0GHI12345'
    },
    'radon-emergency-us': {
        title: 'AirThings Corentium Radon Detector',
        desc: 'Professional Radon Monitor, Accurate Readings, EPA Standard',
        image: 'https://m.media-amazon.com/images/I/81abc12345P._AC_SL1500_.jpg',
        link: 'https://www.amazon.com/dp/B0MNO12345'
    }
};

function addProductSection(content, product, region) {
    const productBox = `
<div class="amazon-product-section">
<div class="product-box">
<img src="${product.image}" alt="${product.title}" class="product-image">
<div class="product-info">
<h3>${product.title}</h3>
<p>${product.desc}</p>
<a href="${product.link}" target="_blank" class="amazon-button">View on Amazon ${region}</a>
</div>
</div>
</div>`;
    
    const insertPoint = content.indexOf('<h2>');
    if (insertPoint > -1) {
        return content.substring(0, insertPoint) + productBox + content.substring(insertPoint);
    }
    return content + productBox;
}

async function addProducts() {
    let updated = 0;
    
    for (const [slug, product] of Object.entries(ukProducts)) {
        const { data } = await supabase.from('posts').select('content').eq('slug', slug).single();
        if (data && !data.content.includes('product-box')) {
            const newContent = addProductSection(data.content, product, 'UK');
            await supabase.from('posts').update({ content: newContent }).eq('slug', slug);
            console.log('Added UK product:', slug);
            updated++;
        }
    }
    
    for (const [slug, product] of Object.entries(usProducts)) {
        const { data } = await supabase.from('posts').select('content').eq('slug', slug).single();
        if (data && !data.content.includes('product-box')) {
            const newContent = addProductSection(data.content, product, 'US');
            await supabase.from('posts').update({ content: newContent }).eq('slug', slug);
            console.log('Added US product:', slug);
            updated++;
        }
    }
    
    console.log('\nDone! Added products to', updated, 'blogs');
}

addProducts();
