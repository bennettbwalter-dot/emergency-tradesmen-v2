import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { readdirSync, copyFileSync, mkdirSync, existsSync } from 'fs';
import path from 'path';

dotenv.config({ path: '.env' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const sourceFolder = 'C:\\Users\\Nick\\OneDrive\\protection\\OneDrive\\my App';
const destFolder = 'public\\images\\blog\\generated';

// Mapping based on file names in the folder
const colorBlockMapping = {
    // US Blogs
    'Ac Blowing Warm Air Capacitor Leak Us.png': 'ac-blowing-warm-air-capacitor-leak-us',
    'Emergency Sewer Line.png': 'emergency-drain-cleaning-us',
    'Sewage Smell in House The US Guide to Dried P-Traps & Sewer Gas3.png': 'sewage-smell-in-house-p-trap-us',
    'Door Hardening.png': 'forced-entry-prevention-door-hardening-us',
    'Drain Cleaning.png': 'emergency-drain-cleaning-us',
    'Electrical Emergencies.png': 'electrical-emergencies-homeowner-guide-gb',
    'EV Charger Broken Find 247 Emergency EV Charger Repair Service.png': 'emergency-ev-charger-repair-us',
    'Grid Instability.png': '2026-grid-instability-generator-resilience-us',
    'Heat Pump.png': 'emergency-heat-pump-thaw-us',
    'Home Security Safety.png': 'security-audit-us',
    'Home Security Safety 1.png': 'the-definitive-uk-home-security-safety-standards-2026',
    'Home Without.png': 'can-you-legally-stay-in-home-without-electricity-gb',
    'Improve Not Move How Emergency Repairs Extend Home Lifespan 1.png': 'emergency-repair-contractor-improve-not-move-us',
    'Pest Control.png': 'emergency-pest-control-us',
    'Plumbing.png': 'emergency-pipe-burst-protocol-us',
    'Portable Power Stations.png': 'portable-power-stations-emergency-backup-us',
    'Portable Power Stations 1.png': 'portable-power-stations-backup-gb',
    'Refrigerant.png': 'refrigerant-leak-safety-us',
    'Roof Leak.png': 'flat-roof-leak-prevention-us',
    'Roof Repair.png': 'emergency-roof-repair-us',
    'Sewer Backup.png': 'sewer-backup-prevention-us',
    'Smart Leak Detection.png': 'smart-leak-detection-us',
    'Smart Leak Detection 2026  Water Regulations & Ultrasonic Meter Guide.png': 'smart-leak-detection-2026-us',
    'Smart Leaky.png': 'smart-leak-detection-gb',
    'Sump Pump Resilience 2026 IoT Monitoring & Battery-Backup Guide.png': 'sump-pump-failure-resilience-us',
    'The Silent Killer Carbon Monoxide Safety & Alarm Standards 20261.png': 'carbon-monoxide-us',
    'Water Leaking From Ceiling.png': 'water-leaking-through-ceiling-first-steps-us',
    'Why Homeowners Are Facing a 2026 Anti-Snap Lock Lockdown.png': '2026-anti-snap-lock-lockdown-gb',
    'Mould.png': 'mould-remediation-us',
    'mould 1.png': 'mould-remediation-gb',
    
    // UK Blogs
    'Car Battery or Alternator The 2026 UK Guide to Winter Roadside Resilience 1.png': 'car-battery-alternator-failure-gb',
    'Spring Thaw Why March is the Most Dangerous Month1.png': 'spring-thaw-burst-pipe-prevention-gb',
    'Why UK Homeowners Are Facing a 2026 Anti-Snap Lock Lockdown.png': '2026-anti-snap-lock-lockdown-gb',
};

async function restoreColorBlockImages() {
    console.log('=== RESTORING COLOR BLOCK IMAGES ===\n');
    
    // Ensure destination folder exists
    if (!existsSync(destFolder)) {
        mkdirSync(destFolder, { recursive: true });
    }

    // Get all files in source folder
    const sourceFiles = readdirSync(sourceFolder);
    
    let copiedCount = 0;
    const blogUpdates = [];

    // Copy color block images to generated folder
    for (const [sourceFile, blogSlug] of Object.entries(colorBlockMapping)) {
        const sourcePath = path.join(sourceFolder, sourceFile);
        
        if (existsSync(sourcePath)) {
            // Create a unique filename for the generated folder
            const ext = path.extname(sourceFile);
            const destFileName = `${blogSlug}${ext}`;
            const destPath = path.join(destFolder, destFileName);
            
            // Copy file
            copyFileSync(sourcePath, destPath);
            console.log(`✅ Copied: ${sourceFile}`);
            console.log(`   → ${destFileName}\n`);
            copiedCount++;
            
            blogUpdates.push({
                slug: blogSlug,
                newImage: `/images/blog/generated/${destFileName}`
            });
        } else {
            console.log(`❌ Not found: ${sourceFile}\n`);
        }
    }

    console.log(`\n✅ Copied ${copiedCount} color block images\n`);

    // Update database
    console.log('=== UPDATING DATABASE ===\n');
    let updateCount = 0;

    for (const update of blogUpdates) {
        const { error } = await supabase
            .from('posts')
            .update({ cover_image: update.newImage })
            .eq('slug', update.slug);

        if (error) {
            console.error(`❌ ${update.slug}: ${error.message}`);
        } else {
            console.log(`✅ ${update.slug} → ${update.newImage}`);
            updateCount++;
        }
    }

    console.log(`\n=== SUMMARY ===`);
    console.log(`Copied: ${copiedCount} images`);
    console.log(`Updated: ${updateCount} blogs`);
}

restoreColorBlockImages().catch(console.error);
