import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Try .env.production if keys are missing in .env
if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY) {
  dotenv.config({ path: '.env.production' });
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase credentials missing in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateHeroImage() {
  const slug = 'uk-spring-roof-damage-spot-leaks';
  const newHeroPath = '/images/blog/uk-roof-damage.png';

  console.log(`Updating hero image for ${slug}...`);

  const { data, error } = await supabase
    .from('posts')
    .update({ cover_image: newHeroPath })
    .eq('slug', slug);

  if (error) {
    console.error('Error updating post:', error);
  } else {
    console.log('Successfully updated hero image!');
  }
}

updateHeroImage();
