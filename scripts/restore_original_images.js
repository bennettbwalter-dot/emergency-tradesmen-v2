import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';

dotenv.config({ path: '.env' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

// Original images from the audit file
const originalImages = {
    'sewage-smell-in-house-p-trap-us': '/blog/plumbing/p-trap-diagram.png',
    'ac-blowing-warm-air-capacitor-leak-us': '/blog/hvac/ac-capacitor.png',
    'water-leaking-through-ceiling-first-steps-us': '/blog/water-leak/cover.jpg',
    'structural-cracks-foundation-repair-us': '/blog/structure/brick-crack.png',
    '5-signs-you-need-emergency-plumber-us': '/blog/plumber/basement-flood.jpg',
    'emergency-plumber-london-guide-gb': 'https://images.unsplash.com/photo-1542013936693-884638332954?q=80&w=2070&auto=format&fit=crop',
};

console.log('=== RESTORING ORIGINAL BLOG IMAGES ===\n');
console.log('This will restore the following blogs to their original images:\n');

Object.entries(originalImages).forEach(([slug, image]) => {
    console.log(`${slug}`);
    console.log(`  → ${image}\n`);
});

console.log('\nProceeding with restore...\n');

let successCount = 0;
let errorCount = 0;

for (const [slug, image] of Object.entries(originalImages)) {
    const { error } = await supabase
        .from('posts')
        .update({ cover_image: image })
        .eq('slug', slug);

    if (error) {
        console.error(`❌ ${slug}: ${error.message}`);
        errorCount++;
    } else {
        console.log(`✅ ${slug}`);
        successCount++;
    }
}

console.log(`\n=== RESTORE COMPLETE ===`);
console.log(`Restored: ${successCount}`);
console.log(`Errors: ${errorCount}`);
console.log('\nNote: The audit file only had 45 blogs. For the remaining blogs that were changed,');
console.log('you will need to either:');
console.log('1. Provide the original image paths, or');
console.log('2. Restore from a Supabase backup if available');
