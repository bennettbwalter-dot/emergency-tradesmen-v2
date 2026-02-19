
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function auditWordCounts() {
    const { data, error } = await supabase.from('posts').select('title, slug, content');
    
    if (error) {
        console.error('Error fetching posts:', error);
        return;
    }

    console.log('Post Word Count Audit:');
    console.log('----------------------');
    
    data.forEach(p => {
        const words = p.content.split(/\s+/).filter(w => w.length > 0).length;
        const status = words >= 1200 ? '✅ PASS' : '❌ FAIL';
        console.log(`${p.slug.padEnd(50)}: ${words.toString().padStart(5)} words [${status}]`);
    });
}

auditWordCounts();
