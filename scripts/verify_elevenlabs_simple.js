import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const apiKey = process.env.VITE_ELEVENLABS_API_KEY;

console.log(`ℹ️  Testing API Key: ${apiKey ? apiKey.substring(0, 8) + '...' : 'MISSING'}`);

async function verifyElevenLabsSimple() {
    console.log('Testing ElevenLabs - List Voices...');

    try {
        const response = await fetch('https://api.elevenlabs.io/v1/voices', {
            method: 'GET',
            headers: {
                'xi-api-key': apiKey
            }
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('❌ API Request Failed:', error);
            process.exit(1);
        }

        const data = await response.json();
        console.log('✅ ElevenLabs API Response: 200 OK');
        console.log(`✅ Found ${data.voices.length} voices.`);

        // Print first 3 voices
        data.voices.slice(0, 3).forEach(v => {
            console.log(` - ${v.name} (${v.voice_id})`);
        });

    } catch (error) {
        console.error('❌ Network or Execution Error:', error);
        process.exit(1);
    }
}

verifyElevenLabsSimple();
