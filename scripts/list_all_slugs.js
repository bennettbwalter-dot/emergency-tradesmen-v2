
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xwqvhymkwuasotsgmarn.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3cXZoeW1rd3Vhc290c2dtYXJuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTk5MDM0MywiZXhwIjoyMDgxNTY2MzQzfQ.ZJQXY5OzkfO4Ey2G5enTdPHx_shgDMGAUaTJAHKDKus';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function listAllSlugs() {
    const { data, error } = await supabase
        .from('posts')
        .select('slug')
        .order('slug');

    if (error) {
        console.error('Error fetching slugs:', error);
        return;
    }

    console.log('Total posts:', data.length);
    console.log('Slugs:', data.map(p => p.slug));
}

listAllSlugs();
