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
    slug: 'ac-freezing-ice-refrigerant-lines-us',
    title: 'AC Freezing Up or Ice on Refrigerant Lines? Safe Thaw Steps Before Calling a 24/7 HVAC Technician',
    excerpt: 'Is your AC frozen or showing ice on lines? Follow these 5 safe thaw steps to troubleshoot airflow and drain issues before calling a 24/7 HVAC technician. US expert guide.',
    filePath: 'optimized-blogs/us-ac-freezing-ice-refrigerant-lines.md',
    isUS: true,
    cover_image: '/images/blog/us-ac-freezing-ice-lines-hero.png'
  },
  {
    slug: 'washing-machine-wont-drain-leaking-uk',
    title: 'Washing Machine Won’t Drain or Is Leaking? Quick Fixes Before Calling an Emergency Tradesman',
    excerpt: 'Is your washing machine full of water or leaking? Follow these 5 safe checks to clear blocked filters and hoses before calling an emergency tradesman. UK expert guide.',
    filePath: 'optimized-blogs/uk-washing-machine-wont-drain-leaking.md',
    isUS: false,
    cover_image: '/images/blog/uk-washing-machine-wont-drain-hero.png'
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
        .maybeSingle();

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
