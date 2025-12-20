import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl!, supabaseKey!);

async function verifyDeletion() {
    console.log('Checking for remaining test businesses...\n');

    const { data: testBusinesses, error } = await supabase
        .from('businesses')
        .select('id, name, city')
        .ilike('name', '%Developer Test Business%');

    if (error) {
        console.error('Error:', error);
        return;
    }

    if (testBusinesses && testBusinesses.length > 0) {
        console.log(`❌ Still found ${testBusinesses.length} test businesses`);
        testBusinesses.slice(0, 5).forEach(b => {
            console.log(`  - ${b.name} (${b.city})`);
        });
        if (testBusinesses.length > 5) {
            console.log(`  ... and ${testBusinesses.length - 5} more`);
        }
    } else {
        console.log('✅ SUCCESS! All test businesses have been deleted!');
        console.log('   The database is now clean.');
    }

    // Check total business count
    const { data: allBusinesses } = await supabase
        .from('businesses')
        .select('id', { count: 'exact', head: true });

    console.log(`\nTotal businesses in database: ${allBusinesses?.length || 0}`);
}

verifyDeletion();
