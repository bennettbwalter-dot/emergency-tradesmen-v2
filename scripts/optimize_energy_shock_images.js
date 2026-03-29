import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseDir = path.join(__dirname, '..', 'public', 'images', 'blog', 'energy-shock');

async function optimizeBlogImages() {
    console.log('Starting energy-shock blog image optimization...');
    const files = fs.readdirSync(baseDir);
    for (const file of files) {
        if (!file.match(/\.(jpg|jpeg|png)$/i)) continue;
        const inputPath = path.join(baseDir, file);
        const outputFileName = file.replace(/\.(jpg|jpeg|png)$/i, '.webp');
        const outputPath = path.join(baseDir, outputFileName);
        try {
            await sharp(inputPath)
                .resize({ width: 1200, withoutEnlargement: true })
                .webp({ quality: 80 })
                .toFile(outputPath);
            console.log(`✅ ${file} -> ${outputFileName}`);
        } catch (err) {
            console.error(`❌ Error converting ${file}:`, err);
        }
    }
    console.log('Done!');
}

optimizeBlogImages();
