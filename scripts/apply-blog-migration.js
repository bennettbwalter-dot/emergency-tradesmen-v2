import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
    console.log('Applying migration 019_blog_posts.sql...');

    const migrationPath = path.join(__dirname, '../supabase/migrations/019_blog_posts.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    // Note: supabase-js doesn't have a direct 'run SQL' method for security reasons.
    // We usually run migrations via the CLI or the SQL Editor.
    // However, we can try to use the rpc call if we have a custom function, but that's unlikely.
    // Instead, I will inform the user to run it in the SQL Editor.

    console.log('--- MIGRATION SQL START ---');
    console.log(sql);
    console.log('--- MIGRATION SQL END ---');

    console.log('\nACTION REQUIRED: Please copy the SQL above and run it in your Supabase SQL Editor.');
}

applyMigration();
