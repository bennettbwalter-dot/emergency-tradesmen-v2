// ─────────────────────────────────────────────────────────────────────────────
//  insert_todays_blogs.mjs
//  Run once from the project root:  node insert_todays_blogs.mjs
// ─────────────────────────────────────────────────────────────────────────────
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';

dotenv.config({ path: '.env' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

const now = new Date().toISOString();

const posts = [
  {
    title:       'Sewage Backing Up into the Tub or Toilet? Safe Steps Before Calling a 24/7 Plumber',
    slug:        'sewage-backup-tub-toilet-us',
    content:     readFileSync('optimized-blogs/usa-emergencycontractors/sewage-backup-tub-toilet-us.md', 'utf8'),
    excerpt:     'Sewage backing up into your bathtub or toilet? Follow these safe, critical step-by-step DIY instructions to isolate your water, locate cleanouts, and mitigate damage before calling a 24/7 emergency plumber.',
    cover_image: '/images/blog/us-sewage-backup-tub-toilet-hero.png',
    published:    true,
    published_at: now,
  },
  {
    title:       'Shower Pump Grinding, Humming, or Dead? Safe Fixes Before Calling an Emergency Plumber',
    slug:        'shower-pump-grinding-humming-gb',
    content:     readFileSync('optimized-blogs/uk-emergencytradesmen/shower-pump-grinding-humming-gb.md', 'utf8'),
    excerpt:     'Shower pump grinding, humming, or dead? Follow this step-by-step DIY troubleshooting guide to safely bleed airlocks, clear limescale blockages, free impellers, and get your power shower working before calling a plumber.',
    cover_image: '/images/blog/uk-shower-pump-grinding-hero.png',
    published:    true,
    published_at: now,
  },
];

async function run() {
  console.log('🚀 Inserting today\'s blog posts into Supabase...\n');

  for (const post of posts) {
    const { data, error } = await supabase
      .from('posts')
      .upsert(post, { onConflict: 'slug' })
      .select('id, slug, title');

    if (error) {
      console.error(`❌ FAILED: ${post.slug}`);
      console.error('   Error:', error.message);
    } else {
      console.log(`✅ OK: ${data[0].slug}`);
      console.log(`   ID:    ${data[0].id}`);
      console.log(`   Title: ${data[0].title}\n`);
    }
  }

  console.log('Done! Check your blog pages:');
  console.log('  🇺🇸 http://localhost:3001/blog/sewage-backup-tub-toilet-us');
  console.log('  🇬🇧 http://localhost:3000/blog/shower-pump-grinding-humming-gb');
}

run().catch(console.error);
