const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xwqvhymkwuasotsgmarn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3cXZoeW1rd3Vhc290c2dtYXJuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTk5MDM0MywiZXhwIjoyMDgxNTY2MzQzfQ.ZJQXY5OzkfO4Ey2G5enTdPHx_shgDMGAUaTJAHKDKus';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSchema() {
    const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('country_code', 'US')
        .limit(1);

    if (error) {
        console.error('Error fetching sample US business:', error);
        return;
    }

    if (data && data.length > 0) {
        console.log('Sample Business Columns:', Object.keys(data[0]));
    } else {
        console.log('No US businesses found to check columns.');
    }
}

checkSchema();
