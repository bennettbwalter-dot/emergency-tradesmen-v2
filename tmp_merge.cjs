const fs = require('fs');
const path = require('path');

const targetDir = 'scripts/content';
const sourceDirs = ['.']; // Search everything

function findAndCopy(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stats = fs.statSync(fullPath);
        
        if (stats.isDirectory()) {
            if (file === 'node_modules' || file === '.git' || file === 'scripts') continue;
            findAndCopy(fullPath);
        } else if (file.endsWith('.md')) {
            if (stats.size > 10000) {
                console.log(`Copying ${file} (${stats.size} bytes)`);
                fs.copyFileSync(fullPath, path.join(targetDir, file));
            }
        }
    }
}

findAndCopy('.');
console.log('Done!');
