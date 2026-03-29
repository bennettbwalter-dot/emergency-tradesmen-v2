const fs = require('fs');
const path = require('path');

const mappings = {
  "bathroom-drain.webp": "sewage-cleanup-gb.md",
  "battery-check.webp": "portable-power-stations-backup-gb.md",
  "boiler-safety-diagram.webp": "hybrid-heating-backup-gb.md",
  "broken-window-boarding.webp": "emergency-glazing-gb.md",
  "car-battery-frosty.webp": "generator-safety-grid-instability-us.md",
  "diy-disaster-main.webp": "emergency-handyman-us.md",
  "diy-struggle.webp": "emergency-contractor-us.md",
  "emergency-home-kit.webp": "emergency-services-gb.md",
  "et-service-van-night.webp": "emergency-trades-us.md",
  "fast-response-stopwatch.webp": "emergency-tradesmen-uk.md",
  "foundation-cracks.png": "structural-cracks-foundation-repair-us.md",
  "frozen-pipe.webp": "emergency-pipe-burst-protocol-gb.md",
  "gas-isolation.webp": "commercial-gas-safe-uk.md",
  "glazing-replacement.webp": "emergency-glazing-us.md",
  "jump-cables.webp": "generator-safety-grid-instability-gb.md",
  "mold-restoration.png": "mould-remediation-gb.md",
  "plumber-inspecting-drain.webp": "commercial-drainage-gb.md",
  "plumbing-emergency-signs.png": "emergency-pipe-burst-protocol-us.md",
  "plumbing-heating-emergency-hero.webp": "emergency-heat-pump-thaw-gb.md",
  "plywood-install.webp": "forced-entry-prevention-door-hardening-us.md",
  "pouring-warm-water.webp": "emergency-heat-pump-thaw-us.md",
  "running_toilet_hero.webp": "septic-tank-emergency-us.md",
  "toilet_tank_mechanism.webp": "sewer-backup-prevention-backwater-valves-us.md",
  "tradesman-night-rain.webp": "emergency-water-main-repair-gb.md",
  "us-certification-badge.webp": "building-envelope-audit-us.md",
  "us-gas-meter.webp": "smart-leak-detection-2026-us.md",
  "us-hvac-system.webp": "commercial-refrigeration-repair-us.md",
  "us-service-truck.webp": "facility-management-emergency-us.md",
  "vetted-pro-badge.webp": "security-audit-us.md",
  "water-shut-off.webp": "emergency-water-main-repair-us.md"
};

const dir = path.join(__dirname, 'content');
let updatedCount = 0;

for (const [img, targetBlog] of Object.entries(mappings)) {
    const p = path.join(dir, targetBlog);
    if (!fs.existsSync(p)) {
        console.log("Missing:", targetBlog);
        continue;
    }
    
    let content = fs.readFileSync(p, 'utf-8');
    
    // Safety check: is it already there?
    if (content.includes(img)) continue;
    
    // We want to insert the image structurally in a missing gap.
    // The safest gap is right before <h2>4. or <h2>5. 
    // Let's try <h2>5. first, if not, <h2>4.
    const imageTag = `\n    <img src="/blog/generated/${img}" alt="Editorial illustration related to the blog topic, matte flat-vector style" width="800" height="450">\n\n`;
    
    let injected = false;
    for (const heading of ['<h2>5.', '<h2>6.', '<h2>4.']) {
        if (content.includes(heading)) {
            content = content.replace(heading, imageTag + '    ' + heading);
            injected = true;
            break;
        }
    }
    
    if (injected) {
        fs.writeFileSync(p, content, 'utf-8');
        console.log(`Updated ${targetBlog} with ${img}`);
        updatedCount++;
    } else {
        console.log(`Could not find a valid insertion point for ${targetBlog}`);
    }
}
console.log("Total updated:", updatedCount);
