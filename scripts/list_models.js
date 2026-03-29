import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const apiKey = process.env.VITE_GEMINI_API_KEY;

// Cloudflare Details
const accountId = 'dd742691cc31b1d460788e1084fe3243';
const gatewayId = 'emergency-tradesmen';
const provider = 'google-ai-studio';

// Try listing models via Cloudflare Gateway
const endpoint = `https://gateway.ai.cloudflare.com/v1/${accountId}/${gatewayId}/${provider}/v1beta/models?key=${apiKey}`;

console.log('Fetching available models...');

async function listModels() {
    try {
        const response = await fetch(endpoint);
        const data = await response.json();

        if (!response.ok) {
            console.error('❌ Error fetching models:', data);
            return;
        }

        console.log('✅ Available Models:');
        if (data.models) {
            data.models.forEach(model => {
                console.log(` - ${model.name} (${model.displayName})`);
            });
        } else {
            console.log('No models list found in response:', data);
        }

    } catch (e) {
        console.error('❌ Network Error:', e);
    }
}

listModels();
