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
    title:       'Ceiling Fan Humming, Wobbling, or Dead? Safe Fixes Before Calling a 24/7 Electrician',
    slug:        'ceiling-fan-humming-wobbling-dead-us',
    content:     readFileSync('optimized-blogs/usa-emergencycontractors/ceiling-fan-humming-wobbling-dead-us.md', 'utf8'),
    excerpt:     'Ceiling fan humming, wobbling, or completely dead? Follow this step-by-step troubleshooting guide to test circuit breakers, secure blade irons, check remote receiver wire nuts, replace run capacitors, and lubricate cast-iron motor bearings.',
    cover_image: '/images/blog/us-ceiling-fan-hero.png',
    published:    true,
    published_at: now,
  },
  {
    title:       'Combi Boiler Losing Pressure in Summer? Quick Fixes Before Calling a Gas Engineer',
    slug:        'combi-boiler-losing-pressure-summer-gb',
    content:     readFileSync('optimized-blogs/uk-emergencytradesmen/combi-boiler-losing-pressure-summer-gb.md', 'utf8'),
    excerpt:     'Is your combi boiler losing pressure during the summer heatwave? Follow this UK DIY guide to inspect lockshield and TRV valves for leaks, check the external PRV safety pipe, top up the filling loop, and bleed air from radiators.',
    cover_image: '/images/blog/uk-combi-boiler-hero.png',
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
  console.log('  🇺🇸 http://localhost:3001/blog/ceiling-fan-humming-wobbling-dead-us');
  console.log('  🇬🇧 http://localhost:3000/blog/combi-boiler-losing-pressure-summer-gb');
}

run().catch(console.error);
