import { readFileSync } from 'fs';
import { execSync } from 'child_process';
import { join } from 'path';

const secretsPath = join(process.cwd(), 'USER_SECRETS_INPUT.json');

try {
    const secrets = JSON.parse(readFileSync(secretsPath, 'utf8'));
    const envVars = [];

    if (secrets.EMAILOCTOPUS_API_KEY) {
        envVars.push(`EMAILOCTOPUS_API_KEY=${secrets.EMAILOCTOPUS_API_KEY}`);
    }
    if (secrets.EMAILOCTOPUS_LIST_ID) {
        envVars.push(`EMAILOCTOPUS_LIST_ID=${secrets.EMAILOCTOPUS_LIST_ID}`);
    }

    if (envVars.length > 0) {
        console.log('Setting secrets in Supabase...');
        execSync(`npx --yes supabase secrets set ${envVars.join(' ')}`, { stdio: 'inherit' });
        console.log('Secrets set successfully!');
    } else {
        console.log('No EmailOctopus secrets found in USER_SECRETS_INPUT.json');
    }

} catch (error) {
    console.error('Error setting secrets:', error.message);
}
