import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function deleteSafeModeProfiles() {
    // Find all Safe Mode profiles
    const { data, error } = await supabase
        .from('businesses')
        .select('id, name, city, country_code')
        .ilike('name', '%Safe Mode%');

    if (error) {
        console.error('Error finding profiles:', error);
        return;
    }

    console.log(`Found ${data.length} Safe Mode profiles`);

    // Only delete UK profiles
    const ukProfiles = data.filter(d => d.country_code === 'GB');
    console.log(`UK Safe Mode profiles to delete: ${ukProfiles.length}`);

    if (ukProfiles.length === 0) {
        console.log('No UK Safe Mode profiles found.');
        return;
    }

    const ids = ukProfiles.map(p => p.id);
    
    // Delete in batches of 100
    for (let i = 0; i < ids.length; i += 100) {
        const batch = ids.slice(i, i + 100);
        const { error: deleteError } = await supabase
            .from('businesses')
            .delete()
            .in('id', batch);

        if (deleteError) {
            console.error('Error deleting batch:', deleteError);
        } else {
            console.log(`Deleted batch ${Math.floor(i / 100) + 1}: ${batch.length} profiles`);
        }
    }

    console.log('Done.');
}

deleteSafeModeProfiles();
