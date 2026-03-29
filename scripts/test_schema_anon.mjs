import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xwqvhymkwuasotsgmarn.supabase.co';
// Using anon key instead of service key to test
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3cXZoeW1rd3Vhc290c2dtYXJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM3Njg4NjgsImV4cCI6MjA0OTM0NDg2OH0.97h_LNyLhECPc1Kj4OC8lxGAu3IYZxILIGR20dA-gLE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testDatabaseSchema() {
    console.log('Testing database schema with anon key...\n');

    // Simple query to test if the column exists
    const { data, error, count } = await supabase
        .from('businesses')
        .select('id, name, country_code', { count: 'exact' })
        .limit(3);

    if (error) {
        console.error('❌ Error:', error.message);
        console.log('\nColumn may not exist or there may be RLS restrictions.');
        return;
    }

    console.log('✅ SUCCESS! Query worked.');
    console.log(`Total businesses in DB: ${count}`);
    console.log('\nSample data:');
    data?.forEach(biz => {
        console.log(`  ${biz.name}: country_code="${biz.country_code || 'NULL'}"`);
    });
}

testDatabaseSchema();
