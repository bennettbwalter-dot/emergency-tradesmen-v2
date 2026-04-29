import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '..', '.env.uk.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const updates = [
  {
    slug: 'fuse-box-keeps-tripping-uk',
    cover_image: '/images/blog/uk-fuse-box-tripping-hero.png'
  },
  {
    slug: 'garage-door-stuck-halfway-us',
    cover_image: '/images/blog/us-garage-door-stuck-hero.png'
  }
];

async function updateImages() {
  for (const update of updates) {
    console.log(`Updating cover image for ${update.slug}...`);
    const { error } = await supabase
      .from('posts')
      .update({ cover_image: update.cover_image })
      .eq('slug', update.slug);

    if (error) console.error(`Error updating ${update.slug}:`, error);
    else console.log(`Successfully updated ${update.slug}`);
  }
}

updateImages();
