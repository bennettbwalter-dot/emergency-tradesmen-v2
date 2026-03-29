import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Keys from apply_regional_migration.ts
const supabaseUrl = 'https://xwqvhymkwuasotsgmarn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3cXZoeW1rd3Vhc290c2dtYXJuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTk5MDM0MywiZXhwIjoyMDgxNTY2MzQzfQ.ZJQXY5OzkfO4Ey2G5enTdPHx_shgDMGAUaTJAHKDKus';

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
    const migrationPath = path.resolve('supabase/migrations/20260114120000_add_us_hierarchy_slugs.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('Applying US Schema Migration...');
    console.log(sql);

    // Attempt 1: exec_sql RPC
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
        console.error('❌ Error applying migration via RPC:', error.message);
        process.exit(1);
    } else {
        console.log('✅ Migration applied successfully.');
    }
}

applyMigration();
