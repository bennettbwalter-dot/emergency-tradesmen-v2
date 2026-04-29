
import fs from 'fs';

function cleanDuplicates(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const newLines = [];
    const keysToKeep = new Map(); // key -> lineIndex
    const keyRegex = /^\s*"([^"]+)":\s*"[^"]*",?/;

    lines.forEach((line, index) => {
        const match = line.match(keyRegex);
        if (match) {
            const key = match[1];
            keysToKeep.set(key, index);
        }
    });

    lines.forEach((line, index) => {
        const match = line.match(keyRegex);
        if (match) {
            const key = match[1];
            if (keysToKeep.get(key) === index) {
                newLines.push(line);
            } else {
                console.log(`Removing duplicate from ${filePath}: ${key} at line ${index + 1}`);
            }
        } else {
            newLines.push(line);
        }
    });

    fs.writeFileSync(filePath, newLines.join('\n'));
}

const files = [
    'c:/Users/Nick/Downloads/hitmaker-2026/emergency-tradesmen/src/lib/cityPostcodes.ts',
    'c:/Users/Nick/Downloads/hitmaker-2026/emergency-tradesmen/src/lib/usCityStates.ts'
];

files.forEach(cleanDuplicates);
console.log('Cleanup complete.');
