import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
dotenv.config({ path: '.env.production' });
const sb = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
const { data, error } = await sb.from('posts').select('content,slug').eq('slug','commercial-drainage-gb').single();
if (error) { console.error(error); process.exit(1); }
// Print first 3000 chars
console.log(data.content.substring(0, 4000));
console.log('---SEPARATOR---');
// Find context around broken image
const idx = data.content.indexOf('/blog/commercial/commercial-drainage-uk.webp');
if (idx >= 0) {
  const start = Math.max(0, idx - 300);
  const end = Math.min(data.content.length, idx + 500);
  console.log(data.content.substring(start, end));
}
