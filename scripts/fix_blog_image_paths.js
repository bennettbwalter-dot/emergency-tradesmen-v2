import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { readdirSync, existsSync } from 'fs';
import path from 'path';

dotenv.config({ path: '.env' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
const generatedFolder = 'public\\images\\blog\\generated';

// Get all existing color block images
const existingImages = readdirSync(generatedFolder)
    .filter(f => /\.(png|webp|jpg|jpeg)$/i.test(f));

console.log(`Available color block images: ${existingImages.length}\n`);

// Blogs that need fixing + keyword mapping to existing images
const blogsToFix = [
    { slug: 'structural-cracks-foundation-repair-us', keywords: ['foundation', 'cracks'] },
    { slug: 'hybrid-heating-backup-gb', keywords: ['boiler', 'heating'] },
    { slug: 'emergency-water-main-repair-gb', keywords: ['water', 'rain'] },
    { slug: 'ultimate-us-emergency-home-resilience-2026', keywords: ['us-technical'] },
    { slug: '7-ways-to-safe-proof-your-garden-electrics-spring-2026-gb', keywords: ['garden', 'electric'] },
    { slug: '5-hidden-warning-signs-of-attic-mold-rainy-spring-us', keywords: ['attic', 'mold'] },
    { slug: 'radon-emergency-us', keywords: ['home-security'] },
    { slug: 'frozen-pipe-thaw-flood-prevention-us', keywords: ['frozen'] },
    { slug: 'sewer-backup-prevention-backwater-valves-us', keywords: ['toilet'] },
    { slug: 'smart-lock-emergency-us', keywords: ['smart', 'lock'] },
    { slug: 'sewer-backup-prevention-gb', keywords: ['battery'] },
    { slug: 'septic-tank-emergency-us', keywords: ['toilet'] },
    { slug: 'emergency-contractor-us', keywords: ['diy'] },
    { slug: 'commercial-electrician-us', keywords: ['hvac'] },
    { slug: 'building-envelope-audit-us', keywords: ['certification'] },
    { slug: 'commercial-gas-safe-uk', keywords: ['gas'] },
    { slug: 'emergency-at-home-master-protocol-us', keywords: ['emergency', 'home'] },
    { slug: 'commercial-refrigeration-repair-us', keywords: ['costway'] },
    { slug: 'emergency-glazing-us', keywords: ['glazing'] },
    { slug: 'emergency-water-main-repair-us', keywords: ['water', 'shut'] },
    { slug: 'facility-management-emergency-us', keywords: ['service', 'truck'] },
    { slug: 'emergency-services-gb', keywords: ['emergency', 'home'] },
    { slug: 'emergency-pipe-burst-protocol-gb', keywords: ['frozen'] },
    { slug: 'generator-safety-grid-instability-us', keywords: ['generator'] },
    { slug: 'emergency-tradesmen-uk', keywords: ['stopwatch'] },
    { slug: 'emergency-handyman-us', keywords: ['diy', 'disaster'] },
    { slug: 'emergency-trades-us', keywords: ['van'] },
];

async function fixBlogs() {
    console.log('=== FIXING BLOG IMAGE PATHS ===\n');

    let fixed = 0;
    let skipped = 0;

    for (const blog of blogsToFix) {
        // Find matching image from existing files
        const matchingImage = existingImages.find(img => {
            const imgLower = img.toLowerCase();
            return blog.keywords.every(kw => imgLower.includes(kw));
        });

        if (!matchingImage) {
            console.log(`⚠️  No match for: ${blog.slug}`);
            console.log(`   Keywords: ${blog.keywords.join(', ')}\n`);
            skipped++;
            continue;
        }

        const imagePath = `/images/blog/generated/${matchingImage}`;

        const { error } = await supabase
            .from('posts')
            .update({ cover_image: imagePath })
            .eq('slug', blog.slug);

        if (error) {
            console.log(`❌ ${blog.slug}: ${error.message}\n`);
            skipped++;
        } else {
            console.log(`✅ ${blog.slug}`);
            console.log(`   → ${imagePath}\n`);
            fixed++;
        }
    }

    console.log('\n=== SUMMARY ===');
    console.log(`✅ Fixed: ${fixed}`);
    console.log(`⚠️  Skipped: ${skipped}`);
}

fixBlogs().catch(console.error);
