import 'dotenv/config';
import fs from 'fs';

console.log('Checking environment variables...');
const envPath = '.env';

if (fs.existsSync(envPath)) {
    console.log('.env file FOUND');
    const content = fs.readFileSync(envPath, 'utf-8');
    const lines = content.split('\n');
    console.log('Keys found in .env file:');
    lines.forEach(line => {
        const match = line.match(/^([^=]+)=/);
        if (match) {
            console.log(` - ${match[1]}`);
        }
    });
} else {
    console.log('.env file NOT FOUND at ' + envPath);
}

console.log('\nprocess.env check:');
const required = ['VITE_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'VITE_GOOGLE_MAPS_API_KEY', 'SUPABASE_URL'];
required.forEach(key => {
    if (process.env[key]) {
        console.log(`✅ ${key} is set (length: ${process.env[key].length})`);
    } else {
        console.log(`❌ ${key} is MISSING`);
    }
});
