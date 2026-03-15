const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xwqvhymkwuasotsgmarn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3cXZoeW1rd3Vhc290c2dtYXJuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTk5MDM0MywiZXhwIjoyMDgxNTY2MzQzfQ.ZJQXY5OzkfO4Ey2G5enTdPHx_shgDMGAUaTJAHKDKus';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function countListings() {
    const { count: ukCount, error: ukError } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true })
        .eq('country_code', 'GB');

    if (ukError) {
        console.error('Error counting UK listings:', ukError);
        return;
    }

    console.log(`TOTAL_UK_LISTINGS: ${ukCount}`);
}

countListings();
