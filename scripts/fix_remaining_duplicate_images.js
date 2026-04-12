import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function fixRemainingDuplicates() {
    console.log('=== FIXING REMAINING DUPLICATE IMAGES ===\n');

    const updates = [
        // US blogs
        { slug: 'sewer-backup-prevention-backwater-valves-us', image: '/images/blog/generated/running_toilet_hero.webp', reason: 'Unique toilet/water image' },
        { slug: 'emergency-pipe-burst-protocol-us', image: '/images/blog/generated/water-shut-off.webp', reason: 'Water shut-off valve' },
        { slug: '5-signs-you-need-emergency-plumber-us', image: '/images/blog/generated/plumber-inspecting-drain.webp', reason: 'Plumber inspection' },
        { slug: 'frozen-pipe-thaw-flood-prevention-us', image: '/images/blog/generated/frozen-pipe.webp', reason: 'Frozen pipe specific' },
        { slug: 'emergency-pest-control-us', image: '/images/blog/generated/xsense-leak-detector.png', reason: 'US pest detector' },
        { slug: '2026-grid-instability-generator-resilience-us', image: '/images/blog/generated/generator-safety-hero-us.jpg', reason: 'Generator hero' },
        { slug: 'commercial-refrigeration-repair-us', image: '/images/blog/generated/costway-ac.png', reason: 'Commercial refrigeration' },
        
        // UK blogs
        { slug: 'generator-safety-grid-instability-gb', image: '/images/blog/generated/grid-instability.png', reason: 'UK grid instability' },
        { slug: 'emergency-services-gb', image: '/images/blog/generated/emergency-home-kit.webp', reason: 'Emergency services kit' },
    ];

    // Wait, let me check what emergency-services-gb and portable-power-stations-backup-gb currently have
    let successCount = 0;
    let errorCount = 0;

    for (const update of updates) {
        const { data, error } = await supabase
            .from('posts')
            .update({ cover_image: update.image })
            .eq('slug', update.slug)
            .select('slug, title, cover_image');

        if (error) {
            console.error(`❌ ${update.slug}: ${error.message}`);
            errorCount++;
        } else if (data && data.length > 0) {
            console.log(`✅ ${update.slug}`);
            console.log(`   → ${update.image}`);
            console.log(`   (${update.reason})\n`);
            successCount++;
        }
    }

    console.log('\n=== SUMMARY ===');
    console.log(`Updated: ${successCount}`);
    console.log(`Errors: ${errorCount}`);
}

fixRemainingDuplicates().catch(console.error);
