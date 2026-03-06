import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load .env explicitly
dotenv.config({ path: path.join(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function markEmailed() {
    console.log("Reading batch 1 to mark as emailed...");

    const csvPath = 'C:\\Users\\Nick\\Downloads\\hitmaker-2026\\emergency-tradesmen\\outreach_batch_1.csv';
    if (!fs.existsSync(csvPath)) {
        console.error("Batch 1 CSV not found!");
        process.exit(1);
    }

    const content = fs.readFileSync(csvPath, 'utf8');
    const lines = content.split('\n').filter(l => l.trim().length > 0);

    // Skip header
    lines.shift();

    const emails = lines.map(line => {
        // Basic CSV parsing for the first column (Email) which is quoted
        const match = line.match(/^"([^"]+)"/);
        return match ? match[1] : null;
    }).filter(e => e !== null);

    console.log(`Found ${emails.length} emails to update.`);

    if (emails.length === 0) return;

    // Since we can't do a mass UPDATE WHERE email IN (...) easily with Supabase JS update()
    // We'll update them individually or in chunks.
    let successCount = 0;
    for (const email of emails) {
        const { error } = await supabase
            .from('businesses')
            .update({ last_emailed_at: new Date().toISOString() })
            .eq('email', email);

        if (error) {
            console.error(`Failed to update ${email}:`, error.message);
        } else {
            successCount++;
        }
    }

    console.log(`Successfully marked ${successCount} leads as emailed in the database.`);
}

markEmailed();
