import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env from root
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '../.env');
console.log(`Loading .env from: ${envPath}`);
const result = dotenv.config({ path: envPath });

if (result.error) {
    console.error('❌ Error loading .env file:', result.error.message);
} else {
    console.log('✅ .env file loaded successfully');
    console.log('Available keys starting with VITE_:');
    Object.keys(result.parsed || {}).forEach(key => {
        if (key.startsWith('VITE_')) {
            console.log(` - ${key}`);
        }
    });
}

const apiKey = process.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
    console.error('❌ VITE_GEMINI_API_KEY is missing in process.env');
    // Check if it's in the parsed object but not process.env for some reason
    if (result.parsed && result.parsed.VITE_GEMINI_API_KEY) {
        console.log('⚠️ Key found in file but not in process.env?');
    }
    process.exit(1);
}

console.log('✅ Found VITE_GEMINI_API_KEY in .env');

async function verifyGemini() {
    // Cloudflare AI Gateway Endpoint
    const accountId = 'dd742691cc31b1d460788e1084fe3243';
    const gatewayId = 'emergency-tradesmen';
    const provider = 'google-ai-studio';
    const model = 'gemini-2.5-flash';

    const endpoint = `https://gateway.ai.cloudflare.com/v1/${accountId}/${gatewayId}/${provider}/v1beta/models/${model}:generateContent?key=${apiKey}`;

    console.log(`Testing connection to ${model} via Cloudflare Gateway...`);

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: "Hello, are you online?" }]
                }]
            })
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('❌ API Request Failed:', error);
            process.exit(1);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (text) {
            console.log('✅ Gemini API Response Received:');
            console.log('------------------------------------------------');
            console.log(text);
            console.log('------------------------------------------------');
            console.log('✅ Verification Succesful! The API Key is valid and working.');
        } else {
            console.error('❌ Received response but no text content found:', JSON.stringify(data, null, 2));
        }

    } catch (error) {
        console.error('❌ Network or Execution Error:', error);
        process.exit(1);
    }
}

verifyGemini();
