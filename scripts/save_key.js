import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
const envConfig = dotenv.parse(fs.readFileSync(envPath));
fs.writeFileSync('key.txt', envConfig.SUPABASE_SERVICE_ROLE_KEY, 'utf8');
console.log("Key saved to key.txt");
