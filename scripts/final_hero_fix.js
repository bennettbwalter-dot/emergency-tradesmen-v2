import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function finalHeroFix() {
  const { data: posts, error } = await supabase
    .from('posts')
    .select('id, title, slug, cover_image')
    .ilike('title', '%AC Ready for the Early 2026 Heatwave%');

  if (error) {
    console.error(error);
    return;
  }

  for (const post of posts) {
    const isUS = post.slug.includes('-us') || post.title.includes('(US Guide)');
    const regionFolder = isUS ? 'ac-heatwave-preparation-signs-repair-us-2026' : 'ac-heatwave-preparation-signs-repair-uk-2026';
    const correctPath = `/blog/${regionFolder}/thermostat-85f.webp`;
    
    console.log(`Fixing ${post.title}: ${post.slug} -> ${correctPath}`);
    
    const { error: updateError } = await supabase
      .from('posts')
      .update({ cover_image: correctPath })
      .eq('id', post.id);

    if (updateError) {
      console.error(`Update failed for ${post.id}`, updateError);
    }
  }
}

finalHeroFix();
