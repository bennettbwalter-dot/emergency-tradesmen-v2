import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xwqvhymkwuasotsgmarn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3cXZoeW1rd3Vhc290c2dtYXJuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTk5MDM0MywiZXhwIjoyMDgxNTY2MzQzfQ.ZJQXY5OzkfO4Ey2G5enTdPHx_shgDMGAUaTJAHKDKus';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyMigration() {
    console.log('Verifying migration...\n');

    try {
        // Try to query businesses with country_code
        const { data, error } = await supabase
            .from('businesses')
            .select('id, name, country_code')
            .limit(5);

        if (error) {
            console.error('❌ ERROR:', error.message);
            console.log('\nThe country_code column does NOT exist yet.');
            return;
        }

        console.log('✅ SUCCESS! The country_code column exists!');
        console.log(`\nFound ${data.length} businesses. Sample data:`);
        data.forEach(biz => {
            console.log(`  - ${biz.name}: country_code = "${biz.country_code}"`);
        });

        // Check if regional_cities table exists
        const { data: cities, error: citiesError } = await supabase
            .from('regional_cities')
            .select('name, country_code')
            .limit(5);

        if (!citiesError) {
            console.log(`\n✅ regional_cities table exists with ${cities.length} cities`);
            cities.forEach(city => {
                console.log(`  - ${city.name} (${city.country_code})`);
            });
        }

    } catch (err) {
        console.error('Exception:', err.message);
    }
}

verifyMigration();
