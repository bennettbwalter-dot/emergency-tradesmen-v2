import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: process.cwd() + '/.env' });

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkLocation() {
    const { data } = await supabase.from('posts').select('content').eq('slug', 'refrigerant-leak-safety-us').single();
    if (data) {
        const h2s = data.content.match(/<h2[^>]*>/g);
        console.log('H2 count:', h2s ? h2s.length : 0);
        
        const amazonPos = data.content.indexOf('amazon-product-section');
        const h2Positions = [];
        let match;
        const regex = /<h2[^>]*>/g;
        while ((match = regex.exec(data.content)) !== null) {
            h2Positions.push(match.index);
        }
        
        console.log('Amazon position:', amazonPos);
        console.log('H2 positions:', h2Positions);
        
        if (amazonPos > -1) {
            const whichH2 = h2Positions.filter(p => p < amazonPos).length;
            console.log('Amazon is after H2 #', whichH2 + 1);
        }
    }
}

checkLocation();
