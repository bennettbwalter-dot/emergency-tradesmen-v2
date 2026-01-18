
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Move up from scripts/ to root
const rootDir = join(__dirname, '..');
const filePath = join(rootDir, 'src', 'lib', 'cityPostcodes.ts');

console.log(`Processing: ${filePath}`);

try {
    let content = fs.readFileSync(filePath, 'utf8');

    // Extract the object content
    const match = content.match(/export const cityPostcodes: Record<string, string> = \{([\s\S]*?)\};/);
    if (!match) {
        console.error("Could not find cityPostcodes object structure");
        process.exit(1);
    }

    const body = match[1];
    const lines = body.split('\n');
    const seenKeys = new Set();
    const cleanLines = [];

    // Regex to match: "City": "Code",
    const lineRegex = /^\s*"([^"]+)":\s*"([^"]+)",?\s*$/;

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) {
            cleanLines.push(line);
            continue;
        }

        const m = trimmed.match(lineRegex);
        if (m) {
            const key = m[1];
            if (!seenKeys.has(key)) {
                seenKeys.add(key);
                cleanLines.push(line);
            } else {
                console.log(`Removed duplicate: ${key}`);
            }
        } else {
            // Comments or non-matching lines kept
            cleanLines.push(line);
        }
    }

    // Reconstruct file
    const newContent = content.replace(match[1], cleanLines.join('\n'));
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log("Successfully cleaned cityPostcodes.ts");

} catch (e) {
    console.error("Error:", e);
}
