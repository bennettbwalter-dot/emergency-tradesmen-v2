import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl!, supabaseKey!);

async function checkAndRemoveAll() {
    console.log('Checking for ALL "Developer Test Business" listings...');

    // Check all cities
    const { data: allTests, error } = await supabase
        .from('businesses')
        .select('id, name, city, trade')
        .ilike('name', '%Developer Test Business%');

    if (error) {
        console.error('Error fetching:', error);
        return;
    }

    console.log(`\nFound ${allTests?.length || 0} "Developer Test Business" listings total`);

    if (allTests && allTests.length > 0) {
        console.log('\nBreakdown by city:');
        const byCity: Record<string, number> = {};
        allTests.forEach(b => {
            byCity[b.city] = (byCity[b.city] || 0) + 1;
        });
        Object.entries(byCity).forEach(([city, count]) => {
            console.log(`  ${city}: ${count} listings`);
        });

        // Delete ALL of them
        console.log('\nDeleting ALL test businesses...');
        const ids = allTests.map(b => b.id);

        const { error: deleteError } = await supabase
            .from('businesses')
            .delete()
            .in('id', ids);

        if (deleteError) {
            console.error('Error deleting:', deleteError);
        } else {
            console.log(`✅ Successfully deleted ALL ${ids.length} test businesses`);
        }
    } else {
        console.log('✅ No test businesses found - database is clean!');
    }
}

checkAndRemoveAll();
