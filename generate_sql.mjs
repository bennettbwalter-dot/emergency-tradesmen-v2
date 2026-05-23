import fs from 'fs';
import path from 'path';

function escapeSql(str) {
  if (!str) return '';
  return str.replace(/'/g, "''");
}

async function run() {
  console.log('🚀 Generating SQL insert script...');
  
  const usFile = path.join(process.cwd(), 'optimized-blogs', 'usa-emergencycontractors', 'ac-leaking-water-ceiling-safe-steps-us.md');
  const ukFile = path.join(process.cwd(), 'optimized-blogs', 'uk-emergencytradesmen', 'outside-tap-leaking-burst-winter-gb.md');

  let usContent = fs.readFileSync(usFile, 'utf8');
  let ukContent = fs.readFileSync(ukFile, 'utf8');

  const now = new Date().toISOString();
  
  const posts = [
    {
      title: "AC Leaking Water Through the Ceiling? Safe Steps Before Calling a 24/7 HVAC Technician",
      slug: "ac-leaking-water-ceiling-safe-steps-us",
      content: usContent,
      excerpt: "AC dripping through your ceiling? Follow this step-by-step guide to safely shut down your system, drain a ceiling drywall blister, clear a clogged PVC condensate line with a Shop-Vac, and decide whether to repair or replace your unit.",
      cover_image: "/images/blog/us-ac-leaking-ceiling-hero.png"
    },
    {
      title: "Outside Tap Leaking or Burst After Winter? Quick Fixes Before Calling an Emergency Plumber",
      slug: "outside-tap-leaking-burst-winter-gb",
      content: ukContent,
      excerpt: "Your outside tap split over winter? Follow this UK step-by-step guide to isolate the water, replace a perished washer or burst bib tap, check for cavity wall leaks, and prevent future frost damage.",
      cover_image: "/images/blog/uk-outside-tap-leaking-hero.png"
    }
  ];

  let sql = `-- Run this in your Supabase SQL Editor\n\n`;

  for (const post of posts) {
    sql += `INSERT INTO public.posts (title, slug, content, excerpt, cover_image, published, published_at)
VALUES (
  '${escapeSql(post.title)}',
  '${escapeSql(post.slug)}',
  '${escapeSql(post.content)}',
  '${escapeSql(post.excerpt)}',
  '${escapeSql(post.cover_image)}',
  true,
  '${now}'
)
ON CONFLICT (slug) DO UPDATE SET 
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  excerpt = EXCLUDED.excerpt,
  cover_image = EXCLUDED.cover_image,
  published = EXCLUDED.published,
  published_at = EXCLUDED.published_at;

`;
  }

  const sqlFile = path.join(process.cwd(), 'insert_blogs.sql');
  fs.writeFileSync(sqlFile, sql);

  console.log('✅ Generated insert_blogs.sql');
  console.log('👉 Please open insert_blogs.sql, copy everything, and run it in your Supabase SQL Editor.');
}

run().catch(console.error);
