
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xwqvhymkwuasotsgmarn.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3cXZoeW1rd3Vhc290c2dtYXJuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTk5MDM0MywiZXhwIjoyMDgxNTY2MzQzfQ.ZJQXY5OzkfO4Ey2G5enTdPHx_shgDMGAUaTJAHKDKus';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUSContent() {
    const { data, error } = await supabase
        .from('posts')
        .select('slug, content')
        .eq('slug', 'car-wont-start-click-vs-crank-us')
        .single();

    if (error) {
        console.error('Error fetching post:', error);
        return;
    }

    if (data) {
        console.log('Found post:', data.slug);
        const hasGlossary = data.content.toLowerCase().includes('glossary');
        console.log('Has Glossary:', hasGlossary);
        if (hasGlossary) {
            const gIndex = data.content.toLowerCase().indexOf('glossary');
            console.log('--- Snippet ---');
            console.log(data.content.substring(gIndex, gIndex + 300));
        }
    }
}

checkUSContent();
