import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Missing Supabase credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
    console.log("🔧 Running database migration...\n");

    const migrationSQL = fs.readFileSync(
        path.join(__dirname, 'migrations/add_enrichment_fields.sql'),
        'utf-8'
    );

    // Split SQL into individual statements
    const statements = migrationSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('COMMENT'));

    for (const statement of statements) {
        console.log(`Executing: ${statement.substring(0, 60)}...`);
        const { error } = await supabase.rpc('exec_sql', { sql_query: statement });

        if (error) {
            console.error(`❌ Error: ${error.message}`);
            console.log("\n⚠️  Migration may require manual execution via Supabase Dashboard");
            console.log("📋 Copy the SQL from: scripts/migrations/add_enrichment_fields.sql");
            console.log("🔗 Run at: https://supabase.com/dashboard/project/[your-project]/sql");
            process.exit(1);
        }
    }

    console.log("\n✅ Migration completed successfully!");
}

runMigration().catch(console.error);
