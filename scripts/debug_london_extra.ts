
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLondonExtra() {
    const { data: businesses, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('city', 'london_extra');

    if (error) { console.error(error); return; }

    console.log(`Found ${businesses.length} businesses in 'london_extra':`);
    const trades = {};
    businesses.forEach(b => {
        trades[b.trade] = (trades[b.trade] || 0) + 1;
    });
    console.log("Trades distribution:", trades);
    if (businesses.length > 0) {
        console.log("Sample:", businesses[0]);
    }
}

checkLondonExtra();
