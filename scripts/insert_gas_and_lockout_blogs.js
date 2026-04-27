import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

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

const postsToInsert = [
  {
    slug: 'smell-gas-immediate-safety-steps-uk',
    title: 'Smell Gas? Immediate Steps to Take Before Calling an Emergency Engineer',
    excerpt: 'Detecting gas in your home is instantly alarming. Follow these critical steps to ensure your safety before calling a Gas Safe engineer.',
    filePath: 'optimized-blogs/uk-smell-gas-steps.md',
    isUS: false
  },
  {
    slug: 'locked-out-car-safe-access-guide-us',
    title: 'Locked Out of Your Car? Safe Ways to Get Back In Without Damage',
    excerpt: 'Locked out of your car? Before you break a window or damage your door seal, explore these safer, smarter ways to get back in.',
    filePath: 'optimized-blogs/us-locked-out-car-safe-ways.md',
    isUS: true
  }
];

async function processPosts() {
  for (const postInfo of postsToInsert) {
    try {
      const fullPath = path.resolve(postInfo.filePath);
      if (!fs.existsSync(fullPath)) {
        console.error(`File not found: ${fullPath}`);
        continue;
      }

      const content = fs.readFileSync(fullPath, 'utf8');
      
      console.log(`Processing ${postInfo.slug}...`);

      const { data: existingPost } = await supabase
        .from('posts')
        .select('id')
        .eq('slug', postInfo.slug)
        .single();

      const postData = {
        title: postInfo.title,
        slug: postInfo.slug,
        content: content,
        excerpt: postInfo.excerpt,
        published_at: new Date().toISOString(),
        published: true,
        // Using a generic placeholder as requested not to generate new ones
        cover_image: postInfo.isUS ? '/images/blog/us-locksmith-hero.webp' : '/images/blog/uk-gas-safety-hero.webp'
      };

      if (existingPost) {
        console.log(`Post ${postInfo.slug} already exists, updating...`);
        const { error } = await supabase
          .from('posts')
          .update(postData)
          .eq('slug', postInfo.slug);

        if (error) console.error(`Error updating ${postInfo.slug}:`, error);
        else console.log(`Successfully updated ${postInfo.slug}`);
      } else {
        console.log(`Inserting new post ${postInfo.slug}...`);
        const { error } = await supabase
          .from('posts')
          .insert(postData);

        if (error) console.error(`Error inserting ${postInfo.slug}:`, error);
        else console.log(`Successfully inserted ${postInfo.slug}`);
      }
    } catch (err) {
      console.error(`Unexpected error processing ${postInfo.slug}:`, err);
    }
  }
}

processPosts();
