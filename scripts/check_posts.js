import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '..', '.env.uk.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPosts() {
  const { data, error } = await supabase
    .from('posts')
    .select('slug, cover_image')
    .in('slug', ['fuse-box-keeps-tripping-uk', 'garage-door-stuck-halfway-us']);

  if (error) console.error(error);
  else console.log(JSON.stringify(data, null, 2));
}

checkPosts();
