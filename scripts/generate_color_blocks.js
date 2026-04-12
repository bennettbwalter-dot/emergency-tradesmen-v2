import { writeFileSync, mkdirSync, existsSync } from 'fs';
import path from 'path';

const destFolder = 'public\\images\\blog\\generated';
if (!existsSync(destFolder)) mkdirSync(destFolder, { recursive: true });

// Blog slugs that need new color block images
const blogsNeedingImages = [
    { slug: 'structural-cracks-foundation-repair-us', title: 'Structural Cracks & Foundation Repair' },
    { slug: 'hybrid-heating-backup-gb', title: 'Hybrid Heating Backup' },
    { slug: 'emergency-water-main-repair-gb', title: 'Emergency Water Main Repair' },
    { slug: 'ultimate-us-emergency-home-resilience-2026', title: 'US Emergency Home Resilience' },
    { slug: '7-ways-to-safe-proof-your-garden-electrics-spring-2026-gb', title: 'Garden Electrics Safety' },
    { slug: '5-hidden-warning-signs-of-attic-mold-rainy-spring-us', title: 'Attic Mold Warning Signs' },
    { slug: 'radon-emergency-us', title: 'Radon Emergency' },
    { slug: 'frozen-pipe-thaw-flood-prevention-us', title: 'Frozen Pipe Prevention' },
    { slug: 'sewer-backup-prevention-backwater-valves-us', title: 'Sewer Backup Prevention' },
    { slug: 'smart-lock-emergency-us', title: 'Smart Lock Emergency' },
    { slug: 'sewer-backup-prevention-gb', title: 'Sewer Backup Prevention UK' },
    { slug: 'septic-tank-emergency-us', title: 'Septic Tank Emergency' },
    { slug: 'emergency-contractor-us', title: 'Emergency Contractor' },
    { slug: 'commercial-electrician-us', title: 'Commercial Electrician' },
    { slug: 'building-envelope-audit-us', title: 'Building Envelope Audit' },
    { slug: 'commercial-gas-safe-uk', title: 'Commercial Gas Safe UK' },
    { slug: 'emergency-at-home-master-protocol-us', title: 'Emergency Home Protocol' },
    { slug: 'commercial-refrigeration-repair-us', title: 'Commercial Refrigeration' },
    { slug: 'emergency-glazing-us', title: 'Emergency Glazing US' },
    { slug: 'emergency-water-main-repair-us', title: 'Water Main Repair US' },
    { slug: 'facility-management-emergency-us', title: 'Facility Management' },
    { slug: 'emergency-services-gb', title: 'Emergency Services UK' },
    { slug: 'emergency-pipe-burst-protocol-gb', title: 'Pipe Burst Protocol UK' },
    { slug: 'generator-safety-grid-instability-us', title: 'Generator Safety US' },
    { slug: 'emergency-tradesmen-uk', title: 'Emergency Tradesmen UK' },
    { slug: 'emergency-handyman-us', title: 'Emergency Handyman' },
    { slug: 'emergency-trades-us', title: 'Emergency Trades US' },
];

// Color palette for variety
const colorPalettes = [
    { bg1: '#1e3a5f', bg2: '#2563eb', accent: '#60a5fa' },  // Blue
    { bg1: '#7c2d12', bg2: '#c2410c', accent: '#fdba74' },  // Orange
    { bg1: '#14532d', bg2: '#16a34a', accent: '#86efac' },  // Green
    { bg1: '#4a1d6a', bg2: '#7c3aed', accent: '#c4b5fd' },  // Purple
    { bg1: '#713f12', bg2: '#ca8a04', accent: '#fef08a' },  // Gold
    { bg1: '#831843', bg2: '#db2777', accent: '#f9a8d4' },  // Pink
    { bg1: '#0e7490', bg2: '#06b6d4', accent: '#67e8f9' },  // Cyan
    { bg1: '#991b1b', bg2: '#dc2626', accent: '#fca5a5' },  // Red
];

function generateColorBlockSVG(title, palette) {
    // Word wrap title for better display
    const words = title.split(' ');
    const lines = [];
    let currentLine = '';
    
    for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        if (testLine.length <= 25) {
            currentLine = testLine;
        } else {
            if (currentLine) lines.push(currentLine);
            currentLine = word;
        }
    }
    if (currentLine) lines.push(currentLine);
    
    const lineCount = Math.min(lines.length, 3);
    const startY = 280 - (lineCount * 35) / 2;
    
    // Create decorative elements based on title keywords
    let decorativeElements = '';
    const titleLower = title.toLowerCase();
    
    if (titleLower.includes('crack') || titleLower.includes('foundation')) {
        decorativeElements = `<path d="M 100 150 L 180 180 L 160 220 L 240 200 L 220 280 L 300 250" stroke="${palette.accent}" stroke-width="2" fill="none" opacity="0.3"/>`;
    } else if (titleLower.includes('water') || titleLower.includes('pipe') || titleLower.includes('flood')) {
        decorativeElements = `<path d="M 80 300 Q 140 270 200 300 T 320 300" stroke="${palette.accent}" stroke-width="3" fill="none" opacity="0.4"/><path d="M 60 320 Q 120 290 180 320 T 340 320" stroke="${palette.accent}" stroke-width="2" fill="none" opacity="0.3"/>`;
    } else if (titleLower.includes('electric') || titleLower.includes('power')) {
        decorativeElements = `<path d="M 200 120 L 220 180 L 180 200 L 230 280" stroke="${palette.accent}" stroke-width="3" fill="none" opacity="0.5"/>`;
    } else if (titleLower.includes('lock') || titleLower.includes('security')) {
        decorativeElements = `<circle cx="200" cy="200" r="60" stroke="${palette.accent}" stroke-width="3" fill="none" opacity="0.3"/><circle cx="200" cy="200" r="80" stroke="${palette.accent}" stroke-width="2" fill="none" opacity="0.2"/>`;
    } else if (titleLower.includes('heat') || titleLower.includes('warm')) {
        decorativeElements = `<circle cx="280" cy="150" r="40" fill="${palette.accent}" opacity="0.2"/><circle cx="280" cy="150" r="30" fill="${palette.accent}" opacity="0.3"/>`;
    } else if (titleLower.includes('gas') || titleLower.includes('radon')) {
        decorativeElements = `<circle cx="150" cy="180" r="20" stroke="${palette.accent}" stroke-width="2" fill="none" opacity="0.4"/><circle cx="250" cy="220" r="15" stroke="${palette.accent}" stroke-width="2" fill="none" opacity="0.3"/><circle cx="180" cy="260" r="12" stroke="${palette.accent}" stroke-width="2" fill="none" opacity="0.2"/>`;
    } else if (titleLower.includes('glaz') || titleLower.includes('window')) {
        decorativeElements = `<rect x="140" y="160" width="120" height="120" rx="8" stroke="${palette.accent}" stroke-width="3" fill="none" opacity="0.3"/><line x1="200" y1="160" x2="200" y2="280" stroke="${palette.accent}" stroke-width="2" opacity="0.3"/>`;
    } else if (titleLower.includes('contractor') || titleLower.includes('trades')) {
        decorativeElements = `<rect x="160" y="170" width="80" height="60" rx="4" stroke="${palette.accent}" stroke-width="3" fill="none" opacity="0.3"/><path d="M 160 200 L 280 200" stroke="${palette.accent}" stroke-width="2" opacity="0.3"/>`;
    } else if (titleLower.includes('handyman') || titleLower.includes('repair')) {
        decorativeElements = `<path d="M 180 160 L 200 180 L 180 200 L 200 220" stroke="${palette.accent}" stroke-width="3" fill="none" opacity="0.4"/>`;
    } else if (titleLower.includes('mold') || titleLower.includes('sewer') || titleLower.includes('septic')) {
        decorativeElements = `<circle cx="150" cy="200" r="25" fill="${palette.accent}" opacity="0.15"/><circle cx="250" cy="180" r="20" fill="${palette.accent}" opacity="0.2"/><circle cx="200" cy="250" r="18" fill="${palette.accent}" opacity="0.15"/>`;
    }
    
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${palette.bg1}"/>
      <stop offset="100%" style="stop-color:${palette.bg2}"/>
    </linearGradient>
    <filter id="shadow">
      <feDropShadow dx="0" dy="2" stdDeviation="4" flood-opacity="0.3"/>
    </filter>
  </defs>
  
  <!-- Background -->
  <rect width="400" height="500" fill="url(#bg)" rx="0"/>
  
  <!-- Decorative elements -->
  ${decorativeElements}
  
  <!-- Corner accents -->
  <path d="M 0 0 L 60 0 L 40 20 L 0 20 Z" fill="${palette.accent}" opacity="0.4"/>
  <path d="M 400 500 L 340 500 L 360 480 L 400 480 Z" fill="${palette.accent}" opacity="0.4"/>
  
  <!-- Title text -->
  <g filter="url(#shadow)">
    ${lines.slice(0, 3).map((line, i) => `
    <text x="200" y="${startY + i * 40}" 
          font-family="Arial, Helvetica, sans-serif" 
          font-size="28" 
          font-weight="bold" 
          fill="white" 
          text-anchor="middle" 
          letter-spacing="1">${line}</text>
    `).join('\n    ')}
  </g>
  
  <!-- Subtitle -->
  <text x="200" y="${startY + lines.length * 40 + 20}" 
        font-family="Arial, Helvetica, sans-serif" 
        font-size="14" 
        fill="${palette.accent}" 
        text-anchor="middle" 
        letter-spacing="2" 
        opacity="0.8">EMERGENCY GUIDE 2026</text>
</svg>`;
    
    return svg;
}

console.log('=== GENERATING COLOR BLOCK IMAGES ===\n');

let generated = 0;
let failed = 0;

for (const blog of blogsNeedingImages) {
    try {
        const palette = colorPalettes[generated % colorPalettes.length];
        const svg = generateColorBlockSVG(blog.title, palette);
        const fileName = `${blog.slug}.svg`;
        const filePath = path.join(destFolder, fileName);
        
        writeFileSync(filePath, svg, 'utf-8');
        console.log(`✅ ${blog.slug}`);
        console.log(`   → /images/blog/generated/${fileName}\n`);
        generated++;
    } catch (err) {
        console.log(`❌ Failed: ${blog.slug}`);
        console.log(`   Error: ${err.message}\n`);
        failed++;
    }
}

console.log('\n=== SUMMARY ===');
console.log(`✅ Generated: ${generated}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📊 Total: ${blogsNeedingImages.length}`);
