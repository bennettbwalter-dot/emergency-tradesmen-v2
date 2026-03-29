import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '../.env');
const newVoiceId = 'wyWA56cQNU2KqUW4eCsI';

try {
    let envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split(/\r?\n/);
    const newLines = [];
    let updated = false;

    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('VITE_ELEVENLABS_VOICE_ID=')) {
            newLines.push(`VITE_ELEVENLABS_VOICE_ID=${newVoiceId}`);
            updated = true;
        } else {
            newLines.push(line);
        }
    }

    if (!updated) {
        newLines.push(`VITE_ELEVENLABS_VOICE_ID=${newVoiceId}`);
    }

    // Join and write back
    const finalContent = newLines.join('\n');
    fs.writeFileSync(envPath, finalContent, 'utf8');

    console.log('✅ Updated .env with new VITE_ELEVENLABS_VOICE_ID (Christopher)');

} catch (err) {
    console.error('❌ Failed to update .env:', err);
    process.exit(1);
}
