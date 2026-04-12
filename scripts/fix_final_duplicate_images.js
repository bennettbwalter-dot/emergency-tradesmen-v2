import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function fixFinalDuplicates() {
    console.log('=== FIXING FINAL DUPLICATE IMAGES ===\n');

    const updates = [
        { slug: 'septic-tank-emergency-us', image: '/images/blog/generated/emergency-sewer-line.png', reason: 'Septic system' },
        { slug: 'emergency-water-main-repair-us', image: '/images/blog/generated/water-shut-off.webp', reason: 'Water main shut-off' },
        { slug: '5-signs-you-need-emergency-plumber-us', image: '/images/blog/generated/diy-disaster-main.webp', reason: 'DIY plumbing disaster' },
        { slug: 'emergency-services-gb', image: '/images/blog/generated/plumbing-heating-emergency-hero.webp', reason: 'Emergency services hero' },
    ];

    let successCount = 0;

    for (const update of updates) {
        const { data, error } = await supabase
            .from('posts')
            .update({ cover_image: update.image })
            .eq('slug', update.slug)
            .select('slug, title, cover_image');

        if (error) {
            console.error(`❌ ${update.slug}: ${error.message}`);
        } else if (data && data.length > 0) {
            console.log(`✅ ${update.slug}`);
            console.log(`   → ${update.image}`);
            console.log(`   (${update.reason})\n`);
            successCount++;
        }
    }

    console.log(`\n✅ Updated ${successCount} blogs`);
}

fixFinalDuplicates().catch(console.error);
