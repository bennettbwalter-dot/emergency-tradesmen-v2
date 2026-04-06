import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: process.cwd() + '/.env' });

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyProducts() {
    const { data: posts } = await supabase.from('posts').select('slug, content');
    
    let ukCount = 0, usCount = 0;
    
    for (const p of posts) {
        if (p.content.includes('product-box')) {
            const isUK = p.content.includes('Amazon UK');
            if (isUK) ukCount++; else usCount++;
            
            const hasImage = p.content.includes('<img');
            const hasButton = p.content.includes('amazon-button');
            const hasInfo = p.content.includes('product-info');
            
            console.log(p.slug + ': image=' + hasImage + ', button=' + hasButton + ', info=' + hasInfo);
        }
    }
    
    console.log('\n=== Summary ===');
    console.log('UK blogs with products:', ukCount);
    console.log('US blogs with products:', usCount);
}

verifyProducts();
