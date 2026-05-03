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
    slug: 'patio-door-lock-jammed-uk',
    title: 'Patio Door Lock Jammed or Won’t Turn? Safe Checks Before Calling an Emergency Locksmith',
    excerpt: 'Is your uPVC or aluminium patio door lock jammed? Follow these 5 safe checks to free a stuck handle or mechanism before calling an emergency locksmith. UK expert guide.',
    filePath: 'optimized-blogs/uk-patio-door-lock-jammed.md',
    isUS: false,
    cover_image: '/images/blog/uk-patio-door-lock-jammed-hero.png'
  },
  {
    slug: 'gfci-outlet-tripping-us',
    title: 'Outdoor GFCI Outlet Keeps Tripping? Safe Reset Steps Before Calling a 24/7 Electrician',
    excerpt: 'Is your outdoor GFCI outlet constantly tripping? Follow these 5 safe reset steps to troubleshoot moisture and faulty devices before calling a 24/7 electrician. US expert guide.',
    filePath: 'optimized-blogs/us-gfci-outlet-tripping.md',
    isUS: true,
    cover_image: '/images/blog/us-gfci-outlet-tripping-hero.png'
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
