import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const businessesPath = path.join(__dirname, '../src/lib/businesses.ts');

try {
    const content = fs.readFileSync(businessesPath, 'utf8');
    const lines = content.split('\n');

    console.log(`Total lines: ${lines.length}`);

    let insideObject = false;

    // Debug first 1500 lines (covering the plumber section we saw)
    for (let i = 0; i < 1500; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        if (trimmed === '{') {
            console.log(`Line ${i + 1}: Start of object detected`);
            insideObject = true;
        }

        if (insideObject) {
            const websiteMatch = line.match(/website:\s*"(https?:\/\/[^"]+)"/);
            if (websiteMatch) {
                console.log(`Line ${i + 1}: Website found: ${websiteMatch[1]}`);
            }

            if (trimmed === '},' || trimmed === '}') {
                console.log(`Line ${i + 1}: End of object detected`);
                insideObject = false;
            }
        }
    }

} catch (error) {
    console.error('Error:', error);
}
