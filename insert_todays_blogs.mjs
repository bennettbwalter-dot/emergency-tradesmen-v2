// ─────────────────────────────────────────────────────────────────────────────
//  insert_todays_blogs.mjs
//  Run once from the project root:  node insert_todays_blogs.mjs
// ─────────────────────────────────────────────────────────────────────────────
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

const now = new Date().toISOString();

const posts = [
  {
    title:       'AC Leaking Water Through the Ceiling? Safe Steps Before Calling a 24/7 HVAC Technician',
    slug:        'ac-leaking-water-ceiling-safe-steps-us',
    content:     readFileSync('optimized-blogs/usa-emergencycontractors/ac-leaking-water-ceiling-safe-steps-us.md', 'utf8'),
    excerpt:     'AC dripping through your ceiling? Follow this step-by-step guide to safely shut down your system, drain a ceiling drywall blister, clear a clogged PVC condensate line with a Shop-Vac, and decide whether to repair or replace your unit.',
    cover_image: '/images/blog/us-ac-leaking-ceiling-hero.png',
    published:    true,
    published_at: now,
  },
  {
    title:       'Outside Tap Leaking or Burst After Winter? Quick Fixes Before Calling an Emergency Plumber',
    slug:        'outside-tap-leaking-burst-winter-gb',
    content:     readFileSync('optimized-blogs/uk-emergencytradesmen/outside-tap-leaking-burst-winter-gb.md', 'utf8'),
    excerpt:     'Your outside tap split over winter? Follow this UK step-by-step guide to isolate the water, replace a perished washer or burst bib tap, check for cavity wall leaks, and prevent future frost damage.',
    cover_image: '/images/blog/uk-outside-tap-leaking-hero.png',
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
  console.log('  🇺🇸 http://localhost:3001/blog/ac-leaking-water-ceiling-safe-steps-us');
  console.log('  🇬🇧 http://localhost:3000/blog/outside-tap-leaking-burst-winter-gb');
}

run().catch(console.error);
