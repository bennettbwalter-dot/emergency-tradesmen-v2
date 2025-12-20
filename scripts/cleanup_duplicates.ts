
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl!, supabaseKey!);

const OWNER_ID = '8f23ee60-3d67-4389-a1c6-49c765e2f425';

async function cleanupDuplicates() {
    console.log(`Fetching all businesses for owner: ${OWNER_ID}...`);

    const { data: businesses, error } = await supabase
        .from('businesses')
        .select('id, name, created_at')
        .or(`owner_id.eq.${OWNER_ID},owner_user_id.eq.${OWNER_ID}`)
        .order('created_at', { ascending: false });

    if (error || !businesses) {
        console.error('Error fetching businesses:', error);
        return;
    }

    console.log(`Found ${businesses.length} businesses.`);

    if (businesses.length <= 1) {
        console.log('No duplicates to clean up.');
        return;
    }

    // Keep the first one (most recent)
    const toKeep = businesses[0];
    const toDelete = businesses.slice(1);

    console.log(`Keeping: ${toKeep.id} (${toKeep.name}) created at ${toKeep.created_at}`);
    console.log(`Deleting ${toDelete.length} duplicates...`);

    const idsToDelete = toDelete.map(b => b.id);

    const { error: deleteError } = await supabase
        .from('businesses')
        .delete()
        .in('id', idsToDelete);

    if (deleteError) {
        console.error('Error deleting duplicates:', deleteError);
    } else {
        console.log('Successfully deleted duplicates.');
    }
}

cleanupDuplicates();
