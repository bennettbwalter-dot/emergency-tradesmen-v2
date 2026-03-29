import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.resolve(__dirname, '..', 'public', 'images', 'blog', 'spring-thaw');

const src = path.join(dir, 'x-sense-water-detector.jpg');
const dest = path.join(dir, 'x-sense-water-detector.webp');

sharp(src)
    .webp({ quality: 85 })
    .toFile(dest)
    .then(() => console.log('✅ Converted x-sense-water-detector.jpg → .webp'))
    .catch(err => console.error('❌', err));
