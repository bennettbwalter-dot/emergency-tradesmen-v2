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
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

const now = new Date().toISOString();

const posts = [
  {
    title:       'Outdoor Hose Bibb Leaking or Snapped Off? Safe Fixes Before Calling a 24/7 Plumber',
    slug:        'outdoor-hose-bibb-leaking-snapped-us',
    content:     readFileSync('optimized-blogs/usa-emergencycontractors/outdoor-hose-bibb-leaking-snapped-us.md', 'utf8'),
    excerpt:     'Outdoor hose bibb (spigot) leaking, dripping, or snapped off? Follow this step-by-step troubleshooting guide to shut off the water, identify your faucet type, replace vacuum breakers, repack valve stems, and avoid costly plumber calls.',
    cover_image: '/images/blog/us-outdoor-hose-bibb-hero.png',
    published:    true,
    published_at: now,
  },
  {
    title:       'Loft Water Tank Overflowing or Ball Valve Stuck? Quick Fixes Before Calling an Emergency Plumber',
    slug:        'loft-water-tank-overflowing-stuck-gb',
    content:     readFileSync('optimized-blogs/uk-emergencytradesmen/loft-water-tank-overflowing-stuck-gb.md', 'utf8'),
    excerpt:     'Loft cold water storage tank overflowing or warning pipe dripping? Follow this step-by-step UK DIY guide to isolate the water, clean brass Portsmouth valves, adjust float arms, check shower pumps, and prevent water damage.',
    cover_image: '/images/blog/uk-loft-water-tank-hero.png',
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
  console.log('  🇺🇸 http://localhost:3001/blog/outdoor-hose-bibb-leaking-snapped-us');
  console.log('  🇬🇧 http://localhost:3000/blog/loft-water-tank-overflowing-stuck-gb');
}

run().catch(console.error);
