const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function countBusinesses() {
    const { count, error } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true });

    if (error) {
        console.error("Error counting businesses:", error);
        return;
    }

    console.log(`Total listings in Supabase: ${count}`);
}

countBusinesses();
