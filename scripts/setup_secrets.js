import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');
const secretsPath = path.join(projectRoot, 'USER_SECRETS_INPUT.json');
const envPath = path.join(projectRoot, '.env');

try {
    if (!fs.existsSync(secretsPath)) {
        console.error('Secrets file not found: ' + secretsPath);
        process.exit(1);
    }

    const secrets = JSON.parse(fs.readFileSync(secretsPath, 'utf8'));
    const { VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY } = secrets;

    if (!VITE_SUPABASE_URL || !VITE_SUPABASE_ANON_KEY) {
        console.error('Error: One or more keys are missing in USER_SECRETS_INPUT.json');
        process.exit(1);
    }

    let envContent = '';
    if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
    }

    // specific replacement or append
    // We want to avoid duplicates.
    const cleanEnv = envContent
        .split('\n')
        .filter(line => !line.startsWith('VITE_SUPABASE_URL=') && !line.startsWith('VITE_SUPABASE_ANON_KEY='))
        .join('\n');

    const newEnv = `${cleanEnv.trim()}\n\nVITE_SUPABASE_URL=${VITE_SUPABASE_URL}\nVITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}\n`;

    fs.writeFileSync(envPath, newEnv.trim() + '\n');

    // cleanup
    fs.unlinkSync(secretsPath);

    console.log('Successfully updated .env with Supabase credentials.');

} catch (err) {
    console.error('Error updating secrets:', err);
    process.exit(1);
}
