
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDuplicates() {
    const { data: posts, error } = await supabase
        .from('posts')
        .select('id, title, content, cover_image');

    if (error) {
        console.error('Error:', error);
        return;
    }

    posts.forEach(post => {
        if (post.content && post.cover_image) {
            // Check for the image URL anywhere in the content
            const imgUrl = post.cover_image.replace(/^\//, ''); // Remove leading slash
            const regex = new RegExp(`!\\[.*?\\]\\(.*?${imgUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}.*?\\)`, 'g');
            const matches = post.content.match(regex);

            if (matches) {
                console.log(`\nPost: ${post.title}`);
                console.log(`Hero Image: ${post.cover_image}`);
                matches.forEach(m => console.log(`  Found in content: ${m}`));
            }
        }
    });
}

checkDuplicates();
