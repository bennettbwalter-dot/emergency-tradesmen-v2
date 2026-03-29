import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function dumpContent() {
  const { data } = await supabase.from('posts').select('content').ilike('title', '%AC Ready%');
  if (data && data[0]) {
    fs.writeFileSync('tmp_content.md', data[0].content);
    console.log('Content dumped to tmp_content.md');
  }
}

dumpContent();
