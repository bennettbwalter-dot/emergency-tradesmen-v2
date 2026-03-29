
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTable() {
    console.log('Checking for trade_knowledge_base table...');
    
    // Try to select 1 row
    const { data, error } = await supabase.from('trade_knowledge_base').select('id').limit(1);
    
    if (error) {
        console.log('Error or table missing:', error.message);
        if (error.message.includes('not found') || error.message.includes('does not exist')) {
            console.log('Table seems to be missing. You should run the migration 024_trade_knowledge_base.sql in the Supabase SQL Editor.');
        }
    } else {
        console.log('Table exists! Data found:', data);
    }
}

checkTable();
