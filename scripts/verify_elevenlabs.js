import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const apiKey = process.env.VITE_ELEVENLABS_API_KEY;
const voiceId = process.env.VITE_ELEVENLABS_VOICE_ID || 'piTKgcLEGmPE4e6mEKli';

if (!apiKey) {
    console.error('❌ VITE_ELEVENLABS_API_KEY is missing in .env');
    process.exit(1);
}

console.log('✅ Found API Key');
console.log(`ℹ️  Using Voice ID: ${voiceId}`);

async function verifyElevenLabs() {
    console.log('Testing ElevenLabs API connection...');

    try {
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`, {
            method: 'POST',
            headers: {
                'Accept': 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': apiKey
            },
            body: JSON.stringify({
                text: "Hello, this is a test.",
                model_id: "eleven_turbo_v2_5",
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75
                }
            })
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('❌ API Request Failed:', error);
            process.exit(1);
        }

        console.log('✅ ElevenLabs API Response: 200 OK');
        console.log('✅ Audio stream received successfully.');

    } catch (error) {
        console.error('❌ Network or Execution Error:', error);
        process.exit(1);
    }
}

verifyElevenLabs();
