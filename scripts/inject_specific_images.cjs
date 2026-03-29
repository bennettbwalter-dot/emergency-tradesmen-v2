const fs = require('fs');
const path = require('path');

const injectionMap = {
    'ac-blowing-warm-air-capacitor-leak-us.md': {
        cover: '/images/blog/generated/ac-capacitor.webp',
        body: [
            { anchor: '## 2. The #1 Cause: The Run Capacitor', img: '\n![HVAC capacitor failure - bulging unit](/images/blog/generated/ac-capacitor.webp)\n' }
        ]
    },
    'emergency-drain-cleaning-gb.md': {
        cover: '/images/blog/generated/bathroom-drain.webp'
    },
    'car-battery-alternator-failure-gb.md': {
        cover: '/images/blog/generated/battery-check.webp',
        body: [
            { anchor: '## 2. Identifying the Failure', img: '\n![Professional car battery health check](/images/blog/generated/battery-check.webp)\n' },
            { anchor: '## 4. Emergency Procedures', img: '\n![Heavy-duty jump cables ready](/images/blog/generated/jump-cables.webp)\n' }
        ]
    },
    'carbon-monoxide-gb.md': {
        body: [
            { anchor: '<h2>5. Recognizing the "Lazy Flame": Visual Warning Signs</h2>', img: '\n![Standard UK boiler safety and ventilation diagram](/images/blog/generated/boiler-safety-diagram.webp)\n' }
        ]
    },
    'emergency-glazing-gb.md': {
        cover: '/images/blog/generated/broken-window-boarding.webp',
        body: [
            { anchor: '<h2>6. Emergency Boarding 2026: "The 4-Hour Response"</h2>', img: '\n![Emergency boarding up and glazing security](/images/blog/generated/broken-window-boarding.webp)\n' }
        ]
    },
    'emergency-glazing-us.md': {
        cover: '/images/blog/generated/glazing-replacement.webp',
        body: [
            { anchor: '<h2>2. ASTM F3561 & ANSI Z97.1: The 2026 Security Benchmarks</h2>', img: '\n![Residential glazing replacement in progress](/images/blog/generated/glazing-replacement.webp)\n' }
        ]
    },
    'emergency-at-home-master-protocol-us.md': {
        body: [
            { anchor: '<h2>1. The 2026 US Safety Baseline: The "Knowledge Capsule" Summary</h2>', img: '\n![Emergency home safety kit components](/images/blog/generated/emergency-home-kit.webp)\n' },
            { anchor: '<h2>5. Finding the Curb Key: Regional Shut-off Protocols</h2>', img: '\n![Main water shut-off valve location and operation](/images/blog/generated/water-shut-off.webp)\n' }
        ]
    },
    '5-signs-you-need-emergency-plumber-us.md': {
        body: [
            { anchor: '<h2>4. The Ceiling Blister: Preventing Structural Drywall Collapse</h2>', img: '\n![DIY plumbing disaster - leaking ceiling bulge](/images/blog/generated/diy-disaster-main.webp)\n' },
            { anchor: '<h2>2. Total Loss of Pressure: When the Service Line Fails</h2>', img: '\n![Struggling with a DIY plumbing repair in progress](/images/blog/generated/diy-struggle.webp)\n' }
        ]
    },
    'carbon-monoxide-us.md': {
        body: [
            { anchor: '<h2>10. Emergency Protocol: Refreshing Your Family’s "Outdoor Fresh Air" Drill</h2>', img: '\n![Modern US residential gas meter and exterior shut-off](/images/blog/generated/us-gas-meter.webp)\n' }
        ]
    },
    'refrigerant-leak-safety-us.md': {
        body: [
            { anchor: '<h2>4. Identifying an A2L Leak: The 2026 Signs</h2>', img: '\n![Modern US HVAC system high-efficiency exterior unit](/images/blog/generated/us-hvac-system.webp)\n' }
        ]
    },
    'emergency-drain-cleaning-us.md': {
        cover: '/images/blog/generated/plumber-inspecting-drain.webp'
    },
    'frozen-pipe-thaw-flood-prevention-us.md': {
        body: [
            { anchor: '<h2>3. Emergency Response: Main Shut-off Valve Locations</h2>', img: '\n![Pouring warm water slowly on a frozen pipe](/images/blog/generated/pouring-warm-water.webp)\n' }
        ]
    },
    'emergency-tradesmen-uk.md': {
        cover: '/images/blog/generated/et-service-van-night.webp'
    },
    'emergency-contractor-us.md': {
        cover: '/images/blog/generated/us-service-truck.webp'
    }
};

const contentDir = 'scripts/content';

Object.entries(injectionMap).forEach(([filename, data]) => {
    const filePath = path.join(contentDir, filename);
    if (!fs.existsSync(filePath)) {
        console.log(`File not found: ${filename}`);
        return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // 1. Inject/Update Cover Image logic (This is tricky because cover images are often in frontmatter or first img tag)
    // For simplicity, I'll just look for existing img tags or add a fake one if missing
    if (data.cover) {
        if (!content.includes(data.cover)) {
            // Find first img tag
            const imgMatch = content.match(/!\[.*?\]\((.*?)\)/);
            if (imgMatch) {
                // Replace the first image with the cover
                content = content.replace(imgMatch[0], `![Header Image](${data.cover})`);
                modified = true;
            } else {
                // Prepend if no image
                content = content.replace(/(# .*?\n)/, `$1\n![Header Image](${data.cover})\n`);
                modified = true;
            }
        }
    }

    // 2. Inject body images
    if (data.body) {
        data.body.forEach(item => {
            if (content.includes(item.anchor) && !content.includes(item.img.trim())) {
                content = content.replace(item.anchor, `${item.anchor}\n${item.img}`);
                modified = true;
            }
        });
    }

    if (modified) {
        fs.writeFileSync(filePath, content);
        console.log(`Updated: ${filename}`);
    } else {
        console.log(`No changes needed: ${filename}`);
    }
});
