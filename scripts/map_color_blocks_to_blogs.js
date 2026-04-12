import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { copyFileSync, existsSync, mkdirSync } from 'fs';
import path from 'path';

dotenv.config({ path: '.env' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
const sourceFolder = 'C:\\Users\\Nick\\OneDrive\\protection\\OneDrive\\my App';
const destFolder = 'public\\images\\blog\\generated';

if (!existsSync(destFolder)) mkdirSync(destFolder, { recursive: true });

// Map blog slugs to their color block image filenames in OneDrive
const blogToColorBlockMap = {
    // US BLOGS
    'security-audit-us': 'Home Security.png',
    '5-hidden-warning-signs-of-attic-mold-rainy-spring-us': 'attic-mold-hero-us.png',
    'ultimate-us-emergency-home-resilience-2026': 'us-technical-standards-hub.jpg',
    'ac-blowing-warm-air-capacitor-leak-us': 'Ac Blowing Warm Air Capacitor Leak Us.png',
    'emergency-ev-charger-repair-us': 'EV Charger Broken Find 247 Emergency EV Charger Repair Service.png',
    'water-leaking-through-ceiling-first-steps-us': 'Water Leaking From Ceiling.png',
    'sewage-smell-in-house-p-trap-us': 'Sewage Smell in House The US Guide to Dried P-Traps & Sewer Gas3.png',
    'emergency-repair-contractor-improve-not-move-us': 'Improve Not Move How Emergency Repairs Extend Home Lifespan 1.png',
    'carbon-monoxide-us': 'The Silent Killer Carbon Monoxide Safety & Alarm Standards 20261.png',
    'sump-pump-failure-resilience-us': 'Sump Pump Resilience 2026 IoT Monitoring & Battery-Backup Guide.png',
    'smart-lock-emergency-us': 'smart-lock-hero-gb.jpg',
    'smart-leak-detection-us': 'Smart Leak Detection.png',
    'smart-leak-detection-2026-us': 'Smart Leak Detection 2026  Water Regulations & Ultrasonic Meter Guide.png',
    'sewer-line-repair-us': 'Emergency Sewer Line.png',
    'sewer-backup-prevention-us': 'Sewer Backup.png',
    'sewer-backup-prevention-backwater-valves-us': 'toilet_tank_mechanism.webp',
    'septic-tank-emergency-us': 'running_toilet_hero.webp',
    'refrigerant-leak-safety-us': 'Refrigerant.png',
    'radon-emergency-us': 'home-security-safety.png',
    'mould-remediation-us': 'Mould.png',
    'generator-safety-grid-instability-us': 'generator-safety-hero-us.jpg',
    'flat-roof-leak-prevention-us': 'Roof Leak.png',
    'facility-management-emergency-us': 'us-service-truck.webp',
    'emergency-water-main-repair-us': 'water-shut-off.webp',
    'emergency-trades-us': 'et-service-van-night.webp',
    'emergency-roof-repair-us': 'Roof Repair.png',
    'emergency-pipe-burst-protocol-us': 'Plumbing.png',
    'emergency-pest-control-us': 'Pest Control.png',
    'emergency-heat-pump-thaw-us': 'Heat Pump.png',
    'emergency-handyman-us': 'diy-struggle.webp',
    'emergency-glazing-us': 'glazing-replacement.webp',
    'emergency-drain-cleaning-us': 'Drain Cleaning.png',
    'emergency-contractor-us': 'diy-disaster-main.webp',
    'emergency-at-home-master-protocol-us': 'emergency-home-kit.webp',
    'commercial-refrigeration-repair-us': 'costway-ac.png',
    'commercial-electrician-us': 'us-hvac-system.webp',
    'building-envelope-audit-us': 'us-certification-badge.webp',
    '5-signs-you-need-emergency-plumber-us': 'plumber.png',
    'portable-power-stations-emergency-backup-us': 'Portable Power Stations.png',
    'frozen-pipe-thaw-flood-prevention-us': 'frozen-pipe.webp',
    'forced-entry-prevention-door-hardening-us': 'Door Hardening.png',
    '2026-grid-instability-generator-resilience-us': 'Grid Instability.png',
    'structural-cracks-foundation-repair-us': 'foundation-cracks.png',

    // UK BLOGS
    '7-ways-to-safe-proof-your-garden-electrics-spring-2026-gb': 'garden-electrics-hero-gb.jpg',
    'the-definitive-uk-home-security-safety-standards-2026': 'Home Security Safety 1.png',
    'emergency-ev-charger-repair-gb': 'EV Charger Broken Find 247 Emergency EV Charger Repair Service.png',
    'emergency-repair-contractor-improve-not-move-gb': 'Improve Not Move How Emergency Repairs Extend Home Lifespan 1.png',
    'carbon-monoxide-gb': 'The Silent Killer Carbon Monoxide Safety & Alarm Standards 20261.png',
    '2026-anti-snap-lock-lockdown-gb': 'Why UK Homeowners Are Facing a 2026 Anti-Snap Lock Lockdown.png',
    'smart-lock-emergency-gb': 'locksmith (1).png',
    'smart-leak-detection-gb': 'Smart Leaky.png',
    'smart-leak-detection-2026-gb': 'Smart Leak Detection 2026  Water Regulations & Ultrasonic Meter Guide.png',
    'sewer-backup-prevention-gb': 'battery-check.webp',
    'sewage-cleanup-gb': 'mould 1.png',
    'refrigerant-leak-safety-gb': 'Refrigerant.png',
    'portable-power-stations-backup-gb': 'Portable Power Stations.png',
    'mould-remediation-gb': 'Mould.png',
    'hybrid-heating-backup-gb': 'boiler-safety-diagram.webp',
    'generator-safety-grid-instability-gb': 'Grid Instability.png',
    'flat-roof-leak-prevention-gb': 'Roof Leak.png',
    'emergency-water-main-repair-gb': 'tradesman-night-rain.webp',
    'emergency-tradesmen-uk': 'fast-response-stopwatch.webp',
    'emergency-services-gb': 'emergency-home-kit.webp',
    'emergency-roof-repair-gb': 'Roof Repair.png',
    'emergency-pipe-burst-protocol-gb': 'frozen-pipe.webp',
    'emergency-pest-control-gb': 'Pest Control.png',
    'emergency-heat-pump-thaw-gb': 'Heat Pump.png',
    'emergency-glazing-gb': 'glazier (1).png',
    'emergency-drain-cleaning-gb': 'Drain Cleaning.png',
    'electrical-emergencies-homeowner-guide-gb': 'Electrical Emergencies.png',
    'commercial-gas-safe-uk': 'gas-isolation.webp',
    'commercial-drainage-gb': 'plumber.png',
    'can-you-legally-stay-in-home-without-electricity-gb': 'Home Without.png',
    'spring-thaw-burst-pipe-prevention-gb': 'Spring Thaw Why March is the Most Dangerous Month1.png',
    'portable-power-stations-home-backup-gb': 'Portable Power Stations 1.png',
    'hollow-frame-door-security-trap-gb': 'Door Hardening.png',
    'car-battery-alternator-failure-gb': 'Car Battery or Alternator The 2026 UK Guide to Winter Roadside Resilience 1.png',
    '2026-energy-crisis-generator-safety-gb': 'Grid Instability.png',
    'emergency-plumber-london-guide-gb': 'plumber.png',

    // SHARED BLOGS
    'ultimate-us-emergency-home-resilience-2026': 'uk-technical-standards-hub.jpg',
};

async function mapAndRestoreBlogImages() {
    console.log('=== MAPPING COLOR BLOCK IMAGES TO BLOGS ===\n');

    let copyCount = 0;
    let updateCount = 0;
    let skipCount = 0;

    for (const [slug, colorBlockFile] of Object.entries(blogToColorBlockMap)) {
        const sourcePath = path.join(sourceFolder, colorBlockFile);
        
        // Check if the file is already in generated folder or needs copying
        const ext = path.extname(colorBlockFile);
        const destFileName = `${slug}${ext}`;
        const destPath = path.join(destFolder, destFileName);
        const imagePath = `/images/blog/generated/${destFileName}`;

        // Copy from OneDrive if the file exists
        if (existsSync(sourcePath)) {
            if (!existsSync(destPath)) {
                copyFileSync(sourcePath, destPath);
                console.log(`📁 Copied: ${colorBlockFile} → ${destFileName}`);
                copyCount++;
            }
        }

        // Update database
        const { error } = await supabase
            .from('posts')
            .update({ cover_image: imagePath })
            .eq('slug', slug);

        if (error) {
            console.error(`❌ ${slug}: ${error.message}`);
        } else {
            console.log(`✅ ${slug} → ${imagePath}`);
            updateCount++;
        }
    }

    console.log('\n=== COMPLETE ===');
    console.log(`📁 Files copied: ${copyCount}`);
    console.log(`✅ Blogs updated: ${updateCount}`);
}

mapAndRestoreBlogImages().catch(console.error);
