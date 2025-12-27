import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '../.env');
const newKey = 'AIzaSyB4r6b45gHcsqxbMGBk_beQpPMouDBEsNw';

try {
    let envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split(/\r?\n/);
    const newLines = [];
    let keyUpdated = false;

    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('VITE_GEMINI_API_KEY=') || trimmed.startsWith('GEMINI_API_KEY=')) {
            // Skip existing keys (we will add the correct one)
            continue;
        }
        newLines.push(line);
    }

    // Append the new key
    newLines.push(`VITE_GEMINI_API_KEY=${newKey}`);

    // Join and write back
    const finalContent = newLines.join('\n');
    fs.writeFileSync(envPath, finalContent, 'utf8');

    console.log('✅ Updated .env with new VITE_GEMINI_API_KEY');

} catch (err) {
    console.error('❌ Failed to update .env:', err);
    process.exit(1);
}
