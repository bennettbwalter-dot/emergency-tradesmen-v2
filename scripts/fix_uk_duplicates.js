import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function fixUkDuplicates() {
    console.log('=== FIXING UK BLOG DUPLICATES ===\n');

    // Complete unique mapping for UK blogs
    const ukMapping = {
        '7-ways-to-safe-proof-your-garden-electrics-spring-2026-gb': '/images/blog/generated/garden-electrics-hero-gb.jpg',
        'ultimate-us-emergency-home-resilience-2026': '/images/blog/generated/uk-technical-standards-hub.jpg',
        'the-definitive-uk-home-security-safety-standards-2026': '/images/blog/generated/home-security-safety-1.png',
        'emergency-ev-charger-repair-gb': '/images/blog/ev-charger-repair/header-portrait.webp',
        'emergency-repair-contractor-improve-not-move-gb': '/images/blog/improve-not-move/hero.png',
        'carbon-monoxide-gb': '/images/blog/carbon-monoxide/header-portrait.webp',
        '2026-anti-snap-lock-lockdown-gb': '/images/blog/anti-snap-locks/header-portrait.webp',
        'smart-lock-emergency-gb': '/images/blog/generated/smart-lock-hero-gb.jpg',
        'smart-leak-detection-gb': '/images/blog/generated/smart-leaky-hero.png',
        'smart-leak-detection-2026-gb': '/images/blog/smart-leak-detection-2026/smart-leak-header.webp',
        'sewer-backup-prevention-gb': '/images/blog/sewer-backup-gb/sewer-backup-hero.png',
        'sewage-cleanup-gb': '/images/blog/sewage-smell/header-portrait.webp',
        'refrigerant-leak-safety-gb': '/images/blog/ac-heatwave-preparation-signs-repair-uk-2026/costway-6in1.webp',
        'portable-power-stations-backup-gb': '/images/blog/generated/battery-check.webp',
        'mould-remediation-gb': '/images/blog/generated/mold-restoration.png',
        'hybrid-heating-backup-gb': '/images/blog/generated/boiler-safety-diagram.webp',
        'generator-safety-grid-instability-gb': '/images/blog/generated/grid-instability.png',
        'flat-roof-leak-prevention-gb': '/images/blog/generated/roof-leak.png',
        'emergency-water-main-repair-gb': '/images/blog/generated/tradesman-night-rain.webp',
        'emergency-tradesmen-uk': '/images/blog/generated/fast-response-stopwatch.webp',
        'emergency-services-gb': '/images/blog/generated/emergency-home-kit.webp',
        'emergency-roof-repair-gb': '/images/blog/generated/plumbing-heating-emergency-hero.webp',
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
        'portable-power-stations-home-backup-gb': '/images/blog/generated/portable-power-stations-1.png',
        'hollow-frame-door-security-trap-gb': '/images/blog/generated/door-hardening.png',
        'car-battery-alternator-failure-gb': '/images/blog/generated/car-battery-frosty.webp',
        '2026-energy-crisis-generator-safety-gb': '/images/blog/generated/jump-cables.webp',
        'emergency-plumber-london-guide-gb': '/images/blog/generated/bluetti-power-station.png',
    };

    let successCount = 0;

    for (const [slug, image] of Object.entries(ukMapping)) {
        const { error } = await supabase
            .from('posts')
            .update({ cover_image: image })
            .eq('slug', slug);

        if (error) {
            console.error(`❌ ${slug}: ${error.message}`);
        } else {
            console.log(`✅ ${slug}`);
            successCount++;
        }
    }

    console.log(`\n✅ Updated ${successCount} UK blogs`);
}

fixUkDuplicates().catch(console.error);
