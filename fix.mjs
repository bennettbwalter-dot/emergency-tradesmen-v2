import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase keys in .env.local!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('🚀 Fixing today\'s blogs...');

  // --- STEP 1: Copy Images ---
  console.log('\n📸 Step 1: Copying hero images...');
  
  const imgDest = path.join(process.cwd(), 'public', 'images', 'blog');
  if (!fs.existsSync(imgDest)) {
    fs.mkdirSync(imgDest, { recursive: true });
  }

  const images = [
    {
      src: "C:\\Users\\Nick\\OneDrive\\my App\\AC Leaking Water Through the Ceiling.png",
      dest: path.join(imgDest, "us-ac-leaking-ceiling-hero.png"),
      name: "US AC Leaking hero"
    },
    {
      src: "C:\\Users\\Nick\\OneDrive\\my App\\Outside Tap Leaking or Burst After Winter.png",
      dest: path.join(imgDest, "uk-outside-tap-leaking-hero.png"),
      name: "UK Outside Tap hero"
    }
  ];

  for (const img of images) {
    try {
      if (!fs.existsSync(img.src)) {
        console.error(`  ❌ Source image not found: ${img.src}`);
        continue;
      }
      fs.copyFileSync(img.src, img.dest);
      const stats = fs.statSync(img.dest);
      console.log(`  ✅ ${img.name} copied (${Math.round(stats.size / 1024)}KB)`);
    } catch (err) {
      console.error(`  ❌ ${img.name} failed to copy:`, err.message);
    }
  }

  // --- STEP 2: Read Blog Content ---
  console.log('\n📄 Step 2: Reading blog files...');
  
  const usFile = path.join(process.cwd(), 'optimized-blogs', 'usa-emergencycontractors', 'ac-leaking-water-ceiling-safe-steps-us.md');
  const ukFile = path.join(process.cwd(), 'optimized-blogs', 'uk-emergencytradesmen', 'outside-tap-leaking-burst-winter-gb.md');

  let usContent = '';
  let ukContent = '';

  try { usContent = fs.readFileSync(usFile, 'utf8'); console.log('  ✅ US blog read'); } 
  catch (e) { console.error('  ❌ US blog read failed:', e.message); }

  try { ukContent = fs.readFileSync(ukFile, 'utf8'); console.log('  ✅ UK blog read'); } 
  catch (e) { console.error('  ❌ UK blog read failed:', e.message); }

  // --- STEP 3: Insert into Supabase ---
  console.log('\n🗄️  Step 3: Inserting into Supabase...');

  const now = new Date().toISOString();
  
  const posts = [
    {
      title: "AC Leaking Water Through the Ceiling? Safe Steps Before Calling a 24/7 HVAC Technician",
      slug: "ac-leaking-water-ceiling-safe-steps-us",
      content: usContent,
      excerpt: "AC dripping through your ceiling? Follow this step-by-step guide to safely shut down your system, drain a ceiling drywall blister, clear a clogged PVC condensate line with a Shop-Vac, and decide whether to repair or replace your unit.",
      cover_image: "/images/blog/us-ac-leaking-ceiling-hero.png",
      published: true,
      published_at: now
    },
    {
      title: "Outside Tap Leaking or Burst After Winter? Quick Fixes Before Calling an Emergency Plumber",
      slug: "outside-tap-leaking-burst-winter-gb",
      content: ukContent,
      excerpt: "Your outside tap split over winter? Follow this UK step-by-step guide to isolate the water, replace a perished washer or burst bib tap, check for cavity wall leaks, and prevent future frost damage.",
      cover_image: "/images/blog/uk-outside-tap-leaking-hero.png",
      published: true,
      published_at: now
    }
  ];

  for (const post of posts) {
    if (!post.content) {
      console.error(`  ❌ Skipping ${post.slug} (no content read)`);
      continue;
    }

    const { data, error } = await supabase
      .from('posts')
      .upsert(post, { onConflict: 'slug' })
      .select('id, slug, title');

    if (error) {
      console.error(`  ❌ FAILED: ${post.slug}`);
      console.error('     Error:', error.message);
    } else if (data && data.length > 0) {
      console.log(`  ✅ OK: ${data[0].slug}`);
    }
  }

  console.log('\n✨ Done! Refresh your browser and the blogs should be live.');
  console.log('   🇺🇸 http://localhost:3001/blog/ac-leaking-water-ceiling-safe-steps-us');
  console.log('   🇬🇧 http://localhost:3000/blog/outside-tap-leaking-burst-winter-gb\n');
}

run().catch(console.error);
