import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
dotenv.config({ path: '.env.production' });
const sb = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
const { data, error } = await sb.from('posts').select('id,slug,title,excerpt,cover_image,published').in('slug', ['us-sewage-backup-immediate-safety', 'uk-spring-roof-damage-spot-leaks']);
if (error) { console.error(error); process.exit(1); }
data.forEach(p => {
  console.log('==== slug:', p.slug);
  console.log('title:', p.title);
  console.log('cover:', p.cover_image);
  console.log('excerpt:', (p.excerpt||'').substring(0, 200));
  console.log('id:', p.id);
});
