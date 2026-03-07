import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(__dirname, '..', 'public');

function findImages(dir) {
    let results = [];
    const items = fs.readdirSync(dir, { withFileTypes: true });

    for (const item of items) {
        if (item.name.startsWith('.') || item.name === 'node_modules') continue;

        const fullPath = path.join(dir, item.name);
        if (item.isDirectory()) {
            results = results.concat(findImages(fullPath));
        } else if (/\.(png|jpe?g)$/i.test(item.name)) {
            // Check if webp version already exists
            const webpPath = fullPath.replace(/\.(png|jpe?g)$/i, '.webp');
            if (!fs.existsSync(webpPath)) {
                results.push(fullPath);
            }
        }
    }
    return results;
}

async function convertAll() {
    console.log('🔍 Auditing public directory for legacy images...');
    const images = findImages(publicDir);
    console.log(`📊 Found ${images.length} images to convert.`);

    let successCount = 0;
    let failCount = 0;

    for (const imgPath of images) {
        const webpPath = imgPath.replace(/\.(png|jpe?g)$/i, '.webp');
        try {
            await sharp(imgPath)
                .webp({ quality: 80 })
                .toFile(webpPath);

            const oldSize = fs.statSync(imgPath).size;
            const newSize = fs.statSync(webpPath).size;
            const savings = ((1 - newSize / oldSize) * 100).toFixed(1);

            console.log(`✅ Converted: ${path.relative(publicDir, imgPath)} (${savings}% saved)`);
            successCount++;
        } catch (err) {
            console.error(`❌ Failed: ${path.relative(publicDir, imgPath)} - ${err.message}`);
            failCount++;
        }
    }

    console.log('\n--- Conversion Summary ---');
    console.log(`✅ Success: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);
}

convertAll();
