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
    slug: 'electric-shower-tripping-dead-uk',
    title: 'Electric Shower Tripping or Dead? Safe Checks Before Calling a Tradesman',
    excerpt: 'Is your electric shower cutting out mid-wash or tripping the fuse box? Learn the safe checks you can do yourself, from isolator resets to limescale removal, before booking an emergency tradesman.',
    filePath: 'optimized-blogs/uk-shower-tripping.md',
    isUS: false,
    cover_image: '/images/blog/uk-shower-tripping-hero.png'
  },
  {
    slug: 'emergency-board-up-storm-damage-us',
    title: 'Emergency Board-Up After Storm Damage: Secure Your Home Fast',
    excerpt: 'Staring at a hole in your roof or a shattered window after a storm? Learn the critical steps to secure your home, prevent secondary water damage, and document everything for insurance before a pro arrives.',
    filePath: 'optimized-blogs/us-storm-board-up.md',
    isUS: true,
    cover_image: '/images/blog/us-storm-board-up-hero.png'
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
