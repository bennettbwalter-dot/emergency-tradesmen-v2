import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function listFolder() {
    console.log("Listing 'Untitled folder' contents...");
    const { data, error } = await supabase.storage
        .from('business-assets')
        .list('Untitled folder', { limit: 100 });

    if (error) {
        console.error("Error:", error.message);
        return;
    }

    console.log(`Found ${data.length} files in Untitled folder:`);
    data.forEach((file, idx) => {
        const url = supabase.storage.from('business-assets').getPublicUrl(`Untitled folder/${file.name}`).data.publicUrl;
        console.log(`${idx + 1}. ${file.name}`);
        console.log(`   URL: ${url}`);
    });
}

listFolder();