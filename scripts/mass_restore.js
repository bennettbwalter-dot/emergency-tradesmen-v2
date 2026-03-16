import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function massRestore() {
    console.log('--- Mass Content Restoration (Non-Destructive) ---');
    
    // Load backup
    let backupText = fs.readFileSync('scripts/all_posts_content.json', 'utf16le');
    if (backupText.charCodeAt(0) === 0xFEFF) {
        backupText = backupText.slice(1);
    }
    const backupData = JSON.parse(backupText);
    console.log(`Loaded ${backupData.length} posts from backup.`);

    // Restore all
    const { error } = await supabase.from('posts').upsert(backupData, { onConflict: 'slug' });
    
    if (error) {
        console.error('Error during mass restoration:', error);
    } else {
        console.log('✅ Mass restoration complete.');
    }
}

massRestore();
