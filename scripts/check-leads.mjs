import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load .env explicitly
dotenv.config({ path: path.join(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLeads() {
    console.log("Querying Supabase for lead statistics...");

    // Total businesses
    const { count: total, error: err1 } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true });

    // Businesses with email
    const { count: withEmail, error: err2 } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true })
        .not('email', 'is', null)
        .neq('email', '');

    // Businesses with email AND never emailed (based on our export script logic)
    const { count: viableLeads, error: err3 } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true })
        .not('email', 'is', null)
        .neq('email', '')
    // We normally check last_emailed_at here, but we bypassed it for batch 1. 
    // Let's just see total available with emails first.

    console.log("-----------------------------------------");
    console.log(`Total businesses in database: ${total}`);
    console.log(`Total businesses WITH an email address: ${withEmail}`);
    console.log("-----------------------------------------");

    if (err1 || err2) console.error(err1 || err2);
}

checkLeads();
