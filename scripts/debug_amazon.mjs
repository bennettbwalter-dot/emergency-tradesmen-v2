import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: process.cwd() + '/.env' });

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkAmazonBox() {
    const { data } = await supabase
        .from('posts')
        .select('content')
        .eq('slug', 'smart-leak-detection-us')
        .single();
    
    if (data) {
        const match = data.content.match(/<div class="product-box"[^>]*>[\s\S]*?<\/div>/);
        if (match) {
            console.log('=== Product Box Found ===');
            console.log(match[0]);
        } else {
            console.log('No product box found');
            const amazonMatch = data.content.match(/amazon[\s\S]{0,500}/);
            if (amazonMatch) console.log(amazonMatch[0].substring(0, 500));
        }
    }
}

checkAmazonBox();
