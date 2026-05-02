import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use UK env as it has the same DB URL as US
dotenv.config({ path: path.resolve(__dirname, '..', '.env.uk.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const postsToInsert = [
  {
    slug: 'toilet-running-overflowing-fixes-uk',
    title: 'Toilet Constantly Running or Overflowing? Quick Fixes Before Calling a Plumber',
    excerpt: 'Is your toilet hissing, gurgling, or overflowing? Learn the safe UK checks you can do yourself, from float valve adjustments to siphon diaphragm inspections, before booking an emergency plumber.',
    filePath: 'optimized-blogs/uk-toilet-running-fixes.md',
    isUS: false,
    cover_image: '/images/blog/uk-toilet-running-fixes-hero.png'
  },
  {
    slug: 'low-water-pressure-main-line-leak-us',
    title: 'Sudden Low Water Pressure or Suspected Main Line Leak? Safe Checks Before Calling a 24/7 Plumber',
    excerpt: 'Dealing with a sudden drop in water pressure or a soggy lawn? Learn how to isolate the issue, check your water meter for hidden leaks, and inspect your pressure regulator before calling a 24/7 emergency plumber.',
    filePath: 'optimized-blogs/us-low-water-pressure-main-line.md',
    isUS: true,
    cover_image: '/images/blog/us-low-water-pressure-main-line-hero.png'
  }
];

async function processPosts() {
  for (const postInfo of postsToInsert) {
    try {
      const rootDir = path.resolve(__dirname, '..');
      const fullPath = path.resolve(rootDir, postInfo.filePath);
      
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
        cover_image: postInfo.cover_image
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
