import { copyFileSync, existsSync, mkdirSync } from 'fs';
import path from 'path';

const sourceFolder = 'C:\\Users\\Nick\\OneDrive\\protection\\OneDrive\\my App';
const destFolder = 'public\\images\\blog\\generated';

if (!existsSync(destFolder)) mkdirSync(destFolder, { recursive: true });

// Map blog slugs to their color block image filenames in OneDrive
const missingImages = {
    'structural-cracks-foundation-repair-us': 'foundation-cracks.png',
    'hybrid-heating-backup-gb': 'boiler-safety-diagram.webp',
    'emergency-water-main-repair-gb': 'tradesman-night-rain.webp',
    'ultimate-us-emergency-home-resilience-2026': 'us-technical-standards-hub.jpg',
    '7-ways-to-safe-proof-your-garden-electrics-spring-2026-gb': 'garden-electrics-hero-gb.jpg',
    '5-hidden-warning-signs-of-attic-mold-rainy-spring-us': 'attic-mold-hero-us.png',
    'radon-emergency-us': 'home-security-safety.png',
    'frozen-pipe-thaw-flood-prevention-us': 'frozen-pipe.webp',
    'sewer-backup-prevention-backwater-valves-us': 'toilet_tank_mechanism.webp',
    'smart-lock-emergency-us': 'locksmith (1).png',
    'sewer-backup-prevention-gb': 'battery-check.webp',
    'septic-tank-emergency-us': 'running_toilet_hero.webp',
    'emergency-contractor-us': 'diy-struggle.webp',
    'commercial-electrician-us': 'us-hvac-system.webp',
    'building-envelope-audit-us': 'us-certification-badge.webp',
    'commercial-gas-safe-uk': 'gas-isolation.webp',
    'emergency-at-home-master-protocol-us': 'emergency-home-kit.webp',
    'commercial-refrigeration-repair-us': 'costway-ac.png',
    'emergency-glazing-us': 'glazing-replacement.webp',
    'emergency-water-main-repair-us': 'water-shut-off.webp',
    'facility-management-emergency-us': 'us-service-truck.webp',
    'emergency-services-gb': 'emergency-home-kit.webp',
    'emergency-pipe-burst-protocol-gb': 'frozen-pipe.webp',
    'generator-safety-grid-instability-us': 'generator-safety-hero-us.jpg',
    'emergency-tradesmen-uk': 'fast-response-stopwatch.webp',
    'emergency-handyman-us': 'diy-disaster-main.webp',
    'emergency-trades-us': 'et-service-van-night.webp',
};

console.log('=== COPYING MISSING COLOR BLOCK IMAGES ===\n');

let copied = 0;
let failed = 0;

for (const [slug, colorBlockFile] of Object.entries(missingImages)) {
    const sourcePath = path.join(sourceFolder, colorBlockFile);
    const ext = path.extname(colorBlockFile);
    const destFileName = `${slug}${ext}`;
    const destPath = path.join(destFolder, destFileName);

    if (!existsSync(sourcePath)) {
        console.log(`⚠️  Not found: ${colorBlockFile}`);
        console.log(`   For: ${slug}\n`);
        failed++;
        continue;
    }

    try {
        copyFileSync(sourcePath, destPath);
        console.log(`✅ ${colorBlockFile}`);
        console.log(`   → ${destFileName}\n`);
        copied++;
    } catch (err) {
        console.log(`❌ Failed: ${colorBlockFile} → ${destFileName}`);
        console.log(`   Error: ${err.message}\n`);
        failed++;
    }
}

console.log('\n=== SUMMARY ===');
console.log(`✅ Copied: ${copied}`);
console.log(`⚠️  Failed: ${failed}`);
console.log(`📊 Total: ${Object.keys(missingImages).length}`);
