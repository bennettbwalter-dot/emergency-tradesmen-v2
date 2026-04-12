import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

/**
 * RESTORE ALL BLOG COVER IMAGES TO COLOR BLOCK IMAGES
 * This maps each blog slug to its appropriate color block image from public/images/blog/generated/
 */
async function restoreAllBlogImages() {
    console.log('=== RESTORING ALL BLOG COVER IMAGES TO COLOR BLOCKS ===\n');

    // Complete mapping of ALL 79 blogs to their color block images
    const imageMapping = {
        // ==================== US BLOGS (42) ====================
        'security-audit-us': '/images/blog/generated/vetted-pro-badge.webp',
        '5-hidden-warning-signs-of-attic-mold-rainy-spring-us': '/images/blog/generated/attic-mold-hero-us.png',
        'ultimate-us-emergency-home-resilience-2026': '/images/blog/generated/us-technical-standards-hub.jpg',
        'ac-blowing-warm-air-capacitor-leak-us': '/images/blog/generated/ac-capacitor-hero-us.jpg',
        'emergency-ev-charger-repair-us': '/images/blog/ev-charger-repair/header-portrait.webp',
        'water-leaking-through-ceiling-first-steps-us': '/images/blog/generated/water-leaking-from-ceiling.png',
        'sewage-smell-in-house-p-trap-us': '/images/blog/generated/p-trap-diagram.webp',
        'emergency-repair-contractor-improve-not-move-us': '/images/blog/improve-not-move/hero.png',
        'carbon-monoxide-us': '/images/blog/carbon-monoxide/header-portrait.webp',
        'sump-pump-failure-resilience-us': '/images/blog/generated/running_toilet_hero.webp',
        'smart-lock-emergency-us': '/images/blog/generated/smart-lock-hero-gb.jpg',
        'smart-leak-detection-us': '/images/blog/generated/smart-leak-detection-portrait-hero-us.jpg',
        'smart-leak-detection-2026-us': '/images/blog/generated/smart-leak-detection-us-hero.png',
        'sewer-line-repair-us': '/images/blog/generated/emergency-sewer-line.png',
        'sewer-backup-prevention-us': '/images/blog/generated/toilet_tank_mechanism.webp',
        'sewer-backup-prevention-backwater-valves-us': '/images/blog/generated/xsense-leak-detector-us.png',
        'septic-tank-emergency-us': '/images/blog/generated/xsense-infographic-us.jpg',
        'refrigerant-leak-safety-us': '/images/blog/generated/refrigerant-hero-gb.png',
        'radon-emergency-us': '/images/blog/generated/home-security-safety.png',
        'mould-remediation-us': '/images/blog/generated/mould-hero.png',
        'generator-safety-grid-instability-us': '/images/blog/generated/generator-safety-hero-us.jpg',
        'flat-roof-leak-prevention-us': '/images/blog/generated/roof-leak.png',
        'facility-management-emergency-us': '/images/blog/generated/us-service-truck.webp',
        'emergency-water-main-repair-us': '/images/blog/generated/water-shut-off.webp',
        'emergency-trades-us': '/images/blog/generated/et-service-van-night.webp',
        'emergency-roof-repair-us': '/images/blog/generated/roof-repair.png',
        'emergency-pipe-burst-protocol-us': '/images/blog/generated/frozen-pipe.webp',
        'emergency-pest-control-us': '/images/blog/generated/pest-control.png',
        'emergency-heat-pump-thaw-us': '/images/blog/generated/heat-pump.png',
        'emergency-handyman-us': '/images/blog/generated/diy-struggle.webp',
        'emergency-glazing-us': '/images/blog/generated/glazing-replacement.webp',
        'emergency-drain-cleaning-us': '/images/blog/generated/drain-cleaning.png',
        'emergency-contractor-us': '/images/blog/generated/diy-disaster-main.webp',
        'emergency-at-home-master-protocol-us': '/images/blog/generated/emergency-home-kit.webp',
        'commercial-refrigeration-repair-us': '/images/blog/generated/costway-ac.png',
        'commercial-electrician-us': '/images/blog/generated/us-hvac-system.webp',
        'building-envelope-audit-us': '/images/blog/generated/us-certification-badge.webp',
        '5-signs-you-need-emergency-plumber-us': '/images/blog/generated/plumber-inspecting-drain.webp',
        'portable-power-stations-emergency-backup-us': '/images/blog/generated/portable-power-stations.png',
        'frozen-pipe-thaw-flood-prevention-us': '/images/blog/generated/plumbing.png',
        'forced-entry-prevention-door-hardening-us': '/images/blog/generated/door-hardening.png',
        '2026-grid-instability-generator-resilience-us': '/images/blog/generated/grid-instability.png',
        'structural-cracks-foundation-repair-us': '/images/blog/generated/foundation-cracks.png',

        // ==================== UK BLOGS (35) ====================
        '7-ways-to-safe-proof-your-garden-electrics-spring-2026-gb': '/images/blog/generated/garden-electrics-hero-gb.jpg',
        'ultimate-us-emergency-home-resilience-2026': '/images/blog/generated/uk-technical-standards-hub.jpg',
        'the-definitive-uk-home-security-safety-standards-2026': '/images/blog/generated/home-security-safety-1.png',
        'emergency-ev-charger-repair-gb': '/images/blog/ev-charger-repair/header-portrait.webp',
        'emergency-repair-contractor-improve-not-move-gb': '/images/blog/improve-not-move/hero.png',
        'carbon-monoxide-gb': '/images/blog/carbon-monoxide/header-portrait.webp',
        '2026-anti-snap-lock-lockdown-gb': '/images/blog/anti-snap-locks/header-portrait.webp',
        'smart-lock-emergency-gb': '/images/blog/generated/smart-lock-hero-gb.jpg',
        'smart-leak-detection-gb': '/images/blog/generated/smart-leaky-hero.png',
        'smart-leak-detection-2026-gb': '/images/blog/generated/smart-water-sensor.png',
        'sewer-backup-prevention-gb': '/images/blog/generated/battery-check.webp',
        'sewage-cleanup-gb': '/images/blog/generated/mold-restoration.png',
        'refrigerant-leak-safety-gb': '/images/blog/generated/refrigerant-hero-gb.png',
        'portable-power-stations-backup-gb': '/images/blog/generated/portable-power-stations-1.png',
        'mould-remediation-gb': '/images/blog/generated/mould-hero.png',
        'hybrid-heating-backup-gb': '/images/blog/generated/boiler-safety-diagram.webp',
        'generator-safety-grid-instability-gb': '/images/blog/generated/jump-cables.webp',
        'flat-roof-leak-prevention-gb': '/images/blog/generated/roof-leak.png',
        'emergency-water-main-repair-gb': '/images/blog/generated/tradesman-night-rain.webp',
        'emergency-tradesmen-uk': '/images/blog/generated/fast-response-stopwatch.webp',
        'emergency-services-gb': '/images/blog/generated/emergency-home-kit.webp',
        'emergency-roof-repair-gb': '/images/blog/generated/roof-repair.png',
        'emergency-pipe-burst-protocol-gb': '/images/blog/generated/frozen-pipe.webp',
        'emergency-pest-control-gb': '/images/blog/generated/pest-control.png',
        'emergency-heat-pump-thaw-gb': '/images/blog/generated/heat-pump.png',
        'emergency-glazing-gb': '/images/blog/generated/broken-window-boarding.webp',
        'emergency-drain-cleaning-gb': '/images/blog/generated/drain-cleaning.png',
        'electrical-emergencies-homeowner-guide-gb': '/images/blog/generated/electrical-emergencies.png',
        'commercial-gas-safe-uk': '/images/blog/generated/gas-isolation.webp',
        'commercial-drainage-gb': '/images/blog/generated/plumber-inspecting-drain.webp',
        'can-you-legally-stay-in-home-without-electricity-gb': '/images/blog/generated/home-without.png',
        'spring-thaw-burst-pipe-prevention-gb': '/images/blog/generated/plumbing.png',
        'portable-power-stations-home-backup-gb': '/images/blog/generated/portable-power-stations-2.jpg',
        'hollow-frame-door-security-trap-gb': '/images/blog/generated/plywood-install.webp',
        'car-battery-alternator-failure-gb': '/images/blog/generated/car-battery-frosty.webp',
        '2026-energy-crisis-generator-safety-gb': '/images/blog/generated/grid-instability.png',
        'emergency-plumber-london-guide-gb': '/images/blog/generated/bluetti-power-station.png',
    };

    let successCount = 0;
    let errorCount = 0;

    console.log(`Total blogs to update: ${Object.keys(imageMapping).length}\n`);

    for (const [slug, image] of Object.entries(imageMapping)) {
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

    console.log('\n=== RESTORATION COMPLETE ===');
    console.log(`✅ Successfully updated: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📊 Total attempted: ${Object.keys(imageMapping).length}`);
}

restoreAllBlogImages().catch(console.error);
