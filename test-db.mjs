import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.uk.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
  const b = await supabase.from('businesses').select('*').limit(1);
  console.log('Businesses Columns:', Object.keys(b.data[0] || {}).join(', '));
}
check();
