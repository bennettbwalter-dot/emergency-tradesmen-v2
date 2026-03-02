import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const blogDir = path.join(__dirname, '..', 'public', 'blog');

const exactPaths = [
    'generated/plumbing-heating-emergency-hero.png',
    'infographics/drainage-uk.jpg',
    'infographics/drainage-us.jpg',
    'infographics/infographic-uk.jpg',
    'infographics/infographic-us.png',
    'common/hero-burst-pipes.jpg',
    'common/pipe-insulation-global.jpg'
];

async function findFileRecursive(dir, filename) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            const found = await findFileRecursive(fullPath, filename);
            if (found) return found;
        } else if (file === filename) {
            return fullPath;
        }
    }
    return null;
}

const filesToConvert = [
    'plumbing-heating-emergency-hero.png',
    'drainage-uk.jpg',
    'drainage-us.jpg',
    'hero-burst-pipes.jpg',
    'infographic-uk.jpg',
    'infographic-us.png',
    'pipe-insulation-global.jpg'
];


async function convertToWebp() {
    for (const filename of filesToConvert) {
        console.log(`Searching for ${filename}...`);
        const inputPath = await findFileRecursive(blogDir, filename);

        if (!inputPath) {
            console.log(`File not found: ${filename}`);
            continue;
        }

        const { dir, name } = path.parse(inputPath);
        const outputPath = path.join(dir, `${name}.webp`);

        try {
            await sharp(inputPath)
                .webp({ quality: 80 })
                .toFile(outputPath);
            console.log(`Converted: ${filename} -> ${name}.webp`);
        } catch (error) {
            console.error(`Error converting ${filename}:`, error);
        }
    }
}

convertToWebp();
