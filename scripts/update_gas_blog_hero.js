import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY) {
  dotenv.config({ path: '.env.production' });
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateHero() {
  const slug = 'smell-gas-immediate-safety-steps-uk';
  const newHeroPath = '/images/blog/generated/uk-smell-gas-hero.png';

  console.log(`Updating hero image for ${slug}...`);

  const { error } = await supabase
    .from('posts')
    .update({ cover_image: newHeroPath })
    .eq('slug', slug);

  if (error) {
    console.error('Error updating hero image:', error);
  } else {
    console.log('Successfully updated hero image in Supabase');
  }
}

updateHero();
