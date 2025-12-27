import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '../.env');
const newKey = 'sk_1e83328ca94b220c700ea2b7b4552eec7b67c6195ededb25';

try {
    let envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split(/\r?\n/);
    const newLines = [];

    for (const line of lines) {
        const trimmed = line.trim();
        // Remove ANY existing ElevenLabs API key lines
        if (trimmed.startsWith('VITE_ELEVENLABS_API_KEY=')) {
            continue;
        }
        newLines.push(line);
    }

    // Append the new key
    newLines.push(`VITE_ELEVENLABS_API_KEY=${newKey}`);

    // Join and write back
    const finalContent = newLines.join('\n');
    fs.writeFileSync(envPath, finalContent, 'utf8');

    console.log('✅ Updated .env with new VITE_ELEVENLABS_API_KEY (duplicates removed)');

} catch (err) {
    console.error('❌ Failed to update .env:', err);
    process.exit(1);
}
