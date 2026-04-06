import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    const { data } = await supabase.from('posts').select('content').eq('slug', '5-hidden-warning-signs-of-attic-mold-rainy-spring').single();
    if (data) {
        fs.writeFileSync('tmp/us_blog_content.txt', data.content);
        console.log("Wrote to tmp/us_blog_content.txt");
    }
}
main();
