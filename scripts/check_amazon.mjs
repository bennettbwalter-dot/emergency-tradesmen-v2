import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkAmazonLinks() {
    const { data: posts } = await supabase
        .from('posts')
        .select('slug, content, title')
        .eq('published', true);

    console.log('=== Checking for Amazon product boxes ===\n');
    
    let hasAmazon = 0;
    let noAmazon = 0;
    
    for (const p of posts) {
        const hasProductBox = p.content.includes('product-box') || p.content.includes('amazon-product');
        const hasAmazonLink = p.content.includes('amazon.com') || p.content.includes('amazon.co.uk');
        const hasBuyButton = p.content.includes('buy-button') || p.content.includes('amazon-btn');
        
        if (hasProductBox || hasAmazonLink) {
            hasAmazon++;
            console.log('HAS AMAZON:', p.slug);
            console.log('  Product box:', hasProductBox);
            console.log('  Amazon link:', hasAmazonLink);
            console.log('  Buy button:', hasBuyButton);
        } else {
            noAmazon++;
        }
    }
    
    console.log('\n=== Summary ===');
    console.log('With Amazon:', hasAmazon);
    console.log('Without Amazon:', noAmazon);
}

checkAmazonLinks();
