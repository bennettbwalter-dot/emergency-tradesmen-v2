const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const blogDir = path.join(__dirname, '..', 'public', 'blog');

function findImages(dir) {
    const results = [];
    if (!fs.existsSync(dir)) return results;
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory()) {
            results.push(...findImages(fullPath));
        } else if (/\.(png|jpe?g)$/i.test(item.name)) {
            const webpPath = fullPath.replace(/\.(png|jpe?g)$/i, '.webp');
            if (!fs.existsSync(webpPath)) {
                results.push(fullPath);
            }
        }
    }
    return results;
}

async function convert() {
    const images = findImages(blogDir);
    console.log(`Found ${images.length} images to convert to WebP`);

    let success = 0;
    let failed = 0;

    for (const img of images) {
        const webpPath = img.replace(/\.(png|jpe?g)$/i, '.webp');
        try {
            await sharp(img)
                .webp({ quality: 80 })
                .toFile(webpPath);
            const origSize = fs.statSync(img).size;
            const webpSize = fs.statSync(webpPath).size;
            const savings = ((1 - webpSize / origSize) * 100).toFixed(1);
            console.log(`✅ ${path.basename(img)} → ${path.basename(webpPath)} (${savings}% smaller)`);
            success++;
        } catch (err) {
            console.error(`❌ Failed: ${path.basename(img)} - ${err.message}`);
            failed++;
        }
    }

    console.log(`\nDone! ${success} converted, ${failed} failed.`);
}

convert();
