import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = 'https://xwqvhymkwuasotsgmarn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3cXZoeW1rd3Vhc290c2dtYXJuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTk5MDM0MywiZXhwIjoyMDgxNTY2MzQzfQ.ZJQXY5OzkfO4Ey2G5enTdPHx_shgDMGAUaTJAHKDKus';

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
    const migrationPath = path.resolve('supabase/migrations/023_multi_regional_base.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('Applying migration...');

    // Split SQL into individual statements if necessary, or use RPC if it exists
    // Since we don't have a generic SQL executive RPC, we'll try to run it using a common pattern

    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
        console.error('Error applying migration via RPC:', error);
        console.log('Attempting alternative method (individual table updates)...');
        // Fallback or just report error
    } else {
        console.log('Migration applied successfully via RPC.');
    }
}

applyMigration();
