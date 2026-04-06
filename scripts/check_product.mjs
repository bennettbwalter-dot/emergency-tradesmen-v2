import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: process.cwd() + '/.env' });

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const ukProductBlogs = [
    'smart-leak-detection-gb',
    'portable-power-stations-backup-gb',
    'smart-leak-detection-2026-gb',
    'refrigerant-leak-safety-gb'
];

const usProductBlogs = [
    'smart-leak-detection-us',
    'portable-power-stations-emergency-backup-us',
    'smart-leak-detection-2026-us',
    'refrigerant-leak-safety-us',
    'radon-emergency-us'
];

async function checkProductContent() {
    const allSlugs = [...ukProductBlogs, ...usProductBlogs];
    
    for (const slug of allSlugs) {
        const { data } = await supabase.from('posts').select('content').eq('slug', slug).single();
        if (data) {
            const hasProductBox = data.content.includes('product-box');
            const hasImage = data.content.includes('amazon') && data.content.includes('<img');
            const hasButton = data.content.includes('amazon') && data.content.includes('button');
            console.log(slug + ': box=' + hasProductBox + ', image=' + hasImage + ', button=' + hasButton);
        }
    }
}

checkProductContent();
