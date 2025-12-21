
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTrades() {
    console.log("Global Trade Distribution:");

    const { data, error } = await supabase
        .from('businesses')
        .select('trade');

    if (error) {
        console.error(error);
        return;
    }

    const counts = data.reduce((acc, curr) => {
        const t = curr.trade || 'null';
        acc[t] = (acc[t] || 0) + 1;
        return acc;
    }, {});

    console.log(counts);
}

checkTrades();
