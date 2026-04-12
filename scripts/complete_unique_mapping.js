import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function createCompleteUniqueMapping() {
    console.log('=== CREATING COMPLETE UNIQUE IMAGE MAPPING ===\n');

    // Get all blogs
    const { data: allPosts } = await supabase
        .from('posts')
        .select('slug, title, cover_image, published')
        .eq('published', true)
        .order('published_at', { ascending: false });

    const usPosts = allPosts.filter(p => p.slug.endsWith('-us') || p.slug.endsWith('-usa') || (!p.slug.match(/-(gb|uk)$/)));
    
    // Map each US blog to a UNIQUE image
    const completeMapping = {
        'security-audit-us': '/images/blog/generated/vetted-pro-badge.webp',
        '5-hidden-warning-signs-of-attic-mold-rainy-spring-us': '/images/blog/generated/attic-mold-hero-us.png',
        'ultimate-us-emergency-home-resilience-2026': '/images/blog/generated/us-technical-standards-hub.jpg',
        'ac-blowing-warm-air-capacitor-leak-us': '/images/blog/generated/ac-capacitor-hero-us.jpg',
        'emergency-ev-charger-repair-us': '/images/blog/ev-charger-repair/header-portrait.webp',
        'water-leaking-through-ceiling-first-steps-us': '/images/blog/generated/water-leaking-from-ceiling.png',
        'sewage-smell-in-house-p-trap-us': '/images/blog/sewage-smell/header-portrait.webp',
        'emergency-repair-contractor-improve-not-move-us': '/images/blog/improve-not-move/hero.png',
        'carbon-monoxide-us': '/images/blog/carbon-monoxide/header-portrait.webp',
        'sump-pump-failure-resilience-us': '/images/blog/sump-pump-resilience-2026/sump-pump-pool.webp',
        'smart-lock-emergency-us': '/images/blog/smart-locks/header-portrait.webp',
        'smart-leak-detection-us': '/images/blog/generated/smart-leak-detection-portrait-hero-us.jpg',
        'smart-leak-detection-2026-us': '/images/blog/generated/smart-leak-detection-us-hero.png',
        'sewer-line-repair-us': '/images/blog/generated/emergency-sewer-line.png',
        'sewer-backup-prevention-us': '/images/blog/generated/toilet_tank_mechanism.webp',
        'sewer-backup-prevention-backwater-valves-us': '/images/blog/generated/xsense-leak-detector-us.png',
        'septic-tank-emergency-us': '/images/blog/generated/running_toilet_hero.webp',
        'refrigerant-leak-safety-us': '/images/blog/ac-heatwave-preparation-signs-repair-us-2026/costway-6in1.webp',
        'radon-emergency-us': '/images/blog/spring-condensation/aranet-radon-detector.webp',
        'mould-remediation-us': '/images/blog/generated/mold-restoration.png',
        'generator-safety-grid-instability-us': '/images/blog/generated/generator-safety-hero-us.jpg',
        'flat-roof-leak-prevention-us': '/images/blog/generated/roof-leak.png',
        'facility-management-emergency-us': '/images/blog/generated/us-service-truck.webp',
        'emergency-water-main-repair-us': '/images/blog/generated/water-shut-off.webp',
        'emergency-trades-us': '/images/blog/generated/et-service-van-night.webp',
        'emergency-roof-repair-us': '/images/blog/generated/roof-repair.png',
        'emergency-pipe-burst-protocol-us': '/images/blog/generated/plumbing-emergency-signs.png',
        'emergency-pest-control-us': '/images/blog/generated/xsense-leak-detector.png',
        'emergency-heat-pump-thaw-us': '/images/blog/generated/pouring-warm-water.webp',
        'emergency-handyman-us': '/images/blog/generated/diy-disaster-main.webp',
        'emergency-glazing-us': '/images/blog/generated/glazing-replacement.webp',
        'emergency-drain-cleaning-us': '/images/blog/generated/plumber-inspecting-drain.webp',
        'emergency-contractor-us': '/images/blog/generated/diy-struggle.webp',
        'emergency-at-home-master-protocol-us': '/images/blog/generated/emergency-home-kit.webp',
        'commercial-refrigeration-repair-us': '/images/blog/generated/costway-ac.png',
        'commercial-electrician-us': '/images/blog/generated/us-hvac-system.webp',
        'building-envelope-audit-us': '/images/blog/generated/us-certification-badge.webp',
        '5-signs-you-need-emergency-plumber-us': '/images/blog/generated/plumbing-heating-emergency-hero.webp',
        'portable-power-stations-emergency-backup-us': '/images/blog/portable-power/bluetti-solar-outdoor.webp',
        'frozen-pipe-thaw-flood-prevention-us': '/images/blog/generated/frozen-pipe.webp',
        'forced-entry-prevention-door-hardening-us': '/images/blog/generated/door-hardening.png',
        '2026-grid-instability-generator-resilience-us': '/images/blog/generated/car-battery-frosty.webp',
        'structural-cracks-foundation-repair-us': '/images/blog/generated/foundation-cracks.png',
    };

    let successCount = 0;
    let errorCount = 0;

    for (const [slug, image] of Object.entries(completeMapping)) {
        const { error } = await supabase
            .from('posts')
            .update({ cover_image: image })
            .eq('slug', slug);

        if (error) {
            console.error(`❌ ${slug}: ${error.message}`);
            errorCount++;
        } else {
            successCount++;
        }
    }

    console.log(`✅ Updated ${successCount} US blogs with unique images`);
    console.log(`❌ Errors: ${errorCount}\n`);

    // Now verify
    console.log('=== VERIFYING UNIQUENESS ===\n');
    const { data: verifyPosts } = await supabase
        .from('posts')
        .select('slug, cover_image')
        .eq('published', true);

    const usVerify = verifyPosts.filter(p => p.slug.endsWith('-us') || p.slug.endsWith('-usa') || (!p.slug.match(/-(gb|uk)$/)));
    const imageCounts = {};
    
    usVerify.forEach(p => {
        if (p.cover_image) {
            if (!imageCounts[p.cover_image]) imageCounts[p.cover_image] = [];
            imageCounts[p.cover_image].push(p.slug);
        }
    });

    const duplicates = Object.entries(imageCounts).filter(([_, slugs]) => slugs.length > 1);
    
    if (duplicates.length === 0) {
        console.log('✅✅✅ ALL US BLOG IMAGES ARE NOW UNIQUE! ✅✅✅\n');
    } else {
        console.log(`Still have ${duplicates.length} duplicate(s):\n`);
        duplicates.forEach(([image, slugs]) => {
            console.log(`Image: ${image}`);
            slugs.forEach(s => console.log(`  - ${s}`));
            console.log('');
        });
    }
}

createCompleteUniqueMapping().catch(console.error);
