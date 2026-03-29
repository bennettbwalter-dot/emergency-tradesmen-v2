
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xwqvhymkwuasotsgmarn.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3cXZoeW1rd3Vhc290c2dtYXJuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTk5MDM0MywiZXhwIjoyMDgxNTY2MzQzfQ.ZJQXY5OzkfO4Ey2G5enTdPHx_shgDMGAUaTJAHKDKus';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function findGlossary() {
    const { data, error } = await supabase
        .from('posts')
        .select('slug, content')
        .ilike('content', '%Glossary%')
        .limit(1);

    if (error) {
        console.error('Error fetching posts:', error);
        return;
    }

    if (data && data.length > 0) {
        console.log('Found post with Glossary:', data[0].slug);
        console.log('--- Content Snippet ---');
        // Find the glossary section
        const content = data[0].content;
        const glossaryIndex = content.toLowerCase().indexOf('glossary');
        console.log(content.substring(glossaryIndex, glossaryIndex + 1000));
    } else {
        console.log('No posts found with Glossary.');
    }
}

findGlossary();
