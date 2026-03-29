import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://antqstrspkchkoylysqa.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials');
    console.error('Please set VITE_SUPABASE_URL and SUPABASE_SERVICE_KEY (or VITE_SUPABASE_ANON_KEY)');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration(filename) {
    console.log(`\n📄 Running migration: ${filename}`);

    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', filename);

    if (!fs.existsSync(migrationPath)) {
        console.error(`❌ Migration file not found: ${filename}`);
        return false;
    }

    const sql = fs.readFileSync(migrationPath, 'utf-8');

    try {
        const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

        if (error) {
            // Try alternative method - direct SQL execution not available via RPC
            console.log('⚠️  Cannot run migration via API - please run manually in Supabase dashboard');
            console.log('\n📋 SQL to run:');
            console.log('─'.repeat(60));
            console.log(sql.substring(0, 500) + '...');
            console.log('─'.repeat(60));
            console.log(`\n👉 Go to: ${supabaseUrl.replace('//', '//supabase.com/dashboard/project/')}/editor`);
            return false;
        }

        console.log('✅ Migration completed successfully');
        return true;
    } catch (err) {
        console.error('❌ Error running migration:', err.message);
        return false;
    }
}

async function setupDatabase() {
    console.log('🚀 Starting Supabase Database Setup\n');
    console.log(`📍 Project: ${supabaseUrl}\n`);

    // Test connection
    console.log('🔌 Testing connection...');
    const { data, error } = await supabase.from('_migrations').select('*').limit(1);

    if (error && error.code !== 'PGRST116') {
        // PGRST116 = table doesn't exist, which is fine
        if (error.message.includes('JWT')) {
            console.error('❌ Authentication failed. Please check your SUPABASE_SERVICE_KEY');
            console.error('\n💡 Get your service key from:');
            console.error(`   ${supabaseUrl.replace('https://', 'https://supabase.com/dashboard/project/')}/settings/api`);
            process.exit(1);
        }
    }

    console.log('✅ Connected to Supabase\n');

    // Since we can't run SQL directly via the API without admin access,
    // let's provide clear instructions instead
    console.log('📋 MANUAL SETUP REQUIRED\n');
    console.log('The Supabase JavaScript client does not support running arbitrary SQL.');
    console.log('Please follow these steps:\n');

    console.log('1️⃣  Go to Supabase SQL Editor:');
    console.log(`   ${supabaseUrl.replace('https://', 'https://supabase.com/dashboard/project/')}/sql/new`);

    console.log('\n2️⃣  Run migration 001_business_tables.sql');
    console.log('   Location: supabase/migrations/001_business_tables.sql');

    console.log('\n3️⃣  Run migration 002_seed_data.sql');
    console.log('   Location: supabase/migrations/002_seed_data.sql');

    console.log('\n4️⃣  Create Storage Bucket:');
    console.log('   - Go to Storage section');
    console.log('   - Create bucket named: business-photos');
    console.log('   - Make it PUBLIC');

    console.log('\n✨ After completing these steps, your database will be ready!\n');
}

setupDatabase().catch(console.error);
