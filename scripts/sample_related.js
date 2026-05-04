import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
dotenv.config({ path: '.env.production' });
const sb = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
const { data, error } = await sb.from('posts').select('content').eq('slug','commercial-drainage-gb').single();
const idx = data.content.indexOf('related-post-s106-uk.webp');
const start = Math.max(0, idx - 600);
const end = Math.min(data.content.length, idx + 800);
console.log(data.content.substring(start, end));
