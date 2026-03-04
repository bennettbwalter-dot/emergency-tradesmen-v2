import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseDir = path.join(__dirname, '..', 'public', 'images');
const trades = ['builder', 'roofer', 'water-restoration', 'hvac'];

async function optimizeImages() {
    console.log('Starting image optimization...');

    for (const trade of trades) {
        const tradeDir = path.join(baseDir, trade);

        if (!fs.existsSync(tradeDir)) continue;

        const files = fs.readdirSync(tradeDir);

        for (const file of files) {
            // Only process jpg and png files
            if (!file.match(/\.(jpg|jpeg|png)$/i)) continue;

            const inputPath = path.join(tradeDir, file);
            const outputFileName = file.replace(/\.(jpg|jpeg|png)$/i, '.webp');
            const outputPath = path.join(tradeDir, outputFileName);

            try {
                // Resize if too large and convert to WebP
                await sharp(inputPath)
                    .resize({ width: 1200, withoutEnlargement: true }) // Max width 1200px
                    .webp({ quality: 80 }) // 80% quality for good compression/visual balance
                    .toFile(outputPath);

                console.log(`✅ Converted: ${file} -> ${outputFileName}`);

                // Optional: Delete original after successful conversion
                // fs.unlinkSync(inputPath); 

            } catch (err) {
                console.error(`❌ Error converting ${file}:`, err);
            }
        }
    }

    console.log('Image optimization complete!');
}

optimizeImages();
