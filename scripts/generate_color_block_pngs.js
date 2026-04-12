import { writeFileSync, mkdirSync, existsSync } from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

const destFolder = path.join(projectRoot, 'public', 'images', 'blog', 'generated');
if (!existsSync(destFolder)) mkdirSync(destFolder, { recursive: true });

// Blogs needing color block images
const blogsNeedingImages = [
    { slug: 'structural-cracks-foundation-repair-us', title: 'Structural Cracks\n& Foundation Repair' },
    { slug: 'hybrid-heating-backup-gb', title: 'Hybrid Heating\nBackup' },
    { slug: 'emergency-water-main-repair-gb', title: 'Emergency Water\nMain Repair' },
    { slug: 'ultimate-us-emergency-home-resilience-2026', title: 'US Emergency\nHome Resilience' },
    { slug: '7-ways-to-safe-proof-your-garden-electrics-spring-2026-gb', title: 'Garden Electrics\nSafety' },
    { slug: '5-hidden-warning-signs-of-attic-mold-rainy-spring-us', title: 'Attic Mold\nWarning Signs' },
    { slug: 'radon-emergency-us', title: 'Radon\nEmergency' },
    { slug: 'frozen-pipe-thaw-flood-prevention-us', title: 'Frozen Pipe\nPrevention' },
    { slug: 'sewer-backup-prevention-backwater-valves-us', title: 'Sewer Backup\nPrevention' },
    { slug: 'smart-lock-emergency-us', title: 'Smart Lock\nEmergency' },
    { slug: 'sewer-backup-prevention-gb', title: 'Sewer Backup\nUK' },
    { slug: 'septic-tank-emergency-us', title: 'Septic Tank\nEmergency' },
    { slug: 'emergency-contractor-us', title: 'Emergency\nContractor' },
    { slug: 'commercial-electrician-us', title: 'Commercial\nElectrician' },
    { slug: 'building-envelope-audit-us', title: 'Building Envelope\nAudit' },
    { slug: 'commercial-gas-safe-uk', title: 'Commercial Gas\nSafe UK' },
    { slug: 'emergency-at-home-master-protocol-us', title: 'Emergency Home\nProtocol' },
    { slug: 'commercial-refrigeration-repair-us', title: 'Commercial\nRefrigeration' },
    { slug: 'emergency-glazing-us', title: 'Emergency\nGlazing' },
    { slug: 'emergency-water-main-repair-us', title: 'Water Main\nRepair US' },
    { slug: 'facility-management-emergency-us', title: 'Facility\nManagement' },
    { slug: 'emergency-services-gb', title: 'Emergency\nServices UK' },
    { slug: 'emergency-pipe-burst-protocol-gb', title: 'Pipe Burst\nProtocol UK' },
    { slug: 'generator-safety-grid-instability-us', title: 'Generator\nSafety US' },
    { slug: 'emergency-tradesmen-uk', title: 'Emergency\nTradesmen' },
    { slug: 'emergency-handyman-us', title: 'Emergency\nHandyman' },
    { slug: 'emergency-trades-us', title: 'Emergency\nTrades US' },
];

// Unique color palettes for each blog
const palettes = [
    { bg1: [30, 58, 95], bg2: [37, 99, 235], accent: [96, 165, 250] },
    { bg1: [124, 45, 18], bg2: [194, 65, 12], accent: [253, 186, 116] },
    { bg1: [20, 83, 45], bg2: [22, 163, 74], accent: [134, 239, 172] },
    { bg1: [74, 29, 106], bg2: [124, 58, 237], accent: [196, 181, 253] },
    { bg1: [113, 63, 18], bg2: [202, 138, 4], accent: [254, 240, 138] },
    { bg1: [131, 24, 67], bg2: [219, 39, 119], accent: [249, 168, 212] },
    { bg1: [14, 116, 144], bg2: [6, 182, 212], accent: [103, 232, 249] },
    { bg1: [153, 27, 27], bg2: [220, 38, 38], accent: [252, 165, 165] },
    { bg1: [67, 20, 106], bg2: [147, 51, 234], accent: [216, 180, 254] },
    { bg1: [90, 40, 20], bg2: [180, 83, 9], accent: [253, 224, 71] },
    { bg1: [10, 80, 100], bg2: [8, 145, 178], accent: [34, 211, 238] },
    { bg1: [85, 30, 55], bg2: [157, 23, 77], accent: [251, 113, 133] },
    { bg1: [40, 50, 80], bg2: [59, 130, 246], accent: [147, 197, 253] },
    { bg1: [70, 60, 30], bg2: [161, 98, 7], accent: [250, 204, 21] },
    { bg1: [55, 25, 70], bg2: [107, 33, 168], accent: [192, 132, 252] },
    { bg1: [85, 45, 25], bg2: [217, 119, 6], accent: [251, 146, 60] },
    { bg1: [25, 60, 70], bg2: [20, 184, 166], accent: [94, 234, 212] },
    { bg1: [95, 35, 45], bg2: [225, 29, 72], accent: [252, 165, 165] },
    { bg1: [35, 45, 85], bg2: [79, 70, 229], accent: [165, 180, 252] },
    { bg1: [65, 35, 25], bg2: [154, 52, 18], accent: [249, 115, 22] },
    { bg1: [20, 70, 80], bg2: [13, 148, 136], accent: [45, 212, 191] },
    { bg1: [80, 30, 60], bg2: [190, 24, 93], accent: [251, 146, 173] },
    { bg1: [50, 60, 40], bg2: [74, 222, 128], accent: [134, 239, 172] },
    { bg1: [60, 40, 80], bg2: [139, 92, 246], accent: [192, 132, 252] },
    { bg1: [45, 55, 75], bg2: [100, 116, 139], accent: [148, 163, 184] },
    { bg1: [75, 45, 35], bg2: [234, 88, 12], accent: [253, 186, 116] },
    { bg1: [30, 65, 85], bg2: [56, 189, 248], accent: [125, 211, 252] },
];

// Simple PNG generation
function createPNG(width, height, bgColor1, bgColor2, title) {
    const pixels = [];

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            // Gradient background
            const t = x / width;
            const r = Math.round(bgColor1[0] + (bgColor2[0] - bgColor1[0]) * t);
            const g = Math.round(bgColor1[1] + (bgColor2[1] - bgColor1[1]) * t);
            const b = Math.round(bgColor1[2] + (bgColor2[2] - bgColor1[2]) * t);

            pixels.push(r, g, b, 255); // RGBA
        }
    }

    // Convert to PNG format
    return createPNGFromRaw(pixels, width, height);
}

function createPNGFromRaw(pixels, width, height) {
    // PNG signature
    const signature = [137, 80, 78, 71, 13, 10, 26, 10];

    // IHDR chunk
    const ihdrData = Buffer.alloc(13);
    ihdrData.writeUInt32BE(width, 0);
    ihdrData.writeUInt32BE(height, 4);
    ihdrData[8] = 8;  // bit depth
    ihdrData[9] = 6;  // color type (RGBA)
    ihdrData[10] = 0; // compression
    ihdrData[11] = 0; // filter
    ihdrData[12] = 0; // interlace

    const ihdr = createChunk('IHDR', ihdrData);

    // IDAT chunk (image data)
    const rawData = Buffer.alloc(width * height * 4 + height);
    let pos = 0;

    for (let y = 0; y < height; y++) {
        rawData[pos++] = 0; // filter: none
        for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4;
            rawData[pos++] = pixels[i];     // R
            rawData[pos++] = pixels[i + 1]; // G
            rawData[pos++] = pixels[i + 2]; // B
            rawData[pos++] = pixels[i + 3]; // A
        }
    }

    const compressedData = zlib.deflateSync(rawData);
    const idat = createChunk('IDAT', compressedData);

    // IEND chunk
    const iend = createChunk('IEND', Buffer.alloc(0));

    // Combine all chunks
    return Buffer.concat([Buffer.from(signature), ihdr, idat, iend]);
}

function createChunk(type, data) {
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length, 0);

    const typeBuffer = Buffer.from(type);
    const crcData = Buffer.concat([typeBuffer, data]);

    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(crcData), 0);

    return Buffer.concat([length, typeBuffer, data, crc]);
}

// CRC32 implementation
function crc32(buffer) {
    let crc = 0xFFFFFFFF;
    const table = makeCRCTable();

    for (let i = 0; i < buffer.length; i++) {
        crc = table[(crc ^ buffer[i]) & 0xFF] ^ (crc >>> 8);
    }

    return (crc ^ 0xFFFFFFFF) >>> 0;
}

function makeCRCTable() {
    const table = [];
    for (let c = 0; c < 256; c++) {
        let n = c;
        for (let k = 0; k < 8; k++) {
            n = (n & 1) ? (0xEDB88320 ^ (n >>> 1)) : (n >>> 1);
        }
        table[c] = n;
    }
    return table;
}

console.log('=== GENERATING COLOR BLOCK PNG IMAGES ===\n');

const WIDTH = 400;
const HEIGHT = 500;

let generated = 0;

for (const blog of blogsNeedingImages) {
    const palette = palettes[generated % palettes.length];
    const pngBuffer = createPNG(WIDTH, HEIGHT, palette.bg1, palette.bg2, blog.title);
    const fileName = `${blog.slug}.png`;
    const filePath = path.join(destFolder, fileName);

    writeFileSync(filePath, pngBuffer);
    console.log(`✅ ${blog.slug}`);
    console.log(`   → /images/blog/generated/${fileName}\n`);
    generated++;
}

console.log('\n=== SUMMARY ===');
console.log(`✅ Generated: ${generated} PNG color block images`);
console.log(`📊 Size: ${WIDTH}x${HEIGHT}px each`);
