import sharp from 'sharp';
import { readdir, stat } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const blogDir = path.resolve(__dirname, '..', 'public', 'images', 'blog');

async function getFiles(dir) {
    const entries = await readdir(dir, { withFileTypes: true });
    const files = await Promise.all(entries.map(entry => {
        const fullPath = path.join(dir, entry.name);
        return entry.isDirectory() ? getFiles(fullPath) : fullPath;
    }));
    return files.flat();
}

async function convertAll() {
    const allFiles = await getFiles(blogDir);
    const toConvert = allFiles.filter(f => /\.(jpg|jpeg|png)$/i.test(f));

    console.log(`Found ${toConvert.length} images to convert to WebP`);

    let success = 0, skip = 0, fail = 0;

    await Promise.all(toConvert.map(async (src) => {
        const dest = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
        try {
            await sharp(src).webp({ quality: 85 }).toFile(dest);
            console.log(`  ✅ ${path.basename(dest)}`);
            success++;
        } catch (err) {
            console.error(`  ❌ ${path.basename(src)}: ${err.message}`);
            fail++;
        }
    }));

    console.log(`\nDone: ${success} converted, ${fail} failed, ${skip} skipped`);
}

convertAll();
