const fs = require('fs');
const path = require('path');

// Read the businesses.ts file
const filePath = path.join(__dirname, '..', 'src', 'lib', 'businesses.ts');
const content = fs.readFileSync(filePath, 'utf8');

// Count unique business IDs using regex
const idMatches = content.match(/id:\s*["'][\w-]+["']/g);
const uniqueIds = new Set();

if (idMatches) {
    idMatches.forEach(match => {
        // Extract just the ID value
        const id = match.match(/["']([\w-]+)["']/)[1];
        uniqueIds.add(id);
    });
}

console.log('=== Business Count Analysis ===');
console.log(`Total ID occurrences: ${idMatches ? idMatches.length : 0}`);
console.log(`Unique business IDs: ${uniqueIds.size}`);
console.log(`File size: ${(fs.statSync(filePath).size / 1024 / 1024).toFixed(2)} MB`);
console.log(`Total lines: ${content.split('\n').length}`);

// Count by city
const cityMatches = content.match(/(\w+):\s*\{[\s\S]*?plumber:/g);
console.log(`\nCities found: ${cityMatches ? cityMatches.length : 0}`);

// Sample some IDs
console.log('\nSample business IDs:');
Array.from(uniqueIds).slice(0, 10).forEach(id => console.log(`  - ${id}`));
