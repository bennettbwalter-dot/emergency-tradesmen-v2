const fs = require('fs');
const path = require('path');

const checkAndCleanFile = (filePath) => {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    let modified = false;
    let removedCount = 0;

    // 1. Clean Markdown Images ![alt](url)
    // Careful with regex to not infinite loop: we use replace
    content = content.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, url) => {
        if (url.startsWith('http')) return match;
        const assetPath = path.join('public', url.split('?')[0]);
        if (!fs.existsSync(assetPath)) {
            console.log(`[REMOVED] Markdown Image: ${url} (File missing)`);
            removedCount++;
            return ''; // Remove entirely
        }
        return match;
    });

    // 2. Clean HTML Images <img src="url" ...>
    content = content.replace(/<img([^>]+)src=["']([^"']+)["']([^>]*)>/gi, (match, before, url, after) => {
        if (url.startsWith('http')) return match;
        const assetPath = path.join('public', url.split('?')[0]);
        if (!fs.existsSync(assetPath)) {
            console.log(`[REMOVED] HTML Image: ${url} (File missing)`);
            removedCount++;
            return ''; // Remove entirely
        }
        return match;
    });

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        return removedCount;
    }
    return 0;
};

const scanDir = (dir) => {
    let totalRemoved = 0;
    fs.readdirSync(dir).forEach(file => {
        const p = path.join(dir, file);
        if (fs.statSync(p).isDirectory()) {
            totalRemoved += scanDir(p);
        } else if (p.endsWith('.md')) {
            totalRemoved += checkAndCleanFile(p);
        }
    });
    return totalRemoved;
};

console.log('--- Scanning for broken image tags ---');
let c1 = scanDir('scripts/content');
let c2 = scanDir('emergency-content-orchestrator/optimized-blogs');

console.log(`Total broken images removed: ${c1 + c2}`);
