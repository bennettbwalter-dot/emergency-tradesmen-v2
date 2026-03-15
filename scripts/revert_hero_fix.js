import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function revertHeroFix() {
  const { data: posts, error } = await supabase
    .from('posts')
    .select('id, title, slug')
    .ilike('title', '%AC Ready for the Early 2026 Heatwave%');

  if (error) {
    console.error(error);
    return;
  }

  for (const post of posts) {
    const isUS = post.slug.includes('-us') || post.title.includes('(US Guide)');
    const correctPath = isUS ? '/blog/hvac/ac-heatwave-us.webp' : '/blog/hvac/ac-heatwave-uk.webp';
    
    console.log(`Reverting ${post.title}: -> ${correctPath}`);
    
    const { error: updateError } = await supabase
      .from('posts')
      .update({ cover_image: correctPath })
      .eq('id', post.id);

    if (updateError) {
      console.error(`Update failed for ${post.id}`, updateError);
    }
  }
}

revertHeroFix();
