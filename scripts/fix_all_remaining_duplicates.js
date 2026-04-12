import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function fixAllRemainingDuplicates() {
    console.log('=== COMPREHENSIVE FINAL DUPLICATE FIX ===\n');

    const updates = [
        // US blogs - assign truly unique images
        { slug: 'sewer-line-repair-us', image: '/images/blog/generated/plumber-inspecting-drain.webp', reason: 'Sewer line inspection' },
        { slug: 'septic-tank-emergency-us', image: '/images/blog/generated/running_toilet_hero.webp', reason: 'Septic toilet emergency' },
        { slug: 'emergency-pipe-burst-protocol-us', image: '/images/blog/generated/frozen-pipe.webp', reason: 'Pipe burst frozen' },
        { slug: 'emergency-water-main-repair-us', image: '/images/blog/generated/tradesman-night-rain.webp', reason: 'Water main night repair' },
        { slug: '5-signs-you-need-emergency-plumber-us', image: '/images/blog/generated/plumbing-heating-emergency-hero.webp', reason: 'Plumber emergency signs' },
        { slug: 'emergency-handyman-us', image: '/images/blog/generated/diy-struggle.webp', reason: 'Handyman DIY work' },
        
        // UK blogs
        { slug: 'emergency-services-gb', image: '/images/blog/generated/gas-isolation.webp', reason: 'Emergency gas services' },
        { slug: 'emergency-heat-pump-thaw-gb', image: '/images/blog/generated/boiler-safety-diagram.webp', reason: 'Heat pump boiler system' },
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

    console.log(`\n=== FINAL SUMMARY ===`);
    console.log(`✅ Updated ${successCount} blogs`);
    console.log(`📝 Remaining duplicates (title-based, not image-based): 2 pairs`);
    console.log(`   - portable-power-stations-backup-gb & portable-power-stations-home-backup-gb (same topic)`);
    console.log(`   - generator-safety-grid-instability-us & 2026-grid-instability-generator-resilience-us (same topic)`);
    console.log(`   - ultimate-us-emergency-home-resilience-2026 & the-definitive-uk-home-security-safety-standards-2026 (cross-region shared)`);
}

fixAllRemainingDuplicates().catch(console.error);
