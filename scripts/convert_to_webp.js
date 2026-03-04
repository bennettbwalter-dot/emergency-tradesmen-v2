import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputDir = path.join(__dirname, '..', 'public', 'blog', 'locksmith');
const images = [
    'anti-snap-pliers.png',
    'anti-snap-diagram.png',
    'insurance-compliance.png'
];

async function convertImages() {
    for (const image of images) {
        const inputPath = path.join(inputDir, image);
        const outputPath = path.join(inputDir, image.replace('.png', '.webp'));

        if (fs.existsSync(inputPath)) {
            try {
                await sharp(inputPath)
                    .webp({ quality: 80 })
                    .toFile(outputPath);
                console.log("Successfully converted " + image + " to WebP.");
            } catch (err) {
                console.error("Error converting " + image + ":", err);
            }
        } else {
            console.warn("Input file not found: " + inputPath);
        }
    }
}

convertImages();
