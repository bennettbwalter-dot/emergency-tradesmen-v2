import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkPost() {
  const { data, error } = await supabase
    .from('posts')
    .select('id, title, featured_image, slug')
    .ilike('title', '%AC Ready for the Early 2026 Heatwave%');

  if (error) {
    console.error(error);
  } else {
    console.log(JSON.stringify(data, null, 2));
  }
}

checkPost();
