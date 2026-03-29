
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const blogDir = 'c:/Users/Nick/Downloads/hitmaker-2026/emergency-tradesmen/public/blog/structural-security-2026';
const files = [
    'splintered-frame.jpg',
    'screw-comparison.png',
    'glass-attack.jpg',
    'hinge-bolts.jpg',
    'smart-lock.jpg',
    'birmingham-bar.png'
];

async function convert() {
    for (const file of files) {
        const inputPath = path.join(blogDir, file);
        const outputPath = inputPath.replace(/\.(jpg|jpeg|png)$/i, '.webp');

        if (fs.existsSync(inputPath)) {
            console.log(`Converting ${file} to webp...`);
            await sharp(inputPath)
                .resize({ width: 1200, withoutEnlargement: true })
                .webp({ quality: 85 })
                .toFile(outputPath);
            console.log(`✅ Created ${path.basename(outputPath)}`);
        } else {
            console.error(`❌ File not found: ${inputPath}`);
        }
    }
}

convert();
