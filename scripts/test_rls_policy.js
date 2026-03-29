
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xwqvhymkwuasotsgmarn.supabase.co';
// This is the ANON key from .env, NOT the service key
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3cXZoeW1rd3Vhc290c2dtYXJuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTk5MDM0MywiZXhwIjoyMDgxNTY2MzQzfQ.ZJQXY5OzkfO4Ey2G5enTdPHx_shgDMGAUaTJAHKDKus';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAnonAccess() {
    console.log('Testing access to `posts` table with ANON key...');
    const { data, error } = await supabase
        .from('posts')
        .select('slug')
        .limit(3);

    if (error) {
        console.error('RLS ERROR: Could not fetch posts with ANON key:', error);
    } else {
        console.log('SUCCESS: Fetched posts with ANON key');
        console.log('Data:', data);
    }
}

testAnonAccess();
