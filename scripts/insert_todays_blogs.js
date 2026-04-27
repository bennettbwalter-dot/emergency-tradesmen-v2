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
    slug: 'uk-spring-roof-damage-spot-leaks',
    title: 'Spring Rain Revealing Winter Roof Damage? How to Spot Leaks Early',
    excerpt: 'Winter storms often cause hidden damage to roofs. Learn how to identify leaks early and prevent costly structural damage.',
    filePath: 'optimized-blogs/uk-spring-roof-damage.md',
    isUS: false
  },
  {
    slug: 'us-sewage-backup-immediate-safety',
    title: 'Sewage Backup in Your Home? Immediate Health & Safety Steps',
    excerpt: 'A sewage backup is a serious health hazard. Follow these critical steps to protect your health and minimize property damage.',
    filePath: 'optimized-blogs/us-sewage-backup-safety.md',
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
        // Using placeholders as requested not to generate new ones
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
