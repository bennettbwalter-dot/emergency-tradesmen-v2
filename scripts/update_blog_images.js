import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';

dotenv.config({ path: '.env' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function updateBlogImages() {
    const imageMapping = JSON.parse(readFileSync('scripts/blog_image_mapping.json', 'utf-8'));
    
    console.log(`=== UPDATING ${Object.keys(imageMapping).length} BLOG IMAGES ===\n`);

    const updates = Object.entries(imageMapping);
    let successCount = 0;
    let errorCount = 0;

    for (const [slug, newImage] of updates) {
        const { data, error } = await supabase
            .from('posts')
            .update({ cover_image: newImage })
            .eq('slug', slug)
            .select('slug, title, cover_image');

        if (error) {
            console.error(`❌ Error updating ${slug}:`, error.message);
            errorCount++;
        } else if (data && data.length > 0) {
            console.log(`✅ Updated: ${slug}`);
            console.log(`   → ${newImage}\n`);
            successCount++;
        } else {
            console.log(`⚠️  Not found: ${slug}\n`);
        }
    }

    console.log('\n=== SUMMARY ===');
    console.log(`✅ Successfully updated: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📊 Total attempted: ${updates.length}`);
}

updateBlogImages().catch(console.error);
