
import * as fs from 'fs';

const content = fs.readFileSync('src/lib/businesses.ts', 'utf-8');
const lines = content.split('\n');
const keys = new Map<string, number>();
const duplicates: { key: string, firstStart: number, firstEnd: number, secondStart: number, secondEnd: number }[] = [];

// Helper to find block end assuming balanced braces and proper indentation
function findBlockEnd(lines: string[], startLineIndex: number): number {
    let openBraces = 0;
    // The start line definitely has a '{'
    for (let i = startLineIndex; i < lines.length; i++) {
        const line = lines[i];
        openBraces += (line.match(/{/g) || []).length;
        openBraces -= (line.match(/}/g) || []).length;
        if (openBraces === 0) return i + 1;
    }
    return -1;
}

let insideObject = false;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('export const businessListings')) insideObject = true;

    if (insideObject) {
        const match = line.match(/^\s*"?([a-zA-Z0-9-]+)"?:\s*{/);
        if (match) {
            const key = match[1];
            if (keys.has(key)) {
                const firstStart = keys.get(key)!;
                // Recalculate end for first (inefficient but works)
                const firstEnd = findBlockEnd(lines, firstStart - 1);
                const secondStart = i + 1;
                const secondEnd = findBlockEnd(lines, i);
                duplicates.push({ key, firstStart, firstEnd, secondStart, secondEnd });
            } else {
                keys.set(key, i + 1);
            }
        }
    }
}

console.log("Found duplicates ranges:", JSON.stringify(duplicates, null, 2));
