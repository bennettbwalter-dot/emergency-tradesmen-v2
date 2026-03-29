import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

// Manually selecting the second key found in the file dump
const apiKey = '03924d318409f42066a05b577c6b87e5979319911e9fb3ad4683c2f6a8048847';
const voiceId = process.env.VITE_ELEVENLABS_VOICE_ID || 'piTKgcLEGmPE4e6mEKli';

console.log(`ℹ️  Testing API Key: ${apiKey.substring(0, 8)}...`);
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
