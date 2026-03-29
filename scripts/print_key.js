import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
const envConfig = dotenv.parse(fs.readFileSync(envPath));
console.log("KEY_START|" + envConfig.SUPABASE_SERVICE_ROLE_KEY + "|KEY_END");
