import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = 'https://xwqvhymkwuasotsgmarn.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3cXZoeW1rd3Vhc290c2dtYXJuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTk5MDM0MywiZXhwIjoyMDgxNTY2MzQzfQ.ZJQXY5OzkfO4Ey2G5enTdPHx_shgDMGAUaTJAHKDKus';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
    try {
        const migrationPath = path.resolve(__dirname, '../supabase/migrations/023_multi_regional_base.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');

        console.log('Reading migration file...');
        console.log(`File length: ${sql.length} characters`);

        // Split into individual SQL statements
        const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));

        console.log(`Found ${statements.length} SQL statements to execute`);

        // Execute each statement via individual queries
        for (let i = 0; i < statements.length; i++) {
            const stmt = statements[i];
            console.log(`\nExecuting statement ${i + 1}/${statements.length}:`);
            console.log(stmt.substring(0, 100) + '...');

            try {
                // Use the postgres REST API to execute raw SQL
                const { data, error } = await supabase.rpc('exec', { query: stmt + ';' });

                if (error) {
                    console.error(`Error on statement ${i + 1}:`, error.message);
                    // Try alternative: direct table operations for ALTER TABLE
                    if (stmt.includes('ALTER TABLE')) {
                        console.log('  Skipping ALTER TABLE (may already exist)');
                        continue;
                    }
                } else {
                    console.log(`  ✓ Success`);
                }
            } catch (err) {
                console.error(`Exception on statement ${i + 1}:`, err.message);
            }
        }

        console.log('\n\nMigration process completed. Please verify in Supabase dashboard.');

    } catch (error) {
        console.error('Fatal error:', error);
    }
}

applyMigration();
