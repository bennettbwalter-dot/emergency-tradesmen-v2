const path = require('path');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

console.log('SUPABASE_URL:', SUPABASE_URL);
console.log('Using Key:', SUPABASE_KEY ? SUPABASE_KEY.substring(0, 15) + '...' : 'NULL');

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function test() {
    // Total count
    const { count: total, error: errTotal } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true });
        
    console.log('Total Count:', total, 'Error:', errTotal);

    // UK count with simpler query
    const { count: ukSimple, error: errUkSimple } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true })
        .not('country_code', 'eq', 'US');

    console.log('UK Simple Count:', ukSimple, 'Error:', errUkSimple);
    
    // Check UK null country code or GB
    const { count: ukGB, error: errUkGB } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true })
        .in('country_code', ['GB', 'UK']);

    console.log('UK GB/UK Count:', ukGB, 'Error:', errUkGB);
}

test();
